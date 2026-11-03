# 释义修正明细 · 2026-11-04

方法：words.json 3200–3599 双盲读（R1 顺读 / R2 倒读，各 400 行 + 2175），另把 2175 regulatory capture 送第三位读者。两位读者共标 10 处（并集；两人同标 3 处）。独立裁定者 VG 只见 live 与 proposed（不见读者与理由）盲判：9 APPLY / 1 KEEP。按主人 2026-11-02 决定「正确优先于唯一」，读者与 VG 同词即改：提交 `13479d8` 共 **9 处**（id 6 / zh 3），3 个旧首义钉入 zh-renames.json（KEYS_FLAG v4.201 → v4.204），zh-pinyin.json 新增 3 条（使位于、凝结、提取器）。重复计数不变（zh 首义 28 / id 13）。

## 已改（9）

| 行 | 词头 | 字段 | before → after | 同意者 | 理由 |
|---|---|---|---|---|---|
| 2175 | regulatory capture | id | penangkapan regulator → kooptasi regulator | R1 + R2 + VG（+ 11-03 G/R5） | penangkapan 读作「逮捕监管者」；KBBI kooptasi 才是「被既得利益俘获」义 |
| 3238 | breezy | id | riang → berangin | R1 + R2 + VG | riang 是引申的「轻快」义；zh 首义 有微风的 与常用义都是「有风」 |
| 3346 | chewy | id | liat → kenyal | R1 + VG | liat 是「韧、硬」（贬义）；kenyal 才是食物「有嚼劲」，与 zh 有嚼劲 一致 |
| 3352 | sobering | id | serius → menyadarkan | R1 + VG | serius 只是「严肃」；sobering 是「令人清醒」，与 zh 令人清醒的 一致 |
| 3496 | chock | id | penahan → ganjal | R1 + VG | ganjal roda 即车轮楔；penahan 泛指「支撑物」 |
| 3538 | situate | zh | 位于 → 使位于；安置 | R2 + VG | situate 及物（id menempatkan）；位于 是「位于」不及物 |
| 3551 | toothy | id | menyeringai → bergigi | R2 + VG | menyeringai 是动词「龇牙笑」；toothy 是形容词，KBBI bergigi |
| 3555 | curdling | zh | 凝化；凝固；凝结 → 凝结；凝固 | R1 + R2 + VG（三方首义同为 凝结；取 R2 = VG 的全值） | 凝化 不是规范词 |
| 3576 | extractor | zh | 抽出器 → 提取器；抽取器 | R2 + VG（VG 另加 萃取器，取两方共有的最小值） | 抽出器 不是通行词；提取器 为标准译名 |

每行重生成 pinyin / idSyllables；位于 → situate、凝化 → curdling、抽出器 → extractor 钉入 zh-renames.json（三者都不是其他行的现首义）。

## 未改（1）

| 行 | 词头 | 字段 | live | 提议 | 裁定 |
|---|---|---|---|---|---|
| 3268 | ulcer | id | borok | tukak（R1） | VG KEEP：borok 是合法的 KBBI 对应（开放性疮）；tukak 更合医学义但 live 不算错 |

## 读者未标的边缘行（供下次参考）

3384 liberalize melonggarkan、3532 resettle menetap（缺「再」义）、3401 truffle jamur truffle、3379 rupiah 印尼卢比（vs 印尼盾）、3419 catwalk 伸展台（台湾用法）、3205 bolster 抱枕、3517 predilection minat、3598 calcareous kapur、3587 bilge lambung、3261 crowding kerumunan、3310 dynamo 直流发电机、3359 contemporaneous semasa、3525 stagnate terhenti、3543 gnarled berkerut-kerut、3552 coiling spiral、3566 anemic anemis。
