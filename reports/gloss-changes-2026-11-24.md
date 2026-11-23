# 释义修正 · 2026-11-24

样本：`random.seed(20261124)` 从 words.json 3879 行抽 320 行，另加昨日带旗 / 待复读 8 行（699 indemnity / 824 authorized signatory / 1869 trade promotion / 3877 cuddle / 765 saucepan / 3576 extractor / 3748 frequent / 2164 under-invoicing），共 328 行（scratchpad/G/sample.tsv）；R1 正序、R2 逆序盲读（互不可见、不看项目文件与账本、不上网），VG 裁定（读全 union.tsv 与 prec.out——60 个旗字段的词头在全部 gloss-*.md 与账本中的先例——并以脚本核对共享 / 拼音 / 音节 / wordfreq），主代理以 G/apply.py 套用（三文件往返字节相同已断言），E check.py 复跑拼音 / 音节 0 不符，V1 独立复验迁移与渲染。

两位读者：R1 zh OK 306 / UNSURE 20 / WRONG 2（2336 cabinet、1869 trade promotion），id OK 309 / UNSURE 19 / WRONG 0；R2 zh OK 305 / UNSURE 22 / WRONG 1（2336 cabinet），id OK 309 / UNSURE 19 / WRONG 0。并集 60 字段 / 57 行，23 字段两读者同标。VG：AGREE 13（zh 8 + id 5）、KEEP 32（17 ★）、OWNER 12、SPLIT 3。

提交 `799042a`（分支 claude/daily-2026-11-24）：12 行 13 字段改义——

| i | en | before → after | 理由 |
|---|---|---|---|
| 2336 | cabinet | zh 内阁；橱柜 → 橱柜；柜子；内阁 | daily A2 行教的是家具，不是政府内阁；两读者皆 WRONG 且值相同；en-core cabinet [壁橱, 橱柜]。本轮置信最高 |
| 1962 | lose something | zh 失去 → 丢失；失去；丢 | 丢东西（id kehilangan）是具体丢失；两读者同首义同三义；en-core lose 领首 丢失 |
| 2188 | what if | zh 要不；要是；万一 → 要是；万一；要不 | 要不 是「要不然 / 不如」；两读者同首义 要是；R1 的 如果……呢 含省略号不合字符规则，故次义取 R2 的原三义重排 |
| 1597 | bias (study) | zh 偏见 → 偏差；偏见 | study B2 统计语域（#916 遗漏变量偏差 已用 偏差）；偏见 = prejudice；两读者同首义 |
| 699 | indemnity | zh 赔偿责任 → 赔偿；赔偿保证；赔偿责任 | 第四轮：R1 11-21/22/23 连续三轮单旗 ★，今日 R2 收敛于同首义 赔偿；赔偿责任 是赔偿的责任（另一概念）；R2 的 补偿 为 #2396 compensation 首义，弃 |
| 3877 | cuddle | zh 偎依；偎抱 → 搂抱；依偎；拥抱 | R1 = R2 值完全相同，且与 11-05 R1 相同；偎依 为书面语；结束 11-22 起的 SPLIT ★；拥抱（次义）与 #1256 hug 首义共享（次义共享允许） |
| 2836 | fixture | zh 固定物 → 固定装置；固定物 | 固定物 是 en-upper 的拷贝式生造；两读者同首义 |
| 3631 | slither | zh 滑行；蜿蜒爬行 → 蜿蜒爬行；滑行 | 滑行 = glide / 滑行（飞机）；两读者同首义，现行两义互换 |
| 3363 | frenzied | id kalut → kalap | kalut = 慌乱、混乱；kalap = 失控狂乱，与 zh 狂乱 一致；第三次读皆给 kalap（推翻 11-09 单读者 KEEP） |
| 3431 | tranquillity | id kedamaian → ketenangan | kedamaian = peace；两读者相同 |
| 3555 | curdling | id pembekuan → penggumpalan | pembekuan = freezing / 凝固；两读者相同。**本轮置信最低**（pembekuan 与 zh 凝固 尚可对应；penggumpalan wordfreq 0.00 为派生词缺口）——主人若不认可，回退即可 |
| 3594 | resuscitate | id menghidupkan → menghidupkan kembali | 裸 menghidupkan = 开机 / 点亮；两读者相同（推翻 11-12 单读者「偏好」KEEP） |
| 3631 | slither | id merayap → melata | melata 专指爬行动物蜿蜒而行，与 zh 首义一致；两读者相同 |

