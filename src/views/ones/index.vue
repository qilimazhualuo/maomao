<script setup lang="jsx">
import { ref, getCurrentInstance } from 'vue'
import { JSEncrypt } from 'jsencrypt'
import { doPromise } from '@/common/tool'

const { service } = window.ipcRenderer

// 登录
const loginData = ref({
    email: '945270296@qq.com',
    password: '123zhangbei',
})

const loginRules = {
    email: [{ required: true, message: 'email必填!' }],
    password: [{ required: true, message: 'password必填!' }],
}

const name = ref('')
const userInfo = ref(null)

function generateCodeVerifier() {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return base64UrlEncode(array)
}

async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return base64UrlEncode(digest)
}

function base64UrlEncode(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}

function encryptPassword(password, publicKey) {
    const encrypt = new JSEncrypt() // 使用jsencrypt库
    encrypt.setPublicKey(publicKey)
    return encrypt.encrypt(password)
}

function generateFinalRedirectUrl(originalHref) {
    debugger
    // 常量定义（与原代码一致）
    const IDS_LOGIN_PAGE_URL = '/identity/login';
    const COOKIE_DOMAIN = '.ones.cn';

    // 解析原始 URL
    const originalUrl = new URL(originalHref);

    // 提取 hash 部分构造虚拟 URL
    const hash = originalUrl.hash.slice(1) || '';
    const fakeUrl = new URL(`http://dummy${hash}`);

    // 提取语言参数（优先取原始 URL 的 lang）
    const langParam = originalUrl.searchParams.get('lang') || fakeUrl.searchParams.get('lang');

    // 构造 ones_from 参数（需编码原始 URL）
    const onesFromParam = encodeURIComponent(originalHref);

    // 构建目标 URL
    const targetUrl = new URL(IDS_LOGIN_PAGE_URL, originalUrl.origin);

    // 设置查询参数
    const queryParams = new URLSearchParams();
    queryParams.set('ones_from', onesFromParam);
    if (langParam) queryParams.set('lang', langParam);

    // 组合最终 URL
    targetUrl.search = queryParams.toString();

    return targetUrl.toString();
}
const login = (val) => {
    const getPublic = () => {
        return service({
            url: 'https://ones.cn/identity/api/encryption_cert',
            method: 'post',
        })
    }
    const login = (res) => {
        const { email, password } = val
        return service({
            url: 'https://ones.cn/identity/api/login',
            method: 'post',
            data: {
                email, password: encryptPassword(password, res.public_key)
            }
        })
    }
    doPromise([getPublic, login]).then((res) => {
        userInfo.value = res[1]
        const org_uuid = userInfo.value.org_users[0].org.org_uuid
        // 再次获取公钥
        service({
            method: 'get',
            url: 'https://sz.ones.cn/project/api/project/auth/login_support',
            params: { team_uuid: '', org_uuid: userInfo.value.org_users[0].org.org_uuid }
        }).then(async (res) => {
            const { padding_type, public_key } = res.encryption.encrypt_config
            const codeVerifier = generateCodeVerifier()
            sessionStorage.setItem('code_verifier', codeVerifier)
            const codeChallenge = await generateCodeChallenge(codeVerifier)
            const clientId = 'ones.v1'
            const redirectUri = encodeURIComponent('https://ones.cn/auth/authorize/callback')
            const encryptedPassword = encryptPassword('user_password', public_key)
            
            // service({
            //     url: 'https://ones.cn/auth/authorize',
            //     params: {
            //         response_type: 'code',
            //         client_id: clientId,
            //         // redirect_uri: redirectUri,
            //         code_challenge: codeChallenge,
            //         code_challenge_method: 'S256',
            //         encrypted_password: encodeURIComponent(encryptedPassword)
            //     }
            // }).then((res) => {
            //     console.log('aaaaaaaaaaa', res)
            // })
            const authUrl = `https://ones.cn/auth/authorize?
                response_type=code&
                client_id=${clientId}&
                redirect_uri=${redirectUri}&
                code_challenge=${codeChallenge}&
                code_challenge_method=S256&
                encrypted_password=${encodeURIComponent(encryptedPassword)}`
            console.log(generateFinalRedirectUrl(authUrl))
            // service({
            //     method: 'post',
            //     url: 'https://ones.cn/identity/oauth/token',
            //     params: {
            //         grant_type: 'authorization_code',
            //         client_id: 'ones.v1',
            //         code: 
            //     }
            // })
        })
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
const searchData = ref({
    time: []
})

const searchRules = {
    time: [{ required: true, message: '时间必填!' }],
}
const getData = () => {

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
            <a-typography-title v-if="name">您的名字：{{ name }}</a-typography-title>
        </a-typography>
        <a-form :model="loginData" :rules="loginRules" @finish="login">
            <a-form-item name="email" label="ones Email">
                <a-input v-model:value="loginData.email" placeholder="请输入Email"></a-input>
            </a-form-item>
            <a-form-item name="password" label="ones password">
                <a-input v-model:value="loginData.password" placeholder="请输入password"></a-input>
            </a-form-item>
            <a-form-item>
                <a-button type="primary" html-type="submit">登录</a-button>
            </a-form-item>
        </a-form>
        <a-form :model="searchData" :rules="searchRules" @finish="getData">
            <a-form-item name="time" label="时间">
                <a-range-picker v-model:value="searchData.time" />
            </a-form-item>
            <a-form-item>
                <a-button :disabled="!userInfo" type="primary" html-type="submit">获取数据</a-button>
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
