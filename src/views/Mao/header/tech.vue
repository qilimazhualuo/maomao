<script setup>
import { tech } from '@/config/mao_config'
import { ref, onMounted, onUnmounted } from 'vue'
import Tree from '@/components/Tree.vue'

const open = ref(false)

const hasStudy = ref([])

const study = (item, parent) => {
    console.log(item, parent)
}

const disabled = (item, parent) => {
    return false
}

const showModal = (e) => {
    if (e.key === 't' && !open.value) {
        open.value = !open.value
    }
}

onMounted(() => {
    document.addEventListener('keydown', showModal)
})

onUnmounted(() => {
    document.removeEventListener('keydown', showModal)
})

</script>

<template>
    <a-button size="small" type="dashed" @click.stop="open = true">{{ $t('mao.tech') }}</a-button>
    <a-modal v-model:open="open" title="科技树" :footer="false" centered>
        <Tree :data="tech" @click="study" :disabled="disabled" />
    </a-modal>
</template>

<style lang="less"></style>
