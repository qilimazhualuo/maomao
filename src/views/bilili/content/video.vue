<script setup>
import { watch } from 'vue'
import { getVideoInfo, getVideoBaseInfo } from '../api.js'

const props = defineProps({
    info: {
        type: [Object, null],
    }
})

const emit = defineEmits(['update:info'])

const close = () => {
    emit('update:info', null)
}

watch(() => props.info, (val) => {
    if (!val) {
        return
    }
    const { bvid } = val
    getVideoInfo(val).then((res) => {
        console.log(res)
        getVideoBaseInfo({ bvid, vd_source: res.data.vd_source }).then((res) => {
            console.log(res)
        })
    })
})

</script>

<template>
    <a-modal
        title="视频播放"
        :open="!!info"
        centered
        @cancel="close"
        :footer="null"
        wrap-class-name="full-modal"
    >
        <!-- iframe也是一个好方案啊 -->
        <!-- <iframe
            v-if="id"
            ref="iframeRef"
            :src="`//player.bilibili.com/player.html?bvid=${id}&high_quality=1&danmaku=0&loop=1`"
            :src1="`//bilibili.com/blackboard/html5mobileplayer.html?bvid=${id}&cid=${id}&autoplay=1&p=1&share_source=copy_web`"
            allowfullscreen="allowfullscreen"
            width="100%"
            height="100%"
            scrolling="no"
            frameborder="0"
            sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts"
        ></iframe> -->
    </a-modal>
</template>

<style lang="less"></style>
