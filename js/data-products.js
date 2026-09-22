/* ============================================================
 * 躺平 · 躺平神器商品数据
 * 全局变量 window.TP_PRODUCTS
 * 字段：id name desc price origPrice category emoji rating sales tags
 * ============================================================ */
window.TP_PRODUCTS = [
  { id: 'p01', name: '3D 立体遮光眼罩', desc: '透气无痕，午休午睡坐飞机通用，把世界调暗两度。', price: 19.9, origPrice: 39.9, category: '睡眠', emoji: '😴', rating: 4.8, sales: 12000, tags: ['午休', '遮光', '出差'] },
  { id: 'p02', name: '云朵靠枕', desc: '人体工学记忆棉，工位靠上去一秒进入待机模式。', price: 59, origPrice: 99, category: '办公', emoji: '☁️', rating: 4.7, sales: 8600, tags: ['护腰', '工位', '记忆棉'] },
  { id: 'p03', name: '主动降噪耳机', desc: '一键静音会议室与无效社交，世界立刻清净。', price: 399, origPrice: 599, category: '降噪', emoji: '🎧', rating: 4.9, sales: 5400, tags: ['降噪', '通勤', '沉浸'] },
  { id: 'p04', name: '单人露营折叠椅', desc: '周末找个草地一躺，KPI 与我无关。', price: 129, origPrice: 199, category: '户外', emoji: '🏕️', rating: 4.6, sales: 3200, tags: ['露营', '轻便', '户外'] },
  { id: 'p05', name: '懒人豆袋沙发', desc: '陷进去就别想站起来，整个人瘫成流体。', price: 299, origPrice: 499, category: '居家', emoji: '🛋️', rating: 4.8, sales: 2100, tags: ['瘫坐', '客厅', '可拆洗'] },
  { id: 'p06', name: '恒温保温杯', desc: '45℃ 温水随身带，拒绝奶茶店刺客。', price: 69, origPrice: 109, category: '居家', emoji: '🥤', rating: 4.7, sales: 9800, tags: ['喝水', '省钱', '长效保温'] },
  { id: 'p07', name: '助眠香薰蜡烛', desc: '薰衣草+雪松，点燃十分钟心率降一半。', price: 49, origPrice: 79, category: '居家', emoji: '🕯️', rating: 4.6, sales: 4300, tags: ['助眠', '放松', '氛围'] },
  { id: 'p08', name: '减压捏捏乐套装', desc: '甲方再改需求也不怕，捏爆它。', price: 29, origPrice: 49, category: '解压', emoji: '🧸', rating: 4.5, sales: 15000, tags: ['解压', '工位', '礼物'] },
  { id: 'p09', name: '全遮光窗帘', desc: '睡到中午像午夜，周末不存在早晨。', price: 159, origPrice: 259, category: '居家', emoji: '🌑', rating: 4.8, sales: 2700, tags: ['遮光', '睡眠', '卧室'] },
  { id: 'p10', name: '床上小书桌', desc: '躺着也能看剧办公，人类驯化床的终极形态。', price: 89, origPrice: 139, category: '办公', emoji: '🛏️', rating: 4.4, sales: 1900, tags: ['床上', '可折叠', '追剧'] },
  { id: 'p11', name: '法兰绒毛毯', desc: '办公室空调太冷？裹上它你就是最暖的崽。', price: 45, origPrice: 69, category: '居家', emoji: '🧶', rating: 4.7, sales: 7600, tags: ['保暖', '办公室', '午睡'] },
  { id: 'p12', name: '静音棉拖鞋', desc: '在家走路像猫，房东都听不见你躺平。', price: 35, origPrice: 55, category: '居家', emoji: '🥿', rating: 4.6, sales: 6400, tags: ['居家', '静音', '软底'] },
  { id: 'p13', name: '冥想打坐垫', desc: '每日静坐十分钟，内耗少一半。', price: 79, origPrice: 129, category: '解压', emoji: '🧘', rating: 4.5, sales: 1500, tags: ['冥想', '打坐', '专注'] },
  { id: 'p14', name: '墨水屏电子书阅读器', desc: '纸质书的观感，整箱书的容量，不刷短视频。', price: 899, origPrice: 1099, category: '学习', emoji: '📖', rating: 4.9, sales: 3800, tags: ['阅读', '护眼', '专注'] },
  { id: 'p15', name: '户外睡袋', desc: '办公室午休神器，拉上拉链就是私人结界。', price: 109, origPrice: 169, category: '户外', emoji: '🎒', rating: 4.5, sales: 2200, tags: ['午休', '保暖', '便携'] },
  { id: 'p16', name: '升降脚踏', desc: '工位上把脚一抬，灵魂先退休半步。', price: 49, origPrice: 79, category: '办公', emoji: '🦶', rating: 4.4, sales: 1100, tags: ['工位', '护腰', '放松'] },
  { id: 'p17', name: '重力减压被', desc: '8 斤重力压在身上，像被大地拥抱入睡。', price: 199, origPrice: 329, category: '睡眠', emoji: '🫂', rating: 4.7, sales: 1800, tags: ['助眠', '深睡', '包裹感'] },
  { id: 'p18', name: '白噪音机', desc: '雨声、海浪、风扇声，把出租屋变成森林。', price: 89, origPrice: 139, category: '睡眠', emoji: '🌊', rating: 4.6, sales: 950, tags: ['白噪音', '助眠', '专注'] }
];

window.TP_PRODUCT_CATS = ['全部', '睡眠', '办公', '降噪', '户外', '居家', '解压', '学习'
,
  { id: 'p19', name: '蒸汽热敷眼罩', desc: '午休 20 分钟发热热敷，眼睛一酸就贴一片，把疲劳蒸出去。', price: 29.9, origPrice: 49.9, category: '睡眠', emoji: '🌡️', rating: 4.7, sales: 7600, tags: ['午休', '热敷', '缓解眼疲'] },
  { id: 'p20', name: '薰衣草助眠香薰', desc: '淡淡薰衣草香，点上十分钟，房间变成能深呼吸的地方。', price: 49, origPrice: 89, category: '居家', emoji: '🕯️', rating: 4.6, sales: 3400, tags: ['助眠', '香薰', '放松'] },
  { id: 'p21', name: '加厚冥想坐垫', desc: '打坐、冥想、盘腿发呆专用，腰一靠，杂念自动靠边。', price: 79, origPrice: 129, category: '解压', emoji: '🧘', rating: 4.5, sales: 1500, tags: ['冥想', '打坐', '蒲团'] }

];
