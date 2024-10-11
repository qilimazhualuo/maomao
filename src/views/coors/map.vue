<script setup>
defineProps({
    value: {
        type: Array,
        default: () => ([])
    }
})
</script>

<template>
{{ value }}
</template>

<style lang="less">

</style>