# 释义修正 · 2026-11-14

样本：`random.seed(20261114)` 从 words.json 3879 行抽 320 行；R1 顺读、R2 倒读（互不可见、不看账本），VG 裁定（可见先例），V2 复核（独立第二意见 + 数据机械校验 + 迁移实测）。

两位读者各标 WRONG 3 / UNSURE 4（R1）与 WRONG 3 / UNSURE 13（R2），并集 15 行，重合 7 行（1792 / 3062 / 1862 / 1144 / 1203 / 1682 / 1880）。VG：CHANGE 1、KEEP 8、OWNER 7。两读者标 WRONG 的 3 行（1862 / 1880 / 1203）全是大写缩写（主人项 words-id-values-with-capitals-and-digit），无马来语形、无错义、无定义片段首义。

## 已改（提交 e0786fd）

| i | en | 字段 | 现值 → 新值 | 同意方 | 理由 |
|---|---|---|---|---|---|
| 3062 | smoky | zh | 冒烟 → 烟雾弥漫的；冒烟的；烟熏味的 | R1, R2, VG | Headword is an adjective; 冒烟 is the verb 'emit smoke'. Both readers give 烟雾弥漫的 as first sense; words.json glosses descriptive adjectives with 的 (foggy 有雾的, noisy 吵闹的, starry 布满星星的；星光灿烂的); en-academic smoky was already changed 冒烟 → 烟雾弥漫的；冒烟的 on 10-12. Later senses: 冒烟的 (precedent) + 烟熏味的 (R2, smoky flavour). No row shares the new value. |

pinyin 已重算（yān wù mí màn de）；冒烟 钉入 src/zh-renames.json（KEYS_FLAG v4.228 → v4.229）；zh-pinyin.json 增 烟雾弥漫的（默认等级 4）。V2 复核结论见当日报告。

## 未改（VG KEEP）

