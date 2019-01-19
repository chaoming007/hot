<template>
    <div class="app-container">
        <div class="filter-container">
            <el-form>
                <el-form-item>
                    <el-button type="success" icon="plus" @click="showCreate">添加操作
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
        <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row>
            <el-table-column align="center" label="序号" width="80">
                <template slot-scope="scope">
                    <span v-text="getIndex(scope.$index)"> </span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作代码" prop="code"></el-table-column>
            <el-table-column align="center" label="操作名称" prop="name"></el-table-column>
            <el-table-column align="center" label="管理" width="220"  v-if="hasPerm('operate:update') ||hasPerm('operate:delete') ">
                <template slot-scope="scope">
                    <el-button type="primary" icon="edit" :disabled="scope.row.deletable==0"  v-if="hasPerm('operate:update')" @click="showUpdate(scope.$index)">修改
                    </el-button>
                    <el-button type="danger" icon="delete" :disabled="scope.row.deletable==0"  v-if="hasPerm('operate:delete')" @click="removeMenu(scope.$index)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
            <el-form class="small-space" :model="tempOperate" label-position="left" label-width="100px" style='width: 500px; margin-left:50px;'>
                <el-form-item label="操作代码" required>
                    <el-input type="text" v-model="tempOperate.code" :disabled="dialogStatus=='update'" style="width: 250px;">
                    </el-input>
                </el-form-item>
                <el-form-item label="操作名称" required>
                    <el-input type="text" v-model="tempOperate.name" style="width: 250px;">
                    </el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button v-if="dialogStatus=='create'" type="success" @click="createMenu">创 建</el-button>
                <el-button type="primary" v-else @click="updateMenu">修 改</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            list: [], //表格的数据
            allPermission: [],
            listLoading: false, //数据加载等待动画
            dialogStatus: "create",
            dialogFormVisible: false,
            textMap: {
                update: "编辑操作",
                create: "新建操作"
            },
            tempOperate: {
                id: "",
                code: "",
                name: "",
                deleted:0
            },
            adminName: "管理员"
        };
    },
    created() {
        this.getList();
    },
    methods: {
        getList() {
            //查询列表
            this.listLoading = true;
            this.api({
                url: "/user/list_operate",
                method: "get"
            }).then(data => {
                this.listLoading = false;
                this.list = data.list;
            });
        },
        getIndex($index) {
            //表格序号
            return $index + 1;
        },
        showCreate() {
            //显示新增对话框
            this.tempOperate.code = "";
            this.tempOperate.name = "";
            this.dialogStatus = "create";
            this.dialogFormVisible = true;
        },
        showUpdate($index) {
            let operate = this.list[$index];
            this.tempOperate.code = operate.code;
            this.tempOperate.name = operate.name;
            this.tempOperate.id = operate.id;
            this.dialogStatus = "update";
            this.dialogFormVisible = true;
        },
        createMenu() {
            if (!this.checkMenuNameUnique()) {
                return;
            }
            //添加新角色
            this.api({
                url: "/user/add_operate",
                method: "post",
                data: this.tempOperate
            }).then(() => {
                this.getList();
                this.dialogFormVisible = false;
            });
        },
        updateMenu() {
            //修改角色
            this.tempOperate.deleted = "0";
            this.api({
                url: "/user/update_operate",
                method: "post",
                data: this.tempOperate
            }).then(() => {
                this.getList();
                this.dialogFormVisible = false;
            });
        },
        checkMenuNameUnique() {
            let result = true;
            //校验名称重复
            let code = this.tempOperate.code;
            if (!code) {
                this.$message.error("请填写操作代码!");
                return false;
            }
            let name = this.tempOperate.name;
            if (!name) {
                this.$message.error("请填写操作名称!");
                return false;
            }
            
            return result;
        },
        removeMenu($index) {
            let _vue = this;
            this.$confirm("确定删除此资源?", "提示", {
                confirmButtonText: "确定",
                showCancelButton: false,
                type: "warning"
            }).then(() => {
                let operate = _vue.list[$index];
                operate.deleted = "1";
                _vue.api({
                    url: "/user/update_operate",
                    method: "post",
                    data: operate
                })
                    .then(() => {
                        _vue.getList();
                    })
                    .catch(() => {
                        _vue.$message.error("删除失败");
                    });
            });
        },
        addUnique(val, arr) {
            //数组内防重复地添加元素
            let _index = arr.indexOf(val);
            if (_index < 0) {
                arr.push(val);
            }
        },
        checkRequired(_perm, _index) {
            //本方法会在勾选状态改变之后触发
            let permId = _perm.id;
            if (this.tempOperate.permissions.indexOf(permId) > -1) {
                //选中事件
                //如果之前未勾选本权限,现在勾选完之后,tempOperate里就会包含本id
                //那么就要将必选的权限勾上
                this.makeReuqiredPermissionChecked(_index);
            } else {
                //取消选中事件
                if (_perm.requiredPerm === 1) {
                    //如果是必勾权限,就把本菜单的权限全部移出
                    //(其实也可以提示用户本权限是菜单里的必选,请先取消勾选另外几个权限,交互太麻烦,此处就直接全部取消选中了)
                    this.noPerm(_index);
                }
            }
        },
        makeReuqiredPermissionChecked(_index) {
            //将本菜单必选的权限勾上
            let menu = this.allPermission[_index].permissions;
            for (let j = 0; j < menu.length; j++) {
                let perm = menu[j];
                if (perm.requiredPerm === 1) {
                    //找到本菜单的必选权限,将其勾上
                    this.addUnique(perm.id, this.tempOperate.permissions);
                }
            }
        }
    }
};
</script>
<style scoped>
.requiredPerm {
    color: #ff0e13;
}
</style>
