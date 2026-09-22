# 🛌 躺平 · 反内卷生活指南

![PWA](https://img.shields.io/badge/PWA-ready-7FB069) ![纯前端](https://img.shields.io/badge/纯前端-零依赖-7FB069) ![离线可用](https://img.shields.io/badge/离线-可用-7FB069) ![深色模式](https://img.shields.io/badge/深色模式-已支持-8B8680)

**在线访问：https://endcodeworld.github.io/tangping/**

一个纯前端、零依赖、离线可用的「躺平」主题 PWA。没有框架、没有构建工具、没有后端，所有数据都存在你自己的浏览器 localStorage 里。不卷，不慌，慢慢来。

## ✨ 功能

| 功能 | 路由 | 说明 |
|---|---|---|
| 📊 今日躺平打卡 | `#/` | 一键打卡（默认 8h），记录躺平时长 / 摸鱼指数 / 消耗卡路里，7 天趋势图 |
| 📖 反内卷文章 | `#/articles` | 17 篇干货：摸鱼技巧 / 低消费指南 / 不看群方法 / 情绪健康，分类筛选 + 详情 |
| 🎯 躺平指数测试 | `#/quiz` | 10 题自动跳题，四档等级（咸鱼→躺平大师），五维雷达图，复制分享 |
| 🛍️ 躺平商店 | `#/shop` | 21 个躺平神器（眼罩 / 靠枕 / 降噪耳机 / 香薰…），加购 + 购物车 + 模拟结算 |
| 🔥 FIRE 计算器 | `#/fire` | 4% 法则，复利公式算目标金额 / 进度 / 预计退休年龄，改数字即时出结果 |
| 💬 躺平树洞 | `#/feed` | 本地社区信息流，种子帖 / 发帖 / 点赞 / 评论 + emoji + 图片评论 |
| 📈 今日战报 | `#/report` | 连续打卡天数 / 累计统计 / 超过打工人百分比 / 一键复制分享文案 |
| 👤 个人中心 | `#/profile` | 昵称头像 / 躺平修为等级 / 统计 / 深色模式 / PWA 安装 |

## 🎨 设计

- 米白 `#FAF8F5` · 浅绿 `#7FB069` · 暖灰 `#8B8680` · 暖橙 `#E8B04C`
- 深色模式自动切换，内联脚本防闪烁
- 移动端优先，底部 Tab 栏，桌面端自动隐藏
- 轻柔动效（`cubic-bezier(.22,.61,.36,1)`），无夸张弹跳
- 所有图标用 emoji，零外部图片依赖，离线完整可用

## 🗂️ 项目结构

```
躺平/
├── index.html              # 入口
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service Worker（离线缓存，当前 tp-static-v7）
├── css/style.css           # 设计系统
├── js/
│   ├── app.js              # hash 路由 + 全部页面逻辑
│   ├── data-products.js    # 21 个商品（window.TP_PRODUCTS）
│   ├── data-articles.js   # 17 篇文章（window.TP_ARTICLES）
│   ├── data-quiz.js       # 10 道测试题（window.TP_QUIZ）
│   └── data-feed.js        # 树洞种子帖（window.TP_FEED_SEED）
├── icons/
│   ├── icon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── make-icons.ps1
├── .gitignore
└── README.md
```

## 🚀 本地运行

```powershell
cd D:\云\躺平
python -m http.server 8080
```

浏览器访问 <http://localhost:8080>（Service Worker 需要 http 协议，file:// 不生效）。

## 🛠️ 技术要点

- 纯前端 SPA，hash 路由，无框架无构建
- localStorage 统一 `tp_` 前缀（`tp_checkins` / `tp_cart` / `tp_feed_posts` / `tp_fire_profile` …）
- 离线 PWA：sw.js 预缓存所有静态资源，断网可打开
- 社区功能在纯静态站下的能力边界：所有数据仅存本机浏览器，不同设备 / 浏览器之间不互通；清空浏览器数据会丢失本地帖子和评论。

## 📝 License

学习 / 演示用途，商店流程不产生真实交易。
