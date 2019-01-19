<template>
    <div class="container">
        <div class="search-box">
            <el-form :inline="true">
                日期&nbsp;
                <el-form-item>
                    <el-date-picker v-model="dateTime" class="datetimerange" type="datetimerange" :editable="false" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" align="center" value-format="yyyy-MM-dd HH:mm:ss">
                    </el-date-picker>
                </el-form-item>
                &nbsp; &nbsp;商品&nbsp;
                <el-select v-model="searchData.goodsName" clearable placeholder="请选择">
                    <el-option v-for="(item,index) in goodsName" :key="index" :label="item.goodsName" :value="item.goodsName">
                    </el-option>
                </el-select>
                &nbsp; &nbsp;兑换信息&nbsp;
                <el-input v-model="searchData.deliveryInfos" placeholder="请输入内容"></el-input>
                &nbsp; &nbsp;状态&nbsp;
                <el-select class="state" v-model="searchData.status" clearable placeholder="请选择">
                    <el-option v-for="item in status" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
                <el-button class="search-button" @click="searchFun()">查找</el-button>
            </el-form>
        </div>
        <el-table :data="list" border style="width: 100%">
            <el-table-column prop="id" label="编号" width="50" align="center">
            </el-table-column>
            <el-table-column prop="goodsName" label="商品" width="220" align="center">
                <template slot-scope="scope">
             <el-button type="text" size="small" @click="handleGoods(scope.row.goodsId)" :key="list.goodsId">{{scope.row.goodsName}}</el-button>
            </template>
            </el-table-column>
            <el-table-column prop="deliveryInfos" label="兑换信息" width="400" align="center">
            </el-table-column>
            <el-table-column prop="orderTime" label="下单时间" width="180" align="center">
            </el-table-column>
            <el-table-column prop="deliveryTime" label="发货时间" width="180" align="center">
            </el-table-column>
            <el-table-column  label="状态" width="180" align="center" :formatter="formatStatus">
            </el-table-column>
            <el-table-column prop="" label="操作" width="180" align="center">
<template slot-scope="scope">
    <el-button :disabled="scope.row.status != 0" @click="showDialog(scope.row.id)" type="text" :key="list.id" size="small">
        {{scope.row.status=='0'?'发货':'-'}}</el-button>
</template>
        </el-table-column>
    </el-table>
     <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="searchData.pageNum"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="searchData.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalCount">
    </el-pagination>
    <el-dialog class="deliveryGoods" title="发货" :visible.sync="dialogFormVisible1">
        <el-form :model="form">
            <el-form-item label="快递单号:" :label-width="formLabelWidth">
                <el-input v-model="form.expressNum" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="发货时间:" :label-width="formLabelWidth">
                <el-date-picker v-model="form.deliveryTime" type="datetime" placeholder="选择日期时间" value-format="yyyy-MM-dd HH:mm:ss" format="yyyy-MM-dd HH:mm:ss">
                </el-date-picker>
            </el-form-item>
        </el-form>
<template>
    <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible1 = false">取 消</el-button>
        <el-button type="primary" @click="deliverData()">确 定</el-button>
    </div>
