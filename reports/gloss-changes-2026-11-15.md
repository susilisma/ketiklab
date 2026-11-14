# 释义修正 · 2026-11-15

样本：`random.seed(20261115)` 从 words.json 3879 行抽 320 行；R1 顺读、R2 倒读（互不可见、不看账本），VG 裁定（可见先例），V1 复核（独立第二意见 + 数据机械校验 + 迁移实测）。

两位读者各标 WRONG 3 / UNSURE 12 / OWNER-CAPS 1（R1）与 WRONG 4 / UNSURE 8 / OWNER-CAPS 1（R2），并集 23 行，重合 5 行（1881 / 1888 / 2876 / 3049 / 3348 / 3517 中两方都标的）。VG：AGREE 2、KEEP 13、OWNER 8、SPLIT 0。无马来语形、无错义；两行 WRONG 都是词性错位（副词词头配形容词首义、形容词词头配 令人+X 释义片段）。

## 已改（提交 a9adcfc）

| i | en | 字段 | 现值 → 新值 | 同意方 | 理由 |
|---|---|---|---|---|---|
| 3348 | idly | zh | 懒惰；懒散；懒洋洋 → 懒散地；无所事事地；懒洋洋地 | R1, R2, VG | Headword is an adverb; 懒惰 / 懒散 / 懒洋洋 are adjectives ('lazy'). Both readers gave the same three adverb senses (orders differed); VG confirmed R2's order (Oxford/Collins lead with 懒散地). id bermalas-malasan accepted by both readers and VG. 懒散地 reads lǎn sǎn de — the adverbial 地 is pinned in scripts/pinyin-fixes.json like 逐渐地 / 亲切地 / 零碎地 / 部分地 before it (pypinyin takes dì). No row shares the new value. |
| 3740 | painful | zh | 令人痛苦；痛苦 → 痛苦的；疼痛的；令人痛苦的 | R2, VG（R1 OK） | 令人痛苦 is the 令人 + X definitional pattern (ruled a definition fragment for exciting's 令人兴奋 on 10-31; flagged by the 09-15 scan). The adjective is 痛苦的 (= menyakitkan), 疼痛的 the physical sense, 令人痛苦的 kept third. 痛苦的 is no other row's value (bare 痛苦 is #2917 agony's first sense — a different string, no key collision). |

pinyin 已重算（lǎn sǎn de / tòng kǔ de）；懒惰、令人痛苦 钉入 src/zh-renames.json（KEYS_FLAG v4.229 → v4.231）；zh-pinyin.json 增 懒散地、痛苦的（默认等级 4）；懒惰、令人痛苦 都不是 zh-core/plus/upper 词头，不触发词典豁免。迁移实测（M/migrate.cjs，种 v4.229 + 错词 zh:懒惰 / zh:令人痛苦 + 收藏 懒惰 与 trio:painful 令人痛苦）：键变 v4.231，错词键变 zh:trio:idly / zh:trio:painful，收藏文本变 懒散地（普通话 · lǎn sǎn de）/ 痛苦的，0 错误。

## 未改（VG KEEP）

| i | en | 字段 | 现值 | 提议 | 提出方 | 理由 |
|---|---|---|---|---|---|---|
| 693 | ceiling fan | id | kipas langit-langit | kipas angin plafon | R1 | Prior KEEP 11-14 on the identical candidate; single UNSURE, no new reason. |
| 795 | difference-in-differences | id | perbedaan-dalam-perbedaan | perbedaan dalam perbedaan | R2 | Calque either way; hyphens permitted by the field rule; 10-27 three-way split; orthographic preference only. |
| 1117 | satay | zh | 沙爹烤串 | 沙爹；沙嗲 | R1 | 沙爹 alone usually means the sauce in mainland usage; 沙爹烤串 is a menu name, not a fragment. Single UNSURE, R2 OK. |
| 1513 | lane | id | jalur | lajur | R2 | lajur is the UU 22/2009 technical term; jalur is the everyday standard form and in KBBI. Precision preference. |
| 2163 | customs valuation | zh | 完税价格 | 海关估价；完税价格 | R1 | Prior KEEP 11-12; process-vs-value concern unchanged, zh/id consistent. |
| 2435 | outer | zh | 外部；外面；外层 | 外部的；外面的；外层的 | R1 | Rule: a missing 的 alone is not wrong (bare adjective forms are common in the file). |
| 2876 | meltdown | id | peleburan | pelelehan | R2（R1 UNSURE 无提议） | peleburan inti reaktor is attested; 11-03 left unchanged; no agreed replacement, neither reader WRONG. |
| 3049 | pertinent | zh / id | 中肯；恰当；有关 / berkaitan | relevan（R1 id）/ 相关的；有关的；中肯的（R2 zh） | R1, R2 | Readers flag different fields with different replacements; 中肯 is a standard dictionary rendering (Collins 相关的；中肯的) and 有关 is present; KBBI berkaitan = bersangkutan fits. Neither live value is an error. |
| 3061 | precedence | id | keutamaan | prioritas | R1 | Weak but in KBBI via utama ("mendapat keutamaan"); single UNSURE; 09-15 scan noted ms > id with no second reader. |
| 3276 | unearth | id | membongkar | menggali | R2 | KBBI membongkar "menyingkap (rahasia)" covers the figurative sense; menggali is literal only. Single UNSURE, R1 OK. |
| 3621 | alarmist | zh | 大惊小怪者；杞人忧天者 | 危言耸听者；… | R2 | Prior KEEP 11-12; both are 成语 + 者 constructions; single UNSURE, R1 OK. |
| 3756 | gentleman | id | pria terhormat | pria budiman | R2 | Prior KEEP 11-05 (R2 tuan); no single KBBI word, the new candidate is equally descriptive. |
| 3790 | glorious | id | mulia | gemilang | R2 | Prior KEEP 11-05 on the identical candidate; KBBI mulia = luhur, agung, terhormat. |
| 3820 | systematic | zh | 系统性；有系统 | 系统的；有系统的；系统性的 | R1 | Missing-的 rule; the live value was set deliberately on 09-16. |

## 需要主人决定（VG OWNER）

| i | en | 字段 | 现值 | 提议 | 说明 |
|---|---|---|---|---|---|
| 719 | p-value | zh | 概率值 | p值 | 账本 han-only-rule-blocks-p-value-t-test（10-21 起需主人）：唯一正确形 p值 被「仅汉字」规则挡住。 |
| 1881 | district minimum wage | id | UMK | upah minimum kabupaten/kota | 大写缩写组（words-id-values-with-capitals-and-digit）。 |
| 1888 | regulatory sandbox | id | regulatory sandbox | ruang uji coba terbatas（R2）/ 无（R1） | 09-23 起主人项；OJK/BI 沿用英文术语，两读者替换不一致。 |
| 2804 / 3024 / 3119 | stellar / galactic / oceanic | id | bintang / galaksi / lautan | —（R1 UNSURE 无提议） | 「形容词词头配印尼语名词定语」风格组（09-16 / 09-25），11-09 已 KEEP。 |
| 3517 | predilection | id | minat | kegemaran | 账本 11-04 边缘行、VG 11-11 / 11-13 KEEP；今日两读者首次一致收敛于 kegemaran（R2 WRONG、R1 UNSURE）——理由未变但收敛是新事实，请主人定。 |
