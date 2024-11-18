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
            path: '/about',
            name: 'about',
            component: () => import('../views/about/index.vue'),
        },
    ],
})

export default router
