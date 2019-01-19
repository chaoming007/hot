<template>
<div class="container">
  <!-- 头部 begin -->
  <el-row>
    <h3 class="caption">补丁列表</h3>
    <el-button class="btn-add" type="primary" @click="showPublishDlg">新增补丁</el-button>
  </el-row>
  <!-- 头部 end -->
  <!-- 表格 begin -->
  <el-table :data="appList" stripe  style="width: 100%" border>
    <el-table-column align="center" prop="patchCode" label="补丁版本号" width="140"></el-table-column>
    <el-table-column align="center" prop="patchDesc" label="补丁描述" width="380"></el-table-column>
    <el-table-column align="center" prop="releaseTime" label="补丁下发时间" width="160" :formatter="formatDate"></el-table-column>
    <el-table-column align="center" prop="size" label="补丁大小"></el-table-column>
    <el-table-column align="center" prop="patchStatus" label="补丁状态" width="140" :formatter="formatPatchStatus"></el-table-column>
    <el-table-column align="center" prop="lowerNum" label="补丁已下发" width="140"></el-table-column>
    <el-table-column align="center" label="操作" width="220">
      <template slot-scope="scope">
        <el-button 
          v-show="(scope.row.patchStatus===2||scope.row.patchStatus===3)&&scope.row.status!=0" 
          type="primary" 
          plain 
          size="mini" 
          @click="changeSwitch(scope.row.id,scope.row.status,scope.row.patchCode)">
            {{scope.row.status==1?'暂停':'启动'}}
          </el-button>
        <el-button type="primary" plain size="mini" @click="viewChart(scope.row)">查看</el-button>
      </template>
    </el-table-column>
  </el-table>
  <!-- 表格 end -->
  <!-- 分页 begin -->
  <div class="page">
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.currentPage"
      :page-sizes="[10, 20, 30, 50, 100]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="count">
    </el-pagination>
  </div>
  <!-- 分页 end -->
  <!-- 发布新补丁对话框 begin -->
  <el-dialog title="发布新补丁" :visible.sync="publishDlgVis" width="700px" center>
    <div class="form-box">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="80px">
        <el-form-item label="补丁文件" prop="patchName">
          <el-input v-model="ruleForm.patchName" readonly class="w490"></el-input>
          <el-upload 
            ref="upload"
            class="upload" 
            :action="uploadUrl" 
            method:="post" 
            :on-success="uploaded" 
            :on-error="err => {hideSpinner()}" 
            :on-progress="file => {showSpinner()}" 
            :show-file-list="false">
            <el-button class="btn-browse" v-loading="isSpinnerShow" element-loading-spinner="el-icon-loading">上 传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="补丁描述" prop="patchDescription">
          <el-input type="textarea" rows="7" resize="none" v-model="ruleForm.patchDescription"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm('ruleForm')">确 定</el-button>
      <el-button @click="publishDlgVis = false">取 消</el-button>
    </div>
  </el-dialog>
  <!-- 发布新补丁对话框 end -->
</div>
</template>

