<style lang="scss">
    .teleplate-container {
        margin-left: 16px;
        width: 98%;
       
        .el-table {
            text-align: center;
        }
        .el-dialog {
            margin-left: 20%;
        }
        .dialog-footer {
            text-align: center;
        }
        .font {
            margin: 0 10px;
        }
        .plus,
        .reduce {
            width: 30px;
            height: 30px;
            margin: -10px 0;
        }
        .add-btn button {
            width: 120px;
            margin: 20px 0;
        }
        .dividing-line {
            width: 100%;
            border: 1px solid #eee;
        }
        .dialog {
            width: 124% !important;
            margin-left: -4%;
            .el-dialog__header {
                background: #eee;
                text-align: center;
            }
             .el-input:nth-of-type(1) {
            width: 186px;
        }
        .el-input:nth-of-type(2) {
            width: 86px;
        }
        .el-input:nth-of-type(3) {
            width: 196px;
        }
        }
        
        .noData{
            text-align: center;
            font-size: 20px;
            font-weight: bolder;
        }
    }
</style>
<template>
    <div class="teleplate-container">
        <div class="add-btn">
            <el-button type="primary" plain @click="showDialog()">新增</el-button>
        </div>
        <el-table :data="list" border style="width: 100%">
            <el-table-column prop="id" label="编号" align="center">
            </el-table-column>
            <el-table-column prop="templateName" label="模板名称" align="center">
            </el-table-column>
            <el-table-column prop="" label="操作" align="center">
                <template slot-scope="scope">
                            <el-button @click="editData(scope.row.id)" type="text" :key="list.id" size="small">编辑</el-button>
</template>
        </el-table-column>
    </el-table>
     <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageData.currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageData.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalCount">
    </el-pagination>
    <el-dialog class="dialog" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
  <el-form :model="dynamicValidateForm" ref="dynamicValidateForm" >
    <el-form-item label="模板名称:"><el-input v-model="templateName"></el-input></el-form-item>
    <div class="dividing-line"></div>
    <p class="">配置项:</p>
    <el-form-item v-for="(itemsTemp,index) in dynamicValidateForm.itemList" :label="'字段'+(index+1)+':'" :label-width="formLabelWidth"  :key="itemsTemp.index">
      <el-input v-model="itemsTemp.itemName" ></el-input>
      <span class="font">类型:</span><el-select v-model="itemsTemp.itemType" class="el-select" placeholder="请选择">
        <el-option v-for="(item,index) in itemTypeList" :key="index" :label="item.text" :value="item.code"></el-option>
      </el-select>
      <span class="font">说明:</span><el-input v-model="itemsTemp.itemRemark"  placeholder=""></el-input>
    <img v-show="(index ===dynamicValidateForm.itemList.length-1)" class="plus" :src="plus" @click="pulsInput(index)"/>
    <img v-show="(index < dynamicValidateForm.itemList.length-1)" class="reduce" :src="reduce" @click="reduceInput(itemsTemp)"/>
   <img v-if="reduceShow" v-show="(index ===dynamicValidateForm.itemList.length-1)" class="plus" :src="reduce" @click="reduceInput(itemsTemp)"/>
    </el-form-item>
    <p class="noData" v-show="noData">暂无数据</p>
  </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button type="primary" class="add" v-if="isAdd" @click="addData()">提交</el-button>
    <el-button type="primary" class="edit" v-if="isEdit" @click="updateData()">提交</el-button>
    <el-button  @click="dialogFormVisible = false">关闭</el-button>
  </div>
</el-dialog>
</div>

</template>

