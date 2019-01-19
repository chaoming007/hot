<template>
<div class="container">
  <!-- 筛选 start  -->
  <div class="search-box">
    <div class="search-tj">
      <div class="search-item-row">
        <span class="label-box">名称：</span>
        <el-input placeholder="请输入名称" class="inp-m-set" v-model="inputName"></el-input>

        <span class="label-box">模板类型：</span>
        <el-select v-model="templateValue" class="inp-m-set" placeholder="请选择">
          <el-option v-for="item in templeteOptions" :key="item.id" :label="item.templateName" :value="item.id">
          </el-option>
        </el-select>

        <span class="label-box">状态：</span>
        <el-select v-model="stateValue" placeholder="请选择">
          <el-option v-for="(item,ind) in stateOptions" :key="ind" :label="item.name" :value="item.status">
          </el-option>
        </el-select>
      </div>

      <!--  -->

      <div class="search-item-row">
        <span class="label-box">有效期：</span>
        <el-date-picker v-model="startTimeVal" type="datetime" placeholder="选择开始时间">
        </el-date-picker>
        <span class="time-gd-sty">至</span>
        <el-date-picker v-model="endTimeVal" class="inp-m-set" type="datetime" :disabled="pickControl" placeholder="选择结束时间">
        </el-date-picker>

        <span class="label-box">业务线：</span>
        <el-select v-model="businValue" placeholder="请选择">
          <el-option v-for="item in businOptions" :key="item.id" :label="item.businessName" :value="item.id">
          </el-option>
        </el-select>

      </div>

      <!--  -->

    </div>
    
    <div class="search-btn">
      <el-button type="primary" @click="searchFun" class="search-btn-sty">搜索</el-button>
    </div>
    <div class="all-data">
      <el-button type="success" @click="allDataFun" class="all-data-btn">全部数据</el-button>
    </div>
  </div>
  <!-- 筛选 end  -->

  <!-- 新增 start  -->
  <div class="add-item-box">
    <el-button type="primary" @click="addItemFun" class="add-btn">新增</el-button>
  </div>

  <!-- 新增 end  -->

  <!-- 数据列表 start -->
  <el-table stripe :data="listData" border style="width: 100%">
    <el-table-column align="center" prop="id" label="编号ID" ></el-table-column>
    <el-table-column align="center" prop="materialName" label="名称" ></el-table-column>
    <el-table-column align="center" prop="businessName" label="所属业务线" ></el-table-column>
    <el-table-column align="center" prop="templateName" label="模板类型" ></el-table-column>
    <el-table-column align="center" prop="timeRange" label="有效期" ></el-table-column>
    <el-table-column align="center" prop="materialStatusText" label="状态" ></el-table-column>
    <el-table-column align="center" label="操作">
      <template slot-scope="scope">
        <el-button type="text" @click="editConfigFun(scope.row)" size="small">编辑</el-button>
        <el-button type="text" @click="interfaceConfigFun()" size="small">接口</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 数据列表 end  -->

  <!-- 分页 start  -->

  <div class="page-box">
    <div class="block">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="this.currentPage" :page-sizes="this.pageSizes" :page-size="this.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="this.countNum">
      </el-pagination>
    </div>
  </div>

  <!-- 分页 end  -->
  <!-- ********* tianjx's code begin ******* -->
  <div class="apawnTemp">
    <!-- 新增/编辑对话框 begin -->
    <el-dialog class="add-edit-dlg" :title="`${isAdd?'新增':'编辑'}素材`" :visible.sync="addEditDlgVis" width="60%" center>
      <!-- 表单 begin -->
      <el-form class="addEditForm" label-width="10em" label-position="'left'">
        <el-row>
          <el-form-item class="inline-block" label="选择模板">
            <el-select class="required" v-model="selectedTplId" @change="setSelectedTpl" placeholder="请选择模板">
              <el-option v-for="tpl in templateList" :key="tpl.id" :label="tpl.templateName" :value="tpl.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="inline-block belongs-to" label="所属业务线">
            <el-select class="required" v-model="selectedBusinessId" placeholder="请选择所属业务线">
              <el-option v-for="bs in businessList" :key="bs.id" :label="bs.businessName" :value="bs.id"></el-option>
            </el-select>
          </el-form-item>
        </el-row>
        <el-form-item label="素材名称">
          <el-input class="required" v-model="materialName" placeholder="请输入素材名称，只能使用英文字母、阿拉伯数字和下划线"></el-input>
        </el-form-item>
        <hr class="hor-line">
        <!-- .form-data begin -->
        <div class="form-data" v-for="(data,sonIndex) in dataList" :key="sonIndex">
          <!-- 数据后面的数字是可变的，根据后面”新增数据“按钮的操作 -->
          <h3>数据{{sonIndex + 1}}：</h3>
          <div v-for="(tplItem,grandSonIndex) in dataList[sonIndex].itemList" :key="tplItem.id">
            <!-- text -->
            <el-row v-if="tplItem.itemType === 'text'">
              <el-form-item :label="tplItem.itemName" class="inline-block item">
                <el-input class="required" v-model="tplItem.itemValue"></el-input>
              </el-form-item>
              <span class="red">{{tplItem.itemRemark}}</span>
            </el-row>
            <!-- image -->
            <el-row v-if="tplItem.itemType === 'image'">
              <el-form-item :label="tplItem.itemName" class="inline-block item">
                <el-input class="required" readonly v-model="tplItem.itemValue"></el-input>
              </el-form-item>
              <el-upload :action="uploadUrl" :headers="headers" :data="{'businessCode':'material'}" :show-file-list="false" :on-success="(res,file,fileList) => {uploaded(res, sonIndex, grandSonIndex)}" class="inline-block btn-upload">
                <el-button type="plain">点击上传</el-button>
              </el-upload>
              <span class="red">{{tplItem.itemRemark}}</span>
              <div class="previewImg">
                <img :src="tplItem.itemValue">
            </div>
            </el-row>
            <!-- number -->
            <el-row v-if="tplItem.itemType === 'number'">
              <el-form-item :label="tplItem.itemName" class="inline-block item">
                <el-select class="required" v-model="tplItem.itemValue" placeholder="请选择">
                  <el-option v-for="n in 50" :key="n" :label="n" :value="n"></el-option>
                </el-select>
              </el-form-item>
              <span class="red">{{tplItem.itemRemark}}</span>
            </el-row>
            <!-- bool -->
            <el-row v-if="tplItem.itemType === 'bool'">
              <el-form-item :label="tplItem.itemName" class="inline-block item">
                <el-select class="required" v-model="tplItem.itemValue" placeholder="请选择">
                  <el-option label="是" value="1"></el-option>
                  <el-option label="否" value="0"></el-option>
                </el-select>
              </el-form-item>
              <span class="red">{{tplItem.itemRemark}}</span>
            </el-row>
          </div>
          <hr class="hor-line">
        </div>
        <!-- .form-data end -->
        <el-row class="btns-row">
          <el-button type="primary" @click="addData">新增数据</el-button>
          <el-button type="danger" @click="delData">删除数据</el-button>
        </el-row>
        <el-row class="time-row">
          生效时间：
          <el-date-picker v-model="timeStart" type="datetime" :picker-options="timeStartRestrict" placeholder="选择生效日期时间" class="data-picker required"></el-date-picker>
          到期时间：
          <el-date-picker v-model="timeEnd" type="datetime" :picker-options="timeEndRestrict" placeholder="选择生效日期时间" class="data-picker"></el-date-picker>
          <span class="red">到期时间为空，则为无限期</span>
        </el-row>

        <!-- 对话框按钮区 begin -->
        <el-row class="btns-row">
          <el-button v-if="isAdd" @click="save(1)" type="primary">保 存</el-button>
          <el-button type="info" @click="openPreviewDlg">预 览</el-button>
          <el-button type="success" @click="save(2)">发 布</el-button>
          <el-button type="plain" @click="addEditDlgVis = false">关 闭</el-button>
        </el-row>
        <!-- 对话框按钮区 end -->

      </el-form>
      <!-- 表单 end -->
      <!-- 操作记录 begin -->
      <h4>操作记录：</h4>
      <el-table :data="actLogList" border style="width: 100%">
        <el-table-column prop="operatorName" header-align="center" align="center" label="操作人"></el-table-column>
        <el-table-column prop="createTime" header-align="center" align="center" label="操作时间"></el-table-column>
        <el-table-column header-align="center" align="center" label="素材状态" width="180">
          <template slot-scope="scope">已发布</template>
        </el-table-column>
        <el-table-column header-align="center" align="center" label="操作记录" width="180">
          <template slot-scope="scope">
            <el-button @click="openActLogDlg(scope.row)" type="text">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 操作记录 end -->
      <!-- 分页 begin -->
      <el-pagination :page-sizes="[pagination.pageSize]" :page-size="pagination.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="pagination.totalCount" @current-change="actLogPageChange"></el-pagination>
      <!-- 分页 end -->
    </el-dialog>
    <!-- 新增/编辑对话框 end -->
    <!-- 预览对话框 begin -->
    <el-dialog class="preview-dlg" title="预览（仅文本和图像）" :visible.sync="previewDlgVis" center>
      <div class="content">
        <div v-for="(data,index) in dataList" :key="index">
          <!-- <div class="chunk" v-for="tplItem in dataList[index].itemList" :key="tplItem.id"> -->
          <template v-for="tplItem in dataList[index].itemList">
            <!-- text -->
            <span class="item-box text" v-if="tplItem.itemType === 'text'" :key="tplItem.id">
            {{tplItem.itemValue}}
          </span>
            <!-- image -->
            <span class="item-box image" v-if="tplItem.itemType === 'image'" :key="tplItem.id">
            <img :src="tplItem.itemValue">
          </span>
          </template>

          <!-- </div> -->
          <!-- <hr class="hor-line"> -->
        </div>
      </div>
    </el-dialog>
    <!-- 预览对话框 end -->
    <!-- 操作记录对话框 begin -->
    <el-dialog class="act-log-dlg" title="查看记录" :visible.sync="actLogDlgVis" center>
      <h4>发布内容：</h4>
      <div class="content">
        {{JSON.stringify(currentLog)}}
      </div>
    </el-dialog>
  </div>
  <!-- ********* tianjx's code end ******* -->