</template>
    </el-dialog>
    <el-dialog title="商品详情" :visible.sync="dialogFormVisible2">
        <div class="formData">
        <el-form :model="tempData">
            <el-form-item label="商品名称:" :label-width="formLabelWidth">
                <el-input v-model="tempData.goodsName" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="活力值:" :label-width="formLabelWidth">
                <el-input v-model="tempData.price" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="划掉值:" :label-width="formLabelWidth">
                <el-input v-model="tempData.originalPrice" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="库存:" :label-width="formLabelWidth">
                <el-input v-model="tempData.stock" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="类型:" :label-width="formLabelWidth" >
                <el-input v-model="tempData.goodsType" auto-complete="off" placeholder="商品类型编码（0：虚拟:，1：实物）"></el-input>
            </el-form-item>
            <el-form-item label="排序:" :label-width="formLabelWidth">
                <el-input v-model="tempData.sortNum" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="状态:" :label-width="formLabelWidth">
                <el-input v-model="tempData.status" auto-complete="off" placeholder="上架状态(0：未上架:，1：上架)"></el-input>
            </el-form-item>
            <label class="smallImg-font">商品小图:</label>
            <el-upload :disabled="true" class="avatar-uploader" :action="uploadUrl"  :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                <img v-if="tempData.smallPicture" :src="tempData.smallPicture" class="avatar">
                <i v-else class="smallImg el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <label class="bigImg-font">商品大图:</label>
            <el-upload :disabled="true" class="avatar-uploader"  :action="uploadUrl" :show-file-list="false" :on-success="handleAvatarSuccess2" :before-upload="beforeAvatarUpload">
                <img v-if="tempData.bigPicture" :src="tempData.bigPicture" class="avatar">
                <i v-else class="bigImg el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
        </el-form>
        </div>
        
    </el-dialog>
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
                id: "",
                buttonValue:'',
                list: [],
                totalCount: 0, //总数
                deliveryInfos: "", //兑换信息
                goodsName: [],
                status: [{
                    value: '0',
                    label: '待发货'
                }, {
                    value: '1',
                    label: '已发货'
                }],
                tempData: { //商品详情
                    id: "",
                    goodsName: "",
                    price: "",
                    originalPrice: "",
                    stock: "",
                    goodsType: "",
                    sortNum: "",
                    status: "",
                    smallPicture: '',
                    bigPicture: '',
                },
                searchData: {
                    pageNum: 1, //页码
                    pageSize: 10, //每页数据
                    status: "",
                    goodsName: "",
                    deliveryInfos: "",
                    orderTimeStart: "",
                    orderTimeEnd: "",
                },
                value4: '', //商品名称
                statusVal: '', //状态
                dateTime: [], //查询日历
                deliveryTime: '',
                dialogFormVisible1: false, //发货填单对话框
                dialogFormVisible2: false, //详情对话框
                uploadUrl: process.env.BASE_URL + "/file/upload",
                form: {
                    expressNum: "",
                    deliveryTime: "",
                    id: ""
                },
                formLabelWidth: '120px'
            }
        },
        created() {
            this.getOrderList();
            this.getGoodsName();
        },
        methods: {
            handleGoods(goodsId) {
                this.tempData.id = goodsId;
                this.dialogFormVisible2 = true;
                this.api({
                    url: "/stepmall/goods/get_goods_detail",
                    method: "post",
                    data: {
                        id: goodsId
                    }
                }).then(data => {
                    this.tempData.goodsName = data.goodsName;
                    this.tempData.price = data.price
                    this.tempData.originalPrice = data.originalPrice;
                    this.tempData.stock = data.stock;
                    this.tempData.goodsType = data.goodsType;
                    this.tempData.sortNum = data.sortNum;
                    this.tempData.status = data.status;
                    this.tempData.smallPicture = data.smallPicture;
                    this.tempData.bigPicture = data.bigPicture;
                })
            },
            //获取订单列表
            getOrderList() {
                this.api({
                    url: '/stepmall/order_list',
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': "Bearer " + getToken()
                    },
                    data: this.searchData
                }).then(
                    data => {
                        this.list = data.list;
                        this.totalCount = data.count;
                    }
                )
            },
            //获取商品名称
            getGoodsName() {
                this.api({
                    url: '/stepmall/goods_name',
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': "Bearer " + getToken()
                    },
                }).then(data => {
                    this.goodsName = data;
                })
            },
            searchFun(){
                this.searchData.pageNum=1;
                this.totalCount=0;
                this.getSearchData();
            },
            //查询功能
            getSearchData() {
                if (this.dateTime.length > 0) {
                    this.searchData.orderTimeStart = this.dateTime[0];
                    this.searchData.orderTimeEnd = this.dateTime[1];
                } else {
                    this.dateTime = [];
                }
                if(this.searchData.status=="全部"){
                    this.getOrderList();
                    return false;
                }
                if(this.searchData.orderTimeStart ==""&&this.searchData.orderTimeEnd==""
                    &&this.searchData.goodsName==""&&this.searchData.deliveryInfos==""
                    &&this.searchData.status==""){
                        this.getOrderList();
                }else{
                    this.api({
                    url: "/stepmall/order_list",
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': "Bearer " + getToken()
                    },
                    data: this.searchData
                }).then(data => {
                    console.log(this.searchData);
                    this.list = data.list;
                    this.totalCount =data.count;
                })
                }
                
            },
            //发货功能
            deliverData() {
                //判断是否为空
                if (this.checkContents(this.form.expressNum, "请输入快递单号!!!")) {
                    return;
                }
                if (this.checkContents(this.form.deliveryTime, "请输入发货时间!!!")) {
                    return;
                }
                this.api({
                    url: "/stepmall/delivery",
                    method: "post",
                    data: this.form
                }).then(data => {
                    this.dialogFormVisible1 = false;
                    this.getOrderList();
                    console.log(data);
                })
            },
            formatStatus(row, column) {
                return row.status == "0" ? "待发货" : "已发货";
            },
            
            showDialog(index) {
                this.clearInputValue();
                this.id = index;
                this.form.id = index;
                this.dialogFormVisible1 = true;
            },
            clearInputValue() {
                this.form.id = "";
                this.form.expressNum = "";
                this.form.deliveryTime = "";
            },
            handleSizeChange(val) {
                //改变每页数量
                this.searchData.pageSize = val;
                this.handleFilter();
            },
            handleFilter() {
                //查询事件
                this.searchData.pageNum = 1;
                this.getSearchData();
            },
            handleCurrentChange(val) {
                //改变页码
                this.searchData.pageNum = val;
                this.getSearchData();
            },
            handleAvatarSuccess(res, file) {
                console.log(res);
                this.tempData.smallPicture = res.data;
            },
            handleAvatarSuccess2(res, file) {
                console.log(res);
                this.tempData.bigPicture = res.data;
            },
            beforeAvatarUpload(file) {
                const isJPG = file.type === 'image/jpeg';
                const isGIF = file.type === 'image/gif';
                const isPNG = file.type === 'image/png';
                const isBMP = file.type === 'image/bmp';
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isJPG && !isGIF && !isPNG && !isBMP) {
                    this.$message.error('上传图片必须是JPG/GIF/PNG/BMP 格式!');
                }
                if (!isLt2M) {
                    this.$message.error('上传头像图片大小不能超过 2MB!');
                }
                return (isJPG || isBMP || isGIF || isPNG) && isLt2M;
            },
            //校验
            checkContents(content, des) {
                if (!content) {
                    this.$message.error(des);
                    return true;
                }
            },
            setStatus(row, column) {//设置操作按钮状态
                return row.status == 0 ? false:true;
            },
        }
    }
