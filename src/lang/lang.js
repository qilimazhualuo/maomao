

const lang = {
    com: {
        save: { zhcn: '保存', en: 'Save' },
    },
    mao: {
        happy: { zhcn: '幸福度', en: 'Happiness' },
        food: { zhcn: '食物', en: 'Food' },
        wood: { zhcn: '木材', en: 'Wood' },
        stone: { zhcn: '石头', en: 'Stone' },
        gold: { zhcn: '金币', en: 'Gold' },
        automation: { zhcn: '自动化', en: 'Automation' },
        priority: { zhcn: '优先级', en: 'Priority' },
        tech: { zhcn: '科技', en: 'Technology' },
    }
}

const zhcn = {}, en = {}

for (let key in lang) {
    zhcn[key] = {}
    en[key] = {}
    for (let k in lang[key]) {
        zhcn[key][k] = lang[key][k].zhcn
        en[key][k] = lang[key][k].en
    }
}

export { zhcn, en }
