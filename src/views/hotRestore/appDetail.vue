<template>
<div class="container">
  <!-- 头部 begin -->
  <el-row>
    <h3 class="caption">版本列表</h3>
    <el-button class="btn-add" type="primary" @click="showAddDlg">新增版本</el-button>
  </el-row>
  <!-- 头部 end -->
  <!-- 表格 begin -->
  <el-table :data="appList" stripe style="width: 100%" border>
    <el-table-column align="center" prop="versionCode" label="app版本号" width="200"></el-table-column>
    <el-table-column align="center" prop="patchNum" label="补丁数量"></el-table-column>
    <el-table-column align="center" prop="updateTime" label="最后更新时间" width="240"></el-table-column>
    <el-table-column align="center" prop="totalLower" label="总下发数" width="140"></el-table-column>
    <el-table-column align="center" label="操作" width="120">
      <template slot-scope="scope">
        <el-button type="text" size="mini" @click="viewPatch(scope.row)">查看</el-button>
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
  <!-- 新增对话框 begin -->
  <el-dialog title="新增版本" :visible.sync="addDlgVis" width="600px" center>
    <div class="form-box">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px">
        <el-form-item label="应用版本号" prop="versionCode">
          <el-input v-model="ruleForm.versionCode" placeholder="请输入应用版本号"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm('ruleForm')">确 定</el-button>
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
      count: 0, //总记录数
      pagination: {
        pageSize: 10,
        currentPage: 1
      },
      versionParams:{
        pageSize: 10,
        currentPage: 1,
        applicationId: '',  //应用id
        applicationKey: ''  //应用秘钥
      },
      // 新增对话框显示开关
      addDlgVis: false,
      // 新增表单校验项
      ruleForm: {
        applicationId: '', //应用id
        versionCode: ''  //应用版本号
      },
      // 校验器
      rules: {
        versionCode: [{
          required: true,
          message: '请输入应用版本号',
          trigger: 'blur'
        }]
      },

    };
  },
  created() {
    this.getAppList();
  },
  methods: {
    //设置版本参数
    setVersionParmas(){
      this.versionParams.currentPage = this.pagination.currentPage;
      this.versionParams.pageSize = this.pagination.pageSize;
      this.versionParams.applicationId = this.$route.query.applicationId;
      this.versionParams.applicationKey = this.$route.query.applicationKey;
      return this.versionParams;
    },
    // 获取版本列表
    getAppList() {
      this.appList = [];
      this.api({
        url: '/hotfix/version/pageList',
        method: 'post',
        data: this.setVersionParmas()
      }).then(res => {
          this.count = res.count;
          this.appList = [...res.list];
      }).catch(err => {});
    },
    // 校验表单
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 校验通过后提交
          this.ruleForm.applicationId = this.$route.query.applicationId;
          this.api({
            url: '/hotfix/version/insert',
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
    // 弹出新增对话框
    showAddDlg() {
      this.addDlgVis = true;
      this.$nextTick(() => {
        this.resetForm('ruleForm');
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
    viewPatch(row) {
      this.$router.push({
        path:"/hotRestore/patch",
        query: {
          versionCode: row.versionCode, //版本列表-版本号
          versionId: row.id, //版本列表-版本id
          applicationId: this.$route.query.applicationId,  //应用列表-应用id
          applicationKey: this.$route.query.applicationKey //应用列表-应用密钥
        }
      });
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
  .btn-add {
    float: right;
  }
  .caption {
    display: inline-block;
  }
  .pagination {
    margin-top: 20px;
  }
}
</style>
