# 释义修正 · 2026-10-31

方法：R1（顺读）/ R2（倒读）盲读 words.json 2000–2399（400 行）；R5 独立裁定者只看 live 值重读两位读者标出的 42 行（zh WRONG 24 / OK 17 / UNSURE 1；id WRONG 2 / OK 34 / UNSURE 5 / FORMAT 1）。只改「R5 判 WRONG + 至少一位读者提出同一首义（或读者首义被唯一性挡住而其次义即 R5 首义）+ 首义在 words.json 与队列中唯一 + 字符集合规」的行。提交 `9c08335`（13 个 zh 字段，13 个首义改名，KEYS_FLAG v4.135 → v4.148）+ `cb362ee`（文档 的 zh-pinyin 阶梯条目，沿用 文献记录 的等级 4）。

| 行 | 词头 | 字段 | before → after | 理由 |
|---|---|---|---|---|
| 2063 | documentation | zh | 文献记录 → 文档；文献；记录 | 文献记录 是临时拼合词；R1、R2 UNSURE 同首义，R5 WRONG |
| 2099 | flavour variant | zh | 口味款式 → 口味；风味 | 口味款式 不是搭配；R1 WRONG 同首义，R5 WRONG |
| 2130 | furthermore | zh | 进一步 → 再者；此外 | 进一步 是「further」；此外 被 #1824 moreover 占，R2 WRONG 此外；再者、R5 WRONG 再者；此外 |
| 2131 | you know (particle) | zh | 不是吗 → 吧；不是吗；对吧 | 原值是反问小句；R1 UNSURE 同首义，R5 WRONG |
| 2136 | complaint particle | zh | 怎么会 → 怎么；怎么会 | kok = 怎么；R1 UNSURE 同首义，R5 WRONG |
| 2138 | better (colloquial) | zh | 还不如 → 不如；还不如 | 带副词 还；R1、R2 UNSURE 同首义，R5 WRONG |
| 2140 | then (sequence) | zh | 然后呢 → 然后；接着 | 带语气词 呢；R1、R2 WRONG 同值，R5 WRONG 同值 |
| 2141 | so it becomes | zh | 结果就 → 结果；于是 | 带副词 就；R1 WRONG、R2 UNSURE 同首义，R5 WRONG |
| 2148 | burnt taste | zh | 糊芯 → 糊味；糊芯 | 糊芯 是烧焦的发热芯（原因），rasa gosong 是味道；R1、R2 UNSURE 同首义，R5 WRONG |
| 2201 | service delivery | zh | 公共服务供给 → 服务提供；公共服务供给 | 多加了 公共；R2 UNSURE 同首义，R5 WRONG |
| 2323 | exciting | zh | 令人兴奋；使人激动 → 精彩；令人兴奋 | 令人兴奋 是释义片段；刺激 被 #2684 stimulation 占，R1 UNSURE 刺激；精彩、R5 WRONG 精彩 |
| 2361 | kit | zh | 成套工具；工具包 → 套件；工具包 | 成套工具 是描述；R1 UNSURE 同首义，R5 WRONG |
| 2389 | extraordinary | zh | 了不起；显著；特别 → 非凡；特别；了不起 | 了不起 是口语赞叹；R1、R2 UNSURE 同首义，R5 WRONG |

13 个旧首义都不是 zh 词典词头，迁移会把 `zh:<旧义>` 全部改写为 `zh:trio:<en>`。
