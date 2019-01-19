<template>
<div class="container">
  <!-- 搜索 start  -->
  <div class="search-box">
    <span>APP版本号：</span>
    <el-select v-model="versionVal" placeholder="请选择">
        <el-option
            v-for="item in versionOptions"
            :key="item.id"
            :label="item.versionCode"
            :value="item.versionCode">
        </el-option>
    </el-select>
    <span class="label-box">补丁版本号：</span>
    <el-select v-model="patchVal" placeholder="请选择">
        <el-option
            v-for="item in patchOptions"
            :key="item.id"
            :label="item.patchCode"
            :value="item.patchCode">
        </el-option>
    </el-select>

    <span class="label-box">时间：</span>
    <el-date-picker
      v-model="timVal"
      type="datetimerange"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期">
    </el-date-picker>

    <el-button type="primary" @click="searchFun" class="btn-sty">搜索</el-button>

  </div>
  <!-- 搜索 end  -->

  <!-- 内容 start  -->
    <div class="content-box">
        <!-- 图表 start  -->
        <div class="char-box">
             <VeLine :xAxis="xAxis"  :yAxis="yAxis" :data="chartData"   height="400px"></VeLine>
        </div>

        <!-- 图表 end  -->
        <div class="section-box">
             <el-alert
                :title="statusText"
                class="ts-box"
                type="info">
            </el-alert>
            <div class="btn-warp-box">
                <el-button type="primary" 
                @click="getPatchAllDat" 
                :disabled="allSendBtnCtl" 
                v-show="allSendBtnShow" 
                class="btn-set">全部下发</el-button>

                <el-button type="primary" 
                @click="getPatchGrayDat" 
                :disabled="graySendBtnCtl" 
                v-show="graySendBtnShow" 
                class="btn-set">内部测试</el-button>

            </div>
            <div class="box-content">
                <div class="box-item">
                    下发数:{{totalNum.downNum}}
                </div>
                <div class="box-item">
                    下发成功数:{{totalNum.lowerNum}}
                </div>
                <div class="box-item">
                    合成成功数:{{totalNum.compositeNum}}
                </div>
                <div class="box-item">
                    应用成功数:{{totalNum.applicationNum}}
                </div>
                <div class="box-item">
                    成功率:{{totalNum.successRate}}
                </div>
            </div>

            <!-- 关闭 start  -->
            <div class="close-btn-box">
                <el-button @click="closePageFun" class="close-btn" type="primary" plain >返回</el-button>
            </div>

            <!-- 关闭 end -->

        </div>

    </div>
  <!-- 内容 end  -->

</div>
</template>

<script>
import VeLine from 'v-charts/lib/line.common'

