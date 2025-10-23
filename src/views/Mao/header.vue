<script setup>
import { computed, ref } from 'vue'
import Tech from './header/tech.vue'
import Resource from './header/resource/index.vue'

import { useResourceStore } from '@/stores/resource'

const resource = useResourceStore()

const props = defineProps({
    class: {
        type: String,
        default: '',
    },
})

const className = computed(() => `header ${props.class}`)

const happy = ref(92)

const happyColor = computed(() => {
    const red = 255 - 5.1 * happy.value
    const green = 5.1 * happy.value - 255
    const blue = -0.102 * Math.pow(happy.value, 2)
    return `rgb(${red < 0 ? 0 : red}, ${green < 0 ? 0 : green}, ${blue < 0 ? 0 : blue})`
})
</script>

<template>
    <div :class="className">
        <div class="status">
            <a-menu mode="horizontal" size="small" :selectable="false">
                <a-menu-item>
                    <span class="label">{{ $t('mao.happy') }}</span>
                    <a-tag :color="happyColor">{{ happy }}%</a-tag>
                </a-menu-item>
            </a-menu>
        </div>
        <a-space class="opearte">
            <a-button size="small" type="dashed">{{ $t('mao.automation') }}</a-button>
            <a-button size="small" type="dashed">{{ $t('mao.priority') }}</a-button>
            <Tech />
            <Resource />
            <a-button size="small" type="dashed">{{ $t('mao.save') }}</a-button>
        </a-space>
    </div>
</template>

<style lang="less" scoped>
.header {
    display: flex;
    justify-content: space-between;
    padding: 8px;
    background-color: rgba(255, 255, 255, 0.5);

    .status {
        width: 2px;
        flex: 1 1 auto;

        .ant-menu {
            border-bottom: none;
            background-color: transparent;

            :deep(.ant-menu-submenu-title) {
                padding-left: 0.2rem;
                padding-right: 0.2rem;
                line-height: normal;

                &::after {
                    display: none;
                }

                .label::after {
                    content: ':';
                    padding-right: 0.2rem;
                }
            }

            :deep(.ant-menu-item) {
                padding-left: 0.2rem;
                padding-right: 0.2rem;
                line-height: normal;

                &::after {
                    display: none;
                }

                .label::after {
                    content: ':';
                    padding-right: 0.2rem;
                }
            }
        }
    }
}
</style>