<script>
    import {
        getToken,
        removeToken
    } from '@/utils/auth'
    import plus from "@/assets/images/plus.png"
    import reduce from "@/assets/images/reduce.png"
    export default {
        data() {
            return {
                noData:false,
                plusShow:true,
                reduceShow:false,
                isAdd:true,
                isEdit:false,
                dynamicValidateForm: {
                    templateName:"",
                    itemList: [{
                        itemName: "",
                        itemType: "",
                        itemRemark: ""
                    }],
                },
                id:"",//模板ID     
                plus, //加号icon
                reduce, //减号icon
                totalCount: 0, //总页数
                pageData: {
                    currentPage: 1,
                    pageSize: 10
                },
                list: [], //列表数据
                itemList: {}, //新增数据/编辑数据的集合
                dialogFormVisible: false, //弹窗
                templateName: "",
                itemTypeList: [], //类型列表
                listType: "",
                formLabelWidth: '80px',
                dialogStatus: 'create',
                textMap: {
                    update: "编辑",
                    create: "新增"
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + getToken()
                },
            }
        },
        created() {
            this.getDataList();
        },
        methods: {
            //获取数据列表
            getDataList() {
                this.api({
                    url: '/material/get_template_list',
                    method: "post",
                    headers: this.headers,
                    data: this.pageData,
                }).then(data => {
                    this.list = data.list;
                    this.totalCount = data.count;
                })
            },
            //新增数据
            addData() {
                if(this.checkContents(this.templateName,"请输入模板名称")){
                    return;
                }
                else if(this.checkContents(this.dynamicValidateForm.itemList[0].itemName,"请输入字段")){
                    return;
                }else if(this.checkContents(this.dynamicValidateForm.itemList[0].itemRemark,"请输入说明内容")){
                    return;
                }
                this.dynamicValidateForm.templateName =this.templateName;
                this.api({
                    url: '/material/add_template',
                    method: 'post',
                    data: this.dynamicValidateForm
                }).then(data => {
                    this.dialogFormVisible = false;
                    this.getDataList();
                })
            },
            //编辑详情
            editData(id) {
                this.id =id;
                this.isAdd=false;
                this.isEdit=true;
                this.dialogFormVisible = true;
                this.reduceShow =true;
                this.dialogStatus = "update";
                this.getTypeData();
                this.api({
                    url: '/material/get_template_info',
                    method: 'post',
                    headers: this.headers,
                    data: {
                        id: id
                    }
                }).then(data => {
                    if(data.itemList.length ==0){
                        this.noData =true;
                    }else{
                        this.noData =false;
                    }
                    this.templateName = data.templateName;
                    this.dynamicValidateForm.itemList =data.itemList;
                    for(let i =0;i<data.itemList.length;i++){
                        delete data.itemList[i].id;//删除ID
                    }
                })
            },
            //更新数据
            updateData() {
                this.dynamicValidateForm.id =this.id;
                this.dynamicValidateForm.templateName =this.templateName;
                this.api({
                    url: '/material/update_template',
                    method: 'post',
                    data: this.dynamicValidateForm
                }).then(data => {
                    this.dialogFormVisible = false;
                })
            },
            //获取类型列表
            getTypeData() {
                this.api({
                    url: "/material/get_type_list",
                    method: 'post',
                    headers: this.headers,
                    data: {}
                }).then(data => {
                    this.itemTypeList = data;
                })
            },
            checkContents(content,des) {
                if(!content) {
                    this.$message.error(des);
                    return true;
                }
            },
            //加号操作
            pulsInput(index) {
                this.reduceShow =true;
                this.dynamicValidateForm.itemList.push({});
            },
            //减号操作
            reduceInput(item) {
                var index = this.dynamicValidateForm.itemList.indexOf(item);
                console.log(index);
                // if(index ==0){
                //     this.reduceShow =false;
                //     return false;
                // }
                if (index !== -1) {
                this.dynamicValidateForm.itemList.splice(index, 1)
                } 
                
            },
            //清除input填写的数据
            clearInputValue() {
                this.templateName = "";
            },
            handleSizeChange(val) {
                //改变每页数量
                this.pageData.pageSize = val;
                this.handleFilter();
            },
            handleFilter() {
                this.pageData.currentPage = 1;
                this.getDataList();
            },
            handleCurrentChange(val) {
                //改变页码
                this.pageData.currentPage = val;
                this.getDataList();
            },
            showDialog() {
                this.getTypeData();
                this.clearInputValue();
                this.isAdd=true;
                this.isEdit=false;
                this.reduceShow =false;
                this.dialogStatus = "create";
                this.dialogFormVisible = true;
                this.dynamicValidateForm={
                    itemList: [{
                        itemName: "",
                        itemType: "",
                        itemRemark: ""
                    }],
                }
            }
        },

    }
</script>


