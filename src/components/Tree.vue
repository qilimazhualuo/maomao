<script setup>
import { defineComponent } from 'vue'

defineComponent({
  name: 'Tree',
})

defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  parent: {
    required: false,
  },
  disabled: {
    type: Function,
    default: () => false,
  },
  buttonProps: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['click'])

const clickThis = (item, parent) => {
  emit('click', item, parent)
}
</script>

<template>
  <div class="tree mb-1" v-for="item in data" :key="item.id">
    <a-button
      class="tree-block me-3"
      :disabled="disabled(item, parent)"
      @click.stop="clickThis(item, parent)"
      v-bind="{ ...buttonProps }"
    >{{ item.name }}</a-button>
    <div class="children">
      <Tree :data="item.children" :parent="item" @click="clickThis" :disabled="disabled" :buttonProps="buttonProps" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.tree {
  display: flex;
  .tree-block {
    min-width: 100px;
    min-height: 40px;
    height: 100%;
  }
}
</style>
