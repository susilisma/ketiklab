# 释义修正 · 2026-11-12

样本：`random.seed(20261112)` 从 words.json 3879 行抽 320 行；R1 顺读、R2 倒读（互不可见、不看账本），VG 裁定（可见先例），V2 复核（独立第二意见 + 数据机械校验 + 迁移实测）。

## 已改（提交 6683ae8、6301e6c）

| i | en | 字段 | before → after | 同意方 | 理由 |
|---|---|---|---|---|---|
| 2144 | wick | zh | 导油棉 → 灯芯；烛芯；导油棉 | R1+R2+VG+V2 | 导油棉 是电子烟行业用语；id sumbu（KBBI：灯/蜡烛芯）说明本行是通用词，首义应为 灯芯。11-11 的 KEEP 本就以「确认为通用词条」为条件 |
| 3468 | sleepiness | zh | 困倦；昏昏睡睡；睡意 → 困倦；睡意；昏昏欲睡 | R1+R2+VG+V2 | 昏昏睡睡 不是词，固定语是 昏昏欲睡；首义不变 |
| 347 | urban village | zh | 城市行政村 → 街道；城市行政村 | R1+VG+V2（弱） | 城市行政村 是定义式展开（#790 城市行政村长 已按同一理由改为 村长；街道主任）；街道 是同级行政单位，与 #66 street 共享首义，practisedOnce 处理 |
| 3624 | cubby | zh | 小房间 → 小隔间；小储物格 | R2+VG+V2 | cubby 是储物格/小隔间，不是房间 |
| 3611 | oscillatory | id | berayun → berosilasi | R2+VG+V2 | berayun = 摆荡（ayunan）；本行是物理「振荡的」，KBBI 有 osilasi / berosilasi |
| 1942 | stay | zh | 居住 → 停留；住；居住 | R2+VG+V2（R1 可接受） | 居住 = reside；A2 的 stay 学习者打 停留 / 住；居住 留作后义保住 tinggal 的读法 |
| 3661 | seashell | zh | 海贝；海贝壳；贝 → 贝壳；海贝；海贝壳 | R2+V2（VG 按 11-05 先例 KEEP） | 海贝 主要指海生贝类/货贝，贝 是黏着语素；日常词是 贝壳，无其它行占用。按主人规则「查找者 + 独立校验者一致即改」应用 |

机械处理：触及行的 pinyin / idSyllables 重新生成（oscillatory be·ro·si·la·si；wick dēng xīn；cubby xiǎo gé jiān；seashell bèi ké）；退役首义 导油棉 / 城市行政村 / 小房间 / 居住 / 海贝 钉入 src/zh-renames.json（222 → 227，KEYS_FLAG v4.222 → v4.227）；zh-pinyin.json 增 灯芯 / 小隔间 / 停留（承 居住 的 1 级）/ 贝壳。V2 data-check 67/67（第二提交 33/33 + 4 条为脚本对首批的硬编码预期）；migrate.cjs 24/24：v4.222 设备载入后 SRS / 错词本 / 收藏按新键迁移，zh:居住 因是 zh-core 词头按词典豁免保留（设计）。

## 未改候选（KEEP / 主人项）

| i | en | 字段 | 现值 | 读者意见 | 裁定 |
|---|---|---|---|---|---|
| 3624 | cubby | id | ruang kecil | R2 lemari kecil（WRONG）；V2 倾向改但无一致替换（ceruk 已被 niche 用，loker？） | KEEP，主人定 |
| 1250 | whisper | zh | 低声说 | R1 FRAGMENT → 耳语；低语 | VG / V2 KEEP：动词行，词典并列 低声说 |
| 841 | dummy variable | id | variabel semu | R2 variabel boneka（信心 0.4） | KEEP：semu 有计量文献用例；boneka / dummy 更常见，主人可定 |
| 1874 | subsidized lpg | en / zh | subsidized lpg / 补贴煤气 | 两读者：词头应 LPG；zh 宽泛 | 词头 = 进度键不改；主人项（旧） |
| 3529 clammy / 3421 manger / 3621 alarmist / 3594 resuscitate / 3207 jug / 3729 merely / 3748 frequent / 3691 evening / 2163 customs valuation | | | | 偏好项或 11-05 先例 KEEP | KEEP |
| 1095 / 1139 / 1758 | QRIS payment / Eid al-Adha / housing loan | id | pembayaran QRIS / Iduladha / KPR | 两读者 OK-ABBR | 30 行大写缩写主人项不变 |
