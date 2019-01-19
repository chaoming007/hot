<template>
<div class="container">
    <div class="search-box">
        <el-form :inline="true">
            兑换类型&nbsp;
            <el-form-item>
                <el-select class="select-type" v-model="searchData.selectedValue" clearable placeholder="请选择">
                    <el-option
                        v-for="(item,index) in productType"
                        :key="index"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-button class="search-button" @click="searchFun()">筛选</el-button>
            <el-button class="add-btn" @click="showDialog()" type="primary">添加商品</el-button>
        </el-form>
    </div>
    <el-table :data="list" border style="width: 100%">
        <el-table-column prop="id" label="编号" width="50" align="center">
        </el-table-column>
        <el-table-column prop="goodsName" label="商品" width="420" align="center">
        </el-table-column>
        <el-table-column prop="price" label="兑换值" width="80" align="center">
        </el-table-column>
        <el-table-column prop="pay" label="划掉" width="80" align="center">
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center">
        </el-table-column>
        <el-table-column prop="goodsNum" label="兑换量" width="80" align="center">
        </el-table-column>
        <el-table-column prop="goodsType" label="商品类型" width="" align="center" :formatter="formatGoodsType">
        </el-table-column>
        <el-table-column prop="productType" label="兑换类型" width="" align="center" :formatter="formatProductType">
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center" :formatter="formatStatus">
        </el-table-column>
        <el-table-column prop="date" label="操作" width="250" align="center">
         <template slot-scope="scope">
        <el-button
          size="mini"
          type="primary"
          @click="editData(scope.row.id)" :key="list.id">编辑</el-button>
      </template>
        </el-table-column>
    </el-table>
    <el-pagination 
        @size-change="handleSizeChange" 
        @current-change="handleCurrentChange" 
        :current-page="pageData.currentPage" 
        :page-size="pageData.pageSize" 
        :total="totalCount" :page-sizes="[10, 20, 50, 100]" 
        layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>    
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
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
            <el-form-item label="兑换类型" :label-width="formLabelWidth">
                <el-select class="select-type" v-model="productFormData.selectedValue" clearable placeholder="请选择" @change="productTypeFun()">
                    <el-option
                        v-for="item in productType"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
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
            <el-upload class="avatar-uploader" 
            ref="upload"
            :action="uploadUrl" 
            :headers="headers" 
            method:="post"
            :show-file-list="false" 
            :on-success="handleAvatarSuccess" 
            :before-upload="beforeAvatarUpload">
                <img v-if="tempData.smallPicture" :src="tempData.smallPicture" class="avatar">
                <i v-else class="smallImg el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <label class="bigImg-font">商品大图:</label>
            <el-upload class="avatar-uploader" ref="upload" :action="uploadUrl" :headers="headers" method:="post" :show-file-list="false" :on-success="handleAvatarSuccess2" :before-upload="beforeAvatarUpload">
                <img v-if="tempData.bigPicture" :src="tempData.bigPicture" class="avatar">
                <i v-else class="bigImg el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
        </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button class="isEdit" v-if="isEdit" type="primary" @click="changeSaveData()">确 定</el-button>
            <el-button class="isAdd" v-if="isAdd" type="primary" @click="saveData()">确 定</el-button>
        </div>
    </el-dialog>
</div>
</template>

