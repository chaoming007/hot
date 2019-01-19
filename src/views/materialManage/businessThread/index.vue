<template>
<div class="container">
    <el-button class="add-btn is-plain" @click="showDialog()" type="primary">新增</el-button>
    <el-table :data="list" border style="width: 100%">
        <el-table-column prop="id" label="编号" width="150" align="center">
        </el-table-column>
        <el-table-column prop="businessName" label="业务线名称" align="center">
        </el-table-column>
        <el-table-column  label="操作" width="250" align="center">
            <template slot-scope="scope">
                <el-button v-show="scope.row.businessStatus==1" type="danger" @click="changeStopStatus(scope.row.id,2)" >停用</el-button>
                <el-button v-show="scope.row.businessStatus==2" type="primary"  @click="changeOpenStatus(scope.row.id,1)">启用</el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination 
        @size-change="handleSizeChange" 
        @current-change="handleCurrentChange" 
        :current-page="pageData.currentPage" 
        :page-size="pageData.pageSize" 
        :total="totalCount" :page-sizes="[10, 20, 30, 50, 100]" 
        layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>    
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
        <div class="formData">
        <el-form :model="tempData">
            <el-form-item label="业务线名称:" :label-width="formLabelWidth">
                <el-input v-model="tempData.businessName" placeholder="请输入业务线名称"></el-input>
            </el-form-item>
        </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
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
            businessStatus: 1,
            totalCount:0,//总数
            pageData:{
                currentPage:1,//页码
                pageSize:30//每页数据
            },
            dialogStatus: "create",
            textMap: {
                create: "新增业务线"
            },
            tempData:{
                businessName:""
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
        getproductList(){     //获得业务线列表
            this.api({
                url:"/material/get_business_list",
                method:"post",
                headers:{'Content-Type':'application/json','Authorization': "Bearer "+getToken()},
                data:this.pageData
            }).then(
                data=>{
                    //console.log("业务线列表：",data)
                    this.list =data.list;
                    this.totalCount = data.count;
                }
            )
        },
        changeOpenStatus(id,status){   //启用业务线
            var msg=status==1?"启用":"停用";
    
            this.$confirm('确认要'+msg+'业务线吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                this.api({
                    url:"/material/update_business_status",
                    method:"post",
                    headers:{'Content-Type':'application/json','Authorization': "Bearer "+getToken()},
                    data:{
                        id:id,
                        businessStatus:status
                    }
                }).then((data)=>{ 
                    //console.log("启用",data)
                    if (data==1){
                        this.$message({
                            message: msg+'成功！',
                            type: 'success'
                        });
                        this.getproductList();
                    } else {
                        this.$message({
                            message: msg+'失败！',
                            type: 'error'
                        });
                    }
                })
            }).catch(() => {
            
            }); 
        },  

        changeStopStatus(id,status){         //停用先判断有效期
            this.api({
                url:"/material/get_material_list",
                method:"post",
                data:{
                    businessId:id,
                    currentPage:1,
                    pageSize:10
                }
            }).then((data)=>{ 
                //console.log("素材列表",data)
                this.setBusinessStatusFun(data,id,status)
            })
        },  
        setBusinessStatusFun(data,id,status){
            let list=[...data.list]
            let tim=new Date().getTime()
            if(list.length<=0){       //无素材
                this.changeOpenStatus(id,status);
                return;
            }
            for(let i=0;i<list.length;i++){
                let t=list[i].timeRange
                if(!t){        
                    promptFun.call(this);
                    return;
                }
                let reg=/(\d{4}\-+\d{2}-+\d{2})~?(\d{4}\-+\d{2}-+\d{2})?/i
                let startTime=new Date(t.match(reg)[1]).getTime()
                let endTime=t.match(reg)[2]?new Date(t.match(reg)[2]).getTime():Number.POSITIVE_INFINITY
                if(tim>startTime && tim<endTime){        
                    promptFun.call(this);
                    return;
                }
            }

            this.changeOpenStatus(id,status);
            function promptFun(){
                this.$confirm('在有效期范围内还有素材不能停用！', '提示', {
                    confirmButtonText: '确定',
                    type: 'warning'
                }).then(()=>{
                    this.$message({
                        message: '停用失败！',
                        type: 'error'
                    });
                })
            }
        },

        //新增业务线
        saveData(){
            //检验
            if(this.checkContents(this.tempData.businessName,"业务线名称不能为空!")) {
                return ;
            }
            this.api({
                url:"/material/add_business",
                method:"post",
                headers:{'Content-Type':'application/json','Authorization': "Bearer "+getToken()},
                data:this.tempData
            }).then(data=>{
                this.dialogFormVisible =false;
                this.getproductList();
                console.log("添加成功");
            })
        },
        showDialog(){//添加业务线按钮弹窗
            this.isAdd=true;
            this.isEdit=false;
            this.dialogFormVisible =true;
            this.dialogStatus = "create";
            delete this.tempData.id;
            this.clearInputValue();
        },
        clearInputValue(){
            this.tempData.businessName ="";
        },
        //校验是否为空
        checkContents(content,des) {
            if(!content) {
                this.$message({
                    showClose: true,
                    message: des,
                    type: 'error'
                })
                return true
            }
        },
        handleSizeChange(val) {
            //改变每页数量
            this.pageData.pageSize = val;
            this.getproductList();
        },
        handleCurrentChange(val) {
            //改变页码
            this.pageData.currentPage = val;
            this.getproductList();
        }
        
    }
}
</script>

<style lang="scss" scoped>
.formData{
    overflow: auto;
    height: auto;
}
.container{
    margin-left: 16px;
    width: 98%;
}
.add-btn{
    width: 120px;
    margin: 20px 0;
}
.container .el-input:nth-of-type(1){
  width: 84%;
}
.dialog-footer{
  text-align: center;
}
.el-table .el-button{
    margin: 0;
}
</style>
