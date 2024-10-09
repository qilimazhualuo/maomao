export const config = {
  // 基础单位食物-food ,木材-wood,石头-stone,金币-gold
  // 建筑类型 - production 生产单位,consume 消费单位, efficiency 影响效率的建筑
  room: {
    zhcn: '房屋',
    value: { food: 200 }, // 建筑单位建筑花费
    buildTime: 10, // 建筑单位建筑时间
    product: {}, // 每周期生产
    consume: {},
    people: 1, // 容纳人口数量
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
    product: { food: 1 },
  },
  forest: {
    zhcn: '树林',
    value: { food: 200 },
    buildTime: 10,
    product: { wood: 1 },
  },
  mine: {
    zhcn: '矿洞',
    value: { food: 200, wood: 200 },
    buildTime: 10,
    product: { stone: 1 },
  },
  sawmill: {
    zhcn: '伐木场',
    value: { food: 1000, wood: 1000 },
    buildTime: 10,
    product: { wood: 2 },
  },
  alchemy: {
    zhcn: '炼金厂',
    value: { food: 1000, wood: 1000, stone: 1000 },
    product: { gold: 1 },
  },
  market: {
    zhcn: '市场',
    value: { food: 1000, wood: 1000, stone: 1000, gold: 1000 },
    buildTime: 10,
    product: { gold: 1 },
  },
}

export const tech = [
  {
    name: '种田',
    desc: '可以生产农田',
    value: 1000, // 单位一人时工作量
    effect: {},
    children: [
      {
        name: '农田',
        desc: '可以生产粮食',
        value: 1000, // 单位一人时工作量
        effect: {},
      },
      {
        name: '农田',
        desc: '可以生产粮食',
        value: 1000, // 单位一人时工作量
        effect: {},
      },
    ],
  },
  {
    name: '采矿',
    desc: '可以开挖矿洞',
    value: 1000, // 单位一人时工作量
    effect: {},
    children: [
      {
        name: '农田',
        desc: '可以生产粮食',
        value: 1000, // 单位一人时工作量
        effect: {},
      },
    ],
  },
]
