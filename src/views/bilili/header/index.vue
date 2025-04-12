<script setup>
import Login from './login.vue'
import Nav from './nav.vue'
</script>

<template>
    <div class="header">
        <Nav />
        <Login />
    </div>
</template>

<style lang="less" scoped>
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
}
</style>