</script>

<style lang="scss" scoped>

    .container {
        margin-left: 16px;
        width: 98%;
        .datetimerange {
            width: 378px;
            span {
                padding: 0;
            }
        }
        .state {
            width: 100px;
        }
    }
    
    .search-box {
        margin: 20px 0 0;
    }
    
    .el-input {
        width: 166px;
    }
    
    .search-button {
        float: right;
    }
    
    .el-table {
        text-align: center;
    }
    
    .dialog-footer {
        text-align: center;
    }
    
    .avatar-uploader {
        cursor: pointer;
        position: relative;
        overflow: hidden;
        margin-left: 120px;
    }
    
    .el-upload {
        border-radius: 6px;
        border: 1px dashed #d9d9d9;
    }
    
    .smallImg-font,
    .bigImg-font {
        margin-left: 48px;
    }
    
    .avatar-uploader .el-upload:hover {
        border-color: #409EFF;
    }
    
    .smallImg {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;
        border-radius: 6px;
        border: 1px dashed;
    }
    
    .bigImg {
        font-size: 28px;
        color: #8c939d;
        width: 278px;
        height: 178px;
        line-height: 178px;
        text-align: center;
        border-radius: 6px;
        border: 1px dashed;
    }
    
    .avatar {
        width: 178px;
        height: 178px;
        display: block;
    }
</style>
