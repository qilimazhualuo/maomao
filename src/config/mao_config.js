export const config = {
  // 基础单位食物-food ,木材-wood,石头-stone,金币-gold
  // 建筑类型 - production 生产单位,consume 消费单位, efficiency 影响效率的建筑
  room: {
    zhcn: '房屋',
    value: { food: 200 }, // 建筑单位建筑花费
    buildTime: 10, // 建筑单位建筑时间
    resourceType: {}, // 每周期生产
    consume: {}
  },
  warehouse: {
    zhcn: '仓库',
    value: { food: 200, wood: 200, stone: 200 }, // 建筑单位建筑花费
    buildTime: 10, // 建筑单位建筑时间
    store: 200, // 储存单位最大储存量
    storeType: 'all',
  },
  cropland: {
    zhcn: '农田',
    value: { food: 200 },
    buildTime: 10,
    resourceType: { food: 1 },
  },
  forest: {
    zhcn: '树林',
    value: { food: 200 },
    buildTime: 10,
    resourceType: { wood: 1 },
  },
  mine: {
    zhcn: '矿洞',
    value: { food: 200, wood: 200 },
    buildTime: 10,
    resourceType: { stone: 1 },
  },
  sawmill: {
    zhcn: '伐木场',
    value: { food: 1000, wood: 1000 },
    buildTime: 10,
    resourceType: { wood: 2 },
  },
  alchemy: {
    zhcn: '炼金厂',
    value: { food: 1000, wood: 1000, stone: 1000 },
    resourceType: { gold: 1 },
  },
  market: {
    zhcn: '市场',
    value: { food: 1000, wood: 1000, stone: 1000, gold: 1000 },
    buildTime: 10,
    resourceType: { gold: 1 },
  },
}
