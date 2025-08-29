<script setup>
import { ref, computed, watch, watchEffect, getCurrentInstance } from 'vue'
import { useDraggable } from '@vueuse/core'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: '标题'
    }
})

const { proxy } = getCurrentInstance()

const open = ref(props.visible)
watch(
    () => props.visible,
    (val) => {
        open.value = val
    }
)

const modalTitleRef = ref(null)

const { x, y, isDragging } = useDraggable(modalTitleRef)

const startX = ref(0)
const startY = ref(0)
const startedDrag = ref(false)
const transformX = ref(0)
const transformY = ref(0)
const preTransformX = ref(0)
const preTransformY = ref(0)
const dragRect = ref({ left: 0, right: 0, top: 0, bottom: 0 })
watch([x, y], () => {
    if (!startedDrag.value) {
        startX.value = x.value
        startY.value = y.value
        const bodyRect = document.body.getBoundingClientRect()
        const titleRect = modalTitleRef.value.getBoundingClientRect()
        dragRect.value.right = bodyRect.width - titleRect.width
        dragRect.value.bottom = bodyRect.height - titleRect.height
        preTransformX.value = transformX.value
        preTransformY.value = transformY.value
    }
    startedDrag.value = true
})
watch(isDragging, () => {
    if (!isDragging) {
        startedDrag.value = false
    }
})

watchEffect(() => {
    if (startedDrag.value) {
        transformX.value =
            preTransformX.value + Math.min(Math.max(dragRect.value.left, x.value), dragRect.value.right) - startX.value
        transformY.value =
            preTransformY.value + Math.min(Math.max(dragRect.value.top, y.value), dragRect.value.bottom) - startY.value
    }
})
const transformStyle = computed(() => {
    return {
        transform: `translate(${transformX.value}px, ${transformY.value}px)`
    }
})

const slots = computed(() => {
    const temp = {}
    for (const key in proxy.$slots) {
        if (key !== 'title') {
            temp[key] = proxy.$slots[key]
        }
    }
    return temp
})
</script>

<template>
    <a-modal
        ref="modalRef"
        :open="open"
        :wrap-style="{ overflow: 'hidden' }"
        v-on="{ ...$emit }"
        v-bind="{ ...$attrs }"
    >
        <template #title>
            <div ref="modalTitleRef" style="width: 100%; cursor: move">
                <slot name="title">{{ title }}</slot>
            </div>
        </template>
        <template #modalRender="{ originVNode }">
            <div :style="transformStyle" class="moveModal">
                <component :is="originVNode" />
            </div>
        </template>
        <template v-for="(item, key, index) in slots" :key="index" v-slot:[key] >
            <slot :name="key" v-if="key !== 'title'"></slot>
        </template>
    </a-modal>
</template>

<style lang="less">
.ant-modal-wrap {
    pointer-events: none;
}
</style>