<script setup lang="jsx">
import { ref, getCurrentInstance } from 'vue'
import { doPromise } from '@/common/tool'
import { request } from '@/common/request'
import uuidPromit from './img/uuid.png'
import tokenPromit from './img/token.png'

// 表格
const searchData = ref({
    uuid: '',
    token: '',
    time: []
})

const searchRules = {
    uuid: [{ required: true, message: 'uuid必填!' }],
    token: [{ required: true, message: 'token必填!' }],
    time: [{ required: true, message: '时间必填!' }],
}
const getData = (val) => {
    // 调用electron方法
    const data = {
        config: {
            type: 'member_assess_manhour_desc',
            dimensions: [
                {
                    field: 'root',
                    order_by: {
                        name_pinyin: 'asc',
                    },
                },
            ],
            condition: {
                condition_groups: [
                    [
                        {
                            field_uuid: 'user',
                            operate: {
                                operate_id: 'include',
                                predicate: 'in',
                                negative: false,
                                label: 'filter.addQueryContent.include',
                                filter_query: 'in',
                            },
                            value: ['$currentUser'],
                        },
                    ],
                ],
            },
            display: ['remain_available_hours'],
            based_on: 'members_schedule_view',
            range: { from: val.time[0].format('YYYY-MM-DD'), to: val.time[1].format('YYYY-MM-DD') },
            group: '',
            extension: {},
            task_condition: {
                condition_groups: [
                    [
                        {
                            field_uuid: 'field006',
                            operate: {
                                operate_id: 'include',
                                predicate: 'in',
                                negative: false,
                                label: 'filter.addQueryContent.include',
                                filter_query: 'in',
                            },
                            value: null,
                        },
                        {
                            field_uuid: 'field011',
                            operate: {
                                operate_id: 'include',
                                predicate: 'in',
                                negative: false,
                                label: 'filter.addQueryContent.include',
                                filter_query: 'in',
                            },
                            value: null,
                        },
                    ],
                ],
            },
        },
        taskFilterGQLConditions: [],
        users: [val.uuid],
    }
    request({
        url: 'https://sz.ones.cn/project/api/project/team/JJe6dBze/resource_management/member_schedule_detail',
        method: 'post',
        data,
        headers: {
            Authorization: val.token,
        }
    }).then((res) => {
        const { user, gantt } = res.data.buckets[0]
        const items = []
        gantt.forEach((cur) => {
            const { name, project } = cur
            const item = items.find((item) => item.name === project.name)
            if (item) {
                item.content.push(name)
                item.hour += cur.manhour.hours / 100000
            } else {
                items.push({
                    name: project.name,
                    content: [name],
                    hour: cur.manhour.hours / 100000
                })
            }
        })
        dataSource.value = items
    })
}
const dataSource = ref([])
const columns = [
    {
        title: '项目名称',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: '工作内容',
        dataIndex: 'content',
        key: 'content',
        customRender: ({ text }) => {
            return <div>
                {text.map((item, idx) => <div>
                    {idx + 1}. {item}
                </div>)}
            </div>
        }
    },
    {
        title: '项目时间',
        dataIndex: 'hour',
        key: 'hour',
        customRender: ({ text }) => {
            return text / 8
        }
    },
]

</script>

<template>
    <div class="ones">
        <a-typography>
            <a-typography-title >ones - 鼠标悬浮在label上可以看到提示</a-typography-title>
        </a-typography>
        <a-form :model="searchData" :rules="searchRules" @finish="getData">
            <a-form-item name="uuid">
                <template #label>
                    <a-tooltip placement="right">
                        <template #title>
                            <a-image
                                :width="200"
                                :src="uuidPromit"
                            />
                        </template>
                        ones uuid
                    </a-tooltip>
                </template>
                <a-input v-model:value="searchData.uuid" placeholder="请输入 uuid"></a-input>
            </a-form-item>
            <a-form-item name="token">
                <template #label>
                    <a-tooltip placement="right">
                        <template #title>
                            <a-image
                                :width="200"
                                :src="tokenPromit"
                            />
                        </template>
                        ones token
                    </a-tooltip>
                </template>
                <a-input v-model:value="searchData.token" placeholder="请输入 token"></a-input>
            </a-form-item>
            <a-form-item name="time" label="时间">
                <a-range-picker v-model:value="searchData.time" />
            </a-form-item>
            <a-form-item>
                <a-button type="primary" html-type="submit">获取数据</a-button>
            </a-form-item>
        </a-form>
        <a-table :columns="columns" :data-source="dataSource" />
    </div>
</template>

<style lang="less">
.ones {
    padding: 4px;
}
</style>
