import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { config } from '@/config/mao_config'

let inter

export const useResourceStore = defineStore('resource', () => {
  // food ,木材-wood,石头-stone,金币-gold
  const foods = ref(0)
  const woods = ref(0)
  const stones = ref(0)
  const golds = ref(0)
  const rooms = ref([])
  const croplands = ref([])
  const forests = ref([])
  const mines = ref([])
  const sawmills = ref([])
  const alchemys = ref([])
  const markets = ref([])

  if (inter) {
    clearInterval(inter)
  }
  inter = setInterval(() => {
    // 每个tokens处理产出和消耗
    // 食物固定增加
    foods.value += 1
  }, 1000)

  const product = (type) => {
    switch (type) {
      case 'room':
        rooms.value += 1
        break
      case 'cropland':
        croplands.value += 1
        break
      case 'forest':
        forests.value += 1
        break
      case 'mine':
        mines.value += 1
        break
      case 'sawmill':
        sawmills.value += 1
        break
    }
  }

  return { foods, woods, stones, golds, rooms, croplands, forests, mines, sawmills, alchemys, markets, product }
}, {
  persist: {
    storage: localStorage,
    pick: ['foods', 'woods', 'stones', 'golds', 'rooms', 'croplands', 'forests', 'mines', 'sawmills', 'alchemys', 'markets'],
  },
})