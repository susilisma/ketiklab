# 释义修正 · 2026-10-25（提交 d51be1d）

规则：查找者（或前一位读者）与独立盲读者两方都判错且替换词一致才改；words.json 印尼语与首义唯一；库行钉入 scripts/en-gloss-fixes.json；每个 words.json 改行重算 pinyin / idSyllables。

## words.json（9 字段）

| 行 | 词头 | 字段 | before → after | 判定 |
|---|---|---|---|---|
| 1677 | appraisal | id | penilaian kinerja → penilaian | R2 WRONG + R5 WRONG（zh 评估 被 #317 evaluation 占，见需要主人） |
| 1685 | martial art | zh / id | 印尼武术 → 武术 / pencak silat → seni bela diri | R2 + R5 |
| 1874 | subsidized lpg | id | gas melon → elpiji bersubsidi | R2 + R5（zh 补贴液化气 R5 WRONG / R1 R6 UNSURE，未改） |
| 1830 | apparently | id | ternyata → rupanya | R5 WRONG + R1 UNSURE 同词；与 1852 互换，唯一性要求一起改 |
| 1852 | it turns out | id | rupanya → ternyata | R1 WRONG + R5 WRONG |
| 2230 | multiple | id | berganda → ganda | R3 WRONG + R5 WRONG（R4 UNSURE 同词） |
| 787 | religious affairs office | zh | 宗教事务所 → 宗教事务办公室 | 10-24 R6 WRONG + 今日 R5 WRONG |
| 2615 | kindly | id | kiranya → dengan ramah | R1 WRONG + R6 WRONG（R2 UNSURE 同词） |

## 英语词库首义（18 行，均钉入 en-gloss-fixes.json）

| 库 | 词头 | before → after | 判定 |
|---|---|---|---|
| en-core | crew | 全体机务人员 → 船员 | D + R5 |
| en-core | mac | 橡皮布防水衣 → 雨衣 | D + R5 |
| en-core | replacement | 候补者 → 替代者 | R5 + R6 |
| en-plus | relate | 使发生联系 → 联系 | 10-24 R6 + R5 |
| en-plus | distinctive | 与众不同 → 独特 | R5 + R6 |
| en-upper | notified | 使注意 → 通知（通知 去重） | D + R5 |
| en-upper | aligned | 使结盟 → 对齐 | 10-24 R6 + R5 |
| en-upper | flipped | 用拇指翻书页 → 翻转 | D + R5 |
| en-upper | subscriber | 用户 → 订阅者（用户 删去） | 10-24 R6 + R5 |
| en-upper | stricken | 使苦恼 → 受灾的 | D + R5 |
| en-upper | spun | 使旋转 → 旋转 | D + R5 |
| en-upper | bypass | 环城高速公路 → 绕行道 | R5 + R6 |
| en-academic | interconnected | 使互相连接 → 相互关联 | D + R5 |
| en-academic | misled | 使入歧途 → 误导 | D + R5 |
| en-academic | launcher | 火箭发射装置 → 发射器 | D + R5 |
| en-academic | surrogate | 候补者 → 替代者 | 10-24 R6 + R5 |
| en-academic | intoxicated | 使陶醉 → 醉酒 | R5 + R6 |
| en-academic | emptied | 使空出 → 清空 | R5 + R6 |

## src/zh-renames.json（+5）

印尼武术 → martial art、宗教事务所 → religious affairs office（今日）；养老储蓄保障 → old-age security、印尼炒饭 → fried rice、模型拟合优度 → goodness of fit（10-24 改义时漏加）。KEYS_FLAG v4.113 → v4.118。
