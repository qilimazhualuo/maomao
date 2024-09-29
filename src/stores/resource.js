import { ref, computed, reactive, toRefs } from 'vue'
import { defineStore } from 'pinia'
import { config } from '@/config/mao_config'

let inter

export const useResourceStore = defineStore('resource', () => {
  // food ,木材-wood,石头-stone,金币-gold
  const resourceState = reactive({
    food: 0,
    wood: 0,
    stone: 0,
    gold: 0
  })
  // 建筑
  const structures = reactive({
    room: [],
    cropland: [],
    forest: [],
    mine: [],
    sawmill: [],
    alchemy: [],
    market: [],
  })
  // 仓库额外存储
  const warehouses = ref([])
  // 仓库容量 - 先不搞仓库 - 一直增加吧
  const warehouseStore = computed(() => {
    // 基础容量
    const warehouse = config.warehouse
    return warehouses.value.reduce((prev, item) => {
      if (item.storeType === 'all') {
        prev.food += warehouse.store / 10
        prev.wood += warehouse.store / 10
        prev.stone += warehouse.store / 10
        prev.gold += warehouse.store / 10
      } else {
        prev[item.storeType] += warehouse.store
      }
      return prev
    }, { food: 1000, wood: 1000, stone: 200, gold: 200 }) // 基础容量
  })

  if (inter) {
    clearInterval(inter)
  }
  inter = setInterval(() => {
    // 每个tokens处理产出和消耗
    // 食物固定增加
    resourceState.food += 1
    Object.keys(structures).forEach((key) => {
      // 建筑周期花费
      const consume = config[key].consume
      Object.keys(consume).forEach((resource) => {
        resourceState[resource] -= consume[resource]
      })
      // 建筑周期产出
      const productType = config[key].productType
    })
    if (resourceState.food > warehouseStore.value.food) {
      resourceState.food = warehouseStore.value.food
    }
    if (resourceState.stone > warehouseStore.value.stone) {
      resourceState.stone = warehouseStore.value.stone
    }
    if (resourceState.wood > warehouseStore.value.wood) {
      resourceState.wood = warehouseStore.value.wood
    }
    if (resourceState.gold > warehouseStore.value.gold) {
      resourceState.gold = warehouseStore.value.gold
    }
  }, 1000)

  const product = (type) => {
    switch (type) {
      case 'room':
        structures.room.push({ id: new Date().getTime() })
        Object.keys(config.room.value).forEach((key) => {
          resourceState[key] -= config.room.value[key]
        })
        break
      case 'cropland':
        structures.cropland.push({ id: new Date().getTime() })
        Object.keys(config.cropland.value).forEach((key) => {
          resourceState[key] -= config.cropland.value[key]
        })
        break
      case 'forest':
        structures.forest.push({ id: new Date().getTime() })
        Object.keys(config.forest.value).forEach((key) => {
          resourceState[key] -= config.forest.value[key]
        })
        break
      case 'mine':
        structures.mine.push({ id: new Date().getTime() })
        Object.keys(config.mine.value).forEach((key) => {
          resourceState[key] -= config.mine.value[key]
        })
        break
      case 'sawmill':
        structures.sawmill.push({ id: new Date().getTime() })
        Object.keys(config.sawmill.value).forEach((key) => {
          resourceState[key] -= config.sawmill.value[key]
        })
        break
    }
  }
  const { food, wood, stone, gold } = toRefs(resourceState)
  const { room, cropland, forest, mine, sawmill, alchemy, market } = toRefs(structures)
  return {
    food, wood, stone, gold,
    room, cropland, forest, mine, sawmill, alchemy, market, warehouses,
    warehouseStore, product
  }
}, {
  persist: {
    storage: localStorage,
    pick: [
      'food', 'wood', 'stone', 'gold', 'room', 'cropland', 'forest',
      'mine', 'sawmill', 'alchemy', 'market', 'warehouse', 'warehouseStore'
    ],
  },
})