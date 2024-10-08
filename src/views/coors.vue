<script setup>
import { ref } from 'vue'

const pre = ref('')
const next = ref('')

const convert = () => {
  const preArr = JSON.parse(`[${pre.value}]`)
  const nextArr = []
  preArr.forEach((item) => {
    nextArr.push(JSON.stringify(item))
  })
  next.value = nextArr.join('\n')
}
const convert1 = () => {
  const preArr = JSON.parse(pre.value)
  const nextArr = []
  preArr.forEach((item) => {
    nextArr.push(JSON.stringify(item))
  })
  next.value = nextArr.join('\n')
}
</script>

<template>
  <a-space class="px-2 w-100" direction="vertical">
    <a-textarea
      v-model:value="pre"
      placeholder="请输入"
      allowClear
      :auto-size="{ minRows: 3, maxRows: 15 }"
    ></a-textarea>
    <a-space>
      <a-button type="primary" @click.stop="convert()">转化</a-button>
      <a-button type="primary" @click.stop="convert1()">转化三个[]</a-button>
    </a-space>
    <a-textarea :value="next" :auto-size="{ minRows: 3, maxRows: 15 }"></a-textarea>
  </a-space>
</template>

<style lang="less"></style>
