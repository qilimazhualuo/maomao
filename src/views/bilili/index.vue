<script setup>
import Header from './header/index.vue'
import Content from './content/index.vue'
</script>

<template>
    <div class="bilili-container">
        <Header />
        <Content />
    </div>
</template>

<style lang="less">
.bilili-container {
    height: 100%;
    display: flex;
    flex-direction: column;

    .bilili-content {
        height: 2px;
        flex: 1 1 auto;
        box-shadow: rgba(0, 0, 0, 0.35) 0px 24px 36px -28px inset;
        overflow: hidden;
    }
}
</style>