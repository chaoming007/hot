<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true">
        <el-form-item>
          <el-select v-model="listQuery.platform" placeholder="平台" clearable>
            <el-option v-for="item in platforms" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
            <el-select v-model="listQuery.publishStatus" placeholder="发布状态" clearable>
                <el-option v-for="item in publishStatuses" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="listQuery.applicationCode" placeholder="应用" clearable> 
                <el-option v-for="app in apps" :key="app.code" :label="app.applicationName" :value="app.code"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" v-if="hasPerm('patch:list')" @click="getList">查询</el-button>
        </el-form-item>
        <el-form-item style="float:right;margin-right:90px;">
          <el-button type="primary" icon="plus" @click="showCreate" v-if="hasPerm('patch:add')">添加
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row>
      <!-- <el-table-column align="center" label="序号" width="80">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column> -->
      <el-table-column align="center" prop="applicationName" label="应用名称" style="width: 60px;"></el-table-column>
      <el-table-column align="center" prop="patchVersion" label="补丁版本" style="width: 60px;"></el-table-column>
      <el-table-column align="center" prop="suitableVersion" label="适用版本" style="width: 60px;"></el-table-column>
      <el-table-column align="center" prop="patchInstructions" label="修复问题" style="width: 60px;"></el-table-column>
      <el-table-column align="center" prop="platform" label="平台" style="width: 60px;" :formatter="formatPlatform"></el-table-column>
      <el-table-column align="center" prop="publishStatus" label="发布状态" style="width: 60px;" :formatter="formatPublishStatus"></el-table-column>
      <el-table-column align="center" prop="patchStatus" label="是否生效" style="width: 60px;" :formatter="formatStatus"></el-table-column>
      <el-table-column align="center" prop="createTime" label="新增时间" style="width: 60px;"></el-table-column>
      <el-table-column align="center" prop="operatorName" label="操作人" style="width: 60px;"></el-table-column>
      <el-table-column align="center" label="操作" width="260" v-if="hasPerm('patch:update') || hasPerm('patch:publish') || hasPerm('patch:delete')">
        <template slot-scope="scope">
          <el-button type="success" icon="edit" v-if="hasPerm('patch:publish')" :disabled="scope.row.publishStatus=='y'" @click="publish(scope.$index)">发布</el-button>
          <el-button type="primary" icon="edit" v-if="hasPerm('patch:update')" @click="showUpdate(scope.$index)">修改</el-button>
          <el-button type="danger" icon="delete" v-if="hasPerm('patch:delete')" @click="removeVersion(scope.$index)">删除 </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination 
        @size-change="handleSizeChange" 
        @current-change="handleCurrentChange" 
        :current-page="listQuery.pageNo" 
        :page-size="listQuery.pageSize" 
        :total="totalCount" :page-sizes="[10, 20, 50, 100]" 
        layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :before-close="handleClose">
      <el-form class="small-space" :model="tempPatch" label-position="right" label-width="120px"
        ref="tempPatch" style='width: 500px; margin-left:50px;'>
        <el-form-item label="应用名称" required>
          <el-select v-model="tempPatch.applicationCode" placeholder="请选择"> 
                <el-option v-for="app in apps" :key="app.code" :label="app.applicationName" :value="app.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="补丁版本" required>
          <el-tooltip content="版本号不能低于上个版本且保存后无法修改，保存前请确认" placement="top-end" effect="light" 
              :disabled="this.tempPatch.id != ''">
            <el-input type="text" v-model="tempPatch.patchVersion" :disabled="this.tempPatch.id != ''"></el-input>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="适用版本" required>
          <el-input type="text" v-model="tempPatch.suitableVersion">
          </el-input>
        </el-form-item>
        <el-form-item label="平台" required>
          <el-select v-model="tempPatch.platform" placeholder="请选择">
            <el-option v-for="item in platforms" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="补丁说明" required>
          <el-input type="textarea" v-model="tempPatch.patchInstructions" :rows="4">
          </el-input>
        </el-form-item>
        <el-form-item label="是否生效">
          <el-switch v-model="isValid">
          </el-switch>
        </el-form-item>
        <el-form-item label="附件">
          <el-upload class="upload-demo"
            name="apkFile"
            ref="upload"
            :action="uploadUrl"
            :headers="headers"
            method:="post"
            :data="uploadData"
            :multiple="false" 
            :on-change="handleChange"
            :on-preview="filePreview" 
            :on-remove="fileRemove" 
            :file-list="fileList" 
            :auto-upload="false"
            :on-success="handleSuccess"
            :on-error="handleError">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload()">上传到服务器</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="文件路径" required>
            <!-- <el-input type="textarea" v-model="realPath" :rows="2" :disabled="true"></el-input> -->
            <el-input type="text" v-model="tempPatch.filePath" required placeholder="请上传或输入文件路径"></el-input>
        </el-form-item>
        <el-form-item label="渠道" required>
            <el-input type="text" v-model="tempPatch.channel"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog()">取 消</el-button>
        <el-button type="success" v-if="hasPerm('patch:publish')" :disabled="tempPatch.publishStatus=='y'" @click="publishPatchVersion()">发 布</el-button>
        <el-button type="primary" @click="savePatchVersion()">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getToken, removeToken } from "@/utils/auth";
