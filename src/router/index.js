import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            meta: { title: '首页' },
            component: HomeView,
        },
        {
            path: '/mao',
            name: 'mao',
            meta: { title: '猫猫游戏' },
            component: () => import('@/views/Mao/index.vue'),
        },
        {
            path: '/coors',
            name: 'coors',
            meta: { title: '坐标转换' },
            component: () => import('@/views/coors/index.vue'),
        },
        {
            path: '/map3d',
            name: 'map3d',
            meta: { title: '3d地图方法展示' },
            component: () => import('@/views/map3d/index.vue'),
        },
        {
            path: '/building',
            name: 'building',
            meta: { title: '3d地图方法展示-模型', hidden: true },
            component: () => import('@/views/building/index.vue'),
        },
        {
            path: '/doc',
            name: 'doc',
            meta: { title: '文档生成' },
            component: () => import('@/views/doc/index.vue'),
        },
        {
            path: '/docView',
            name: 'docView',
            meta: { title: '文档预览' },
            component: () => import('@/views/docView/index.vue'),
        },
        {
            path: '/ones',
            name: 'ones',
            meta: { title: 'one工作总结' },
            component: () => import('@/views/ones/index.vue'),
        },
        {
            path: '/bilili',
            name: 'bilili',
            meta: { title: 'b站视频' },
            component: () => import('@/views/bilili/index.vue'),
        },
        {
            path: '/sceneMake',
            name: 'sceneMake',
            meta: { title: '全景切图' },
            component: () => import('@/views/sceneMake/index.vue'),
        },
        {
            path: '/roadjianbo',
            name: 'roadjianbo',
            meta: { title: '建波的路' },
            component: () => import('@/views/jianboRoad/index.vue'),
        },
    ],
})

export default router
