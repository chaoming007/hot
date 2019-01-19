<template>
<div class="my-template">
  <el-tabs v-model="currentTab" type="card">
    <!-- 我的模板tab begin -->
    <el-tab-pane label="我的模板" name="myTemplate">
      <el-row class="btn-box-refresh">
        <el-button type="primary" @click="templateRefresh" class="btn-refresh">刷新</el-button>
      </el-row>
      <el-table :data="templateList" border style="width: 100%">
        <el-table-column prop="title" align="center" label="标题" width="250"></el-table-column>
        <el-table-column align="center" label="关键词" width="180">
          <template slot-scope="scope">
            <div :kw="kw" v-for="(kw,index) in scope.row.keyWords" :key="index">{{kw[0]}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="templateId" align="center" label="模板ID"></el-table-column>
        <el-table-column align="center" label="模板示例">
          <template slot-scope="scope">
            <div :ex="ex" v-for="(ex,index) in scope.row.example" :key="index">{{ex[1]}}</div>
          </template>
        </el-table-column>
        <el-table-column fixed="right" align="center" label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" @click="templateDetailDlg(scope.row.templateId)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 我的模板分页 begin -->
      <el-pagination @current-change="templatePageChange" :current-page="templatePagination.offset" :page-size="templatePagination.pageSize" :total="templatePagination.totalCount" :page-sizes="[10]" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      <!-- 我的模板分页 end -->
    </el-tab-pane>
    <!-- 我的模板tab end -->
    <!-- 埋点管理tab begin -->
    <el-tab-pane label="埋点管理" name="buriedPoints">
      <el-row class="buriedSearchBar">
        <el-button type="primary" @click="pointAdd" class="btn-add">增加</el-button>
        <el-button type="plain" class="btn-search" @click="getBuriedPointList(true)">查找</el-button>
        <el-select v-model="buriedPointDefaultStatus" placeholder="请选择" @change="setSearchCondition">
          <el-option label="全部" value="3"></el-option>
          <el-option v-for="st in buriedPointStatus" :key="st.value" :label="st.label" :value="st.value"></el-option>
        </el-select>
      </el-row>
      <!-- 埋点tab table begin -->
      <el-table :data="buriedPointList" border style="width: 100%">
        <el-table-column type="index" :index="index => buriedPointPagination.count * (buriedPointPagination.offset-1) + index + 1" label="序号" width="80" align="center"></el-table-column>
        <el-table-column prop="pageCode" label="页面编号" width="120" align="center"></el-table-column>
        <el-table-column prop="pageName" label="页面名称" width="140" align="center"></el-table-column>
        <el-table-column prop="moudleCode" label="模块编号" width="120" align="center"></el-table-column>
        <el-table-column prop="moudleName" label="模块名称" width="180" align="center"></el-table-column>
        <el-table-column prop="pointCode" label="点位编号" width="120" align="center"></el-table-column>
        <el-table-column prop="pointName" label="点位名称" width="180" align="center"></el-table-column>
        <el-table-column prop="pointDescribe" label="点位描述" align="center"></el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template slot-scope="scope">{{['待执行','使用中','已停用','全部'][scope.row.status]}}</template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="buriedPointEdit(scope.row.id)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 埋点tab table end -->
      <!-- 埋点管理分页 begin -->
      <el-pagination @current-change="buriedPointPageChange" :current-page="buriedPointPagination.offset" :page-size="buriedPointPagination.pageSize" :total="buriedPointPagination.totalCount" :page-sizes="[10]" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      <!-- 埋点管理分页 end -->
    </el-tab-pane>
    <!-- 埋点管理tab end -->
  </el-tabs>
  <!-- 我的模板-详情对话框 begin -->
  <el-dialog :visible.sync="templateDetailDlgVis" width="840px">
    <div class="template-detail">
      <!-- .left-box begin -->
      <div class="left-box">
        <div class="line border-bottom-none">
          <img src="../../assets/images/logo.png" style="width:18px;height:18px;">
          </div>
          <div class="line border-bottom-none">
            <h3 class="notice-title">{{theDetailTemplate.title}}</h3>
            <ul>
              <li v-for="(ex, index) in theDetailTemplate.example" :ex="ex" :key="index">
                <span class="item">{{ex[0]}}</span>
                <span class="itemValue">{{ex[1]}}</span>
              </li>
            </ul>
          </div>
          <div class="line">
            <span class="right-arrow">&gt;</span>查看详情
          </div>
        </div>
        <!-- .left-box end -->
        <!-- .right-box begin -->
        <div class="right-box">
          <div class="line">
            <div class="itemName">模板ID</div>
            <div class="itemValue">{{theDetailTemplate.templateId}}</div>
            <!-- 复制功能-->
            <el-button type="text" class="btn-copy" v-clipboard:copy="theDetailTemplate.templateId" @click="copySuccess">复制</el-button>
          </div>
          <div class="line">
            <div class="itemName">标题</div>
            <div class="itemValue">{{theDetailTemplate.title}}</div>
          </div>
          <div class="line">
            <div class="itemName">关键词</div>
            <div class="itemValue">
              <ul class="keyword-list">
                <li v-for="(kw, index) in theDetailTemplate.keyWords" :key="index" :kw="kw">{{kw[0]}}&nbsp;&nbsp; {{kw[1]}}</li>
              </ul>
            </div>
          </div>
        </div>
        <!-- .right-box end -->
      </div>
  </el-dialog>
  <!-- 我的模板-详情对话框 begin -->
  <!-- 埋点管理-新增点位对话框 begin-->
  <el-dialog class="addDialog" title="新增点位" center :visible.sync="buriedPointAddDlgVis" width="600px" @close="onClose('addPointForm')">
    <el-form :model="newPoint" :rules="addPointRules" ref="addPointForm" label-position="'left'" label-width="6em">
      <el-row class="row">
        <el-form-item label="页面名称" lab prop="pageName">
          <el-input v-model="newPoint.pageName"></el-input>
        </el-form-item>
        <el-form-item label="页面编号" prop="pageCode">
          <el-input v-model="newPoint.pageCode"></el-input>
        </el-form-item>
      </el-row>
      <el-row class="row">
        <el-form-item label="模块名称" prop="moudleName">
          <el-input v-model="newPoint.moudleName"></el-input>
        </el-form-item>
        <el-form-item label="模块编号" prop="moudleCode">
          <el-input v-model="newPoint.moudleCode"></el-input>
        </el-form-item>
      </el-row>
      <el-row class="row">
        <el-form-item label="点位名称" prop="pointName">
          <el-input v-model="newPoint.pointName"></el-input>
        </el-form-item>
        <el-form-item label="点位编号" prop="pointCode">
          <el-input v-model="newPoint.pointCode"></el-input>
        </el-form-item>
      </el-row>
      <el-form-item class="footer">
        <el-button @click="pointAddCancel('addPointForm')">取 消</el-button>
        <el-button type="primary" @click="pointAddOk('addPointForm')">确 定</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  <!-- 埋点管理-新增点位对话框 end -->
  <!-- 埋点管理-编辑信息对话框 begin-->
  <div class="editDianweiDialog">
    <el-dialog title="编辑信息" center :visible.sync="buriedPointEditDlgVis" width="506px">
      <div class="editDianWeiContent">
        <div class="item">
          <span class="itemName">点位编号：</span>
          <span class="itemValue">{{edittingBuriedPoint.pointCode}}</span>
        </div>
        <div class="item">
          <span class="itemName">点位名称：</span>
          <span class="itemValue">{{edittingBuriedPoint.pointName}}</span>
        </div>
        <div class="item">
          <span class="itemName">状态：</span>
          <el-select v-model="edittingBuriedPoint.status" placeholder="请选择">
            <el-option v-for="st in buriedPointStatus" :key="st.value" :label="st.label" :value="st.value"></el-option>
          </el-select>
        </div>
        <div class="item">
          <span class="itemName">点位描述：</span>
          <textarea class="dianWeiDescription" v-model="edittingBuriedPoint.pointDescribe"></textarea>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button @click="pointEditCancel">取 消</el-button>
          <el-button type="primary" @click="pointEditOk">确 定</el-button>
        </span>
    </el-dialog>
  </div>
  <!-- 埋点管理-编辑信息对话框 end -->
</div>
</template>

<script>
import Vue from "vue";
export default {
  data() {
    return {
      // 当前tab名称，用于设置默认显示的tab
      currentTab: "myTemplate",

      // 我的模板分页
      templatePagination: {
        totalCount: 0, //分页组件--数据总条数
        offset: 1, //页码
        count: 10 //每页条数
      },
      // 模板列表
      templateList: [],

      // 模板详情对话框显示开关
      templateDetailDlgVis: false,
      // 当前展示详情的模板
      theDetailTemplate: {},
      // -------------------

      // 埋点列表分页
      buriedPointPagination: {
        totalCount: 0,
        offset: 1,
        count: 10
      },
      // 埋点管理列表
      buriedPointList: [],
      // 埋点状态列表
      buriedPointStatus: [{
          label: "待执行",
          value: 0
        },
        {
          label: "使用中",
          value: 1
        },
        {
          label: "已停用",
          value: 2
        }
      ],
      // 埋点状态下拉的默认项
      buriedPointDefaultStatus: "使用中",
      // 埋点查询条件（状态）
      buriedPointSearchCondition: 1,
      // 新增埋点对话框显示开关
      buriedPointAddDlgVis: false,
      // 编辑点位对话框显示开关
      buriedPointEditDlgVis: false,
      // 当前正在编辑的点位
      edittingBuriedPoint: {},
      // 当前正在编辑的点位的原数据备份，用于点击“取消”时恢复
      edittingBuriedPointBak: {},
      // 新增点位
      newPoint: {},
      addPointRules: {
        pageName: [{
          required: true,
          message: '请填写页面名称'
        }],
        pageCode: [{
          required: true,
          message: '请填写页面编号'
        }, {
          pattern: '^\\d+$',
          message: '页面编号不符合要求，请重新填写'
        }],
        moudleName: [{
          required: true,
          message: '请填写模块名称'
        }],
        moudleCode: [{
          required: true,
          message: '请填写模块编号'
        }, {
          pattern: '^\\d+$',
          message: '模块编号不符合要求，请重新填写'
        }],
        pointName: [{
          required: true,
          message: '请填写点位名称'
        }],
        pointCode: [{
          required: true,
          message: '请填写点位编号'
        }, {
          pattern: '^\\d+$',
          message: '点位编号不符合要求，请重新填写'
        }]
      }
    };
  },
  methods: {
    // ------我的模板相关 begin
    getTemplateList() {
      //查询列表
      this.api({
        url: "/message/template/list",
        method: "post",
        data: {
          offset: this.templatePagination.offset,
          count: this.templatePagination.count
        }
      }).then(data => {
        console.log(data);
        this.templateList = data.list;
        this.templatePagination.totalCount = data.totalCount;
      });
    },
    templatePageChange(p) {
      this.templatePagination.offset = p;
      this.getTemplateList();
    },
    templateRefresh() {
      this.templatePagination.offset = 1;
      this.getTemplateList();
    },
    templateDetailDlg(templateId) {
      this.api({
        url: "/message/template/detail",
        method: "post",
        data: {
          templateId,
          offset: this.templatePagination.offset,
          count: this.templatePagination.count
        }
      }).then(data => {
        this.theDetailTemplate = data;
      });
      this.templateDetailDlgVis = true;
    },
    copySuccess() {
      this.$message({
        message: '复制成功！',
        type: 'success'
      });
    },
    // -------我的模板相关 end

    // -------埋点管理相关 begin
    getBuriedPointList(isResetCurrentPage) {
      if (isResetCurrentPage) {
        this.buriedPointPagination.offset = 1;
      }
      let data = {
        pageNum: this.buriedPointPagination.offset,
        pageSize: this.buriedPointPagination.count
      };
      if (this.buriedPointSearchCondition < 3) {
        data.status = this.buriedPointSearchCondition;
      }
      this.api({
        url: "/buriedpoint/get_list",
        method: "post",
        data
      }).then(data => {
        this.buriedPointList = data.records;
        this.buriedPointPagination.totalCount = data.total;
        this.buriedPointPagination.offset = data.current;
      });
    },
    buriedPointPageChange(p) {
      this.buriedPointPagination.offset = p;
      this.getBuriedPointList();
    },
    buriedPointEdit(pointId) {
      console.log(pointId);
      this.edittingBuriedPoint =
        this.buriedPointList.find(ele => ele.id === pointId) || {};
      this.edittingBuriedPointBak = { ...this.edittingBuriedPoint
      };
      this.buriedPointEditDlgVis = true;
    },
    pointEditOk() {
      console.log(this.edittingBuriedPoint);
      this.api({
        url: "/buriedpoint/update",
        method: "post",
        data: {
          id: this.edittingBuriedPoint.id,
          status: this.edittingBuriedPoint.status,
          pointDescribe: this.edittingBuriedPoint.pointDescribe
        }
      }).then(data => {
        console.log(data);
        // 编辑提交成功后重新请求页面，刷新数据
        this.getBuriedPointList();
      });
      this.buriedPointEditDlgVis = false;
    },
    pointEditCancel() {
      this.buriedPointEditDlgVis = false;
      Vue.set(
        this.edittingBuriedPoint,
        "pointDescribe",
        this.edittingBuriedPointBak.pointDescribe
      );
      Vue.set(
        this.edittingBuriedPoint,
        "status",
        this.edittingBuriedPointBak.status
      );
    },
    pointAdd() {
      this.buriedPointAddDlgVis = true;
    },
    pointAddOk(formName) {
      console.log(this.newPoint);
      // 表单验证
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.api({
            url: "/buriedpoint/insert",
            method: "post",
            data: {
              pageCode: this.newPoint.pageCode,
              pageName: this.newPoint.pageName,
              moudleCode: this.newPoint.moudleCode,
              moudleName: this.newPoint.moudleName,
              pointCode: this.newPoint.pointCode,
              pointName: this.newPoint.pointName
            }
          }).then(data => {
            console.log('ok', data);
            this.buriedPointAddDlgVis = false;
            // 提交成功后重新请求页面，刷新数据
            this.getBuriedPointList(true);
          });
        }
        return false;

      });

    },
    pointAddCancel(formName) {
      this.buriedPointAddDlgVis = false;
    },
    onClose(formName) {
      this.$refs[formName].resetFields();
    },
    setSearchCondition(currentStatus) {
      console.log(currentStatus);
      this.buriedPointSearchCondition = currentStatus;
    }
    // 埋点管理相关 end
  },
  created() {
    this.getTemplateList();
    this.getBuriedPointList();
  }
};
</script>

