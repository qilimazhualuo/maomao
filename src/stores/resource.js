import { ref, computed, reactive, toRefs } from 'vue'
import { defineStore } from 'pinia'
import { config } from '@/config/mao_config'

let inter

export const useResourceStore = defineStore('resource', () => {
  // food ,木材-wood,石头-stone,金币-gold
  const resourceState = reactive({
    foods: 0,
    woods: 0,
    stones: 0,
    golds: 0
  })
  // 建筑
  const structures = reactive({
    rooms: [],
    croplands: [],
    forests: [],
    mines: [],
    sawmills: [],
    alchemys: [],
    markets: [],
    warehouses: []
  })
  // 仓库容量 - 先不搞仓库 - 一直增加吧
  const warehouseStore = computed(() => {
    // 基础容量
    const warehouse = config.warehouse
    return structures.warehouses.reduce((prev, item) => {
      if (item.storeType === 'all') {
        prev.food += warehouse.store / 10
        prev.wood += warehouse.store / 10
        prev.stone += warehouse.store / 10
        prev.gold += warehouse.store / 10
      } else {
        prev[item.storeType] += warehouse.store
      }
      return prev
    }, { food: 200, wood: 200, stone: 200, gold: 200 }) // 基础容量
  })

  if (inter) {
    clearInterval(inter)
  }
  inter = setInterval(() => {
    // 每个tokens处理产出和消耗
    // 食物固定增加
    resourceState.foods += 1
    if (resourceState.foods > warehouseStore.value.food) {
      resourceState.foods = warehouseStore.value.food
    }
    if (resourceState.stones > warehouseStore.value.stone) {
      resourceState.stones = warehouseStore.value.stone
    }
    if (resourceState.woods > warehouseStore.value.wood) {
      resourceState.woods = warehouseStore.value.wood
    }
    if (resourceState.golds > warehouseStore.value.gold) {
      resourceState.golds = warehouseStore.value.gold
    }
  }, 1000)

  const product = (type) => {
    switch (type) {
      case 'room':
        rooms.value.push({ id: new Date().getTime() })
        Object.keys(config.room.value).forEach((key) => {
          resourceState[`${key}s`] -= config.room.value[key]
        })
        break
      case 'cropland':
        croplands.value.push({ id: new Date().getTime() })
        Object.keys(config.cropland.value).forEach((key) => {
          resourceState[`${key}s`] -= config.cropland.value[key]
        })
        break
      case 'forest':
        forests.value.push({ id: new Date().getTime() })
        Object.keys(config.forest.value).forEach((key) => {
          resourceState[`${key}s`] -= config.forest.value[key]
        })
        break
      case 'mine':
        mines.value.push({ id: new Date().getTime() })
        Object.keys(config.mine.value).forEach((key) => {
          resourceState[`${key}s`] -= config.mine.value[key]
        })
        break
      case 'sawmill':
        sawmills.value.push({ id: new Date().getTime() })
        Object.keys(config.sawmill.value).forEach((key) => {
          resourceState[`${key}s`] -= config.sawmill.value[key]
        })
        break
    }
  }
  const { foods, woods, stones, golds, } = toRefs(resourceState)
  const { rooms, croplands, forests, mines, sawmills, alchemys, markets, warehouses } = toRefs(structures)
  return {
    foods, woods, stones, golds,
    rooms, croplands, forests, mines, sawmills, alchemys, markets, warehouses,
    warehouseStore, product
  }
}, {
  persist: {
    storage: localStorage,
    pick: [
      'foods', 'woods', 'stones', 'golds', 'rooms', 'croplands', 'forests',
      'mines', 'sawmills', 'alchemys', 'markets', 'warehouses', 'warehouseStore'
    ],
  },
})