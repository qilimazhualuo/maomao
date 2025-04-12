<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useTokenStore } from '../store.js'
import { getCollectionList } from '../api.js'
import { message } from 'ant-design-vue'
import Image from './Image.vue'
import Video from './video.vue'

const loading = ref(false)
const page = ref(1)
const pageSize = ref(40)
const dataSource = ref([])
const total = computed(() => {
    const item = useTokenStore().collection.find(item => item.id === useTokenStore().curCollect)
    if (!item) {
        return 0
    }
    return item.media_count
})

const search = () => {
    if (!useTokenStore().curCollect) {
        return message.error('请选择收藏夹')
    }
    loading.value = true
    getCollectionList({
        pn: page.value,
        ps: pageSize.value,
        media_id: useTokenStore().curCollect
    }).then((res) => {
        const { code, data } = res
        if (code !== 0) {
            return message.error(res.message)
        }
        dataSource.value = data.medias || []
    }).finally(() => {
        loading.value = false
    })
}

const pageChange = (pageTemp, pageSizeTemp) => {
    page.value = pageTemp
    pageSize.value = pageSizeTemp
    search()
}

const reset = () => {
    page.value = 1
    dataSource.value = []
    search()
}

watch(() => useTokenStore().curCollect, reset)

onMounted(() => {
    search()
})

// 视频
const videoInfo = ref(null)
const openVideo = (item) => {
    videoInfo.value = item
}

</script>

<template>
    <div class="bilili-content" >
        <a-list
            item-layout="horizontal"
            :dataSource="dataSource"
            class="bilili-content-list"
        >
            <template #renderItem="{ item }">
                <a-list-item @click.stop="openVideo(item)">
                    <a-list-item-meta :description="item.intro">
                        <template #title>
                            <span>{{ item.title }}</span>
                        </template>
                        <template #avatar>
                            <Image :src="item.cover" width="64px" />
                        </template>
                    </a-list-item-meta>
                </a-list-item>
            </template>
        </a-list>
        <a-pagination
            v-model:current="page"
            :total="total"
            :pageSize="pageSize"
            show-less-items
            @change="pageChange"
            class="bilili-content-pagination"
        />
    </div>
    <Video v-model:info="videoInfo" />
</template>

<style lang="less" scoped>
.bilili-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 4px;
    .bilili-content-list {
        height: 2px;
        flex: 1 1 auto;
        overflow: auto;
        margin-bottom: 4px;
    }
}
</style>