<style lang="scss" scoped>
.my-template {
  padding: 16px;

  .btn-box-refresh {
    text-align: right;
    margin-bottom: 24px;

    .btn-refresh {
      margin-right: 40px;
    }
  }

  .template-detail {
    display: flex;

    .left-box {
      flex-grow: 1;
      flex-basis: 280px;
      padding: 1em;

      .line {
        border: 1px solid #ccc;
        padding: 1em;

        ul {
          list-style: none;
          margin: 0;
          padding: 0;

          .item {
            margin-right: 1em;
          }

          .itemValue {
            color: #222;
          }
        }

        .right-arrow {
          float: right;
        }

        &.border-bottom-none {
          border-bottom: none;
        }
      }
    }

    .right-box {
      flex-grow: 1;
      padding: 1em;

      .itemName {
        display: inline-block;
        vertical-align: top;
        margin-right: 1em;
        width: 6em;
        margin-bottom: 1em;
      }

      .itemValue {
        display: inline-block;
        vertical-align: top;
        margin-bottom: 1em;
      }

      ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .btn-copy {
        display: block;
        padding: 0;
        margin-left: 7em;
        margin-bottom: 1em;
        margin-top: -0.7em;
      }
    }
  }

  .buriedSearchBar {
    padding-bottom: 24px;
    .btn-search,
    .btn-add {
      float: right;
      margin-right: 24px;
    }
  }

  .addDialog {
    .row {
      display: flex;
      justify-content: space-between;
    }

    .footer {
      text-align: center;
      margin-left: -6em;
    }
  }

  .editDianWeiContent {
    .dianWeiDescription {
      display: block;
      resize: none;
      overflow: hidden;
      width: 100%;
      height: 100px;
      border: 1px solid #dcdfe6;
      padding: 8px;
    }
  }
}
</style>