| i | en | 字段 | 现值 | 提议 | 提出方 | 理由 |
|---|---|---|---|---|---|---|
| 693 | ceiling fan | id | kipas langit-langit | kipas angin plafon（R2） | R2 | Single reader UNSURE; precedent 10-27/10-28: R4 kipas angin gantung vs R5 kipas angin plafon, both UNSURE, filed without change. KBBI has kipas, langit-langit and plafon; kipas langit-langit is transparent and used in retail listings, a different acceptable form rather than an error, and the three proposals still disagree. |
| 2674 | sovereignty | zh | 主权；独立国；独立自主 | 主权；独立自主（R2） | R2 | First sense 主权 correct (zh-core 主权 = sovereignty, 10-14). Later senses change only if clearly wrong: 独立国 is the countable/rare sense 'a sovereign state' that EN-ZH dictionaries list for sovereignty (主权；独立自主；独立国), so it is marginal, not wrong (11-09 liquefy 溶解 / 11-13 emerald 翡翠 precedent). |
| 3520 | womanly | zh | 女性化；有女子气质 | 有女人味的；女性的（R2） | R2 | Single reader UNSURE. 女性化(的) is among the dictionary renderings of womanly (女性的；女性化的；有女人味的) and matches id feminin (KBBI: bersifat kewanitaan); bare forms without 的 are common in the file (happy 开心, dizzy 头晕). 有女人味的 is an improvement in nuance, not a correction. |
| 1817 | hamlet | zh | 自然村 | 小村庄；自然村（R2） | R2 | Single reader UNSURE. 自然村 is a 现汉 headword (自然形成的村落, as opposed to 行政村), a word not a definition fragment, and it matches id dusun (a sub-unit of a desa #227 村庄) better than generic 小村庄. Not wrong. |
| 1517 | flat tire | zh | 轮胎没气 | 瘪胎（R2） | R2 | Prior KEEP: gloss-candidates-2026-09-24 (verifier: 轮胎没气 is the idiomatic colloquial expression, 瘪胎 is trade jargon not a 现汉 headword), 10-23 readers split 瘪胎/轮胎漏气/爆胎, 10-29 R5 UNSURE. R2 brings no new argument, and 爆胎 (blowout) would be wrong for id ban kempis. |
| 1794 | stock rotation | id | perputaran stok | rotasi stok（R2） | R2 | Single reader UNSURE. Stock rotation is used in trade English both for FIFO rotation and for how fast stock turns ('stock rotation of 30 days'); the row sits in the sell-in/sell-out distribution block and #576 inventory turnover takes the -rate form perputaran persediaan / 库存周转率, so the turnover reading is the intended one. Not clearly wrong; a finder+verifier pair would be needed for the FIFO re-gloss. |
| 1794 | stock rotation | zh | 库存周转 | 库存轮换（R2） | R2 | Same as the id field: 库存周转 is the turnover reading the row is built on (#576 库存周转率); 库存轮换 would be a different sense of an ambiguous headword, single reader UNSURE, no verifier. |
| 1192 | rule of law | id | negara hukum | supremasi hukum（R2） | R2 | Prior KEEP: 10-28 R5 UNSURE, 10-29 R5 OK (closed). negara hukum is the constitutional term (UUD 1945 Art. 1(3)) and the standard Indonesian rendering of rule of law / Rechtsstaat, matching zh 法治；法治国家; supremasi hukum is an alternative, not a correction. R2 brings no new argument. |

## 需要主人决定（VG OWNER）

| i | en | 字段 | 现值 | 提议 | 说明 |
|---|---|---|---|---|---|
| 1792 | sell-in | zh | 一级出货 | 渠道出货（R1=R2） | Precedent: gloss-candidates-2026-10-30 (deferred, R1 渠道进货 vs R5 渠道出货) and gloss-changes-2026-11-09 (主人领域项 按实务保留). New fact for the owner: R1, R2 today and R5 on 10-30 all give 渠道出货 as first sense, so a replacement is ready if the owner releases the item; 一级出货 is attested FMCG jargon, not clearly wrong. |
| 1682 | online motorbike taxi | id | ojol | ojek daring（R1=R2） | Ledger words-online-motorbike-taxi-duplicate-rows (needs-owner): #1110 online motorcycle taxi already is ojek daring / 网约摩的; whether 1682 is merged, deleted or re-glossed is the owner's call. Both readers again propose ojek daring (sharing is allowed), noted for the owner. |
| 1862 | periodic tax return | id | SPT masa | surat pemberitahuan masa（R1=R2） | Member of the 30-row capitals/digits group (ledger words-id-values-with-capitals-and-digit, also id-acronym-glosses-1600-1999): keep acronym vs change rule is an open owner decision. Both readers WRONG with identical expansion surat pemberitahuan masa, recorded for the owner. |
| 1880 | provincial minimum wage | id | UMP | upah minimum provinsi（R1=R2） | Capitals group (ledger words-id-values-with-capitals-and-digit / id-acronym-glosses-1600-1999). Both readers WRONG with identical expansion upah minimum provinsi (consistent with #1068 upah minimum), recorded for the owner. |
| 1203 | fuel subsidy | id | subsidi BBM | subsidi bahan bakar minyak（R1） / subsidi bahan bakar（R2） | Capitals group (ledger words-id-values-with-capitals-and-digit). Readers conflict on the expansion: R1 subsidi bahan bakar minyak (full BBM expansion) vs R2 subsidi bahan bakar; if the owner expands, the full form matches BBM and #241 fuel bahan bakar. |
| 1144 | Independence Day | id | Hari Kemerdekaan | hari kemerdekaan（R1=R2） | Capitals group (ledger words-id-values-with-capitals-and-digit); proper-noun capitals like Idulfitri / Pancasila / Merah Putih. Both readers UNSURE hari kemerdekaan, same form, recorded for the owner. |
| 791 | neighborhood association letter | id | surat pengantar RT | surat pengantar rukun tetangga（R2） | Capitals group; already marked 大写 RT 为主人项 in gloss-candidates-2026-10-27 (R3/R4/R5 surat pengantar rukun tetangga). R2 UNSURE repeats that expansion, no new argument; everyday form is RT. |
