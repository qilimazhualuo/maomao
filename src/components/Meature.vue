<script setup>
const props = defineProps({
    map: {
        type: Object,
        default: () => ({})
    }
})

/**
 * 绘制
 * @param {string} key 绘制类型 [Point, fixedCircle, Circle, Rect, LineString, Polygon]
 * @param {function} callback 回调
 */
const draw = ({ key }) => {
    if (key === 'clear') {
        props.map.clearMeature()
        return
    }
    props.map.draw(key)
}

const setDrawCallback = (callback) => {
    props.map.setMeatureCallBack(callback)
}

defineExpose({
    draw,
    setDrawCallback,
    clear: () => {
        props.map.clearMeature()
    }
})
</script>

<template>
    <a-dropdown arrow>
        <a-button class="meature" @click.prevent>
            绘制
        </a-button>
        <template #overlay>
            <a-menu @click="draw">
                <a-menu-item key="Point">
                    绘制点
                </a-menu-item>
                <a-menu-item key="fixedCircle">
                    绘制固定圆
                </a-menu-item>
                <a-menu-item key="Circle">
                    绘制圆
                </a-menu-item>
                <a-menu-item key="Rect">
                    绘制矩形
                </a-menu-item>
                <a-menu-item key="LineString">
                    绘制线
                </a-menu-item>
                <a-menu-item key="Polygon">
                    绘制面
                </a-menu-item>
                <a-menu-item key="clear">
                    清除绘制
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<style lang="less">
.meature {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 120;
}
</style>
