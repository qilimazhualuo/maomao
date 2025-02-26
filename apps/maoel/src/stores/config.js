import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLangStore = defineStore('lang', () => {
  const lang = ref('zhcn')
  function setLang(type) {
    lang.value = type
  }

  return { lang, setLang }
}, {
  persist: {
    storage: localStorage,
    pick: ['lang'],
  },
})
