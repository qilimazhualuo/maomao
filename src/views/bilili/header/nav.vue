<script setup lang="jsx">
import { useTokenStore } from '../store.js'
import { computed } from 'vue'

const menuItems = computed(() => {
    return useTokenStore().collection.map((item) => {
        return {
            key: item.id,
            label: item.title,
        }
    })
})

const select = ({ key }) => {
    useTokenStore().setCurCollect(key)
}

</script>

<template>
    <a-menu
        :selectedKeys="[useTokenStore().curCollect]"
        mode="horizontal"
        :items="menuItems"
        @select="select"
    />
</template>

<style lang="less">

</style>