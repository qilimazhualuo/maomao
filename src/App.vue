<script setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { RouterLink, RouterView } from 'vue-router'
import dayjs from 'dayjs'
import Menu from '@/components/menu.vue'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

</script>

<template>
    <a-config-provider :locale="{ locale: zhCN }">
        <div class="content">
            <RouterView />
        </div>
        <Menu />
    </a-config-provider>
</template>

<style scoped>
.content {
    height: 2px;
    flex: 1 1 auto;
}
</style>
