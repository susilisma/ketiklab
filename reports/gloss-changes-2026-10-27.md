# 释义修正 · 2026-10-27（提交 8542678）

words.json：
| 行 | 词头 | 字段 | before → after | 理由 |
|---|---|---|---|---|
| 307 | law | id | undang-undang → hukum | undang-undang 是法规/法案，law 的通称是 hukum（R1 R2 UNSURE hukum、R5 WRONG hukum） |
| 384 | forecast | id | perkiraan → prakiraan | perkiraan 是估计；KBBI/BMKG 的 forecast 是 prakiraan（R2、R5 同词） |
| 3676 | footlocker | zh | 扁平箱 → 床尾箱；行李箱 | 扁平箱 是扁的箱子；footlocker 是床尾的行李箱（10-26 R5 与 10-27 R5 同判 床尾箱） |

en-toefl 首项（钉入 scripts/en-gloss-fixes.json `en-toefl`）：irritate n. 刺激 → v. 激怒（D、R5）；dynamic n. 活力的 → adj. 动态的（D、R5）；allegedly adv. 涉嫌的 → adv. 据说（D、R5）；legitimate adj. 合理地… → adj. 合法的, 合理的, 正当的（D、R5 首义 合法的）；characteristic adj. 特点… → n. 特点, 特征 ‖ adj. 特有的（R7、R5）；notorious adj. 众所周知… → adj. 臭名昭著的, 声名狼藉的（R7、R5）；subduction n. 减去 → n. 俯冲 (地壳板块下沉) ‖ 潜没（三方首义 俯冲）；wakefulness n. 难以入睡 → n. 清醒（三方）；edge n. 边线 → n. 边缘（R7、R5），v. 给什么什么加边 → 给…加边（D、R7）。

src/zh-renames.json +1（扁平箱 → footlocker），KEYS_FLAG v4.124 → v4.125。
