# 释义修正明细 · 2026-11-03（主人决定日 2026-11-02）

方法：主人 2026-11-02 决定「正确优先于唯一」。表一为历次因唯一性搁置、两位读者已一致的 34 处，由独立裁定者 VG 盲判（只见 live 与 proposed，不见理由）：34/34 APPLY。表二为 words.json 2800–3199 双盲读（R1 顺读 / R2 倒读）两人同标的行与往日分歧行，经 VG 盲判后「一位读者与 VG 同词」的 26 处。提交 ce0f9ba：60 处（zh 43 / id 17），39 个旧首义钉入 zh-renames.json（KEYS_FLAG v4.163 → v4.201（a1d516f 去掉被现首义遮蔽的 绩效考核 → appraisal 条目）），zh-pinyin.json 新增 5 条（认证、互动、无知、不安的、化妆）。

## 表一：唯一性搁置项（34）

| 行 | 词头 | 字段 | before → after | 同意者 | 理由 | 曾被占 |
|---|---|---|---|---|---|---|
| 122 | problem | zh | 难题 → 问题；难题 | R1+R2 (UNSURE, same word) + R5 WRONG 10-27 + VG | problem = 问题; 难题 is only the 'hard problem' sense (masalah) | #95 question 问题 |
| 267 | immigration | zh | 入境；移民；移居 → 移民；入境；移居 | R2 10-21 + R6 10-23; R1+R2 UNSURE + R5 WRONG 10-27 + VG | immigration = 移民; 入境 is entry (crossing the border) | #2599 immigrant 移民 |
| 550 | legalization | zh | 认证手续 → 认证 | R6 10-23 + R5 10-24 + VG | 认证手续 is a definition fragment ('certification procedures'); legalisasi of documents = 认证 | #2782 accreditation 认证 |
| 790 | urban village head | zh | 城市行政村长 → 村长；街道主任 | R6 10-23 + R5 10-24 村长; R4 10-27 村长；社区主任; R5 10-27 村长；街道主任 + VG | 城市行政村长 is a technical expansion, not a word; lurah = 村长 | #1146 village head 村长 |
| 823 | performance review | zh | 绩效评审 → 绩效考核；绩效评审 | R6 10-23 WRONG 绩效考核 + R5 10-24/10-28 UNSURE same word (R5 10-29 judged live OK) — weaker consensus, applied because the parent listed it explicitly + VG | 绩效考核 is the standard HR term; 绩效评审 is a calque | #1677 appraisal 绩效考核 (moved to 评估 in this batch) |
| 969 | retail selling price | zh | 零售售价；零售价 → 零售价；零售售价 | R1 + R5 10-28 + VG | 零售售价 is redundant; the word is 零售价 | #2087 retail price 零售价 (merge candidate) |
| 1407 | contamination | zh | 沾染；污染 → 污染；沾染 | R3 + R6 10-23 (R4 UNSURE same); R1 + R2 + R5 10-29 + VG | contamination = 污染; 沾染 is 'be tainted by' | #1394 pollution 污染 |
| 1411 | curriculum | zh | 课程体系；课程 → 课程；课程体系 | R1 + R2 (UNSURE, same word) + R5 WRONG 10-29 + VG | 课程体系 is a technical expansion; kurikulum = 课程 | #281 course 课程 |
| 1677 | appraisal | zh | 绩效考核 → 评估；绩效考核 | R2 + R5 10-25 + VG | appraisal (penilaian) = 评估; 绩效考核 is only performance appraisal | #317 evaluation 评估 |
| 1692 | ladder | id | tangga lipat → tangga | R1 + R2 10-24 (R5 10-30 judged tangga lipat acceptable) + VG | tangga lipat is a folding ladder only; KBBI tangga covers ladder | #646 stairs tangga |
| 1852 | it turns out | zh | 原来如此 → 原来；竟然；没想到 | R1 原来；没想到 + R2 原来；竟然 10-30 (R5 结果；原来；事实证明 — 原来 second) + VG | 原来如此 is the idiom 'I see'; ternyata = 原来 | #1830 apparently 原来 |
| 1982 | heart | id | hati → jantung | D + R4 10-21/23, R1 10-24, R5 10-26/27/28 + VG | hati is the liver / figurative heart; the anatomical heart (zh 心) is jantung | #2719 cardiac jantung |
| 2085 | suddenly happen | zh | 冷不防 → 突然；冷不防；突如其来 | R1 WRONG 突然；突如其来 + R2 UNSURE 突然；冷不防 10-31 (R5 忽然；突然；冷不防) + VG | 冷不防 is an idiom; mendadak = 突然 | #1574 suddenly 突然 |
| 2139 | because (colloquial) | zh | 因为嘛 → 因为；问题是 | R1 WRONG 因为；问题是 + R2 UNSURE 因为 10-31 (R5 毕竟；因为；主要是) + VG | 因为嘛 is not a word; soalnya = 因为 / 问题是 | #1917 because 因为 |
| 2366 | memorial | zh | 纪念馆；纪念碑 → 纪念碑；纪念馆 | R1 UNSURE 纪念碑；纪念馆 10-31; R5 纪念塔；纪念碑；纪念物 (R5 first differs: 纪念塔) — weaker consensus, applied because the parent listed it explicitly + VG | tugu peringatan is a memorial monument = 纪念碑, not a hall | #1606 monument 纪念碑 |
| 2370 | marry | zh | 娶；嫁；结婚 → 结婚；娶；嫁 | R3 + R4 10-24; R1 + R2 UNSURE same 10-31 (R5 成婚 first) + VG | 娶 is gender-specific (take a wife); marry = 结婚 | #1958 get married 结婚 |
| 2422 | interaction | zh | 相互作用 → 互动；相互作用；交流 | r1 + R5 11-01 + VG | interaksi (business) = 互动; 相互作用 is the physics sense | #3769 interact 互动 |
| 2458 | transaction | zh | 买卖；交易；生意 → 交易；买卖 | r1 + r2 + R5 11-01; R2 10-25 + R5 10-26 + VG | transaksi = 交易; 买卖 is trading | #3279 transact 交易 |
| 2498 | retain | id | menyimpan → mempertahankan | r1 + r2 + R5 11-01; R1 + R2 + R6 10-25 + R5 10-26 + VG | menyimpan = store/keep; retain (保持) = mempertahankan | #1371 maintain mempertahankan |
| 2551 | predict | zh | 预言；预料；预知 → 预测；预言；预料 | r1 + r2 + R5 11-01; R2 10-25 + R5 10-26 + VG | memprediksi = 预测; 预言 is prophesy | #384 forecast 预测 |
| 2572 | ignorance | zh | 愚昧；无知 → 无知；愚昧 | r1 + R5 11-01; R2 + R6 10-25 + R5 10-26 + VG | ignorance = 无知; 愚昧 is benightedness | #3796 ignorant 无知 |
| 2585 | rehabilitation | zh | 复原；康复 → 康复；复原；改造 | r1 康复；复原；改造 + R5 康复；修复；改造 11-01 (first sense agreed; r1's full value kept) + VG | rehabilitasi = 康复; 复原 is restoration | #413 recover 康复 |
| 2587 | robbery | zh | 抢劫案；抢劫 → 抢劫；抢劫案 | r1 + r2 + R5 11-01 + VG | 抢劫案 is 'a robbery case'; the word is 抢劫 | #2394 rob 抢劫 |
| 2600 | thermal | zh | 热；热量 → 热的；热力的；保暖的 | r1 + r2 + R5 11-01; VG-C 10-14 (ledger words-thermal-zh-first-sense-collides) + VG | thermal is an adjective; 热 is the noun/adjective 'heat/hot' and 热量 is a quantity | #151 hot 热的 |
| 2623 | absent | zh | 不在场；缺席 → 缺席；不在 | r1 缺席；不在 + R5 缺席；不在；缺席的 11-01 + VG | 不在场 is 'not at the scene'; absen = 缺席 | #2399 absence 缺席 |
| 2668 | moisture | id | kadar air → kelembapan | r1 + R5 11-01 + VG | kadar air = water content (a measurement); moisture = kelembapan (KBBI form, not kelembaban) | #3827 humidity kelembapan |
| 2671 | abusive | id | menghina → kasar | r2 + R5 11-01 + VG | menghina is the verb 'to insult'; abusive (adj) = kasar | #1288 rough kasar |
| 2870 | satisfactory | id | cukup baik → memuaskan | R3 + R4 10-25 (both UNSURE, same word) + VG | cukup baik is a phrase; satisfactory = memuaskan | #2635 satisfy memuaskan |
| 2875 | humiliation | id | aib → penghinaan | R3 + R4 10-25 (both UNSURE, same word) + VG | aib = disgrace/shame; humiliation = penghinaan | #2809 contempt penghinaan |
| 3271 | dissuade | id | membujuk agar tidak → mencegah | R1 + R2 UNSURE + R5 WRONG 10-26 + VG | membujuk agar tidak is a phrase; the closest KBBI verb is mencegah | #2255 prevent mencegah |
| 3463 | apprenticed | id | terikat → magang | R1 WRONG + R2 UNSURE + R5 WRONG 10-26 + VG | terikat = bound; apprenticed = magang | #1765 internship magang |
| 3854 | casualty | id | korban jiwa → korban | R4 UNSURE + R5 WRONG 10-26 + VG | korban jiwa is fatalities only; casualty = korban | #1580 victim korban |
| 3763 | grandma | zh | 外婆；外祖母 → 奶奶；外婆；祖母 | R4 UNSURE + R5 WRONG 10-26 + VG | 外婆 is the maternal grandmother only; grandma = 奶奶 | #1000 grandmother 奶奶 |
| 3609 | insubordinate | id | durhaka → membangkang | R5 10-26 + R5 10-27 + R5 10-28 (readers R3 + R4 proposed tidak patuh) — adjudicator-only consensus, applied because the parent listed it explicitly + VG | durhaka is 'treacherous/rebellious against God or parents'; insubordinate = membangkang | #3179 disobey membangkang |

## 表二：2800–3199 双读与往日分歧行（26）

| 行 | 词头 | 字段 | before → after | 同意者 | 理由 |
|---|---|---|---|---|---|
| 2837 | focal | id | fokus → fokal | R1+R2+VG | fokus is the noun; KBBI adjective is fokal |
| 2842 | congestion | id | penyumbatan → kemacetan | R1+R2+VG | penyumbatan is a pipe/vessel blockage; congestion (zh 拥塞) is kemacetan |
| 2926 | abdominal | id | abdomen → abdominal | R1+R2+VG | abdomen is the noun; KBBI adjective is abdominal |
| 2944 | mediocre | zh | 中等；二流；普通 → 平庸；二流；普通 | R1+R2+VG | 中等 means medium; mediocre is 平庸 |
| 2957 | synonymous | id | sinonim → bersinonim | R1+R2+VG | sinonim is the noun; synonymous (with) is bersinonim |
| 3010 | mast | id | tiang → tiang kapal | R1+R2+VG | tiang is any pole; mast is tiang kapal |
| 3010 | mast | zh | 桅；桅杆；船桅 → 桅杆；船桅；桅 | R1+R2+VG | 桅 is near-bound; the standalone word is 桅杆 |
| 3016 | vascular | id | pembuluh → vaskular | R1+R2+VG | pembuluh is the noun (vessel); KBBI adjective is vaskular |
| 3100 | flea | zh | 蚤；跳蚤 → 跳蚤；蚤 | R1+R2+VG | 蚤 is near-bound; the word is 跳蚤 |
| 3154 | frivolous | zh | 肤浅；轻佻；轻薄 → 轻浮；轻佻；无聊 | R1+R2+VG | 肤浅 means superficial; frivolous is 轻浮 |
| 3167 | nutty | id | kacang → berasa kacang | R1+VG (R2 beraroma kacang) | kacang is the noun; the adjective is berasa kacang |
| 3195 | hormonal | id | hormon → hormonal | R1+R2+VG | hormon is the noun; KBBI adjective is hormonal |
| 3021 | moth | zh | 蛾；衣蛾 → 飞蛾；蛾子；蛾 | R1+VG | 蛾 is near-bound, 衣蛾 narrow; the everyday word is 飞蛾 |
| 3008 | dew | zh | 露；露水 → 露水；露 | R2+VG | 露 alone is ambiguous (reveal); dew is 露水 |
| 2451 | continuous | zh | 不断；不间断；连续 → 连续；不断；不间断 | R5+VG (r1 连续的) | 不断 is adverbial; continuous is 连续 |
| 2525 | mild | id | lunak → lembut | R5+VG (r1+r2 ringan) | lunak is soft texture; mild matching zh 温和 is lembut |
| 2666 | troubled | zh | 困扰；不安；麻烦 → 不安的；烦恼的；陷入困境的 | r1+R5+VG | 困扰 is a verb and 麻烦 a noun; troubled is 不安的 |
| 2788 | looting | zh | 抢夺；洗劫 → 劫掠；洗劫；哄抢 | R5+VG (r2 洗劫 first) | 抢夺 is snatching; looting is 劫掠/洗劫 |
| 2130 | furthermore | id | lebih lanjut → lagi pula | R5+VG (R2 selanjutnya) | lebih lanjut means further/in more detail; furthermore is lagi pula |
| 2133 | urging particle | zh | 好不好 → 嘛；啦；呀 | R1+R2+VG (first sense) | 好不好 is a tag question; dong is 嘛 |
| 2134 | emphasis particle | zh | 就这样吧 → 吧；呗；啦 | R1+R2+VG (first sense) | 就这样吧 is a sentence; deh is 吧 |
| 2188 | what if | zh | 要是 → 要不；要是；万一 | R1+VG (first sense) | 要是 is plain if; what if (suggestion) is 要不 |
| 2291 | collected | zh | 已收集；收集的 → 收集的；已收集；集齐 | R1+VG | 已收集 is a verb fragment; collected is 收集的 |
| 2375 | makeup | zh | 化妆品 → 化妆；妆容；化妆品 | R1+VG | riasan is the applied makeup, 化妆品 is cosmetics |
| 2142 | pod | zh | 烟弹仓 → 烟弹；雾化仓；小烟 | R1+R2+VG (first sense) | 烟弹仓 is a fragment; vape pod is 烟弹 |
| 2024 | free | zh | 自由的；免费的 → 自由；免费 | R1+VG | id is bebas (liberty) so 自由 leads; 的 unnecessary |

## 未改（VG 判 live 可接受或无一致替换）

- 2818 tile id genting（zh 首义 瓦 与之对应；若改需 zh/id 同改 瓷砖 / ubin）；2876 meltdown id peleburan；3158 clutter zh 弄乱（id 为动词 mengacaukan）；3173 knitted id rajutan / zh 编织；2688 reproduce（zh 繁殖 与 id berkembang biak 同为生物义，一致）。
- 2175 regulatory capture id：VG 选 penangkapan regulasi（中等把握），G/R5 选 kooptasi regulator，无两方同词，留待第三位读者。
- 单方标记（无第二读者）：1993 message 消息、1396 conservation 保护、1433 upgrade meningkatkan；R1/R2 单方 UNSURE 的其余行见 scratchpad R1/R2 表（未抄录）。

## 建议合并（未做：删行会丢 `<lang>:trio:<en>` 进度键，需主人定）

1. #969 retail selling price（harga jual eceran · 零售价；零售售价）⇄ #2087 retail price（harga eceran · 零售价）：同一概念，zh 现已相同；建议删 #969 留 #2087。
2. #1110 online motorcycle taxi ⇄ #1682 online motorbike taxi：10-28 已列，主人项。
3. #3763 grandma（oma · 奶奶）与 #1000 grandmother（nenek · 奶奶）、#823 performance review 与 #1677 appraisal：可区分，保留。

## 备注

- 绩效考核 既是 zh-renames 键（→ appraisal）又是 #823 performance review 的现首义；planKeyMoves 先按现首义再按 renames，旧键 zh:绩效考核 归 performance review（V2 已验证，见报告）。
- 旧首义同时是中文词典词头的行：相互作用 / 愚昧 / 外婆（zh-plus）——zh:<旧义> 记录按词典豁免留在词典名下（昨日主人项 3）。
- 本次之后 words.json 含 28 个重复 zh 首义、13 个重复 id（均为有意，列于报告）。