</div>
</template>

<script>
import {
  getToken,
  removeToken
} from '@/utils/auth'
export default {
  data() {
    return {
      stateOptions: [], //状态下拉选择数据
      businOptions: [], //业务线下拉选择数据
      templeteOptions: [], //模板类型下拉选择数据

      templateValue: "", //模板选择值
      stateValue: "", //状态选择值
      inputName: "", //名称值
      timeValue: "", //有效期值
      businValue: "", //业务线值
      // pickControl:true, //时间组件控制
      startTimeVal: "", //开始有效期
      endTimeVal: "", //结束有效期

      currentPage: 1, //当前页数
      pageSize: 30, //每页显示条数
      countNum: 0, //数据总数
      pageSizes: [30, 40, 50], //每页显示条数

      paramData: {}, //请求参数列表
      listData: [], //素材列表数据
      downListData: {}, //下拉选择数据

      copyLink: "/material/get_material_info", //要复制的接口地址
      materialDataLink: "/material/get_material_list", //素材列表数据接口
      downSelectListLink: "/material/get_material_pullDown__list", //下拉选择数据接口

      // ******** tianjx's code begin *******
      // 素材名称
      materialName: '',
      // 模板列表
      templateList: [],
      // 业务线列表
      businessList: [],
      // 下拉选择列表中当前选中的模板的id
      selectedTplId: '',
      // 当前选中的业务线id
      selectedBusinessId: '',
      // 新增对话框中包含数据1、数据2……若干部分的列表
      dataList: [],
      // 生效时间
      timeStart: '',
      // 到期时间
      timeEnd: '',
      // 生效时间约束
      timeStartRestrict: {
        disabledDate: (time) => {
          return time.getTime() > (new Date(this.timeEnd)).getTime() - 8.64e7;
        }
      },
      // 到期时间约束
      timeEndRestrict: {
        disabledDate: (time) => {
          return time.getTime() < (new Date(this.timeStart)).getTime();
        }
      },
      // 上传头信息
      headers: {
        'Authorization': "Bearer " + getToken()
      },
      // 上传接口地址配置
      uploadUrl: process.env.BASE_URL + "/file/upload",
      // 操作记录列表
      actLogList: [],
      // 分页
      pagination: {
        totalCount: 0,
        pageSize: 5,
        currentPage: 1
      },
      // 当前正在编辑的素材id，需要对接
      edittingMaterialId: '',
      // 当前查看的操作记录
      currentLog: {},
      // -----------------------------
      // 新增/编辑对话框显示开关
      addEditDlgVis: false,
      // 新增or编辑
      isAdd: true,
      // 预览对话框显示开关
      previewDlgVis: false,
      // 操作记录对话框显示开关
      actLogDlgVis: false,
      // ******** tianjx's code end *******
    }
  },
  created() {
    this.getData()
    this.getDownList()
    // ******** tianjx's code begin *******
    this.getLists();
    // ******** tianjx's code end *******
  },
  computed: {
    pickControl() {
      return this.startTimeVal ? false : true
    }
  },
  methods: {
    //页码跳转处理函数
    handleCurrentChange(val) {
      this.currentPage = val
      this.getData()
    },
    //每页显示多少条
    handleSizeChange(val) {
      this.pageSize = val
      this.getData()
    },

    // 按条件搜索素材
    searchFun() {
      this.paramData = {}
      if (this.startTimeVal) {
        this.paramData.timeStart = this.getTimeFun(this.startTimeVal)
      }
      if (this.endTimeVal) {
        this.paramData.timeEnd = this.getTimeFun(this.endTimeVal)
      }
      this.inputName && (this.paramData.materialName = this.inputName) //按素材名称
      this.templateValue && (this.paramData.templateId = this.templateValue) //模板id
      this.businValue && (this.paramData.businessId = this.businValue) //业务线id
      this.stateValue && (this.paramData.materialStatus = this.stateValue) //素材状态
      this.getData()
    },
    // 全部数据
    allDataFun(){
        this.paramData={}
        this.templateValue= "" 
        this.stateValue= "" 
        this.inputName= "" 
        this.timeValue= "" 
        this.businValue= "" 
        this.startTimeVal=""
        this.endTimeVal="" 
        this.getData()
    },

    getTimeFun(dat) { //格式化时间
      if (dat) {
        return new Date(dat).getFullYear() + "-" + zeroSetFun(new Date(dat).getMonth() + 1) + "-" + zeroSetFun(new Date(dat).getDate()) + " " + zeroSetFun(new Date(dat).getHours()) + ":" + zeroSetFun(new Date(dat).getMinutes())
      }

      function zeroSetFun(num) {
        return num < 10 ? "0" + num : num
      }
    },

    // 新增素材数据
    addItemFun() {
      this.openAddDlg();
    },

    //点击编辑按钮
    editConfigFun(dat) {
      this.edittingMaterialId = dat.id;
      this.openEditDlg();
    },

    //点击了接口按钮
    interfaceConfigFun() {
      const h = this.$createElement
      this.$msgbox({
        title: '复制接口',
        message: h('div', null, [
          h('p', null, '复制接口地址:'),
          h('p', null, this.copyLink),
          h('p', null, '是否继续?'),
        ]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const input = document.createElement('input')
        document.body.appendChild(input)
        input.setAttribute('value', this.copyLink)
        input.select()
        if (document.execCommand('copy')) {
          document.execCommand('copy')
          this.$message({
            type: 'success',
            message: '复制成功!'
          })
          document.body.removeChild(input)
        }

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消复制'
        })
      })
    },

    setParamData() { //设置请求参数页码
      this.paramData.currentPage = this.currentPage;
      this.paramData.pageSize = this.pageSize;
      return this.paramData
    },
    getData() { //请求素材列表数据
      this.api({
        url: this.materialDataLink,
        method: 'post',
        data: this.setParamData(),
      }).then(data => {
        console.log("素材列表", data)
        this.countNum = data.count
        this.listData = [...data.list]
      })
    },
    getDownList() { //请求下拉选项数据列表
      this.api({
        url: this.downSelectListLink,
        method: 'post'
      }).then(data => {
        this.downListData = { ...data
        }
        this.setDownListFun()
      })
    },
    setDownListFun() { //设置选项数据
      this.stateOptions = [...this.downListData.enabledStatusList] //状态选项
      this.businOptions = [...this.downListData.businessList] //业务线选项
      this.templeteOptions = [...this.downListData.templateList] //模板选项
    },
    // ******** tianjx'code begin *******8
    // 获取业务线列表 和模板列表,状态列表
    getLists() {
      this.api({
        url: '/material/get_material_pullDown__list',
        method: 'post'
      }).then(data => {
        this.templateList = data.templateList;
        console.log("​getLists -> this.templateList", this.templateList)
        this.businessList = data.businessList;
      }).catch(err => {});
    },
    // 设置当前模板
    setSelectedTpl() {
      if (this.selectedTplId) {
        this.api({
          url: '/material/get_template_info',
          method: 'post',
          data: {
            id: this.selectedTplId
          }
        }).then(res => {
          console.log("​setSelectedTpl -> res", res)
          this.dataList = [];
          res.itemList.forEach(ele => {
            ele.itemValue = '';
          });
          this.dataList.push({
            itemList: res.itemList
          });
        })
      }
    },
    // 新增数据
    addData() {
      if (this.dataList.length) {
        this.dataList.push(JSON.parse(JSON.stringify(this.dataList[this.dataList.length - 1])));
      }
    },
    // 删除数据
    delData() {
      if (this.dataList.length < 1) {
        this.$message({
          message: '没有数据可供删除',
          type: 'warning'
        });
        return;
      }
      if (this.dataList.length === 1) {
        this.$message({
          message: '最少应保留一条数据',
          type: 'warning'
        });
        return;
      }

      this.$confirm('将要进行删除数据操作，是否继续?', '删除数据确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.dataList.pop();
      }).catch(() => {});

    },
    // 上传图片成功后，把图片路径放入数据列表中
    uploaded(response, sonIndex, grandSonIndex) {
      this.dataList[sonIndex].itemList[grandSonIndex].itemValue = response.data;
    },
    // 保存与发布（保存1 发布2）  
    save(actType) {
      // 校验是否有数据块
      let dataBlocks = document.querySelectorAll('.addEditForm .form-data .required input');
      if (!dataBlocks.length) {
        this.$message({
          message: `该素材没有数据，禁止${['', '保存', '发布'][actType]}`,
          type: 'error'
        });
        return;
      }
      // 校验必填
      let requiredNpts = document.querySelectorAll('.addEditForm .required input');
      console.log(requiredNpts);

      let values = [];
      for (let i = 0; i < requiredNpts.length; i++) {
        values.push(requiredNpts[i].value.trim());
      }
      if (values.some(v => v === '')) {
        this.$message({
          message: `项目填写不完整，禁止${['', '保存', '发布'][actType]}`,
          type: 'error'
        });
        return;
      }
      // 校验素材名称
      if (this.materialName.trim().search(/^[\w\u4e00-\u9fa5]+$/) === -1) {
        this.$message({
          message: '素材名称不符合要求，只接受英文字母、阿拉伯数字和下划线',
          type: 'error'
        });
        return;
      }
      // 操作类型提示文本
      let actTypeText = ['', '保存', '发布'][actType];

      this.$confirm(`将要进行${actTypeText}操作，是否继续?`, `${actTypeText}确认`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 准备参数并调用api
        let tpl = this.templateList.find(ele => ele.id === this.selectedTplId);
        let bs = this.businessList.find(ele => ele.id === this.selectedBusinessId);
        let data = {
          materialName: this.materialName || '',
          templateId: this.selectedTplId || '',
          templateName: tpl && tpl.templateName ? tpl.templateName : '',
          businessId: this.selectedBusinessId || '',
          businessName: bs && bs.businessName ? bs.businessName : '',
          materialStatus: actType,
          timeStart: this.formatDate(this.timeStart) || '',
          timeEnd: this.formatDate(this.timeEnd) || '',
          dataList: this.dataList.map(dataPart => {
            return {
              itemList: dataPart.itemList.map(item => {
                return {
                  itemName: item.itemName,
                  itemType: item.itemType,
                  itemRemark: item.itemRemark,
                  itemValue: item.itemValue
                };
              })
            };
          })
        };

        // 新增素材接口
        let url = '/material/add_material';
        if (!this.isAdd) {
          data.id = this.edittingMaterialId;
          // 更新素材接口
          url = '/material/update_material';
        }

        this.api({
          url,
          method: 'post',
          data
        }).then(res => {
          this.$message({
            message: `${actTypeText}成功`,
            type: 'success'
          });
          this.addEditDlgVis = false;
          this.getData();
          this.getDownList();
          this.getLists();
        }).catch(err => {
          this.$message({
            message: `${actTypeText}时出错`,
            type: 'error'
          });
        });
      }).catch(() => {});
    },
    // --------------------------
    // 重置新增对话框
    resetAddDlg() {
      this.materialName = '';
      this.selectedTplId = '';
      this.selectedBusinessId = '';
      this.dataList = [];
      this.actLogList = [];
      this.timeStart = '';
      this.timeEnd = '';
      this.pagination = {
        totalCount: 0,
        pageSize: 5,
        currentPage: 1
      };
    },
    // 打开新增对话框
    openAddDlg() {
      this.resetAddDlg();
      this.isAdd = true;
      this.addEditDlgVis = true;
    },
    // 打开编辑对话框
    openEditDlg() {
      this.resetAddDlg();
      this.isAdd = false;
      this.api({
        url: '/material/get_material_info',
        method: 'post',
        data: {
          // 将要被编辑的素材id
          id: this.edittingMaterialId
        }
      }).then(res => {
        console.log("​openEditDlg -> res", res)
        this.materialName = res.materialName;
        this.selectedTplId = res.templateId;
        this.selectedBusinessId = res.businessId;
        this.dataList = res.dataList;
        this.timeStart = /(?:^1970)|(?:^\s*$)|(?:null)/.test(res.timeStart) ? '' : (new Date(res.timeStart));
        this.timeEnd = /(?:^1970)|(?:^\s*$)|(?:null)/.test(res.timeEnd) ? '' : (new Date(res.timeEnd));
        this.isAdd = false;
        this.addEditDlgVis = true;
        // 获取操作记录
        this.getActLogList();

      }).catch(err => {
        this.$message({
          message: '准备编辑素材时出错，请重新尝试',
          type: 'error'
        });
      });

    },
    // 打开预览对话框
    openPreviewDlg() {
      this.previewDlgVis = true;
    },
    // 打开操作记录对话框
    openActLogDlg(row) {
      console.log("​openPreviewDlg -> row", row)
      this.currentLog = row;
      this.actLogDlgVis = true;
    },
    // ---------------
    // 获取操作记录列表
    getActLogList() {
      this.api({
        url: '/material/get_material_operate_list',
        method: 'post',
        data: {
          currentPage: this.pagination.currentPage,
          pageSize: this.pagination.pageSize,
          moduleCode: "material",
          // 将要被编辑的素材id
          dataId: this.edittingMaterialId
        }
      }).then(res => {
        this.actLogList = res.list;
        this.pagination.totalCount = res.count;
      }).catch(err => {
        this.$message({
          message: '获取素材操作记录失败',
          type: 'warning'
        });
      });
    },
    // 操作记录页码变化时
    actLogPageChange(p) {
      this.pagination.currentPage = p;
      this.getActLogList();
    },
    // --------------
    // 格式化日期时间为yyyy-MM-dd HH:mm:ss
    formatDate(dt) {
      if (dt && (dt instanceof Date)) {
        let y = dt.getFullYear();
        let M = dt.getMonth() + 1;
        let d = dt.getDate();
        let H = dt.getHours();
        let m = dt.getMinutes();
        let s = dt.getSeconds();
        return [
          y,
          '-',
          M < 10 ? `0${M}` : M,
          '-',
          d < 10 ? `0${d}` : d,
          ' ',
          H < 10 ? `0${H}` : H,
          ':',
          m < 10 ? `0${m}` : m,
          ':',
          s < 10 ? `0${s}` : s
        ].join('');
      }
      return '';
    }

    // ******** tianjx'code end *******

  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .add-item-box {
    margin: 0 auto;
    padding: 20px;
    display: flex;
    justify-content: flex-start;
    flex-direction: row;
    align-items: center;
    width: 100%;

    .add-btn {
      width: 120px;
      height: 40px;
    }
  }

  .page-box {
    margin: 0 auto;
    padding: 20px;
    width: 100%;

    .block {
      float: left;
    }
  }

  .search-box {
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
    width: 100%;
    box-shadow: 0px 4px 5px #E6E6E6;
    padding: 20px;

    .search-tj {
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;

      .search-item-row {
        display: flex;
        justify-content: flex-start;
        flex-direction: row;
        align-items: center;
        padding: 0 0 15px;
        .el-date-editor{
          width: 210px;
        }
      }

      .label-box {
        display: block;
        height: 40px;
        width: 80px;
        line-height: 40px;
      }

      .inp-m-set {
        margin: 0 20px 0 0;
        flex: 1
      }

      .inp-tim-sty {
        width: 495px;
      }

      .time-gd-sty {
        width: 54px;
        text-align: center
      }
    }

    .search-btn {
      margin: 0;
      .search-btn-sty {
        width: 150px;
        height: 60px;
      }
    }
    .all-data{
       margin: 0 0 0 20px;
       .all-data-btn{
          width: 100px;
          height: 60px;
       }
    }
  }

  // ******** tianjx'code begin *******
  .apawnTemp {
    .add-edit-dlg {
      .inline-block {
        display: inline-block;
      }

      .belongs-to {
        margin-left: 2em;
      }

      .hor-line {
        border-bottom-color: #dcdfe6;
        border-top: none;
      }

      .red {
        color: #f00;
      }

      .form-data {
        .item {
          margin-right: 2em;
          width: 420px;
        }

        .btn-upload {
          margin-right: 2em;
        }

        .previewImg {
          width: 100px;
          height: 100px;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
          margin: 0 0 1.5em 10em;

          img {
            width: 100%;
            height: 100%;
          }
        }
      }

      .time-row {
        margin-top: 1.5em;
        padding-left: 5em;

        .data-picker {
          margin-right: 2em;
        }
      }

      .btns-row {
        margin-top: 1.5em;
        text-align: center;

        button {
          margin: 0 12px;
        }
      }

    }

    .act-log-dlg {
      h4 {
        color: #606266;
      }

      .content {
        border: 1px solid #dcdfe6;
        min-height: 270px;
        overflow: auto;
      }
    }

    .preview-dlg {
      .content {
        border: 1px solid #dcdfe6;
        min-height: 270px;
        overflow: auto;

        .item-box {
          display: inline-block;
          width: 100px;
          height: 100px;
          border: 1px solid #dcdfe6;
          text-align: center;
          overflow: hidden;
          margin: 8px;

          &.text {
            border-radius: 50%;
            line-height: 100px;
            text-overflow: ellipsis;
            padding: 0 1.5em;
            white-space: nowrap;
          }

          &.image {
            border-radius: 8px;

            img {
              width: 100%;
              height: 100%;
            }
          }

        }

        // }

      }
    }

    .del-confirm-dlg {
      p {
        line-height: 48px;
        text-align: center;
        font-size: 18px;
      }

      .btns-box {
        text-align: center;

        button {
          margin: 0 1em;
        }
      }
    }

  }

  // ******** tianjx'code end *******
}
</style>
