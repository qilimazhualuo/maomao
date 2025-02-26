const axios = require('axios');

axios.post('http://ones.cn/identity/api/encryption_cert', { aa: 1 }).then((res) => {
    console.log(res)
})