机械处理：行内 pinyin 重算 5 行（2188 yào bù → yào shì、2336 nèi gé → chú guì、2836 gù dìng wù → gù dìng zhuāng zhì、3631 huá xíng → wān yán pá xíng、3877 wēi yī → lǒu bào；699 / 1597 / 1962 本无行内 pinyin 键，照 11-20 惯例不补）；idSyllables 重算 5 行（ka·lap、ke·te·na·ngan、peng·gum·pa·lan、meng·hi·dup·kan kem·ba·li、me·la·ta）。退役首义钉入 src/zh-renames.json 5 键（赔偿责任 → indemnity、要不 → what if、固定物 → fixture、滑行 → slither、偎依 → cuddle）；偏见 / 失去 / 内阁 为 zh-core 词头，按词典豁免不钉。**另删 2 旧键**：橱柜 → cabinet、要是 → what if——两值今日重新成为同一词的首义，迁移循环按活首义解析，钉键若留会违反「钉键不得为活首义」的不变量（E check.py 首跑 FAIL 后发现）；260 → 263 键，KEYS_FLAG v4.260 → v4.263。zh-pinyin.json 增 7 条（赔偿、偏差、要是、橱柜、固定装置、蜿蜒爬行、搂抱，皆 level 4；丢失 已有）5063 → 5070；退役首义 赔偿责任 / 偏见 / 失去 / 内阁 仍为次义，无新孤键。

重复对点名：无新增首义 / id 共享对。次义共享：赔偿 ↔ #2396 compensation 次义；柜子 ↔ #3874 cupboard 次义；拥抱（cuddle 次义）↔ #1256 hug 首义；依偎 为 zh-upper 词头；丢失 为 zh-plus 词头。

V1 实测迁移（dist2，旧库 v1 + ketiklab-keys v4.260）：zh:赔偿责任 / zh:要不 / zh:固定物 / zh:滑行 / zh:偎依 → zh:trio:<en>；zh:橱柜 与既有 zh:trio:cabinet 合并（reps 2+2）、zh:要是 与 zh:要不 合并到 zh:trio:what if；zh:偏见 / zh:失去 原样；错词本四键改名；flag v4.263。

## 未改（摘自 VG.md，全文见 scratchpad 已失，要点如下）

**KEEP ★（下轮优先复读，17）**：87 closed zh（两读者同领首 关门，形式上达 AGREE，因 11-17 #86 开 / #87 关闭 标牌对的风格裁定而扣留——点头即改 关门；关闭，钉 关闭 → closed）；559 data cleaning zh 数据清洗；765 saucepan id panci（第 5 次读）；844 goodness of fit id kebaikan suai；974 mop id alat pel（同读者第二轮）；1120 rendang zh 仁当；1513 lane id lajur；1609 hospitality id keramahtamahan（en-plus 词典同）；2281 user zh 用户 领首；2336 cabinet id lemari（= #3874 cupboard id）；2602 analyst zh 分析师 领首；2916 waiter zh 服务员 领首（同读者第二轮）；3240 degeneration id degenerasi；3475 jester id badut istana / zh 弄臣；3567 inhabitant zh 居民（= #3727 resident 首义）；3841 trader id pedagang（= #2550 merchant id）。
**KEEP 无旗（15）**：817、1321、1383、1448（sedentari 借词）、1894、2117、2376、3126、3365、3407、3482（senna 既定）、3600、3624、3780、3823。824 authorized signatory 今日两读者皆 OK，旗按规则失效。

**OWNER（12）**：见日报「需要主人决定的事」。

**SPLIT（3）**：2170 employment insurance scheme zh（劳工保障 vs 劳工社会保障，皆保留 就业保险 次义）；1083 storefront id（bagian depan toko vs etalase toko，皆判 muka toko 非固定搭配）；1119 chicken soto zh（鸡肉索托 vs 索托鸡汤，皆要音译 索托、保留 印尼鸡汤 次义）。
