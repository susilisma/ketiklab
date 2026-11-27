# 释义修正 · 2026-11-28

样本：`random.seed(20261128)` 从 words.json 3879 行抽 320 行，另加昨日 KEEP ★ 12 行（114 / 490 / 564 / 765 / 1136 / 1585 / 1934 / 1948 / 2116 / 2903 / 3096 / 3709）与 SPLIT 3 行（1489 / 2888 / 3824），共 334 行（scratchpad G/sample.tsv，R2 读逆序 sample_rev.tsv）。

两位读者盲读（R1 正序、R2 逆序，互不见对方，不看仓库与先例）：R1 zh OK 321 / UNSURE 11 / WRONG 2，id OK 328 / UNSURE 4 / WRONG 2；R2 zh OK 321 / UNSURE 12 / WRONG 1，id OK 327 / UNSURE 5 / WRONG 2。并集 28 字段 / 27 行，11 字段两读者同标。VG 独立裁定（读全部先例 prec.out 17478 行、ledger gloss-* / words-* 项、11-24 ～ 11-27 的 需要主人决定的事；数据核对 vgcheck.py：伙伴行、pypinyin、词典词头、zh-renames 钉、整行重复、wordfreq）：**AGREE 6（zh 6 + id 0）· KEEP 14（7 ★）· OWNER 6 · SPLIT 2**。全表见 `reports/vg-2026-11-28.md`。主代理逐项复核 6 项后套用（G/apply.py：紧凑序列化往返字节断言 → 改字段 → 行内 pinyin 重算 → 退场首义钉入 zh-renames（词典词头豁免）→ zh-pinyin 增条并继承退场首义等级 → 钉键不得为活首义 → 钉值须为现有 en 词头）。

提交 `bedfbea`（分支 claude/daily-2026-11-28）：6 行 6 字段改义（全部 zh）——

| i | en | before → after | 理由 | 置信 |
|---|---|---|---|---|
| 114 | decision | zh 决策 → 决定；决策 | keputusan 是普通名词 决定；决策 是决策活动 / 政策决定；R1 11-27 + R2 11-28 同串（隔日异读者）；决定 与 #1968 decide 共享（允许） | 高 |
| 1458 | stimulus | zh 刺激措施 → 刺激；刺激措施 | id stimulus（KBBI rangsangan）为泛指；刺激措施 是经济学窄义短语；两读者同领首；10-31 仅被已废止的唯一性规则挡住；刺激 与 #2684 stimulation 共享 | 中 |
| 1585 | court | zh 法庭 → 法院；法庭 | pengadilan 是机构 法院（#2057 地方法院、#2103 劳资法院 同样处理）；法庭 是审判庭；R1 11-27 + R2 11-28 同串；法庭 为 zh-core 词头，不钉 | 中 |
| 2115 | qualitative method | zh 质性方法 → 定性方法；质性方法 | 大陆标准 定性（#395 定性的、#603 定性编码）；质性 为台湾来源，保留为次义；两读者同串；与 2116 同步 | 高 |
| 2116 | quantitative method | zh 量化方法 → 定量方法；量化方法 | 大陆标准 定量（#396 定量的）；量化 偏台湾；两读者同串 + R1 11-27 ★ | 高 |
| 2903 | polymer | zh 聚合体；聚合物 → 聚合物；聚合体 | 聚合物 为教科书 / 国标用词，聚合体 次要；两读者同领首 + R1 11-27 ★（R2 的 高分子 未加） | 高 |

机械处理：行内 pinyin 重算 4 行（1458 cì jī、2115 dìng xìng fāng fǎ、2116 dìng liàng fāng fǎ、2903 jù hé wù；114 / 1585 本无行内 pinyin 键，照 11-20 惯例不补）；无 id 改动，无 idSyllables 变化；zh-renames +5 钉（决策 / 刺激措施 / 质性方法 / 量化方法 / 聚合体 → 各自 en；法庭 为 zh-core 词头按豁免不钉），280 → 285，KEYS_FLAG v4.285；zh-pinyin.json +5（刺激、法院、定性方法、定量方法、聚合物，5112 → 5117；决定 已有 L1；新键继承退场首义等级，皆 L4，无档位变化）。**新增共享首义 2 对**（有意，正确性优先于唯一性）：决定（#114 decision ↔ #1968 decide，id 不同）、刺激（#1458 stimulus ↔ #2684 stimulation，id 不同）；dup_zh 42 → 44；无整行重复产生。

同日 `c2a0ca9` data(pinyin)：行李牌 xíng lǐ pái → xíng li pái、女朋友 nǚ péng yǒu → nǚ péng you（pinyin-fixes.json 钉入 + zh-pinyin.json 同步；与既有钉 行李 xíng li / 朋友 péng you 及已携带轻声的 行李箱 xíng li xiāng / 肚子痛 dù zi tòng 一致，《现代汉语词典》女朋友 nǚpéng·you、行李卷儿 xíng·lijuǎnr）——仅显示，判分比对去调形式不变。什么时候 shén me shí hòu（#1923）与 时候 shí hou 同类，仍在主人项 声调可商榷项 内未动。

## KEEP ★（明日优先复读，7）

3822 coupon zh 优惠券 · 389 vehicle registration zh 行驶证（家族 #868 / #909 需同动）· 1136 call to prayer zh 宣礼（同一读者第 2 轮，点头即改）· 2052 advance payment id uang muka（姊妹行 #779 jaminan uang muka；与 #415 deposit 共享）· 2174 street level bureaucracy zh（两读者同串 街头官僚；基层官僚，VG 因词头为体制且 街头官僚 为 #1893 首义扣留，建议主人 街头官僚制；街头官僚；基层官僚）· 2706 bomber zh（人义：炸弹袭击者，或 id 改 pesawat pengebom）· 3486 emitter zh（最小改 发射体；发射极）。

## OWNER（6）与 SPLIT（2）

OWNER：1877 PKWTT / 1814 APBD（大写集；两读者 WRONG 且展开式一致：perjanjian kerja waktu tidak tertentu / anggaran pendapatan dan belanja daerah，记录第 3 读）、759 t-test t检验（字符规则，第三次两读者收敛；zh-pinyin 已有 t检验 键）、2804 stelar（形容词词头风格组）、2149 facing（借词组，第 2 读）、3268 tukak（第 7 读）。SPLIT：1489 portion（VG 倾向 分量；份，第 2 轮）、2888 assortment zh（VG 改倾向 R2 花色品种；品类组合；各色物品，第 3 轮）。

## 今日失效的旗标

490 / 564 / 765 / 1934 / 1948 / 3096 / 3709 ★ 与 3824 SPLIT：两读者今日皆 OK，旗标失效（490 / 765 / 1934 / 3709 的「点头即改」提议不受影响）。114 / 1585 / 2116 / 2903 以 AGREE 关闭；1136 ★ 第 2 轮；1489 / 2888 SPLIT 续。
