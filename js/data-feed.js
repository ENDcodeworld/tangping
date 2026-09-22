/* 躺平树洞 · 种子帖子数据
 * 全局变量 window.TP_FEED（数组）
 * 字段：id, author, avatar(emoji), mins(发布时间描述), text, likes, comments[{author,avatar,text}]
 */
window.TP_FEED = [
  {
    id: 'f1',
    author: '六点准时走', avatar: '🐢', mins: '12 分钟前',
    text: '今天准点下班，走出大楼那一刻，连路灯都是香的。不卷了，明天也六点走。',
    likes: 328,
    comments: [
      { author: '早八死撑', avatar: '☕', text: '已经在工位坐到八点的人流下羡慕的眼泪。' },
      { author: '摸鱼大师', avatar: '🐟', text: '准点走不丢人，这是本事。' }
    ]
  },
  {
    id: 'f2',
    author: '免打扰战神', avatar: '🌙', mins: '1 小时前',
    text: '把所有工作群都设成「消息不提醒」了。世界瞬间清净，天没塌，活儿也没多。',
    likes: 512,
    comments: [
      { author: '下班隐身', avatar: '🕶️', text: '学到了，这就去设。' }
    ]
  },
  {
    id: 'f3',
    author: '八百块富翁', avatar: '🍚', mins: '3 小时前',
    text: '月花 800 活了一个月，回头一算，以前花的钱 80% 是焦虑税——怕掉队才买的课、怕不合群才凑的局。',
    likes: 764,
    comments: [
      { author: '极简主义', avatar: '🪨', text: '焦虑税这个词太准了。' },
      { author: '存钱中', avatar: '🐷', text: '这个月已经存下 2000，继续躺。' },
      { author: '躺平观察员', avatar: '👀', text: '不是不消费，是不为恐惧消费。' }
    ]
  },
  {
    id: 'f4',
    author: '工位植物人', avatar: '🪴', mins: '5 小时前',
    text: '教大家一个摸鱼小技巧：戴降噪耳机看窗外，偶尔点头，没人敢打扰你，还以为你在思考人生。',
    likes: 1023,
    comments: [
      { author: '演技派', avatar: '🎭', text: '已实践，领导真过来问我是不是有想法。' },
      { author: '透明人', avatar: '👻', text: '社恐狂喜，这个我能躺一天。' }
    ]
  },
  {
    id: 'f5',
    author: '沙发上的咸鱼', avatar: '🛋️', mins: '昨天',
    text: '周末没出门，没点外卖，自己煮了一锅面，看了三部老电影。这才叫周末，以前那种报复性出去玩才叫上班。',
    likes: 445,
    comments: [
      { author: '宅家冠军', avatar: '📺', text: '同感，出门比加班还累。' }
    ]
  },
  {
    id: 'f6',
    author: 'FIRE 预备役', avatar: '🔥', mins: '昨天',
    text: '算了一笔账：按现在的储蓄率，11 年后能退休。不焦虑了，反正终点都在那儿，慢慢走就是。',
    likes: 289,
    comments: [
      { author: '数字不骗人', avatar: '🧮', text: '我也是 12 年，我们山顶见。' }
    ]
  },
  {
    id: 'f7',
    author: '不回群消息', avatar: '🍃', mins: '2 天前',
    text: '有人问我为什么老不回工作群。我说：活儿在上班时间干完了，下班时间的消息，急的会打电话。三个月了，天没塌。',
    likes: 891,
    comments: [
      { author: '边界感', avatar: '🧱', text: '急的会打电话，这句是真理。' }
    ]
  },
  {
    id: 'f8',
    author: '拒绝比较者', avatar: '🌵', mins: '3 天前',
    text: '把朋友圈关了一周。发现我既没错过什么重要的事，也没人想我。轻装上阵，睡得特别香。',
    likes: 673,
    comments: [
      { author: '断舍离', avatar: '✂️', text: '关朋友圈三个月，血压都正常了。' }
    ]
  }
];
