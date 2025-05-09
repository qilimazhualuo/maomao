const serverUrl = '/'

export const modelConfig = [
    {
        title: '生活区',
        children: [
            {
                id: '110kvBDZ',
                name: '变电站',
                url: serverUrl + 'data/110kvBDZ.glb',
                visible: true,
                showLabel: true, //是否显示label
                position: { //label方位
                    x: -88.8315339492455,
                    y: 19,
                    z: 75.87628036491982
                },
                transparent: true, //是否透明
            }, {
                id: 'inRoom110kv1',
                name: '变电站一层',
                url: serverUrl + 'data/inRoom110kv1.glb',
                visible: false,
                transparent: true, //是否透明
            }, {
                id: 'inRoom110kv2',
                name: '变电站二层',
                url: serverUrl + 'data/inRoom110kv2.glb',
                visible: false,
                transparent: true, //是否透明
            }, {
                id: 'BPBJKXFBXFG',
                name: '备品备件库',
                url: serverUrl + 'data/BPBJKXFBXFG.glb',
                visible: true,
                showLabel: true,
                position: {
                    x: -49.81661338194678,
                    y: 10,
                    z: -66.50643898359131
                },
                transparent: true, //是否透明
            },
            {
                id: 'roomDuty',
                name: '综合值班室',
                url: serverUrl + 'data/roomDuty.glb',
                visible: true,
                showLabel: true,
                position: {
                    x: -91.15855858362791,
                    y: 15,
                    z: -73.88810508929744
                },
                transparent: true, //是否透明
            },
            {
                id: 'roomSBJ',
                name: '综合设备间',
                url: serverUrl + 'data/roomSBJ.glb',
                visible: true,
                showLabel: true,
                position: {
                    x: -21.306629778763384,
                    y: 10,
                    z: -66.66988905926833
                },
                transparent: true, //是否透明
            }, {
                id: 'inRoomSBJ',
                name: '综合设备间内部',
                url: serverUrl + 'data/inRoomSBJ.glb',
                visible: true,

                showLabel: false,
                transparent: false, //是否透明
            }, {
                id: 'roomBPSBJ',
                name: '变频设备间',
                url: serverUrl + 'data/roomBPSBJ.glb',
                visible: true,
                showLabel: true,
                position: {
                    x: -18.620061021805828,
                    y: 13,
                    z: 21.71727070761083
                },
                transparent: true, //是否透明
            },
            {
                id: 'inRoomBPSBJ',
                name: '变频设备间房屋内部',
                url: serverUrl + 'data/inRoomBPSBJ.glb',
                visible: false,
                showLabel: false,
                transparent: false, //是否透明
            },
        ]
    },
    {
        title: '工艺区',
        children: [
            {
                id: 'airCooler',
                name: '空冷区',
                url: serverUrl + 'data/airCooler.glb',
                visible: true,
                showLabel: false,
                transparent: true, //是否透明
            }, {
                id: 'areaYSJ',
                name: '压缩机区',
                url: serverUrl + 'data/areaYSJ.glb',
                visible: true,
                showLabel: false,
                transparent: true, //是否透明
            }, {
                id: 'roomYSJ',
                name: '压缩机房',
                url: serverUrl + 'data/roomYSJ.glb',
                visible: true,
                showLabel: false,
                transparent: true, //是否透明
            },
            {
                id: 'inRoomYSJ1',
                name: '压缩机厂房A',
                url: serverUrl + 'data/inRoomYSJ1.glb',
                visible: false,
                showLabel: true,
                transparent: false, //是否透明
                position: {
                    x: 30.744368042899016,
                    y: 18,
                    z: 8.214374236008341
                },
                cameraPositon: {
                    x: 41.07357492853177,
                    y: 8.284880032627694,
                    z: 8.410061614790736,
                },
                lookAtPositon: {
                    x: 31.962850724535716,
                    y: 2.2754092529995713,
                    z: 21.254934112539683,
                }
            },
            {
                id: 'inRoomYSJ2',
                name: '压缩机厂房B',
                url: serverUrl + 'data/inRoomYSJ2.glb',
                visible: false,
                showLabel: true,
                transparent: false, //是否透明
                position: {
                    x: 30.161985330598345,
                    y: 18,
                    z: 69.86822635602223
                },
            }
        ]
    },
    {
        title: '地下管线',
        children: [
            {
                id: 'ground',
                name: '地面',
                url: serverUrl + 'data/ground.glb',
                visible: true,
                transparent: true, //是否透明
            },
            {
                id: 'underground2',
                name: '生产管线',
                url: serverUrl + 'data/underground2.glb',
                visible: true,
                transparent: true, //是否透明
                cameraPositon: {
                    x: 53.111779401666396,
                    y: 7.6041730472997795,
                    z: -27.146556723240913,
                },
                lookAtPositon: {
                    x: 40.787723541259766,
                    y: 0.4623955488204956,
                    z: -51.94070053100586,
                }
            },
            {
                id: 'underground1',
                name: '生活管线',
                url: serverUrl + 'data/underground1.glb',
                visible: false,
                transparent: true, //是否透明
            },
            {
                id: 'waterSupply',
                name: '给水管线',
                url: serverUrl + 'data/waterSupply.glb',
                visible: false,
                transparent: true, //是否透明
            },
            {
                id: 'drainage',
                name: '排水管线',
                url: serverUrl + 'data/drainage.glb',
                visible: false,
                transparent: true, //是否透明
            },
            {
                id: 'fireFighting',
                name: '消防管线',
                url: serverUrl + 'data/fireFighting.glb',
                visible: false,
                transparent: true, //是否透明
            },
            {
                id: '地形起伏',
                name: '周边地形',
                url: serverUrl + 'data/DIXING.glb',
                visible: false,
                transparent: true, //是否透明
            }
        ]
    },
]