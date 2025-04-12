<script setup>
import { ref, watch } from 'vue'
import { getBiliImage } from '../api.js'

const props = defineProps({
    src: {
        type: String,
        default: ''
    },
    alt: {
        type: String,
        default: ''
    },
    width: {
        type: String,
        default: ''
    },
    height: {
        type: String,
        default: ''
    }
})

const imgBase64 = ref('')

const getImage = () => {
    if (!props.src) {
        return
    }
    getBiliImage(props.src).then(res => {
        const { contentType, data } = res
        imgBase64.value = `data:${contentType};base64,${data}`
    })
}

getImage()

watch(() => props.src, getImage)

</script>

<template>
    <img :src="imgBase64" :alt="alt" :width="width" :height="height">
</template>

<style lang="less">

</style>