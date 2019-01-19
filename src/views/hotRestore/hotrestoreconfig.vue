<template>
<div class="container">
  <!-- 头部 begin -->
  <el-row>
    <h3 class="caption">应用列表</h3>
    <el-button class="btn-add" type="primary" @click="showAddDlg">新增应用</el-button>
  </el-row>
  <!-- 头部 end -->
  <!-- 表格 begin -->
  <el-table :data="appList" stripe style="width: 100%" border>
    <el-table-column align="center" label="应用名称" width="220">
      <template slot-scope="scope">
        {{scope.row.applicationName + `(${getAppTypeLabel(scope.row.cid)})`}}
      </template>
    </el-table-column>
    <el-table-column align="center" prop="applicationKey" label="应用密钥" width="480"></el-table-column>
    <el-table-column align="center" prop="totalLower" label="总发布数"></el-table-column>
    <el-table-column align="center" label="操作" width="120">
      <template slot-scope="scope">
        <el-button type="text" size="mini" @click="viewApp(scope.row)">查看</el-button>
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
      :page-size="pagination.pageSize"
      :page-sizes="[10, 20, 30, 50, 100]"
      :total="count"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
  </div>
  <!-- 分页 end -->
  <!-- 新增对话框 begin -->
  <el-dialog title="新增应用" :visible.sync="addDlgVis" width="600px" center>
    <div class="form-box">
      <el-form :model="formData" :rules="rules" ref="formData" label-width="80px">
        <el-form-item label="应用名称" prop="applicationName">
          <el-input v-model="formData.applicationName" placeholder="请输入应用名称"></el-input>
        </el-form-item>
        <el-form-item label="应用包名" prop="applicationPackage">
          <el-input v-model="formData.applicationPackage" placeholder="请输入应用包名"></el-input>
        </el-form-item>
        <el-form-item label="app类型" prop="cid">
          <el-select v-model="formData.cid" placeholder="请选择">
            <el-option
                v-for="item in apptypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
        </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm('formData')">确 定</el-button>
      <el-button @click="addDlgVis = false">取 消</el-button>
    </div>
  </el-dialog>
  <!-- 新增对话框 end -->
</div>
</template>

<script>
export default {
  data() {
    return {
      // 应用列表
      appList: [],
      // 分页
      count:0,  //总条数
      pagination: {
        pageSize: 10,  //每页条数
        currentPage: 1 //页码
      },
      // 新增对话框显示开关
      addDlgVis: false,
      apptypeOptions:[
        {
          value: '100',
          label: 'android'
        },
        {
          value: '200',
          label: 'ios'
        }
      ],
      // 新增表单项
      formData: {
        applicationName: '',  //应用名称
        applicationPackage: '',  //应用包名
        cid:''  //app类型
      },
      // 校验器
      rules: {
        applicationName: [{
          required: true,
          message: '请输入应用名称',
          trigger: 'blur'
        }],
        applicationPackage: [{
          required: true,
          message: '请输入应用包名',
          trigger: 'blur'
        }],
        cid: [{
          required: true,
          message: '请选择app类型',
          trigger: 'change'
        }]
      }
    };
  },
  created() {
    this.getAppList();
  },
  methods: {
    // 获取应用列表
    getAppList() {
      this.appList = [];
      this.api({
        url: '/hotfix/application/pageList',
        method: 'post',
        data:this.pagination
      }).then(res => {
          this.appList = [...res.list];
          this.count = res.count;
      }).catch(err => {
        
      });
    },
    // 校验表单
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 校验通过后提交
          this.api({
            url: '/hotfix/application/insert',
            method: 'post',
            data: this.formData
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
    // 弹出新增对话框
    showAddDlg() {
      this.addDlgVis = true;
      this.$nextTick(() => {
        this.resetForm('formData');
      });
    },
    // 关闭新增对话框
    hideAddDlg() {
      this.addDlgVis = false;
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
    // 查看
    viewApp(row) {
      this.$router.push({
        path:"/hotRestore/appDetail",
        query: {
          applicationId: row.id,  //应用列表-应用id
          applicationKey: row.applicationKey //应用列表-应用密钥
        }
      });
    },
    //获取设备类型
    getAppTypeLabel(typeCode) {
      let result = this.apptypeOptions.find(ele => {
        return ele.value === typeCode;
      });
      return result ? result.label : 'android';
    }
  }
  
}
</script>

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
}
</style>