export default {
  data() {
    return {
      disabled: true,
      totalCount: 0, //分页组件--数据总条数
      list: [], //表格的数据
      listLoading: false, //数据加载等待动画
      listQuery: {
        pageNo: 1, //页码
        pageSize: 20, //每页条数
        platform: "",
        publishStatus: "",
        applicationCode:""
      },
      dialogStatus: "create",
      dialogFormVisible: false,
      textMap: {
        update: "修改补丁",
        create: "添加补丁"
      },
      apps: [],
      platforms: [
        {
          value: "android",
          label: "安卓"
        },
        {
          value: "ios",
          label: "苹果"
        }
      ],
      publishStatuses: [
        {
          value: "y",
          label: "已发布"
        },
        {
          value: "n",
          label: "待发布"
        }
      ],
      isValid: false,
      headers: { Authorization: "Bearer " + getToken() },
      uploadUrl: process.env.BASE_URL + "patch_manage/upload",
      uploadData: {
        uploadId: "",
        filePath: ""
      },
      fileList: [],
      ftpDomain: "",
      //realPath:"",
      tempPatch: {
        id: "",
        applicationCode: "",
        patchVersion: "",
        platform: "",
        patchInstructions: "",
        filePath: "",
        publishStatus: "n",
        patchStatus: "",
        suitableVersion: "",
        uploadId: -1,
        channel: ""
      }
    };
  },
  created() {
    this.getList();
    this.getAllApps();
  },
  methods: {
    filePreview() {},
    fileRemove() {},
    getList() {
      //查询列表
      if (!this.hasPerm("patch:list")) {
        return;
      }
      this.listLoading = true;
      //this.listQuery.version=JSON.stringify(this.listQuery.data);
      //this.listQuery.data=JSON.stringify(this.listQuery.data);
      this.api({
        url: "/patch_manage/find",
        method: "get",
        params: this.listQuery
      }).then(data => {
        console.log(data);
        this.listLoading = false;
        this.list = data.list;
        this.totalCount = data.total;
        this.ftpDomain = data.ftpDomain;
      });
    },
    getAllApps() {
      this.api({
        url: "/application_manage/find_apps",
        method: "get"
      }).then(data => {
        console.log(data);
        this.apps = data;
      });
    },
    handleSizeChange(val) {
      //改变每页数量
      this.listQuery.pageSize = val;
      this.handleFilter();
    },
    handleFilter() {
      //查询事件
      this.listQuery.pageNo = 1;
      this.getList();
    },
    handleCurrentChange(val) {
      //改变页码
      this.listQuery.pageNo = val;
      this.getList();
    },
    getIndex($index) {
      //表格序号
      return (this.listQuery.pageNo - 1) * this.listQuery.pageSize + $index + 1;
    },
    showCreate() {
      //显示新增对话框，清空表单
      this.tempPatch.id = "";
      this.tempPatch.applicationCode = "";
      this.tempPatch.patchVersion = "";
      this.tempPatch.suitableVersion = "";
      this.tempPatch.platform = "";
      this.tempPatch.patchInstructions = "";
      this.tempPatch.filePath = "";
      this.isValid = false;
      this.tempPatch.publishStatus = "n"
      //this.realPath = "";
      this.tempPatch.uploadId = -1;
      this.tempPatch.channel = "";
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
    },
    showUpdate($index) {
      let patch = this.list[$index];
      //this.tempPatch=patch;
      
      this.tempPatch.id = patch.id;
      this.tempPatch.applicationCode = patch.applicationCode;
      this.tempPatch.patchVersion = patch.patchVersion;
      this.tempPatch.suitableVersion = patch.suitableVersion;
      this.tempPatch.platform = patch.platform;
      this.tempPatch.patchInstructions = patch.patchInstructions;
      this.isValid = patch.patchStatus == "valid" ? true : false;
      this.tempPatch.publishStatus = patch.publishStatus;
      this.tempPatch.filePath = patch.filePath;
      //this.realPath = this.ftpDomain +"/"+ patch.filePath;
      this.tempPatch.uploadId = patch.uploadId;
      this.tempPatch.channel = patch.channel;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },

    //发布
    publishPatchVersion() {
      //校验必填项是否为空
      if (this.checkContents(this.tempPatch.applicationCode, "请选择应用!!!")) {
        return;
      }
      if (
        this.checkContents(this.tempPatch.patchVersion, "请输入补丁版本!!!")
      ) {
        return;
      }
      if (this.checkContents(this.tempPatch.platform, "请选择平台!!!")) {
        return;
      }
      if (this.checkContents(this.tempPatch.suitableVersion, "请输入适用版本!!!")) {
        return;
      }
      if (this.checkContents(this.tempPatch.patchInstructions,"请输入补丁说明!!!")) {
        return;
      }
      if (this.checkContents(this.tempPatch.filePath,"请上传文件/输入文件路径!!!")) {
        return;
      }
      if (this.checkContents(this.tempPatch.channel,"请输入渠道!!!")) {
        return;
      }
      if (this.isValid) {
        this.tempPatch.patchStatus = "valid";
      } else {
        this.tempPatch.patchStatus = "invalid";
      }
      this.$refs.tempPatch.validate(valid => {
        let message = "发布成功";
        if (valid) {
          this.api({
            url: "/patch_manage/save_published_patch",
            method: "post",
            data: this.tempPatch
          })
            .then(() => {
              this.dialogFormVisible = false;
              this.$message({
                message: message,
                type: "success",
                duration: 1 * 1000,
                onClose: () => {
                  this.$refs.upload.clearFiles();
                  this.getList();
                }
              });
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },

    //保存
    savePatchVersion() {
      //校验必填项是否为空
      if (this.checkContents(this.tempPatch.applicationCode, "请选择应用!!!")) {
        return;
      }
      if (
        this.checkContents(this.tempPatch.patchVersion, "请输入补丁版本!!!")
      ) {
        return;
      }
      if (this.checkContents(this.tempPatch.platform, "请选择平台!!!")) {
        return;
      }
      if (this.checkContents(this.tempPatch.suitableVersion, "请输入适用版本!!!")) {
        return;
      }
      if (this.checkContents(this.tempPatch.patchInstructions,"请输入补丁说明!!!")) {
        return;
      }
      if (this.checkContents(this.tempPatch.filePath,"请上传文件/输入文件路径!!!")) {
        return;
      }
      if (this.checkContents(this.tempPatch.channel,"请输入渠道!!!")) {
        return;
      }
      var saveUrl = "/patch_manage/";
      //id 不为空修改， id 为空新增
      if (this.tempPatch.id == "") {
        saveUrl += "add";
      } else {
        saveUrl += "update";
      }
      if (this.isValid) {
        this.tempPatch.patchStatus = "valid";
      } else {
        this.tempPatch.patchStatus = "invalid";
      }
      this.$refs.tempPatch.validate(valid => {
        let message = "保存成功";
        //修改应用
        if (valid) {
          this.api({
            url: saveUrl,
            method: "post",
            data: this.tempPatch
          })
            .then(() => {
              this.dialogFormVisible = false;
              this.$message({
                message: message,
                type: "success",
                duration: 1 * 1000,
                onClose: () => {
                  this.$refs.upload.clearFiles();
                  this.getList();
                }
              });
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },

    publish($index) {
      let _vue = this;
      let patch = _vue.list[$index];
      let message = "发布成功";
      _vue
        .api({
          url: "/patch_manage/save_publish_status/" + patch.id,
          method: "put",
          data: ""
        })
        .then(() => {
          _vue.$message({
            message: message,
            type: "success",
            duration: 1 * 1000,
            onClose: () => {
              _vue.getList();
            }
          });
        });
    },

    removeVersion($index) {
      let _vue = this;
      this.$confirm("确定删除此版本?", "提示", {
        confirmButtonText: "确定",
        showCancelButton: true,
        type: "warning"
      }).then(() => {
        let patch = _vue.list[$index];
        _vue
          .api({
            url: "/patch_manage/delete/" + patch.id,
            method: "delete",
            data: ""
          })
          .then(() => {
            _vue.getList();
          });
      });
    },

    //校验
    checkContents(content, des) {
      if (!content) {
        this.$message.error(des);
        return true;
      }
    },

    formatPlatform(row, column) {
      return row.platform == "ios"
        ? "苹果"
        : row.platform == "android"
          ? "安卓"
          : "其他";
    },
    formatStatus(row, column) {
      return row.patchStatus == "valid" ? "是" : "否";
    },
    formatPublishStatus(row, column) {
      return row.publishStatus == "y" ? "已发布" : "待发布";
    },

    //上传，判断文件是否选择上传文件
    submitUpload() {
      if (this.fileList.length != 1) {
        alert("please choice your file!!");
        return;
      } else {
        this.uploadData.uploadId = this.tempPatch.uploadId;
        this.uploadData.filePath = this.tempPatch.filePath;
        this.$refs.upload.submit();
      }
    },
    //文件状态改变触发函数
    handleChange(file, fileList) {
      //去掉fileList中原文件，只保留最后选择的文件
      this.fileList = fileList.slice(-1);
    },

    handleSuccess(response, file, fileList) {
      console.log(response);
      //code 为0 时上传成功，用响应内容给filePath赋值
      if (response.code == this.global.SUCCESS_CODE) {
        //this.realPath = this.ftpDomain +"/"+ response.data.resultPath;
        this.tempPatch.filePath =
          this.ftpDomain + "/" + response.data.resultPath;
        this.tempPatch.uploadId = response.data.uploadId;
      } else {
        this.$message.error(response.message);
        this.$refs.upload.clearFiles();
      }
    },

    handleError(err, file, fileList) {
      this.$message.error("上传失败,请重新上传");
    },

    //关闭前的回调，解决上传文件回显
    handleClose(done) {
      this.$refs.upload.clearFiles(); //效果同this.fileList = []，后者有延迟
      done();
    },
    //取消按钮关闭
    closeDialog() {
      this.$refs.upload.clearFiles();
      this.dialogFormVisible = false;
    }
  }
};
</script>
