<script setup>
import { ref } from 'vue'
import Menu from '@/components/menu.vue'
import { guid } from '@/common/tool'

const titles = ref([
    {
        id: guid(),
        tabs: 2,
        fontSize: 16,
        color: '#000000',
        fontWeight: 500
    }
])
</script>

<template>
    <a-tabs class="doc-content">
        <a-tab-pane key="1" tab="文档">组件</a-tab-pane>
        <a-tab-pane key="2" tab="设置">
            <a-typography>
                <a-typography-title>标题设置</a-typography-title>
                <a-typography-paragraph>
                    <a-form>
                        <div v-for="(item, idx) in titles" :key="item.id" class="form-item">
                            <a-typography-title :level="2">{{ `标题 ${idx + 1}` }}</a-typography-title>
                            <a-form-item label="缩进">
                                <a-slider v-model:value="item.tabs" :min="0" :max="10"/>
                            </a-form-item>
                            <a-form-item label="字体大小">
                                <a-slider v-model:value="item.fontSize" :min="12" :max="36"/>
                            </a-form-item>
                            <a-form-item label="字体大小">
                                <input type="color" v-model="item.color"/>
                            </a-form-item>
                            <a-form-item label="字体粗细">
                                <a-slider v-model:value="item.fontWeight" :min="100" :max="900" :step="100"/>
                            </a-form-item>
                        </div>
                    </a-form>
                </a-typography-paragraph>
                <a-typography-paragraph>
                    <a-button type="primary" @click="titles.push({ id: guid(), tabs: 2, fontSize: 16, color: '#000000', fontWeight: 500 })">添加标题</a-button>
                </a-typography-paragraph>
            </a-typography>
        </a-tab-pane>
    </a-tabs>
    <Menu />
</template>

<style lang="less">
.doc-content {
    width: 100%;
    height: 100%;
    padding: 8px;
}
</style>
