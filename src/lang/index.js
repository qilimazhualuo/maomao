import { createI18n } from 'vue-i18n'
// 语言包
import { zhcn, en } from './lang'

const i18n = createI18n({
  legacy: false, // 设置为 false，启用 composition API 模式
  locale: sessionStorage.getItem('localeLang') || 'zhcn',
  messages: {
    zhcn,
    en,
  },
})

export default i18n