<script>
import {getToken,removeToken} from '@/utils/auth'
export default {
    data() {
        return {
            list:[],
            isAdd:true,
            isEdit:false,
            totalCount:0,//总数
            pageData:{
                currentPage:1,//页码
                pageSize:10//每页数据
            },
            dialogStatus: "create",
            textMap: {
                update: "编辑商品",
                create: "添加商品"
            },
            searchData:{
                selectedValue: ''
            },
            paramData:{},//列表请求参数
            productType: [{ //兑换类型下拉
                value: '1',
                label: '普通商品'
            },{
                value: '2',
                label: '新手专享'
            }], 
            productFormData: {
                selectedValue: ""  //选中的兑换类型值
            },
            tempData:{
                goodsName:"",
                price:"",
                originalPrice:"",
                stock:"",
                goodsType:"",
                sortNum:"",
                status:"",
                smallPicture: '',
                bigPicture: '',
                productType: '' //兑换类型
            },
            headers:{'Authorization': "Bearer "+getToken()},
            uploadUrl: process.env.BASE_URL+"/file/upload",
            dialogTableVisible: false,
            dialogFormVisible: false,
            formLabelWidth: '120px'
        }
    },
    created(){
        this.getproductList();
    },
    methods: {
        setParamData() { //设置请求参数页码
            this.paramData.currentPage = this.pageData.currentPage;
            this.paramData.pageSize = this.pageData.pageSize;
            return this.paramData;
        },
        getproductList(){
            this.api({
                url:"/stepmall/goods/pageList",
                method:"post",
                headers:{'Content-Type':'application/json','Authorization': "Bearer "+getToken()},
                data:this.setParamData()
            }).then(
                data=>{
                    this.list = data.list;
                    this.totalCount = data.count;
                    console.log(data,"返回")
                }
            )
        },
        //筛选
        searchFun(){
            this.paramData = {};
            this.paramData.productType = this.searchData.selectedValue;
            this.pageData.currentPage = 1;
            this.getproductList();
        },
        //添加商品
        saveData(){
            //判断是否为空
            if(this.checkContents(this.tempData.goodsName,"请输入商品名称!!!")) {
                return ;
            }
            if(this.checkContents(this.tempData.price,"请输入活力值!!!")) {
                return ;
            }
            if(this.checkContents(this.tempData.originalPrice,"请输入划掉值!!!")) {
                return ;
            }
            if(this.checkContents(this.tempData.stock,"请输入库存!!!")) {
                return;
            }
            if(this.checkContents(this.tempData.productType,"请选择兑换类型!!!")) {
                return;
            }
            if(this.checkContents(this.tempData.goodsType,"请输入类型!!!")) {
                return;
            }
            if(this.checkContents(this.tempData.sortNum,"请输入排序序号!!!")) {
                return;
            }
            if(this.checkContents(this.tempData.status,"请输入状态!!!")) {
                return;
            }
            if(this.checkContents(this.tempData.smallPicture,"请选择商品小图!!!")) {
                return;
            }
            if(this.checkContents(this.tempData.bigPicture,"请选择商品大图!!!")) {
                return;
            }
            this.api({
                url:"/stepmall/goods/insert",
                method:"post",
                headers:{'Content-Type':'application/json','Authorization': "Bearer "+getToken()},
                data:this.tempData
            }).then(data=>{
                this.dialogFormVisible =false;
                this.getproductList();
                console.log("添加成功");
            })
        },
        //商品详情内容
        editData(id){
            this.isAdd=false;
            this.isEdit=true;
            this.dialogFormVisible =true;
            this.dialogStatus = "update";
            if(this.dialogStatus == "update"){
                this.tempData.id=id;
            }
            this.api({
                url:"/stepmall/goods/get_goods_detail",
                method:"post",
                data:{id:id}
            }).then(data=>{
            this.tempData.goodsName =data.goodsName;
            this.tempData.price=data.price
            this.tempData.originalPrice=data.originalPrice;
            this.tempData.stock=data.stock;
            this.tempData.goodsType=data.goodsType;
            this.productFormData.selectedValue=data.productType === 1?"普通商品":"新手专享";
            this.tempData.sortNum=data.sortNum;
            this.tempData.status=data.status;
            this.tempData.smallPicture=data.smallPicture;
            this.tempData.bigPicture=data.bigPicture;

            })
        },
        //兑换类型改变方法
        productTypeFun(){
            this.tempData.productType = this.productFormData.selectedValue
        },
        //保存修改商品的数据
        changeSaveData(){
            this.api({
                url:"/stepmall/goods/update",
                method:"post",
                data:this.tempData
            }).then(data=>{
            
                this.dialogFormVisible =false;
                this.getproductList();
            })
        },
        showDialog(){//添加商品按钮弹窗
            this.isAdd=true;
            this.isEdit=false;
            this.dialogFormVisible =true;
            this.dialogStatus = "create";
            delete this.tempData.id;
            this.clearInputValue();
        },
        clearInputValue(){
            this.tempData.goodsName ="";
            this.tempData.price="";
            this.tempData.originalPrice="";
            this.tempData.stock="";
            this.tempData.goodsType="";
            this.tempData.productType="";
            this.productFormData.selectedValue="";
            this.tempData.sortNum="";
            this.tempData.status="";
            this.tempData.smallPicture="";
            this.tempData.bigPicture="";
        },
         //校验
        checkContents(content,des) {
            if(!content) {
                this.$message.error(des);
                return true;
            }
        },
        formatStatus(row, column) {
                return row.status == "0" ? "未上架" :  "上架" ;
        },
        //商品类型转换
        formatGoodsType(row, column) {
            return row.goodsType == "0" ? "虚拟商品" :  "实物商品" ;
        },
        //兑换类型转换
        formatProductType(row, column) {
            return row.productType == "1" ? "普通商品" :  "新手专享" ;
        },
        handleSizeChange(val) {
            //改变每页数量
            this.pageData.pageSize = val;
        },
        handleCurrentChange(val) {
            //改变页码
            this.pageData.currentPage = val;
            this.getproductList();
        },
        handleAvatarSuccess(res, file) {
            this.tempData.smallPicture =res.data;
            // this.tempData.smallPicture = URL.createObjectURL(file.raw);
        },
        handleAvatarSuccess2(res, file) {
            this.tempData.bigPicture=res.data;
            // this.tempData.bigPicture = URL.createObjectURL(file.raw);
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
        
        

    }
}
</script>

<style lang="scss" scoped>
.formData{
    overflow: auto;
    height: 522px;
}
.container{
    margin-left: 16px;
    width: 98%;
}
.add-btn{
    float: right;
}
.el-input:nth-of-type(1){
  width: 70%;
}
.el-input:nth-of-type(2){
  width: 40%;
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
.smallImg-font,.bigImg-font{
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
.dialog-footer{
  text-align: center;
}
/* 新手专享新增样式 */
.search-box {
    margin: 20px 0 0;
    .el-select {
        width: 200px;
    }
}
.select-type{
    width: 70%;
}
</style>
