<template>
<div class="pushLog">
  <!-- 推送记录 -->
  <!-- 查询导出栏 begin -->
  <el-row class="searchBar">
    <el-button type="primary" class="btn-export" @click="exportOut">导出</el-button>
    <span>
        <span class="demonstration">时间</span>
    <el-date-picker type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="选择日期时间" v-model="timeStart"></el-date-picker>
    </span>
    <span>
      <span class="demonstration">至</span>
    <el-date-picker type="datetime" placeholder="选择日期时间" v-model="timeEnd"></el-date-picker>
    </span>
    <el-button type="plain" class="btn-search" @click="getPushLogList">查找</el-button>
  </el-row>
  <!-- 查询导出栏 end -->
  <!-- 表格 begin -->
  <el-row class="tableBox">
    <!-- 推送记录 table begin -->
    <el-table :data="pushLogList" border style="width: 100%">
      <!-- 编号的计算与当前页有关-->
      <el-table-column type="index" :index="index => pushLogPagination.size * (pushLogPagination.current-1) + index + 1" label="编号" width="80" align="center"></el-table-column>
      <el-table-column prop="createTime" label="推送时间" width="160" align="center"></el-table-column>
      <el-table-column prop="sendUserCount" label="推送用户数量" align="center" width="120px"></el-table-column>
      <el-table-column prop="sendUserSuccessCount" label="推送成功数量" align="center" width="120px"></el-table-column>
      <el-table-column prop="openUserCount" label="打开用户数" align="center" width="100"></el-table-column>
      <el-table-column prop="openUserRate" label="打开率" align="center" width="100"></el-table-column>
      <el-table-column label="模板消息编号" align="center" width="120">
        <template slot-scope="scope">
          {{'000000'.slice(0,6 - scope.row.messageNumber.toString().length) +  scope.row.messageNumber}}
        </template>
      </el-table-column>
      <el-table-column prop="linkHref" label="链接地址" width="160" align="center"></el-table-column>
      <el-table-column prop="templateTitle" label="模板消息标题" width="160" align="center"></el-table-column>
      <el-table-column label="模板消息关键词" align="center">
        <template slot-scope="scope">
          <div v-for="(kw,index) in (scope.row.templateKeys ? scope.row.templateKeys.split('-') : '')" :key="index" :kw="kw">{{kw}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="operatorName" label="操作者" align="center" width="100"></el-table-column>
    </el-table>
  </el-row>
  <!-- 推送记录 table end -->
  <!-- 推送记录分页 begin -->
  <el-pagination @current-change="pageChange" :current-page="pushLogPagination.current" :page-size="pushLogPagination.size" :total="pushLogPagination.total" :page-sizes="[10]" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
  <!-- 推送记录分页 end -->
</div>
</template>

<script>
export default {
  data() {
    return {
      // 分页
      pushLogPagination: {
        total: 0, //数据总条数
        current: 1, //页码
        size: 10 //每页条数
      },
      timeStart: null,
      timeEnd: null,
      // 推送记录列表
      pushLogList: []
    };
  },
  methods: {
    // 获取推送记录列表
    getPushLogList() {
      // 调取api获取列表数据
      this.api({
        url: "/message/msglog/get_page",
        method: "post",
        data: {
          timeStart: this.formatDate(this.timeStart),
          timeEnd: this.formatDate(this.timeEnd),
          pageNum: this.pushLogPagination.current,
          pageSize: this.pushLogPagination.size
        }
      }).then(data => {
        console.log(data);
        this.pushLogList = data.records;
        this.pushLogPagination.total = data.total;
        this.pushLogPagination.current = data.current;
      });
    },

    // 下载
    download(data) {
      if (!data) {
        return;
      }
      var blob = new Blob([data], {
        type: 'application/vnd.ms-excel;charset=utf-8'
      })
      var downloadElement = document.createElement('a');
      var href = window.URL.createObjectURL(blob); //创建下载的链接
      downloadElement.href = href;
      downloadElement.download = '导出文件.xls'; //下载后文件名
      document.body.appendChild(downloadElement);
      downloadElement.click(); //点击下载
      document.body.removeChild(downloadElement); //下载完成移除元素
      window.URL.revokeObjectURL(href); //释放掉blob对象
    },
    // 格式化日期时间为yyyy-MM-dd HH:mm:ss
    formatDate(dt) {
      if(dt && dt instanceof Date) {
        let y = dt.getFullYear();
        let M = dt.getMonth() + 1;
        let d = dt.getDate();
        let H = dt.getHours();
        let m = dt.getMinutes();
        let s = dt.getSeconds();
        return [
          y,
          '-',
          M<10?'0'+M:M,
          '-',
          d<10?'0'+d:d,
          ' ',
          H<10?'0'+H:H,
          ':',
          m<10?'0'+m:m,
          ':',
          s<10?'0'+s:s
        ].join('');
      }
      return '';
    },
    // 导出
    exportOut() {
      console.log("导出");
      let timeStart = this.formatDate(this.timeStart);
      let timeEnd = this.formatDate(this.timeEnd);
      console.log(timeEnd);
      this.api({
        url: "/message/msglog/export",
        method: "get",
        params: {
          timeStart,
          timeEnd
        },
        responseType: "blob"
      }).then(data => {
        this.download(data);
      }).catch(err => err);
      
    },
    // 当分页器页码变化时
    pageChange(p) {
      console.log(p);
      this.pushLogPagination.current = p;
      this.getPushLogList();
    }
  },
  created() {
    this.getPushLogList();
  }
};
</script>

<style lang="scss" scoped>
.pushLog {
  padding: 16px;

  .searchBar {
    margin-bottom: 32px;

    .btn-export {
      float: right;
    }

    .btn-search {
        margin-left: 16px;
      }

  }

  .pagination {
    text-align: center;
    padding-top: 42px;
  }
}
</style>
