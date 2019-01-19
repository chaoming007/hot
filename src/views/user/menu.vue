<template>
    <div class="app-container">
        <div class="filter-container">
            <el-form>
                <el-form-item>
                    <el-button type="success" icon="plus" @click="showCreate">添加资源
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
            <el-table-column align="center" label="资源名称" prop="menuName"></el-table-column>

            <el-table-column align="center" label="管理" width="220"  v-if="hasPerm('menu:update')||hasPerm('menu:delete')" >
                <template slot-scope="scope">
                    <el-button type="primary" icon="edit"   :disabled="scope.row.deletable==0" v-if="hasPerm('menu:update')" @click="showUpdate(scope.$index)">修改
                    </el-button>
                    <el-button type="danger" icon="delete"   :disabled="scope.row.deletable==0" v-if="hasPerm('menu:delete')" @click="removeMenu(scope.$index)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
            <el-form class="small-space" :model="tempMenu" label-position="left" label-width="100px" style='width:600px; margin-left:50px;'>
                <el-form-item label="资源代码" required>
                    <el-input type="text" v-model="tempMenu.menuCode" :disabled="dialogStatus=='update'" style="width: 250px;">
                    </el-input>
                </el-form-item>
                <el-form-item label="资源名称" required>
                    <el-input type="text" v-model="tempMenu.menuName" style="width: 250px;">
                    </el-input>
                </el-form-item>
                <el-form-item label="操作功能" required>
                    <el-checkbox-group v-model="tempMenu.permissionNames">
                        <el-checkbox v-for="perm in permissions" :label="perm.name" :key="perm.code" :disabled="perm.name=='列表'">
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <!-- <el-form-item>
             <el-button>自定义操作</el-button>
        </el-form-item> -->
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
                update: "编辑资源",
                create: "新建资源"
            },
            tempMenu: {
                menuCode: "",
                menuName: "",
                permissionNames: ["列表"]
            },
            permissions: [],
            adminName: "管理员"
        };
    },
    created() {
        this.getList();
        this.getOperateList();
    },
    methods: {
        getList() {
            //查询列表
            this.listLoading = true;
            this.api({
                url: "/user/list_all_permission",
                method: "post",
                data:{

                }
            }).then(data => {
                this.listLoading = false;
                this.list = data.list;
            });
        },
        getOperateList() {
            //查询列表
            this.listLoading = true;
            this.api({
                url: "/user/list_all_operate",
                method: "get"
            }).then(data => {
                this.permissions = data;
            });
        },
        getIndex($index) {
            //表格序号
            return $index + 1;
        },
        showCreate() {
            //显示新增对话框
            this.tempMenu.menuName = "";
            this.tempMenu.menuCode = "";
            this.dialogStatus = "create";
            this.tempMenu.permissionNames = ["列表"];
            this.dialogFormVisible = true;
        },
        showUpdate($index) {
            let menu = this.list[$index];
            this.tempMenu.menuName = menu.menuName;
            this.tempMenu.menuCode = menu.menuCode;
            this.tempMenu.id = menu.id;
            this.tempMenu.permissionNames = menu.permissionNames;

            this.dialogStatus = "update";
            this.dialogFormVisible = true;
        },
        createMenu() {
            if (!this.checkMenuNameUnique()) {
                return;
            }
            //添加新角色
            this.api({
                url: "/user/add_menu",
                method: "post",
                data: this.tempMenu
            }).then(() => {
                this.getList();
                this.dialogFormVisible = false;
            });
        },
        updateMenu() {
            //修改角色
            this.tempMenu.deleted = "0";
            this.api({
                url: "/user/update_menu",
                method: "post",
                data: this.tempMenu
            }).then(() => {
                this.getList();
                this.dialogFormVisible = false;
            });
        },
        checkMenuNameUnique() {
            let result = true;
            //校验名称重复
            let menuCode = this.tempMenu.menuCode;
            if (!menuCode) {
                this.$message.error("请填写资源代码!");
                return false;
            }
            let menuName = this.tempMenu.menuName;
            if (!menuName) {
                this.$message.error("请填写资源名称!");
                return false;
            }
            let permissionNames = this.tempMenu.permissionNames;
            if (!permissionNames || permissionNames.length == 0) {
                this.$message.error("请选择操作功能!");
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
                let menu = _vue.list[$index];
                menu.deleted = "1";
                this.tempMenu.id = menu.id;
                this.tempMenu.menuName = menu.menuName;
                this.tempMenu.menuCode = menu.menuCode;
                this.tempMenu.deleted = "1";
                _vue.api({
                    url: "/user/remove_menu",
                    method: "post",
                    data: this.tempMenu
                })
                    .then(() => {
                        _vue.getList();
                    })
                    .catch(() => {
                        _vue.$message.error("删除失败");
                    });
            });
        },
        isMenuNone(_index) {
            //判断本级菜单内的权限是否一个都没选
            let menu = this.allPermission[_index].permissions;
            let result = true;
            for (let j = 0; j < menu.length; j++) {
                if (this.tempMenu.permissions.indexOf(menu[j].id) > -1) {
                    result = false;
                    break;
                }
            }
            return result;
        },
        isMenuAll(_index) {
            //判断本级菜单内的权限是否全选了
            let menu = this.allPermission[_index].permissions;
            let result = true;
            for (let j = 0; j < menu.length; j++) {
                if (this.tempMenu.permissions.indexOf(menu[j].id) < 0) {
                    result = false;
                    break;
                }
            }
            return result;
        },
        checkAll(_index) {
            //点击菜单   相当于全选按钮
            let v = this;
            if (v.isMenuAll(_index)) {
                //如果已经全选了,则全部取消
                v.noPerm(_index);
            } else {
                //如果尚未全选,则全选
                v.allPerm(_index);
            }
        },
        allPerm(_index) {
            //全部选中
            let menu = this.allPermission[_index].permissions;
            for (let j = 0; j < menu.length; j++) {
                this.addUnique(menu[j].id, this.tempMenu.permissions);
            }
        },
        noPerm(_index) {
            //全部取消选中
            let menu = this.allPermission[_index].permissions;
            for (let j = 0; j < menu.length; j++) {
                let idIndex = this.tempMenu.permissions.indexOf(menu[j].id);
                if (idIndex > -1) {
                    this.tempMenu.permissions.splice(idIndex, 1);
                }
            }
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
            if (this.tempMenu.permissions.indexOf(permId) > -1) {
                //选中事件
                //如果之前未勾选本权限,现在勾选完之后,tempMenu里就会包含本id
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
                    this.addUnique(perm.id, this.tempMenu.permissions);
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
