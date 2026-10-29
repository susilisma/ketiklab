# 释义修正 · 2026-10-30

方法：R1（顺读）/ R2（倒读）盲读 words.json 1600–1999（400 行，10-14 前的单读者行，今日第二轮）；R5 独立裁定者只看 live 值重读两位读者标出的 20 行。只改「R5 判 WRONG + 至少一位盲读者提出同一替换词（首义相同）+ id / 首义在 words.json 与队列中唯一 + 字符集合规」的行。

读者计数：R1 zh OK 395 / WRONG 1 / UNSURE 4，id 379 / 1 / 20（其中 11 行只是大写缩写格式）；R2 zh 393 / 2 / 5，id 384 / 0 / 16；R5（20 行）WRONG 13 / OK 7 / UNSURE 0。

提交 `ae95755`（分支 claude/daily-2026-10-30），8 个字段，4 个首义改名（zh-renames +4，KEYS_FLAG v4.131 → v4.135）；`2ca2d22` 为 4 个新首义补 zh-pinyin.json 阶梯条目（沿用旧义等级），旧键保留。

| 行 | 词头 | 字段 | before → after | 理由 |
|---|---|---|---|---|
| 1654 | solar | id | tenaga surya → surya | tenaga surya 是名词「太阳能」；本行是形容词 太阳能的（panel surya、energi surya）。R1 WRONG、R5 WRONG 同词 |
| 1850 | by the way | zh | 顺便说 → 顺便说一下；对了 | 顺便说 是截断片段；固定说法 顺便说一下。R1 UNSURE 同词、R5 WRONG |
| 1850 | by the way | id | ngomong-ngomong → omong-omong | KBBI 标 ngomong 为口语（cak）；标准副词 omong-omong。R1、R2 UNSURE 同词、R5 WRONG |
| 1919 | but | id | tapi → tetapi | KBBI：tapi 是 tetapi 的口语形式。R1 UNSURE 同词、R5 WRONG |
| 1780 | post-Ramadan gathering | id | halal bihalal → halalbihalal | KBBI 连写。R1 UNSURE 同词、R5 WRONG |
| 1980 | end | zh | 结束 → 结尾；末尾；结束 | 本行 id 为名词 akhir；结束 是动词。R1 UNSURE 同值、R5 WRONG 同值 |
| 1799 | past due | zh | 欠款逾期 → 逾期欠款；逾期未付；拖欠款 | 原值是小句不是词项；id tunggakan。R2 UNSURE 首义同、R5 WRONG |
| 1781 | mixed vegetable salad | zh | 印尼杂菜沙拉 → 加多加多；印尼杂菜沙拉 | 原首义是描述；gado-gado 的通行中文名 加多加多 置前，描述保留为次义。R2 UNSURE 同词、R5 WRONG |

pinyin：shùn biàn shuō yī xià；jié wěi；yú qī qiàn kuǎn；jiā duō jiā duō。idSyllables：sur·ya；o·mong-o·mong；te·ta·pi；ha·lal·bi·ha·lal。

迁移种子测试（/home/user/pwmain/migrate-test.cjs，最终 dist）：zh:顺便说（step 4 / reps 5 / lapses 1）+ zh:trio:by the way（reps 1）→ 合并 reps 6 / lapses 1；zh:结束 → zh:trio:end；错词本 zh:顺便说 / zh:欠款逾期 → zh:trio:by the way / zh:trio:past due；收藏 印尼杂菜沙拉 → trio:mixed vegetable salad；标志 v4.135；0 错误。
