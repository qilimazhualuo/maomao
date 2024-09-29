<script setup>
import { computed } from 'vue'
import room from './content/room.vue'
import cropland from './content/cropland.vue'
import forest from './content/forest.vue'

const props = defineProps({
  class: {
    type: String,
    default: '',
  },
})

const className = computed(() => `header ${props.class}`)

</script>

<template>
  <div :class="className">
    <a-row :gutter="[8, 8]">
      <room />
      <cropland />
      <forest />
    </a-row>
  </div>
</template>

<style lang="less" scoped>
.header {
  padding: 0 calc(0.2rem + 8px);
}
</style>