<script>
import {
  getToken,
  removeToken
} from '@/utils/auth';
import {parseTime} from '@/utils/index';
export default {
  data() {
    return {
      // 补丁列表
      appList: [],
      // 分页
      count: 0, //总记录数
      pagination: {
        pageSize: 10,
        currentPage: 1
      },
      //补丁列表参数请求
      patchParmas: {
        pageSize: 10,
        currentPage: 1,
        versionId: 0  //版本id，从补丁列表页面传来
      },
      //补丁状态
      patchStatus:1,
      // 发布补丁对话框显示开关
      publishDlgVis: false,
      // 校验项
      ruleForm: {
        patchName: '',
        patchDescription: '',
        patchUrl: '',
        versionId: 0,  //版本id，从补丁列表页面传来
        size: ''  //补丁大小
      },
      // 校验器
      rules: {
        patchName: [{
          required: true,
          message: '请上传补丁文件',
          trigger: 'change'
        }],
        patchDescription: [{
          required: true,
          message: '请输入补丁描述',
          trigger: 'blur'
        }]
      },
      
      // 上传头信息
      headers: {
        'Authorization': "Bearer " + getToken()
      },
      // 上传接口地址配置
      uploadUrl: process.env.BASE_URL + "/hotfix/patch/uploadPatch",
      // loading图标显示开关
      isSpinnerShow: false
    };
  },
  created() {
    this.getAppList();
  },
  methods: {
    //设置补丁列表参数
    setPatchParmas(){
      this.patchParmas.currentPage = this.pagination.currentPage;
      this.patchParmas.pageSize = this.pagination.pageSize;
      this.patchParmas.versionId = this.$route.query.versionId;
      return this.patchParmas;
    },
    // 获取补丁列表
    getAppList() {
      this.appList = [];
      this.api({
        url: '/hotfix/patch/pageList',
        method: 'post',
        data: this.setPatchParmas()
      }).then(res => {
        console.log(res,"补丁列表返回数据")
          this.count = res.count;
          this.appList = [...res.list];
          this.patchStatus = res.list[0].patchStatus;

      }).catch(err => {});
    },
    // setListDat(data){
    //   data.forEach((item,key)=>{
    //       // item.switchStatus=1
    //   })
    //   return data
    // },
    // 校验表单
    submitForm(formName) {
      this.ruleForm.versionId = parseInt(this.$route.query.versionId);
      this.$refs[formName].validate((valid) => {
       if (valid) {
          // 校验通过后提交
          this.api({
            url: '/hotfix/patch/insert',
            method: 'post',
            data: this.ruleForm
          }).then(res => {
            this.hideAddDlg();
            this.$message({
              message: '新增成功',
              type: 'success'
            });
            this.pagination.currentPage = 1;
            this.getAppList();
          }).catch(err => {});
       } else {
          return false;
       }
      });
    },
    // 重置表单
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    // 弹出发布补丁对话框
    showPublishDlg() {
      this.publishDlgVis = true;
      this.$nextTick(() => {
        this.resetForm('ruleForm');
      });
    },
    // 关闭发布补丁对话框
    hideAddDlg() {
      this.publishDlgVis = false;
    },
    handleSizeChange(val) {
        //改变每页数量
        this.pagination.pageSize = val;
        this.getAppList();
    },
    handleCurrentChange(val) {
        //改变页码
        this.pagination.currentPage = val;
        this.getAppList();
    },
    //格式化补丁状态
    formatPatchStatus(row, column) {
      let patchStatusName = ""
      switch (row.patchStatus) {
        case 1:
          patchStatusName = "已就绪"
          break;
        case 2:
          patchStatusName = "已灰度"
          break;
        default:
          patchStatusName = "已全量"
          break;
      }
      return patchStatusName
    },
    //格式化补丁下发时间
    formatDate(row,column){
      return parseTime(new Date(row.releaseTime))
    },
    // 查看
    viewChart(row) {
      this.$router.push({
        path:"/hotRestore/hotrestorechar",
        query: {
          patchId: row.id, //补丁列表-补丁id
          patchCode: row.patchCode,  //补丁列表-补丁号
          patchStatus: row.patchStatus, //补丁列表-补丁状态
          status: row.status, //补丁列表-补丁启动暂停状态
          versionCode: this.$route.query.versionCode, //版本列表-版本号
          versionId: this.$route.query.versionId, //版本列表-版本id
          applicationId: this.$route.query.applicationId,  //应用列表-应用id
          applicationKey: this.$route.query.applicationKey //应用列表-应用密钥
        }
      });
    },
    //启用暂停开关
    changeSwitch(id,status,code){
      var msg=status==1?"暂停":"启动";
      // let st = status==1?2:1;
      this.$confirm('确认要'+msg+'当前补丁版本吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).then(()=>{
          this.api({
              url:"/hotfix/patch/changeStatus",
              method:"post",
              data:{
                  id:id,  //补丁id
                  status:status===1?2:1,  //补丁状态，如果当前操作是启动，那就传1，如果当前操作是暂停，那就传2
                  patchCode:code  //	补丁号
              }
          }).then((data)=>{ 
              this.$message({
                  message: msg+'成功！',
                  type: 'success'
              });
              this.getAppList();
             
          })
      }).catch(() => {
      
      }); 
    },
    // 显示上传进度
    showSpinner() {
      this.isSpinnerShow = true;
    },
    // 隐藏上传进度
    hideSpinner() {
      this.isSpinnerShow = false;
    },
    // 上传图片成功后，把图片路径放入节点字段列表中
    uploaded(response,file) {
      console.log(response.data)
      this.ruleForm.patchUrl = response.data.url;
      this.ruleForm.patchName = file.name;
      this.ruleForm.size = response.data.size;
      this.hideSpinner();
    },
    
  }
}
</script>

<style lang="scss">
.container {
  .form-box {
    .upload {
      .btn-browse {
        .el-loading-spinner {
          margin-top: -7px;
        }
      }
    }
  }
}
.appswitch .el-switch__label {
  position: absolute;
  display: none;
  color: #fff;
}
/*打开时文字位置设置*/
.appswitch .el-switch__label--right {
  z-index: 1;
  right: 7px;
}
/*关闭时文字位置设置*/
.appswitch .el-switch__label--left {
  z-index: 1;
  left: 8px;
}
/*显示文字*/
.appswitch .el-switch__label.is-active {
  display: block;
}
.appswitch.el-switch .el-switch__core,
.el-switch .el-switch__label {
  width: 55px !important;
}
</style>


<style lang="scss" scoped>
.container {
  padding: 16px;
  .page{
    padding: 10px 0;
  }

  .caption {
    display: inline-block;
  }

  .btn-add {
    float: right;
  }

  .pagination {
    margin-top: 20px;
  }

  .form-box {
    .w490 {
      width: 490px;
    }
    .upload {
      display: inline-block;
    }
  }
}

</style>
