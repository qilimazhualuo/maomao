import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/mao',
            name: 'mao',
            component: () => import('@/views/Mao/index.vue'),
        },
        {
            path: '/coors',
            name: 'coors',
            component: () => import('@/views/coors/index.vue'),
        },
        {
            path: '/map3d',
            name: 'map3d',
            component: () => import('../views/map3d/index.vue'),
        },
        {
            path: '/doc',
            name: 'doc',
            component: () => import('../views/doc/index.vue'),
        },
    ],
})

export default router
