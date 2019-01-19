<template>
<div class="templateMsg">
  <!-- 消息推送 -->
  <!-- 内容区 begin -->
  <div class="content">
    <!-- .left-box begin -->
    <div class="left-box">
      <!-- 选择模板所在行 begin -->
      <el-row class="top">
        <el-button type="primary" class="btnRefresh" @click="refresh">刷新</el-button>
        选择模板
        <el-select class="sel" v-model="value" placeholder="请选择" @change="setCurrentTemplate">
          <el-option v-for="tpl in templateList" :key="tpl.templateId" :tpl="tpl" :label="tpl.title" :value="tpl.templateId"></el-option>
        </el-select>
      </el-row>
      <!-- 选择模板所在行 end -->
      <!-- 关键词编辑 begin -->
      <el-row class="bottom">
        <p class="bottom-title">关键词编辑</p>
        <label class="item" v-for="(kw,index) in currentTemplate.keyWords" :key='index' :kw="kw">
            <span class="keyword-name">{{kw[0]}}</span>
            <span class="true-keyword" v-show="false">{{kw[1].replace(/\{|\}/g,'').split('.')[0]}}</span>
            <el-input class="npt"></el-input>
        </label>
        <label class="item">
            <span class="keyword-name">链接地址</span>
            <el-input class="npt" placeholder="请输入消息推送后打开的页面地址" v-model="openPageUrl"></el-input>
        </label>
      </el-row>
      <!-- 关键词编辑 end -->
      <el-row class="btn-row">
        <el-button type="primary" class="btnEmit" @click="emitMessage">发送模板消息&nbsp;&nbsp;&gt;</el-button>
      </el-row>
    </div>
    <!-- .left-box end -->
  </div>
  <!-- 内容区 end -->
</div>
</template>

<script>
export default {
  data() {
    return {
      // 模板列表
      templateList: [],
      value: "",
      currentTemplate: {},
      openPageUrl: ''
    };
  },
  created() {
    this.getTemplateList();
  },
  methods: {
    getTemplateList() {
      //请求接口，获取模板列表
      this.api({
        url: "/message/template/list_nopage",
        method: "post"
      }).then(data => {
				console.log("​getTemplateList -> data", data)
        
        this.templateList = data.list;
      });
    },
    setCurrentTemplate(currentId) {
      this.currentTemplate = this.templateList.find(
        ele => ele.templateId === currentId
      );
      // 重置关键词
      let npts = document.querySelectorAll('.left-box .bottom .item input');
      for (let i = 0; i < npts.length - 1; i++) {
        npts[i].value = '';
      }
      // 重置链接地址
      this.openPageUrl = '';


    },
    refresh() {
      window.location.reload();
    },

    emitMessage() {
      // 检查是否已选择模板
      if (!this.value) {
        this.$message({
          message: '请选择模板',
          type: 'warning'
        });
        return;
      }

      let items = document.querySelectorAll('.left-box .bottom .item');
      let data = {
        data: []
      };

      if (items.length > 1) {
        for (let i = 0; i < items.length - 1; i++) {
          let kName = items[i].querySelector('.true-keyword').innerHTML;
          let kValue = items[i].querySelector('input').value.trim();
          data.data.push([kName, kValue]);
        }
        // 校验必填项
        if (data.data.some(ele => ele[1] === '')) {
          this.$message({
            message: '关键词填写不完整，发送已中止',
            type: 'error'
          });
          return;
        }
        // 校验链接地址
        var pageUrl = items[items.length - 1].querySelector('input').value.trim();
        if (!pageUrl) {
          this.$message({
            message: '链接地址没有填写，发送已中止',
            type: 'error'
          });
          return;
        } else {
          let reg = /^\//;
          if (reg.test(pageUrl)) {
            this.$message({
              message: '链接地址不可以“/”开头，发送已中止',
              type: 'error'
            });
            return;
          }
        }
      }

      let emitParams = {
        templateID: this.currentTemplate.templateId,
        templateName: this.currentTemplate.title,
        pageUrl,
        data: JSON.stringify(data)
      };

      this.api({
        url: "/message/template/send",
        method: "post",
        data: emitParams
      }).then(data => {
        console.log(data);
        this.$message({
          message: '发送成功！',
          type: 'success'
        });
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.templateMsg {
  padding: 16px;

  .content {

    .left-box {
      width: 80%;
      margin: 0 auto;

      .top {
        margin-bottom: 32px;

        .btnRefresh {
          float: right;
        }

        .sel {
          margin-left: 16px;
          width: 25em;
        }
      }

      .item {
        display: block;
        margin: 8px 0;

        .keyword-name {
          display: inline-block;
          min-width: 4em;
        }

        .npt {
          display: inline-block;
          width: 70%;
          margin-left: 16px;
        }
      }

      .btn-row {
        margin-top: 2em;
      }

      .btnRefresh {
        margin-left: 32px;
      }

      .red {
        color: #f00;
        margin-left: 1.5em;
      }
    }
  }
}
</style>
