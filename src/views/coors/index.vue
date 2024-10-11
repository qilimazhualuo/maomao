<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import Map from './map.vue'

const pre = ref('')
const next = ref([])

const convert = () => {
  const preArr = pre.value.split('\n')
  const nextArr = []
  preArr.forEach((item) => {
    if (!item) {
      return
    }
    const arr = item.split('\t')
    nextArr.push(arr)
  })
  next.value = nextArr
}
const convert1 = () => {
  const preArr = JSON.parse(pre.value)
  const nextArr = []
  preArr.forEach((item) => {
    nextArr.push(JSON.stringify(item))
  })
  next.value = nextArr
}

const copy = () => {
  if (!next.value.length) {
    message.error('没有值可以复制！')
    return
  }
  navigator.clipboard.writeText(JSON.stringify(next.value))
  message.success('已复制到剪切板！')
}
</script>

<template>
  <div class="coors">
    <a-space class="px-2 w-100" direction="vertical">
      <a-textarea
        v-model:value="pre"
        placeholder="请输入"
        allowClear
        :auto-size="{ minRows: 3, maxRows: 3 }"
      ></a-textarea>
      <a-space>
        <a-button type="primary" @click.stop="convert">转化</a-button>
        <a-button type="primary" @click.stop="convert1">转化三个[]</a-button>
        <a-button type="primary" @click.stop="copy">复制</a-button>
      </a-space>
    </a-space>
    <a-tabs class="coors-content px-2">
      <a-tab-pane key="1" tab="列表展示">
        <div class="w-100 h-100 p-2 border radius">
          <a-tag v-for="(item, idx) in next" :key="item" closable @close="close(idx)">{{ item }}</a-tag>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="地图展示">
        <Map v-model:value="next" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<style lang="less">
.coors {
  height: 100%;
  display: flex;
  flex-direction: column;
  .coors-content {
    height: 2px;
    flex: 1 1 auto;
    .ant-tabs-content {
      height: 100%;
      padding-bottom: 8px;
      .ant-tabs-tabpane {
        height: 100%;
      }
    }
  }
}
</style>
