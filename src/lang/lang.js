const lang = {
  com: {
    save: { zhcn: '保存', en: 'Save' },
  },
  mao: {
    // 存储
    happy: { zhcn: '幸福度', en: 'Happiness' },
    resource: { zhcn: '资源', en: 'Resource' },
    all: { zhcn: '全部', en: 'All' },
    food: { zhcn: '食物', en: 'Food' },
    wood: { zhcn: '木材', en: 'Wood' },
    stone: { zhcn: '石头', en: 'Stone' },
    gold: { zhcn: '金币', en: 'Gold' },
    people: { zhcn: '人口', en: 'People' },
    // 建筑
    room: { zhcn: '房间', en: 'Room' },
    cropland: { zhcn: '农场', en: 'Farm' },
    forest: { zhcn: '树林', en: 'Forest' },
    mine: { zhcn: '矿洞', en: 'Mine' },
    house: { zhcn: '房屋', en: 'House' },
    sawmill: { zhcn: '伐木厂', en: 'Sawmill' },
    alchemy: { zhcn: '炼金厂', en: 'Alchemy' },
    market: { zhcn: '市场', en: 'Market' },
    warehouse: { zhcn: '仓库', en: 'Warehouse' },
    // 菜单
    automation: { zhcn: '自动化', en: 'Automation' },
    priority: { zhcn: '优先级', en: 'Priority' },
    tech: { zhcn: '科技', en: 'Technology' },
    // 提示
    tipOfBuild: { zhcn: '建造', en: 'Build' },
  },
}

const zhcn = {},
  en = {}

for (let key in lang) {
  zhcn[key] = {}
  en[key] = {}
  for (let k in lang[key]) {
    zhcn[key][k] = lang[key][k].zhcn
    en[key][k] = lang[key][k].en
  }
}

export { zhcn, en }
