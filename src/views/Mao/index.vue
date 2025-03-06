<script setup>
import Header from './header.vue'
import Content from './content.vue'
</script>

<template>
    <div class="mao-container">
        <Header class="mao-header" />
        <Content class="mao-content" />
    </div>
</template>

<style lang="less" scoped>
.mao-container {
    height: 100%;
    display: flex;
    flex-direction: column;

    .mao-content {
        height: 2px;
        flex: 1 1 auto;
        box-shadow: rgba(0, 0, 0, 0.35) 0px 24px 36px -28px inset;
        overflow: hidden;

        :deep(.ant-typography) {
            margin-bottom: 4px;
        }
    }
}
</style>
