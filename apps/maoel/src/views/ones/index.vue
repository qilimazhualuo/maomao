<script setup lang="jsx">
import { ref, getCurrentInstance } from 'vue'
import { JSEncrypt } from 'jsencrypt'

const data = ref({
    email: '',
    password: '',
    time: [],
    result: '',
})

const rules = {
    email: [{ required: true, message: 'email必填!' }],
    password: [{ required: true, message: 'password必填!' }],
    time: [{ required: true, message: '时间必填!' }],
}

const name = ref('')
const submit = (val) => {
    console.log(val)
    console.log(window.ipcRenderer.service)
    window.ipcRenderer.service({
        url: 'https://ones.cn/identity/api/encryption_cert',
        method: 'post',
    }).then((res) => {
        console.log(res)
    }).catch((err) => {
        console.log(err)
    })
    // 调用electron方法

    // request({
    //     url: 'http://ones.cn/identity/api/encryption_cert',
    //     method: 'post',
    // }).then((res) => {
    //     console.log(res)
    // }).catch((err) => {
    //     console.log(err)
    // })
    // service({
    //     url: '/project/api/project/team/JJe6dBze/resource_management/member_schedule_detail',
    //     method: 'post',
    //     data: {
    //         config: {
    //             type: 'member_assess_manhour_desc',
    //             dimensions: [
    //                 {
    //                     field: 'root',
    //                     order_by: {
    //                         name_pinyin: 'asc',
    //                     },
    //                 },
    //             ],
    //             condition: {
    //                 condition_groups: [
    //                     [
    //                         {
    //                             field_uuid: 'user',
    //                             operate: {
    //                                 operate_id: 'include',
    //                                 predicate: 'in',
    //                                 negative: false,
    //                                 label: 'filter.addQueryContent.include',
    //                                 filter_query: 'in',
    //                             },
    //                             value: ['$currentUser'],
    //                         },
    //                     ],
    //                 ],
    //             },
    //             display: ['remain_available_hours'],
    //             based_on: 'members_schedule_view',
    //             range: { from: val.time[0].format('YYYY-MM-dd'), to: val.time[1].format('YYYY-MM-dd') },
    //             group: '',
    //             extension: {},
    //             task_condition: {
    //                 condition_groups: [
    //                     [
    //                         {
    //                             field_uuid: 'field006',
    //                             operate: {
    //                                 operate_id: 'include',
    //                                 predicate: 'in',
    //                                 negative: false,
    //                                 label: 'filter.addQueryContent.include',
    //                                 filter_query: 'in',
    //                             },
    //                             value: null,
    //                         },
    //                         {
    //                             field_uuid: 'field011',
    //                             operate: {
    //                                 operate_id: 'include',
    //                                 predicate: 'in',
    //                                 negative: false,
    //                                 label: 'filter.addQueryContent.include',
    //                                 filter_query: 'in',
    //                             },
    //                             value: null,
    //                         },
    //                     ],
    //                 ],
    //             },
    //         },
    //         taskFilterGQLConditions: [],
    //         // users: ['SUL2zV8u'],
    //         users: ['WKxm3PT2'],
    //     },
    //     headers: {
    //         Authorization: val.token,
    //     }
    // }).then((res) => {
    //     const { user, gantt } = res.data.buckets[0]
    //     name.value = user.name
    //     const items = []
    //     gantt.forEach((cur) => {
    //         const { name, project } = cur
    //         const item = items.find((item) => item.name === project.name)
    //         if (item) {
    //             item.content.push(name)
    //             item.hour += cur.manhour.hours / 100000
    //         } else {
    //             items.push({
    //                 name: project.name,
    //                 content: [name],
    //                 hour: cur.manhour.hours / 100000
    //             })
    //         }
    //     })
    //     dataSource.value = items
    // })
}

// 表格
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
            <a-typography-title>生成月报内容</a-typography-title>
            <a-typography-title v-if="name">您的名字：{{ name }}</a-typography-title>
        </a-typography>
        <a-form :model="data" :rules="rules" @finish="submit">
            <a-form-item name="email" label="ones Email">
                <a-input v-model:value="data.email" placeholder="请输入Email"></a-input>
            </a-form-item>
            <a-form-item name="password" label="ones password">
                <a-input v-model:value="data.password" placeholder="请输入password"></a-input>
            </a-form-item>
            <a-form-item name="time" label="时间">
                <a-range-picker v-model:value="data.time"/>
            </a-form-item>
            <!-- <a-form-item name="cookie" label="onesCookie">
                <a-input v-model:value="data.cookie" placeholder="请输入cookie"></a-input>
            </a-form-item> -->
            <a-form-item>
                <a-button type="primary" html-type="submit">确认</a-button>
            </a-form-item>
        </a-form>
        <a-table
            :columns="columns"
            :data-source="dataSource"
        />
    </div>
</template>

<style lang="less">
.ones {
    padding: 4px;
}
</style>
