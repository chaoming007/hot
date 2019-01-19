<template>
    <div class="container">
        <div class="formBox">
            <div class="conversionRatio">
                <label>兑换比例</label>
                <span class="font">步数活力值兑换比例:</span>
                <el-input v-model="stepValm1" class="input_Value" onkeyup="value=value.replace( /[^\d]/g,'')" /></el-input>
                <el-input v-model="stepValn1" onkeyup="value=value.replace( /[^\d]/g,'')" /></el-input>
            </div>
            <div class="reward">
                <label>奖励设置</label>
                <span class="font">邀请好友奖励:</span>
                <el-input class="input-child" v-model="stepValm2" onkeyup="value=value.replace( /[^\d]/g,'')" /></el-input><br/><br/>
                <span class="font">分享奖励:</span>
                <el-input v-model="stepValn3" placeholder="" onkeyup="value=value.replace( /[^\d]/g,'')" /></el-input>
                <el-input v-model="stepValm3" placeholder="" onkeyup="value=value.replace( /[^\d]/g,'')" /></el-input>
            </div>
            <div class="signIn">
                <label>签到设置</label>
                <span class="font">签到奖励:</span>
                <el-input class="input-child" v-model="stepValm4" onkeyup="value=value.replace( /[^\d]/g,'')" /></el-input>
            </div>
            <div class="stepRedemption">
                <label>微信分享次数</label>
                <span class="font">微信分享次数:</span>
                <el-input class="input-child" v-model="stepValm5" onkeyup="value=value.replace( /[^\d]/g,'')" /></el-input>
            </div>
            <div class="stepRedemption">
                <label>微信步数兑换上限</label>
                <span class="font">兑换上限:</span>
                <el-input class="input-child" v-model="stepValm6" onkeyup="value=value.replace( /[^\d]/g,'')" /></el-input>
            </div>
            <el-button @click="saveData()" type="primary">保存</el-button>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                tempData: [{
                    stepKey: "6", //兑换比例
                    stepValm: this.stepValm1,
                    stepValn: this.stepValn1
                }, {
                    stepKey: "2", //邀请
                    stepValm: this.stepValm2
                }, {
                    stepKey: "3", //分享奖励
                    stepValm: this.stepValm3,
                    stepValn: this.stepValn3
                }, {
                    stepKey: "1", //签到
                    stepValm: this.stepValm4
                }, {
                    stepKey: "5", //分享次数
                    stepValm: this.stepValm5
                }, {
                    stepKey: "7", //微信步数兑换上限
                    stepValm: this.stepValm6
                }],
                stepValm1: "", //兑换比例
                stepValn1: "", //兑换比例
                stepValm2: "", //邀请好友奖励
                stepValm3: "", //分享奖励
                stepValn3: "", //分享奖励
                stepValm4: "", //签到奖励
                stepValm5: "", //微信分享次数
                stepValm6: "" //微信步数兑换上限
            }
        },
        created() {
            this.getData();
        },
        methods: {
            saveData() {
                this.tempData[5].stepValm = this.stepValm1; //兑换比例
                this.tempData[5].stepValn = this.stepValn1; //兑换比例
                this.tempData[1].stepValm = this.stepValm2; //邀请好友奖励
                this.tempData[2].stepValn = this.stepValn3; //分享奖励
                this.tempData[2].stepValm = this.stepValm3; //分享奖励
                this.tempData[0].stepValm = this.stepValm4; //签到奖励
                this.tempData[4].stepValm = this.stepValm5; //微信分享次数
                this.tempData[6].stepValm = this.stepValm6; //微信步数兑换上限
                if (this.stepValm3 < this.stepValn3) {
                    alert("分享奖励:最小值不能大于最大值！！！");
                    return false;
                }
                this.api({
                    url: '/stepmall/config/insert',
                    method: "post",
                    data: this.tempData
                }).then(data => {
                    this.getData();
                    console.log(this.tempData);
                })
            },
            getData() {
                this.api({
                    url: '/stepmall/config/load',
                    method: 'post',
                }).then(data => {
                    this.tempData = data;
                    this.stepValm1 = data[5].stepValm; //兑换比例
                    this.stepValn1 = data[5].stepValn; //兑换比例
                    this.stepValm2 = data[1].stepValm; //邀请好友奖励
                    this.stepValn3 = data[2].stepValn; //分享奖励
                    this.stepValm3 = data[2].stepValm; //分享奖励
                    this.stepValm4 = data[0].stepValm; //签到奖励
                    this.stepValm5 = data[4].stepValm; //微信分享次数
                    this.stepValm6 = data[6].stepValm; //微信步数兑换上限
                })
            },
        }
    }
</script>

<style lang="scss" scoped>
    .container {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        .formBox {
            width: 500px;
            text-align: center;
            label {
                display: block;
                margin: 10px 26px;
                text-align: left;
            }
            .conversionRatio,
            .reward,
            .signIn,
            .stepRedemption {
                margin: 20px;
                .el-input {
                    margin-left: 20px;
                }
                .input-child {
                    width: 226px;
                }
            }
            .font {
                width: 160px;
                height: 40px;
                border: 2px solid #eee;
                display: inline-block;
                line-height: 34px;
                text-align: center;
            }
            .el-input {
                width: 100px;
                input {
                    width: 100px;
                }
            }
            .el-button {
                margin-left: 20px;
            }
        }
    }
</style>
