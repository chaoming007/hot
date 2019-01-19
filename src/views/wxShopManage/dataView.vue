<template>
<div class="container">
    <!-- tab start -->
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <!-- 数据统计 start -->
        <el-tab-pane label="数据统计" name="first">
            <!-- 日期控件筛选 start -->
            <div class="search-box">
                <el-form :inline="true">
                    日期&nbsp;
                    <el-form-item>
                        <el-date-picker 
                            v-model="dateTime"
                            class="datetimerange" 
                            type="daterange" 
                            :editable="false" 
                            range-separator="至" 
                            start-placeholder="开始时间" 
                            end-placeholder="结束时间" 
                            align="center" 
                            value-format="yyyy-MM-dd">
                        </el-date-picker>
                    </el-form-item>
                    <el-button class="search-button" @click="searchFun">筛选</el-button>
                </el-form>
            </div>
            <!-- 数据统计列表 start -->
            <el-table :data="listData" border style="width=100%" :header-cell-style="{'background-color': '#eaeaea','color': '#222'}">
                <el-table-column prop="exchangePeopleNum" label="兑换人数" align="center"></el-table-column>
                <el-table-column prop="inviteedNum" label="被邀请人" align="center"></el-table-column>
                <el-table-column prop="exchangeGoodsNum" label="商品兑换数" align="center"></el-table-column>
                <el-table-column prop="inviteedSucessNum" label="被邀请成功人数" align="center"></el-table-column>
                <el-table-column prop="exchangeStepNum" label="兑换步数次数" align="center"></el-table-column>
                <el-table-column prop="sendVitalityNum" label="发放活力值" align="center"></el-table-column>
                <el-table-column prop="consumeVitalityNum" label="消耗活力值数" align="center"></el-table-column>
            </el-table>

        </el-tab-pane>

        <!-- 数据统计 end -->

        <!-- 数据分析 start -->
        <el-tab-pane label="数据分析" name="second">
            <!-- 日期控件筛选 start -->
            <div class="search-box">
                <el-form :inline="true">
                    日期&nbsp;
                    <el-form-item>
                        <el-date-picker 
                            v-model="dateTime"
                            class="datetimerange" 
                            type="daterange" 
                            :editable="false" 
                            range-separator="至" 
                            start-placeholder="开始时间" 
                            end-placeholder="结束时间" 
                            align="center" 
                            value-format="yyyy-MM-dd">
                        </el-date-picker>
                    </el-form-item>
                    <el-button class="search-button" @click="searchFun" >筛选</el-button>
                </el-form>
            </div>
            <!-- 数据统计列表 start -->
            <el-table :data="listData" border style="width=100%" :header-cell-style="{'background-color': '#eaeaea','color': '#222'}">
                <el-table-column prop="currentTime" label="日期" align="center"></el-table-column>
                <el-table-column prop="exchangePeopleNum" label="兑换人数" align="center"></el-table-column>
                <el-table-column prop="inviteedNum" label="被邀请人数" align="center"></el-table-column>
                <el-table-column prop="exchangeGoodsNum" label="商品兑换数" align="center"></el-table-column>
                <el-table-column prop="inviteedSucessNum" label="被邀请成功人数" align="center"></el-table-column>
                <el-table-column prop="exchangeStepNum" label="兑换步数次数" align="center"></el-table-column>
                <el-table-column prop="sendVitalityNum" label="发放活力值" align="center"></el-table-column>
                <el-table-column prop="consumeVitalityNum" label="消耗活力值" align="center"></el-table-column>
            </el-table>

              <!-- 分页 start  -->

                <div class="page-box">
                    <div class="block">
                    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="this.currentPage" :page-sizes="this.pageSizes" :page-size="this.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="this.countNum">
                    </el-pagination>
                    </div>
                </div>

            <!-- 分页 end  -->   
            
        </el-tab-pane>
        <!-- 数据分析 end -->
        <!-- 留存分析 start -->
        <el-tab-pane label="留存分析" name="third">
            <!-- 日期控件筛选 start -->
            <div class="search-box">
                <el-form :inline="true">
                    日期&nbsp;
                    <el-form-item>
                        <el-date-picker 
                            v-model="dateTime"
                            class="datetimerange" 
                            type="daterange" 
                            :editable="false" 
                            range-separator="至" 
                            start-placeholder="开始时间" 
                            end-placeholder="结束时间" 
                            align="center" 
                            value-format="yyyy-MM-dd">
                        </el-date-picker>
                    </el-form-item>
                    <el-button class="search-button" @click="searchFun" >筛选</el-button>
                </el-form>
            </div>
            <!-- 数据统计列表 start -->
            <el-table :data="listData" border style="width=100%" :header-cell-style="{'background-color': '#eaeaea','color': '#222'}">
                <el-table-column prop="date" label="留存" align="center"></el-table-column>
                <el-table-column prop="exchangeNum" label="兑换人数" align="center"></el-table-column>
                <el-table-column prop="secondRemainRate" label="次日留存" align="center"></el-table-column>
                <el-table-column prop="thirdRemainRate" label="三日存留" align="center"></el-table-column>
                <el-table-column prop="sevenRemainRate" label="七天留存" align="center"></el-table-column>
               
            </el-table>

             <!-- 分页 start  -->
                <div class="page-box">
                    <div class="block">
                    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="this.currentPage" :page-sizes="this.pageSizes" :page-size="this.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="this.countNum">
                    </el-pagination>
                    </div>
                </div>
            <!-- 分页 end  -->   

        </el-tab-pane>
        <!-- 留存分析 end -->
    </el-tabs>
    
