import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { getCollection } from './api.js'
import { message } from 'ant-design-vue'

export const useTokenStore = defineStore('bililiInfo',
    () => {
        const isLogin = ref(false)

        // token相关
        const token = ref({})
        const setToken = (val) => {
            token.value = Object.assign({
                DedeUserID: '77269342',
                DedeUserID__ckMd5: '458fbff62991306f',
                SESSDATA: 'cabac791,1759586944,34c24*41CjBareuP...',
                bili_jct: 'f13da56949ff2e18a1eae5b52589faf6',
                buvid3: '747B8D27-AA91-ED65-5C53-8592CC0A5A6B30024infoc',
                b_nut: '1744034944'
            }, val)
        }
        const getToken = () => {
            return token.value
        }
        const getCookie = () => {
            return Object.keys(token.value).map(key => `${key}=${token.value[key]}`).join('; ')
        }

        // 个人信息
        const userInfo = ref()
        const setUserInfo = (val) => {
            console.log(val)
            userInfo.value = val
        }

        // 收藏夹
        const collection = ref([])
        const curCollect = ref('')
        const searchCollection = () => {
            getCollection().then(res => {
                if (res.code === 0) {
                    collection.value = res.data.list
                    curCollect.value = res.data.list[0].id
                    return
                }
                message.error(res.message)
            })
        }
        watch(() => token.value, searchCollection)
        const setCurCollect = (val) => {
            curCollect.value = val
        }

        return {
            isLogin, token, setToken, getToken, getCookie,
            userInfo, setUserInfo,
            collection, curCollect, searchCollection, setCurCollect,
        }
    },
    {
        persist: {
            storage: localStorage,
            pick: [
                'isLogin','token', 'userInfo',
                'collection', 'curCollect'
            ],
            afterHydrate: (ctx) => {
                const { collection, token } = ctx.store
                if (ctx.store.collection.length === 0 && ctx.store.token.DedeUserID) {
                    ctx.store.searchCollection()
                }
            }
        },
    }
)