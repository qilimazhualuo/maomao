export const config = {
    // 基础单位食物-food ,木材-wood,石头-stone,金币-gold
    // 建筑类型 - production 生产单位,consume 消费单位, efficiency 影响效率的建筑 
    room: {
        zhcn: '房屋',
        buildType: 'consume', // 生产单位
        value: [{ food: 10, wood: 10, stone: 10, gold: 10 }], // 建筑单位建筑花费
        buildTime: 10, // 建筑单位建筑时间
        resourceType: [{ food: -10 }], // 每周期花费
    },
    warehouse: {
        zhcn: '仓库',
        buildType: 'store', // 储存单位
        value: [{ food: 10, wood: 10, stone: 10, gold: 10 }], // 建筑单位建筑花费
        buildTime: 10, // 建筑单位建筑时间
        store: 200, // 储存单位最大储存量
        storeType: 'all'
    },
    cropland: {
        zhcn: '农田',
        buildType: 'production',
        value: [{ food: 10, wood: 10 }],
        buildTime: 10,
        resourceType: [{ food: 10 }],
    },
    forest: {
        zhcn: '树林',
        buildType: 'production',
        value: [{ food: 10, wood: 10 }],
        buildTime: 10,
        resourceType: [{ wood: 10 }],
    },
    mine: {
        zhcn: '矿洞',
        buildType: 'production',
        value: [{ food: 10, wood: 10 }],
        buildTime: 10,
        resourceType: [{ stone: 10 }],
    },
    sawmill: {
        zhcn: '伐木场',
        buildType: 'production',
        value: [{ food: 10, wood: 10 }],
        buildTime: 10,
        resourceType: [{ wood: 10 }],
    },
    alchemy: {
        zhcn: '炼金厂',
        buildType: 'production',
        value: [{ food: 10, wood: 10, stone: 10 }],
        resourceType: [{ gold: 10 }],
    },
    market: {
        zhcn: '市场',
        buildType: 'consume',
        value: [{ food: 10, wood: 10, stone: 10, gold: 10 }],
        buildTime: 10,
        resourceType: [{ gold: 10 }],
    }
}