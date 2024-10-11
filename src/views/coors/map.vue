<script setup>
defineProps({
    value: {
        type: Array,
        default: () => ([])
    }
})
defineEmits(['update:value'])
</script>

<template>
    <div class="w-100 h-100 border radius">
        {{ value }}
    </div>
</template>

<style lang="less">

</style>