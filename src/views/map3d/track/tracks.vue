<script setup lang="jsx">
const props = defineProps({
    mapObj: {
        type: Object,
        default: () => ({})
    },
    dataSource: {
        type: Array,
        default: () => []
    },
    setEditData: {
        type: Function,
        default: () => {}
    }
})

const emit = defineEmits(['update:dataSource'])

const columns = [
    {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        align: 'center',
        width: 80,
        customRender: ({ text, record, index, column }) => {
            return text + (index + 1)
        }
    },
    {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        align: 'center',
        width: 160,
        customRender: ({ text, record }) => {
            return (
                <>
                    <a-button style="margin-right: 12px;" size="small"
                        onClick={() => {
                            props.setEditData(record)
                            emit(
                                'update:dataSource',
                                props.dataSource.filter((item) => item.id !== text)
                            )
                        }}
                    >
                        编辑
                    </a-button>
                    <a-button size="small"
                        onClick={() => {
                            emit(
                                'update:dataSource',
                                props.dataSource.filter((item) => item.id !== text)
                            )
                        }}
                    >
                        删除
                    </a-button>
                </>
            )
        }
    }
]
</script>

<template>
    <a-table :columns="columns" :dataSource="dataSource" :pagination="false" :scroll="{ y: 152 }" size="small" />
</template>