<script setup>
import { computed } from 'vue'
import { useResourceStore } from '@/stores/resource'

const resource = useResourceStore()

const props = defineProps({
    class: {
        type: String,
        default: ''
    }
})

const className = computed(() => `header ${props.class}`)

</script>

<template>
    <div :class="className">
        
    </div>
</template>

<style lang="less" scoped>
.content {
    padding: 1rem 2px;
}
</style>