<script setup>
import { onMounted, onUnmounted, ref, getCurrentInstance } from 'vue'
import { RouterLink } from 'vue-router'

const { proxy } = getCurrentInstance()

const open = ref(false)

const showModal = (e) => {
    if (e.key === "Escape" && !open.value) {
        open.value = true;
    }
}

const loading = ref(false)
const goMenu = (route) => {
    loading.value = true
    proxy.$router
        .push(route.path)
        .then(() => {
            open.value = false
        })
        .finally(() => {
            loading.value = false
        })
}

onMounted(() => {
    document.addEventListener('keydown', showModal);
})

onUnmounted(() => {
    document.removeEventListener('keydown', showModal);
})
</script>

<template>
    <a-modal title="菜单" :open="open" centered @cancel="open = false">
        <a-spin :spinning="loading">
            <a-space direction="vertical" >
                <a-button
                    v-for="route in $router.getRoutes().filter(i => !i.meta.hidden)"
                    :key="route.path"
                    @click.stop="goMenu(route)"
                    type="link"
                >
                    {{route.meta.title }}
                </a-button>
            </a-space>
        </a-spin>
        <template #footer>
            <a-button @click.stop="open = false">关闭</a-button>
        </template>
    </a-modal>
</template>

<style lang="less"></style>