</div>
</template>

<script>
import {getToken,removeToken} from '@/utils/auth'
export default {
    data() {
        return {
            activeName: "first",           //初始选择标签
            currentTabName:"first",
            listData: [],                  //数据列表数据
            initStartTime:"2018-11-30",   //初始开始时间
            startTime: "",
            endTime: "",
            currentPage: 1,             //当前页数
            pageSize: 30,               //每页显示条数
            countNum: 0,                //数据总数
            pageSizes: [30, 40, 50],    //每页显示条数
            dateTime:[],
            getDataUrl:"",              //请求地址

            dataTongUrl:"/stepmall/list_total_select",     //数据统计接口
            dataFenUrl:"/stepmall/list_single_select",     //数据分析接口
            dataLvUrl:"/stepmall/get_statistic_remain",     //留存分析接口
        };
    },
    created(){
        this.getDataList()
    },
    methods: {
        //页码跳转处理函数
        handleCurrentChange(val) {
            this.currentPage = val
            this.getDataList()
        },
        //每页显示多少条
        handleSizeChange(val) {
            this.pageSize = val
            this.getDataList()
        },
        searchFun(){          //搜索
            if(this.dateTime.length>=1){
                this.startTime=this.dateTime[0]
                this.endTime=this.dateTime[1]
                this.listData=[]
                this.getDataList()
            }
        },
        dataAnalysisParamFun(){     //数据分析参数设置    
            let jsonParam={}
            jsonParam.num=this.currentPage
            jsonParam.size=this.pageSize
            return jsonParam
        },
        retainedAnalysisParamFun(){ //留存分析参数设置
            let jsonParam={}
            jsonParam.pageNum=this.currentPage
            jsonParam.pageSize=this.pageSize
            return jsonParam
        },
        getCurrentTime(){               //获得当前时间并且格式化
            return new Date().getFullYear()+"-"+(new Date().getMonth()+1)+"-"+new Date().getDate()
        },

        //获取数据
        getDataList(){
            let params={
                startTime:this.startTime || this.initStartTime,
                endTime:this.endTime || this.getCurrentTime()
            }
            switch(this.activeName){
                case "first":
                    this.getDataUrl=this.dataTongUrl
                    break;
                case "second":
                    this.getDataUrl=this.dataFenUrl
                    params=Object.assign({},{...params},{...this.dataAnalysisParamFun()})
                    break;
                case "third":
                    this.getDataUrl=this.dataLvUrl
                    params=Object.assign({},{...params},{...this.retainedAnalysisParamFun()})
                    break;
                default:
                    this.getDataUrl=this.dataTongUrl
            }
            this.api({
                url: this.getDataUrl,
                method: "post",
                data: params
            }).then(data=>{
                if(this.activeName==="first"){
                    this.listData.push(data)
                }
                if(this.activeName==="second"){
                    this.countNum=data.count
                    this.listData=[...data.list]
                }
                if(this.activeName==="third"){
                    this.countNum=data.count
                    this.listData=[...data.list]
                }
            })
        },
        handleClick(tab, event) {         //切换tab标签
            if(this.activeName!==this.currentTabName){
                this.startTime=""
                this.endTime=""
                this.currentPage=1          //当前页数
                this.pageSize=30            //每页显示条数
                this.countNum=0             //数据总数
                this.dateTime=[]
                this.listData=[]
                this.currentTabName=this.activeName
                this.getDataList()
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.container{
    margin: 20px;
}
.datetimerange {
    width: 378px;
    span {
        padding: 0;
    }
}
.page-box{
    padding: 20px 0 
}
</style>

