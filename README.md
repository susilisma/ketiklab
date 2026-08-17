# KetikLab — 三语打字练习站

中文 · Bahasa Indonesia · English 三语打字 + 词汇 + 朗读练习。纯静态站，部署在 GitHub Pages，push 即自动构建上线。内容每小时自动扩充。

## 本地开发
```bash
npm install
npm run dev      # 本地预览
npm run build    # 产出 dist/
```

## 部署
GitHub Actions（`.github/workflows/deploy.yml`）在每次 push 到 `main` 时自动构建并发布到 GitHub Pages。
首次需在仓库 Settings → Pages → Source 选 **GitHub Actions**。

## 数据架构（参考 qwerty-learner）
内容不打包进代码，而是放在 JSON 文件里、运行时由前端 `fetch` 加载，所以内容持续增长也不会撑大 JS 包：
- 词汇：`public/data/words.json`（完整 `Word` 对象数组）
- 朗读：`public/data/readings.json`（公共领域全文，带作者/年代/来源/授权）

## 间隔复习（艾宾浩斯 / IndexedDB）
`src/srs.ts` 用 Dexie 在浏览器 IndexedDB 记录每个词的复习状态：答对沿 1/2/4/7/15/30/60/120 天间隔阶梯上升，答错回到起点并很快重现。"间隔复习"页显示今日待复习/已掌握/学习中，可一键开始复习到期词。

## 内容与自动更新
- 追加工具：`node scripts/append-batch.mjs [--dry-run] <batch.json>`（直接读写上面的 JSON）
  - 词条支持元组 `[en,id,zh,category,level?]`（自动补例句）或完整对象。
  - 自动 schema 校验 + 去重（词按 en/id/zh；朗读按 id 与 title+author）+ 幂等。
- 每小时自动更新由计划任务驱动：生成新批次 → append 到 JSON → commit → push → Actions 自动部署。

## 内容规则
词汇须中-印-英语义对齐（非表面直译），优先日常/商务/印尼生活公共服务/公共政策/学术研究。
朗读只用公共领域或开放授权全文，逐条记录作者、年代、来源、授权。保持三语 UI，不混排。
