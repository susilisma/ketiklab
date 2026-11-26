# 释义修正 · 2026-11-27

样本：`random.seed(20261127)` 从 words.json 3879 行抽 320 行，另加昨日 KEEP ★ 8 行（490 / 765 / 1470 / 1934 / 3202 / 3339 / 3612 / 3709）、SPLIT 4 行（1508 / 1612 / 1882 / 3716）与 OWNER 4 行（921 / 1682 / 1822 / 3257），共 334 行（scratchpad G/sample.tsv，R2 读逆序 sample_rev.tsv）。

两位读者盲读（R1 正序、R2 逆序，互不见对方，不看仓库与先例）：R1 zh OK 303 / UNSURE 28 / WRONG 3，id OK 317 / UNSURE 16 / WRONG 1；R2 zh OK 317 / UNSURE 13 / WRONG 4，id OK 327 / UNSURE 7 / WRONG 0。并集 54 字段 / 46 行，18 字段两读者同标。VG 独立裁定（读全部先例 prec.out 867 行、vg-2026-11-25 / 26、各日 需要主人决定的事、ledger gloss-* / words-* 项；数据核对 vgcheck.py：伙伴行、pypinyin、词典词头、zh-renames 钉、整行重复、wordfreq）：**AGREE 6（zh 6 + id 0）· KEEP 32（12 ★）· OWNER 13 · SPLIT 3**。全表见 `reports/vg-2026-11-27.md`。主代理逐项复核 6 项后套用（G/apply.py：紧凑序列化往返字节断言 → 改字段 → 行内 pinyin 重算 → 退场首义钉入 zh-renames（词典词头豁免）→ zh-pinyin 增条并**继承退场首义的等级**（今日新规，见 9d41c85）→ 钉键不得为活首义 → 钉值须为现有 en 词头）。

提交 `7d2c448`（分支 claude/daily-2026-11-27）：6 行 6 字段改义（全部 zh）——

| i | en | before → after | 理由 | 置信 |
|---|---|---|---|---|
| 706 | manpower office | zh 劳工局 → 劳动局；劳工局 | 劳工局 为台港澳机构名；大陆 劳动局（正式 人社局）；全库 ketenagakerjaan 已用 劳动（#2053 劳动法、#2054 劳动合同） | 高 |
| 1171 | rotating savings club | zh 轮转互助会 → 互助会；标会；轮转互助会 | 轮转互助会 为自造复合词（09-15 扫描即判定义式）；arisan 的通行译法 互助会，标会 为民间说法 | 低（主人若更要 合会 可改） |
| 1470 | mixed rice | zh 杂饭 → 什锦饭；杂饭 | 杂饭 为马新华语（economy rice）；昨日 ★ 要求的收敛今日达成（R1 UNSURE = R2 WRONG 同领 什锦饭；10-23 另一读者亦提 什锦饭） | 高 |
| 1882 | neighborhood watch | zh 治安巡逻 → 邻里守望；社区联防；治安巡逻 | 治安巡逻 是巡逻活动而非 siskamling 体系；领首按「隔日异读者」规则（R2 11-26 + R1 今日；R2 今日列第二） | 中 |
| 2107 | unpaid leave | zh 无薪假 → 无薪休假；无薪假 | 无薪假 为台湾用语（彼处指雇主强制无薪假）；大陆 HR 用 无薪休假；两读者同值 | 中 |
| 2154 | store audit | zh 门店稽核 → 门店审计；门店检查；门店稽核 | 稽核 为台湾用法；全库 audit = 审计（#382、#664 审计追踪）；两读者同领同次义 | 高 |

机械处理：行内 pinyin 重算 2 行（2107 wú xīn xiū jià、2154 mén diàn shěn jì；706 / 1171 / 1470 / 1882 本无行内 pinyin 键，照 11-20 惯例不补）；无 id 改动，无 idSyllables 变化；zh-renames +6 钉（劳工局 / 轮转互助会 / 杂饭 / 治安巡逻 / 无薪假 / 门店稽核 → 各自 en；六者皆非 zh 词典词头），274 → 280，KEYS_FLAG v4.280；zh-pinyin.json +6（劳动局、互助会、什锦饭、邻里守望、无薪休假、门店审计，5106 → 5112；退场首义皆为 L4，新键亦 L4，无阶梯档位变化）。无新首义是现有钉键；无整行重复产生；无共享对产生。

另：同日 `9d41c85` data(pinyin) 把 31 个首义键的等级改为其所在行各义中最佳者（15 个为新键）——这是 E 发现的既往改义副作用（tired 疲惫 L2 → 累 L4 等 30 行从 认读 / 打拼音 / 选汉字 消失），非释义变化；详见日报「已修复」。

## KEEP ★（明日优先复读，12）

114 decision zh 决定 · 490 clinic hours zh 门诊时间（同一读者第 3 轮，点头即改）· 564 public consultation zh 公开征求意见 · 765 saucepan id panci（第 7 读，点头即改）· 1136 call to prayer zh 宣礼 · 1585 court zh 法院 · 1934 make zh 做（同一读者第 2 轮）· 1948 look for zh 找 · 2116 quantitative method zh 定量方法 · 2903 polymer zh 聚合物 · 3096 blender zh 搅拌机 · 3709 importance id arti penting（第三次两读者收敛，按既有规则扣留，点头即改）。

## OWNER（13）与 SPLIT（3）

见日报「需要主人决定的事」与 vg-2026-11-27.md 对应节。今日两读者新收敛而被既有主人项挡住的：547 village office zh 村公所；村委会；村办公室 + id kantor desa（各 5 读；10-27 村 / kelurahan 体系）、1752 x-ray X光（拉丁字母规则；汉字替代 爱克斯光）、1822 toll road 收费公路；高速公路（zh-renames 钉 收费公路 → toll 挡住）。

## 今日失效的旗标

1508 size SPLIT、3202 / 3339 / 3612 ★、3257 gout OWNER：两读者今日皆 OK · 1612 cuisine、3716 meal：SPLIT 降为单读者 KEEP · 1470 / 1882：以 AGREE 关闭 · 昨日 AGREE 行 2281 / 2336 / 3351 在样本内，两读者皆 OK（套用后核验）。
