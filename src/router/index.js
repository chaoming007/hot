import Vue from 'vue'
import Router from 'vue-router'
// in development env not use Lazy Loading,because Lazy Loading too many pages will cause webpack hot update too slow.so only in production use Lazy Loading
/* layout */
import Layout from '../views/layout/Layout'
import empty from '../views/empty'



const _import = require('./_import_' + process.env.NODE_ENV)
console.log(process.env.NODE_ENV);

Vue.use(Router)
export const constantRouterMap = [
    { path: '/login', component: _import('login/index'), hidden: true },
    { path: '/404', component: _import('404'), hidden: true },
    // { path: '/portal', component:_import('systemPortal/portal'), hidden: true },
    {
        path: '/',
        component: Layout,
        hidden: true,
        children: [{
            path: 'dashboard',
            component: _import('dashboard/index')
        }]
    },

]
export default new Router({
    // mode: 'history', //后端支持可开
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRouterMap
})
export const asyncRouterMap = [{
        path: '/miniProg',
        component: Layout,
        name: '微信小程序',
        meta: { title: '微信小程序', icon: 'iconfont icon-weixin' },
        children: [{
                path: 'wxShopManage',
                component: empty,
                name: '步数商城',
                meta: { title: '步数商城', icon: 'iconfont icon-yundong' },
                children: [{
                        path: 'index',
                        name: '后台调控',
                        component: _import('wxShopManage/index'),
                        meta: { title: '后台调控', icon: 'iconfont icon-daotiaokongzhi' },
                        menu: 'index'
                    },
                    {
                        path: 'productList',
                        name: '商品列表',
                        component: _import('wxShopManage/productList'),
                        meta: { title: '商品列表', icon: 'iconfont icon-shangpin' },
                        menu: 'productList'
                    },
                    {
                        path: 'orderList',
                        name: '订单列表',
                        component: _import('wxShopManage/orderList'),
                        meta: { title: '订单列表', icon: 'iconfont icon-dingdanyichenggong' },
                        menu: 'orderList'
                    },
                    {
                        path: 'dataView',
                        name: '数据查看',
                        component: _import('wxShopManage/dataView'),
                        meta: { title: '数据查看', icon: 'iconfont icon-dingdanyichenggong' },
                        menu: 'dataView'
                    }

                ]
            },
            {
                path: 'templateManage',
                name: '模板与埋点',
                component: _import('templateManage/index'),
                meta: { title: '模板与埋点', icon: 'iconfont icon-mobanguanli' }
            },
            {
                path: 'msgPushManage',
                component: empty,
                name: '模板消息',
                meta: { title: '模板消息', icon: 'iconfont icon-xiaoxi' },
                children: [{
                        path: 'templateMsg',
                        name: '推送模板消息',
                        component: _import('msgPushManage/templateMsg/index'),
                        meta: { title: '推送模板消息', icon: 'iconfont icon-tuisong' }
                    },
                    {
                        path: 'pushLog',
                        name: '推送记录',
                        component: _import('msgPushManage/pushLog/index'),
                        meta: { title: '推送记录', icon: 'iconfont icon-3lishi' }
                    }
                ]
            }
        ]
    },
    {
        path: '/hotRestore',
        component: Layout,
        name:'App热修复',
        meta: { title: 'App热修复', icon: 'iconfont icon-app' },
        children: [{
                path: 'hotrestoreconfig',
                name: '热修复配置',
                component: _import('hotRestore/hotrestoreconfig'),
                meta: { title: '热修复配置', icon: 'iconfont icon-liebiao' },
                // menu: 'hotrestoreconfig'
            },
            {
                path: 'appDetail',
                name: '应用详情',
                hidden: true,
                component: _import('hotRestore/appDetail'),
                meta: { title: '应用详情', icon: 'iconfont icon-liebiao' }
            },
            {
                path: 'patch',
                name: '应用补丁',
                hidden: true,
                component: _import('hotRestore/patch'),
                meta: { title: '应用补丁', icon: 'iconfont icon-liebiao' }
            },
            {
                path: 'hotrestorechar',
                name: '热修复图表',
                hidden: true,
                component: _import('hotRestore/hotrestorechar'),
                meta: { title: '热修复图表', icon: 'iconfont icon-liebiao' }
            }
        ]
    },


    {
        path: '/configManage',
        component: Layout,
        name: '配置管理',
        meta: { title: '配置管理', icon: 'iconfont icon-tianchongxing-' },
        children: [{
                path: 'material',
                component: empty,
                name: '素材管理',
                meta: { title: '素材管理', icon: 'iconfont icon-duosucai' },
                children: [{
                    path: 'materialList',
                    name: '素材列表',
                    component: _import('materialManage/configManage/materialList'),
                    meta: { title: '素材列表', icon: 'iconfont icon-material' }
                }],
                menu: "material"
            },
            {
                path: 'templateManage',
                name: '模板管理',
                component: empty,
                meta: { title: '模板管理', icon: 'iconfont icon-ic_temp' },
                children: [{
                    path: 'template',
                    name: '模板管理子级',
                    component: _import('materialManage/templateManage/template'),
                    meta: { title: '模板管理', icon: 'iconfont icon-yidongyunkongzhitaiicon43' }
                }],
                menu: "templateManage"
            },
            {
                path: 'businessThread',
                component: empty,
                name: '业务线管理',
                meta: { title: '业务线管理', icon: 'iconfont icon-yewu-tianchong' },
                children: [{
                    path: 'businessThreadSub',
                    name: '业务线管理子级',
                    component: _import('materialManage/businessThread/index'),
                    meta: { title: '业务线管理', icon: 'iconfont icon-yewuliebiao' }
                }],
                menu: "businessThread"
            }
        ]
    },
    {
        path: '/version',
        component: Layout,
        redirect: '/version/application',
        meta: { title: '应用管理', icon: 'iconfont icon-app' },
        children: [{
                path: 'application',
                name: '应用列表',
                component: _import('application/application'),
                meta: { title: '应用列表', icon: 'iconfont icon-liebiao' },
                menu: 'application'
            },
            {
                path: 'version',
                name: '应用发布',
                component: _import('application/version'),
                meta: { title: '应用发布', icon: 'iconfont icon-yingyongguanli' },
                menu: 'version'
            }
        ]
    },
    {
        path: '/patch',
        component: Layout,
        redirect: '/patch/patch',
        meta: { title: '补丁管理', icon: 'iconfont icon-xitong' },
        children: [{
            path: 'patch',
            name: '补丁发布',
            component: _import('patchmanage/patch'),
            meta: { title: '补丁发布', icon: 'iconfont icon-erji-anquanbuding' },
            menu: 'patch'
        }]
    },
    {
        path: '/user',
        component: Layout,
        redirect: '/user/',
        name: '',
        meta: { title: '权限管理', icon: 'iconfont icon-quanxianguanli' },
        children: [{
                path: '',
                name: '用户列表',
                component: _import('user/user'),
                meta: { title: '分配用户', icon: 'iconfont icon-yonghuguanli' },
                menu: 'user'
            },
            {
                path: 'role',
                name: '权限管理',
                component: _import('user/role'),
                meta: { title: '角色管理', icon: 'iconfont icon-jiaoseguanli' },
                menu: 'role'
            },
            {
                path: 'menu',
                name: '资源管理',
                component: _import('user/menu'),
                meta: { title: '资源管理', icon: 'iconfont icon-ziyuanjk' },
                menu: 'menu'
            },
            {
                path: 'operate',
                name: '自定义操作管理',
                component: _import('user/operate'),
                meta: { title: '自定义操作管理', icon: 'iconfont icon-caozuo' },
                menu: 'operate'
            }
        ]
    },
    {
        path: '/setting',
        component: Layout,
        redirect: '/setting/modifyuser',
        meta: { title: '系统设置', icon: 'iconfont icon-xitong1' },
        children: [{
            path: 'operationlog',
            name: '操作日志',
            component: _import('setting/operationlog'),
            meta: { title: '操作日志', icon: 'iconfont icon-log' },
            menu: 'operationlog'
        }]
    },
    { path: '*', redirect: '/404', hidden: true }
]