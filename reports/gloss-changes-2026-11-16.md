# 释义修正 · 2026-11-16（补记于 11-17）

11-16 的维护运行把 8 行修正提交到分支 `claude/daily-2026-11-16`（提交 23f0c34，KEYS_FLAG v4.231 → v4.236），Build check #117 成功，但该运行在写报告前中断：未合入 main、无当日报告、账本未更新。本文件由 11-17 运行据提交说明补记；8 行在 11-17 由两位新读者（R1 顺读、R2 倒读，互不可见）与裁定者 VG 独立复核，全部确认正确且优于旧值，随 11-17 分支一起合入 main。

样本：`seed 20261116` 320 行双读 + 裁定（原始读者文件随 11-16 沙箱丢失）。

## 已改（提交 23f0c34）

| i | en | 字段 | 现值 → 新值 | 理由（11-16 提交说明） | 11-17 复核 |
|---|---|---|---|---|---|
| 502 | penalty | zh | 违约金 → 罚款；处罚；违约金 | 违约金 只是合同违约金一义；id 为 denda（罚款） | R1 R2 VG 一致确认（处罚 与 #3737 punishment 首义共享，practisedOnce 只练一次） |
| 947 | contribution payment | zh | 缴纳保费 → 缴费；保费缴纳 | 名词词头配了动词短语 | 一致确认（R2 注：保费缴纳 在 BPJS 语境可接受） |
| 2960 | overturned | zh | 翻过来 → 翻倒的；被推翻的；颠倒的 | 趋向动词，非分词 terbalik | 一致确认 |
| 3042 | startling | zh | 令人吃惊 → 惊人的；令人吃惊的；令人震惊的 | 令人+X 释义片段（同 exciting / painful 先例） | 一致确认 |
| 3344 | allusion | zh / id | 影射 → 暗指；典故；间接提及 / kiasan → alusi | 影射 是 insinuation，kiasan 是 metaphor；KBBI 有 alusi | 一致确认；暗指 与 #3442 allude 首义共享（刻意，正确优先于唯一）；VG 不建议改序，若主人不要短语可裁为 暗指；典故 |
| 2967 | anomaly | id | kelainan → anomali | kelainan 是医学「异常/疾患」义 | 一致确认 |
| 3061 | precedence | id | keutamaan → prioritas | keutamaan 是「美德/优越」义 | 一致确认（11-15 VG 曾因单读者 UNSURE 判 KEEP；11-16 两读者收敛后改，符合规则） |
| 3168 | perpetuate | id | melestarikan → melanggengkan | melestarikan 是「保护/保存」义 | 一致确认 |

机械处理（11-16）：触及行 pinyin / idSyllables 重算；退役首义 违约金 / 缴纳保费 / 翻过来 / 令人吃惊 / 影射 钉入 src/zh-renames.json（影射 同时是 zh-plus 词头，词典键按既有豁免保留）；zh-pinyin.json 增 罚款 / 缴费 / 翻倒的 / 惊人的（等级 4）。11-17 C 组迁移实测（种 v4.231 + 旧键错词 / 收藏 / SRS 行）：键变 v4.236、错词键与 SRS 行并入 zh:trio:penalty 等、zh:影射 词典键不动、0 错误（见 reports/2026-11-17.md）。
