# 释义修正 · 2026-11-13

样本：`random.seed(20261113)` 从 words.json 3879 行抽 320 行；R1 顺读、R2 倒读（互不可见、不看账本），VG 裁定（可见先例），V2 复核（独立第二意见 + 数据机械校验 + 迁移实测）。

两位读者各标 WRONG 1 / UNSURE 9（R1）与 WRONG 1 / UNSURE 5（R2），并集 13 行，重合 3 行（2101 / 1614 / 3552）。VG：CHANGE 1、KEEP 8、OWNER 4。

## 已改（提交 501cea9）

| i | en | 字段 | before → after | 同意方 | 理由 |
|---|---|---|---|---|---|
| 3282 | inaugurate | zh | 使就任；开创 → 任命；开创 | R2+VG | 使就任 是 使 字定义片段（同类 使保持某状态 / 使流 / 使生殖 / 使失色 已于 10-21、10-24 退役）；任命 对应 id melantik（KBBI：mengangkat menjadi pejabat）。与 #3849 appoint 共享首义，practisedOnce 处理 |

pinyin 已重算（rèn mìng）；使就任 钉入 src/zh-renames.json（KEYS_FLAG v4.227 → v4.228）；zh-pinyin.json 增 任命（默认等级 4）。

## 未改（VG KEEP）

| i | en | 字段 | 现值 | 提议 | 提出方 | 理由 |
|---|---|---|---|---|---|---|
| 535 | equity | zh | 所有者权益 | 权益；所有者权益；股权 | R1 | 会计标准词，与 ekuitas / business 一致；裸 权益 歧义 |
| 1433 | upgrade | id | memutakhirkan | meningkatkan | R1 | 11-03 / 11-09 已 KEEP；meningkatkan 是 improve 的释义，不更接近 升级 |
| 2530 | facial | id | muka | wajah | R1 | KBBI 名词作定语的标准用法（11-11 geopolitik / senator 先例） |
| 2840 | accelerate | zh | 加速；加快；快进 | 加快；加速 | R1 | 首义正确；次义 快进 属边缘项（11-09 liquefy 溶解 先例） |
| 3067 | periphery | id | tepi | pinggiran | R1 | 词典译法，属另一种选择而非更正 |
| 3089 | bathtub | id | bak mandi | bak rendam | R1 | 10-11 先例；bak rendam 不是固定词 |
| 3517 | predilection | id | minat | kegemaran | R2 | 11-11 先例 KEEP，候选相同、无新理由 |
| 2920 | emerald | zh | 祖母绿；绿宝石；翡翠 | 祖母绿；绿宝石 | R2 | 首义正确；第三义 翡翠 是边缘项 |

## 需要主人决定（VG OWNER）

| i | en | 字段 | 现值 | 提议 | 说明 |
|---|---|---|---|---|---|
| 2101 | health insurance scheme | id | BPJS Kesehatan | jaminan kesehatan（R1）/ bpjs kesehatan（R2） | 两读者替换不一致；属既有主人项 words-id-values-with-capitals-and-digit（30 行）；#512 national health insurance 已是 jaminan kesehatan nasional |
| 1614 | backpacker | id | pejalan ransel | pelancong ransel（R1）/ turis ransel（R2） | 10-30 起主人项（R5 曾提 bekpeker）；四票中 turis ransel 最集中 |
| 3552 | coiling | id | spiral | gulungan（R1）/ lilitan（R2） | 两读者都觉得松但替换不同；11-04 已列边缘项；VG 倾向 lilitan |
| 3837 | probable | id | mungkin | kemungkinan besar | 已在 gloss-candidates-2026-11-05（V2 反对）；R1 重复同一理由 |