export default {
    data(){
        return{
            versionOptions:[],              //版本下拉数据
            patchOptions:[],             //补丁下拉数据
            versionVal: '',
            patchVal: '',
            timVal:'',
            totalNum:'',                //统计数据
            chartData: {
                columns: ['时间','下发成功数','合成成功数','应用成功数'],
                rows: []
            },
            // colors:["#00da9e","#cc0000","00ff00"],
            xAxis:{
                type: 'category',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#dedede'
                    }
                },
                axisLabel: {
                    fontSize: 10,
                    color: '#222222',
                    margin: 10
                }
            },
            yAxis:{
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#dedede'
                    }
                },
                axisLabel: {
                    fontSize: 10,
                    color: '#222222',
                    margin: 10
                },
                splitLine: {
                    show:true,
                    lineStyle: {
                        color: '#F5F5F5'
                    }
                },
                axisTick: {
                    show: false
                }
            },
            applicationKey:this.$route.query.applicationKey || "8555745aa8100b40a6eb3c172458dd87",     //应用密钥
            applicationId:this.$route.query.applicationId || 3,                        //应用id
            versionCode:this.$route.query.versionCode || "v10.0.0",                  //版本号
            versionId:this.$route.query.versionId || 1,                             //补丁号
            patchId:this.$route.query.patchId || 1,                               //补丁id
            statusVal:this.$route.query.status || 1,                             //停启用状态（1启动2暂停）

            //patchStatus:1,                           //补丁状态（1已就绪2已灰度3已全量）

            versionsUrl:"/hotfix/version/select",   //版本下拉列表请求地址
            
            patchUrl:"/hotfix/patch/select",         //补丁下拉列表请求地址

            searchUrl:"/hotfix/patch/search",        //补丁查询请求地址

            totalUrl:"/hotfix/patch/total",           //统计总数请求地址

            pushUrl:"/hotfix/patch/down",             //灰度下发和全量下发地址

            allSendBtnCtl:true,             //是否可以全部下发
            graySendBtnCtl:true,            //是否可以灰度下发

            allSendBtnShow:true,            //是否显示全部下发
            graySendBtnShow:true,            //是否显示灰度下发

            statusText:"补丁状态说明"

        }
    }, 
    created(){
        //this.getDataFun()
        this.getNowTimeFun()        //设置初始时间
        this.getVersionsDat()       //请求版本下拉数据
        this.getPatchDat()          //请求补丁下拉数据
        this.getTotalDat()          //请求统计数据
        this.getCharListDat()       //请求图表数据
    },
    methods:{
        searchFun(){                                //搜索事件
            if(!this.versionVal){
                this.hintFun("请选择APP版本号")
            }else if(!this.patchVal){
                this.hintFun("请选择补丁版本号")
            }else if(!this.timVal){
                this.hintFun("请选择开始时间和结束时间")
            }else{
                console.log("开始搜索",this.versionVal,this.patchVal,this.timFormateFun(this.timVal[0]),this.timFormateFun(this.timVal[1]))
                this.versionCode=this.versionVal
                this.versionId=this.patchVal
                this.patchId=this.patchVal
                this.getCharListDat()
                this.getTotalDat()
            }
        },
        setCharDatFun(dat){            //设置图表数据
            let datArr=[]
            console.log("图表数据",dat)
            if(!dat || !dat.list){
                return
            }
            dat.list.forEach((item,key)=>{
                let json={}
                json["时间"]=this.setCharTimeFun(item.date,dat.flag)
                json["下发成功数"]=item.lowerNum
                json["合成成功数"]=item.compositeNum
                json["应用成功数"]=item.applicationNum
                datArr.push(json)
            })
            // if(dat.status===2){                             //如果是停用状态 下发按钮都不可用
            //     this.allSendBtnCtl=true
            //     this.graySendBtnCtl=true
            // }
            if(dat.patchStatus===3){      //如果是开启状态1，并且已全量3，下发按钮都不可用
                this.allSendBtnCtl=true
                this.graySendBtnCtl=true
                this.statusText="当前状态：已全量"
            }
            if(dat.patchStatus===2){      //如果是开启状态1，并且已灰度2，全量下发按钮打开
                this.allSendBtnCtl=false
                this.graySendBtnCtl=true
                this.statusText="当前状态：已灰度"
            }
            if(dat.patchStatus===1){      //如果是开启状态1，并且已就绪1，全量下发按钮关闭，灰度按钮打开
                this.allSendBtnCtl=true
                this.graySendBtnCtl=false
                this.statusText="当前状态：已就绪"
            }
            this.chartData.rows=[...datArr]
        },

        closePageFun(){         //关闭当前页
            this.$router.push({path:`/hotRestore/patch?versionId=${this.versionId}&versionCode=${this.versionCode}&applicationId=${this.applicationId}&applicationKey=${this.applicationKey}`})
        },

        setCharTimeFun(data,type){      //设置图表日期数据
            let time=""
            if(type===1){               //按小时计算
                time=data.match(/\d{2}\:\d{2}\:\d{2}/i)[0]
            }
            if(type===2){               //按天计算
                time=data.match(/\d{2}-\d{2}$/i)[0]
            }
            return time
        },

        getPatchAllDat(){              //全量下发请求方法
            let data={}
            data.id=this.patchId
            data.status=this.statusVal
            data.patchStatus=3
            this.getDataFun(this.pushUrl,data,this.setPatchAllDat)
        },
        setPatchAllDat(data){
            console.log("全量下发成功",data)
            this.$message({
                message: '全量下发成功!',
                type: 'success'
            })
            this.allSendBtnCtl=true
            this.graySendBtnCtl=true
            this.statusText="当前状态：已全量"
        },

        getPatchGrayDat(){             //内部测试下发请求方法(灰度下发)
            let data={}
            data.id=this.patchId
            data.status=this.statusVal
            data.patchStatus=2
            this.getDataFun(this.pushUrl,data,this.setPatchGrayDat)
        },
        setPatchGrayDat(data){
            console.log("灰度下发成功",data)
            this.$message({
                message: '灰度下发成功!',
                type: 'success'
            })
            this.allSendBtnCtl=false
            this.graySendBtnCtl=true
            this.statusText="当前状态：已灰度"
        },

        getCharListDat(){               //获得补丁图表数据
            let data={}
            data.versionCode=this.versionCode
            data.patchCode=this.versionId
            data.id=this.patchId
            data.startTime=this.timFormateFun(this.timVal[0])
            data.endTime=this.timFormateFun(this.timVal[1]) 
            data.applicationKey=this.applicationKey
            this.getDataFun(this.searchUrl,data,this.setCharListDat)
        },
        setCharListDat(data){
            this.setCharDatFun(data)
        },

        getNowTimeFun(){            //默认初始时间
            this.timVal=[]
            this.timVal[0]=new Date()-1000*60*60*10
            this.timVal[1]=new Date()
        },

        getTotalDat(){                  //请求统计总数
            let data={}
            data.applicationKey=this.applicationKey
            data.versionCode=this.versionCode
            data.patchCode=this.versionId
            this.getDataFun(this.totalUrl,data,this.setTotalDat)
        },
        setTotalDat(data){
            this.totalNum={...data}
        },

        getVersionsDat(){                   //请求版本下拉数据
            let data={}
            data.applicationId=this.applicationId
            this.getDataFun(this.versionsUrl,data,this.setVersionsSelectDat)
        },
        setVersionsSelectDat(data){         //设置版本下拉数据
            if(data && data.length>0){
                this.versionOptions=[...data]
            }
        },

        getPatchDat(){                      //请求补丁下拉数据
            let data={}
            data.versionId=this.versionId
            this.getDataFun(this.patchUrl,data,this.setPatchSelectDat)
        },
        setPatchSelectDat(data){            //设置补丁下拉数据
            if(data && data.length>0){
                this.patchOptions=[...data]
            }
        },


        getDataFun(url,data,callBackFun){        //请求数据公共方法
            this.api({
                url: url,
                method: 'post',
                data:data || ""
            }).then(dat => {
                callBackFun && callBackFun.call(this,dat)
            })
        },

        hintFun(title){          //提示公共方法
            this.$message({
                message: title,
                type: 'warning'
            });
            return false
        },
        timFormateFun(dat){      //日期处理函数
            return new Date(dat).getFullYear()+"-"+this.addZeroFun((new Date(dat).getMonth()+1))+"-"+this.addZeroFun(new Date(dat).getDate())
        },
        addZeroFun(num){
            return num<10?"0"+num:num
        },
    },
    components:{
        VeLine
    }
}
</script>

<style lang="scss" scoped>
.container{
  margin: 0 auto
}
.search-box{
  padding:30px 100px;
  box-shadow: 0px 4px 5px #E6E6E6;
}
.label-box{
    margin: 0 0 0 30px
}
.btn-sty{
    width: 100px;
    margin: 0 0 0 30px
}
.content-box{
    padding: 50px 100px
}
.char-box{
    padding: 0;
}
.section-box{
    padding:0 0 20px
}
.btn-warp-box{
    padding:30px 10px 50px
}
.btn-warp-box .btn-set{
    width: 150px;
    height: 50px;
    margin: 0 50px 0 0
}
.box-content{
    flex-direction: row;
    display: flex;
    justify-content: center;
    align-items: center
}
.box-content .box-item{
    flex: 1;
    margin:0 10px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 100px;
    border-radius: 5px;
    font-size: 18px;
    box-shadow:0px 0px 10px #e8e8e8;
}
.box-content .box-item .cgl-box{
    margin: 0 20px 0 0
}
.ts-box{
    width: 500px;
}
.close-btn-box{
    padding: 50px 0;
    text-align: center;
    .close-btn{
        width: 120px;
        height: 50px;
    }
}


</style>
