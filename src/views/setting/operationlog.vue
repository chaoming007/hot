<template>
    <div class="app-container">
        <div class="filter-container">
            <el-form :inline="true">
                <el-form-item>
                    <el-select v-model="listQuery.moduleCode" placeholder="模块" clearable>
                        <el-option v-for="module in modules" :key="module.code" :label="module.name" :value="module.code"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="listQuery.operatorId" filterable remote reserve-keyword placeholder="操作人员" :remote-method="getUserInfo" :loading="loading" clearable>
                        <el-option v-for="user in validUser" :key="user.id" :label="user.userName" :value="user.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-date-picker v-model="times" type="datetimerange" :editable="false" :picker-options="pickerOptions" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" align="left" value-format="yyyy-MM-dd HH:mm:ss">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button icon="el-icon-search" v-if="hasPerm('operationlog:list')" @click="getList()">查询</el-button>
                </el-form-item>
            </el-form>
        </div>
        <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row>
            <el-table-column prop="moduleName" label="模块" align="center" fixed width="140px"></el-table-column>
            <el-table-column prop="operationType" label="操作类型" align="center" width="140px"></el-table-column>
            <el-table-column prop="operationName" label="操作人" align="center" width="140px"></el-table-column>
            <el-table-column prop="createTime" label="操作时间" align="center" width="200px"></el-table-column>
            <el-table-column prop="content" label="更新内容" align="center" width="700px"></el-table-column>
        </el-table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.pageNo" :page-size="listQuery.pageSize" :total="totalCount" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>
</template>

<style>
    .el-range-separator {
        -webkit-box-sizing: content-box;
        box-sizing: content-box
    }
</style>

<script>
    import {
        getToken,
        removeToken
    } from '@/utils/auth'
    export default {
        data() {
            return {
                modules: [], //存放所有模块信息
                users: [], //存放所有用户信息
                validUser: [], //临时存放输入关键字过滤后的用户信息
                times: [],
                loading: false,
                listLoading: false, //数据加载等待动画
                listQuery: {
                    pageNo: 1,
                    pageSize: 20,
                    moduleCode: "",
                    operatorId: "",
                    startTime: "",
                    endTime: ""
    
                },
                list: [],
                totalCount: 0,
                pickerOptions: {
                    shortcuts: [{
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start, end]);
                        }
                    }]
                },
            }
        },
        created() {
            this.getList();
            this.getAllModule();
            this.getAllUser();
        },
        methods: {
            getList() {
                //查询列表
                if (!this.hasPerm("operationlog:list")) {
                    return;
                }
                this.listLoading = true;
                if (this.times.length > 0) {
                    this.listQuery.startTime = this.times[0];
                    this.listQuery.endTime = this.times[1];
                }
                this.api({
                    url: "/logs/find",
                    method: "get",
                    params: this.listQuery
                }).then(data => {
                    console.log(data);
                    this.listLoading = false;
                    this.list = data.list;
                    this.totalCount = data.total;
                });
            },
            getAllModule() {
                this.api({
                    url: "/logs/get_module",
                    method: "get"
                }).then(data => {
                    console.log(data);
                    this.modules = data;
                });
            },
            getAllUser() {
                this.api({
                    url: "/user/get_user",
                    method: "get"
                }).then(data => {
                    console.log(data);
                    this.users = data;
                });
            },
            getUserInfo(key) {
                if (key != '') {
                    this.loading = true;
                    setTimeout(() => {
                        this.loading = false;
                        this.validUser = this.users.filter(item => {
                            return item.userName.toLowerCase()
                                .indexOf(key.toLowerCase()) > -1;
                        });
                    }, 200);
                } else {
                    this.validUser = [];
                }
            },
            handleSizeChange(val) {
                //改变每页数量
                this.listQuery.pageSize = val;
                this.handleFilter();
            },
            handleFilter() {
                //查询事件
                this.listQuery.pageNo = 1
                this.getList()
            },
            handleCurrentChange(val) {
                //改变页码
                this.listQuery.pageNo = val;
                this.getList();
            }
        }
    }
</script>

