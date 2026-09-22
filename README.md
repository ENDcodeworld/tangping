# 躺平 · 反内卷生活指南（PWA）

一个纯前端、零依赖、离线可用的「躺平」主题 PWA 小应用。没有框架、没有构建工具、没有后端，所有数据都存在你自己的浏览器 localStorage 里。

## ✨ 功能列表

底部 5 个 Tab 对应五个核心功能：

1. **首页（#/）** — 今日躺平打卡
   - Hero 区 + 轮播金句（反内卷宣言 / 低消费提示 / 不看群提醒）
   - 记录今天躺了多久（小时）、摸鱼指数（1-10 滑块）、自动估算消耗卡路里（按体重微调）
   - 最近 7 天打卡趋势（纯 CSS 柱状图）
   - 快捷入口直达其余页面
2. **反内卷内容（#/articles）** — 12 篇干货文章，分三类：摸鱼技巧 / 低消费生活指南 / 下班不看群方法
   - 分类筛选、文章详情、点赞、相关推荐
3. **躺平指数测试（#/quiz）** — 10 道选择题，逐题作答 + 进度条
   - 四档等级：咸鱼 / 半躺 / 全躺 / 躺平大师
   - 纯 CSS 五维雷达图、复制结果分享、重新测试
4. **躺平商店（#/shop）** — 18 个「躺平神器」商品
   - 分类筛选 + 排序（销量 / 评分 / 价格）
   - 商品详情、数量选择、加入购物车、收藏
   - 购物车增减、模拟结算（不产生真实交易）
5. **FIRE 低消费计算器（#/fire）** — 4% 法则
   - 输入存款 / 月支出 / 月收入 / 收益率 / 年龄
   - 复利公式估算 FIRE 目标金额、当前进度、预计退休年龄
   - 低消费生活小贴士

另有 **个人中心（#/profile）**：可编辑昵称头像、躺平修为徽章（初入躺门 → 躺平宗师）、统计卡片、打卡记录、最近测试结果、深色模式开关、PWA 安装、清除数据。

## 🗂️ 项目结构

```
躺平/
├── index.html              # 入口
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service Worker（离线缓存，cache 版本 tp-static-v1）
├── css/style.css           # 设计系统（米白 + 浅绿 + 暖橙，深色模式）
├── js/
│   ├── data-products.js    # window.TP_PRODUCTS 商品数据
│   ├── data-articles.js    # window.TP_ARTICLES 文章数据
│   ├── data-quiz.js        # window.TP_QUIZ 测试题数据
│   └── app.js              # 路由 + 全部页面逻辑
├── icons/
│   ├── icon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── img/                    # 占位（本项目全部用 emoji，无外部图片）
├── make-icons.ps1          # PNG 图标生成脚本
├── .gitignore
└── README.md
```

## 🚀 本地运行

Service Worker 只在 `http://` / `https://` 下生效，直接双击 `index.html`（file://）无法离线安装。推荐用本地静态服务器：

```powershell
cd D:\云\躺平
python -m http.server 8080
```

然后浏览器访问 <http://localhost:8080>。

> 也可以用 `npx serve .` 等任意静态服务器，但本项目本身不需要任何 npm 依赖。

## 📤 部署到 GitHub Pages

由于本机 `gh` CLI 未登录，请按以下步骤手动操作：

1. 在 GitHub 上新建一个空仓库，名字建议为 `tangping`（不要勾选 README / .gitignore，避免冲突）。
2. 在本目录执行：
   ```powershell
   git remote add origin https://github.com/<你的用户名>/tangping.git
   git push -u origin main
   ```
3. 打开仓库页面 → **Settings** → 左侧 **Pages**：
   - **Source** 选 `Deploy from a branch`
   - **Branch** 选 `main`，文件夹选 `/ (root)`
   - 保存，等待 1-2 分钟
4. 访问 `https://<你的用户名>.github.io/tangping/` 即可。

> 注意：GitHub Pages 默认是 HTTPS，Service Worker 与 manifest 都会正常工作。若仓库名不是 `tangping`，把上面 URL 里的 `tangping` 换成你的仓库名即可。

## 🛠️ 技术要点

- 纯前端 SPA，hash 路由（`#/`、`#/article/:id`、`#/product/:id`…）
- localStorage 统一使用 `tp_` 前缀（`tp_checkins` / `tp_cart` / `tp_favs` / `tp_theme` / `tp_fire_profile` / `tp_quiz_result`…）
- 所有图片用 emoji 或 CSS 渐变，不引用任何外部图片 URL，确保离线可用
- 深色模式通过 `<html data-theme="dark">` + 内联脚本提前设置，避免刷新闪烁
- 动效统一 `cubic-bezier(.22,.61,.36,1)`，0.2–0.4s，不做夸张弹跳

## 📝 License

本项目仅为学习 / 演示用途，商店流程不产生真实交易。
