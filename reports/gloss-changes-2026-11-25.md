# 释义修正 · 2026-11-25

样本：`random.seed(20261125)` 从 words.json 3879 行抽 320 行，另加昨日 KEEP ★ 17 行与 SPLIT 3 行（87 / 559 / 765 / 844 / 974 / 1120 / 1513 / 1609 / 2281 / 2336 / 2602 / 2916 / 3240 / 3475 / 3567 / 3841 / 2170 / 1083 / 1119；其中 5 行已在随机样本内），共 335 行（scratchpad/G/sample.tsv）。R1 正序、R2 逆序盲读（互不可见、不看项目文件与账本、不上网），VG 读全 union.tsv（80 字段）与 prec.out（73 词头在全部报告与账本中的先例）裁定，并以脚本核对共享值 / 拼音 / 音节；主代理复核 21 项后以 G/apply.py 套用（三文件往返字节相同已断言；pinyin / idSyllables 全库 0 不符；钉键不得为活首义通过），E check.py 复跑，V 实测迁移。

两位读者：R1 zh OK 304 / UNSURE 31 / WRONG 0，id OK 307 / UNSURE 28 / WRONG 0；R2 zh OK 307 / UNSURE 28 / WRONG 0，id OK 300 / UNSURE 35 / WRONG 0。**今日两读者皆无 WRONG**——所有旗都是语域 / 宽窄 / 术语形式。并集 80 字段 / 73 行，38 字段两读者同标。VG：AGREE 21（zh 13 + id 8）、KEEP 43（14 ★）、OWNER 12、SPLIT 4。AGREE 偏多是因为样本带了昨日 17 ★ 的复读：21 项中 10 项为 ★ 项今日得到第二读者、1 项为昨日 SPLIT 收敛。

提交 `571adcd`（分支 claude/daily-2026-11-25）：20 行 21 字段改义——

| i | en | before → after | 理由 |
|---|---|---|---|
| 38 | tired | zh 疲惫 → 累；疲倦；疲惫 | daily A1：累 是日常词，疲惫 偏重偏书面；两读者同首义 |
| 243 | rent | zh 租赁 → 租；租金；租赁 | indonesia A2（id sewa）：租 / 租金 为口语，租赁 是合同用语；两读者同首义 |
| 505 | business identification number | zh 商业识别号码 → 企业识别号；营业识别号 | NIB 中文材料作 企业识别号 / 营业识别号；原值逐字硬译（09-15 扫描亦旗）。**置信较低** |
| 1119 | chicken soto | zh 印尼鸡汤 → 鸡肉索托；印尼鸡汤 | 印尼鸡汤 是描述不是菜名（同 10-24 印尼炒饭 → 炒饭）；昨日 SPLIT（鸡肉索托 / 索托鸡汤）今日两读者收敛。**置信较低** |
| 1120 | rendang | zh 仁当牛肉 → 仁当；仁当牛肉 | rendang 不限牛肉；昨日 ★ 单读者，今日两读者同首义 |
| 2281 | user | zh 使用者；用户 → 用户；使用者 | daily A1：用户 为大陆日常标准词（09-15 扫描亦 用户）；昨日 ★ |
| 2356 | worker | zh 劳动者；劳工；工人 → 工人；劳动者；劳工 | daily A2（id pekerja）：工人 日常词，劳动者 法律语域 |
| 2602 | analyst | zh 分析员；分析家；分析师 → 分析师；分析员；分析家 | daily A2：分析师 现行通称；昨日 ★ |
| 2916 | waiter | zh 侍者；服务员 → 服务员；侍者 | daily B1：服务员 日常词，侍者 书面；第三轮（11-21 R2、11-24 R2 ★、今日 R1 = R2） |
| 3475 | jester | zh 小丑 → 弄臣；宫廷小丑；小丑 | jester 是宫廷弄臣，小丑 = clown（zh-plus 词典 小丑 → clown；10-15）；昨日 ★ |
| 3567 | inhabitant | zh 住户；居民 → 居民；住户 | id penduduk = 居民；住户 是户 / 住客；昨日 ★。首义与 #3727 resident 共享（11-02 起允许） |
| 3695 | excellent | zh 优异 → 优秀；极好；优异 | study A1：优秀 / 极好 为通用词，优异 窄（成绩优异）。首义与 #2334 outstanding 共享 |
| 3800 | relaxed | zh 悠闲 → 放松的；轻松；悠闲 | 11-05 R1 = R2 同值当时 KEEP（视为补充），今日两读者再给同值（四次读）；悠闲 = leisurely。**推翻旧 KEEP，置信较低** |
| 1466 | shadow puppet | id wayang → wayang kulit | wayang 是整个皮影 / 木偶传统（wayang golek、wayang orang）；皮影 = wayang kulit |
| 1975 | move house | id pindah → pindah rumah | 裸 pindah 泛指搬动 / 调动（pindah kerja）；搬家 = pindah rumah |
| 2336 | cabinet | id kabinet → lemari | 昨日 zh 已移到家具义（橱柜）；kabinet 首义是内阁；daily A2 家具 = lemari。与 #3874 cupboard 共享 id |
| 2504 | meaningful | id berarti → bermakna | berarti 首先读作动词「意为」；有意义的 = bermakna（en-plus 词典 10-12 已如此） |
| 3209 | starch | id kanji → pati | 淀粉（泛）= pati；kanji 专指木薯粉 / 浆衣粉 |
| 3240 | degeneration | id kemunduran → degenerasi | kemunduran = 衰退 / 倒退；生物学 退化（study B2）KBBI degenerasi；昨日 ★ |
| 3475 | jester | id badut → badut istana | badut = 小丑；昨日 ★ |
| 3841 | trader | id saudagar → pedagang | daily B1：saudagar 旧词 / 书面（wordfreq 3.37 vs 4.80）；昨日 ★。与 #2550 merchant 共享 id |

机械处理：行内 pinyin 重算 8 行（2281 yòng hù、2356 gōng rén、2602 fēn xī shī、2916 fú wù yuán、3475 nòng chén、3567 jū mín、3695 yōu xiù、3800 fàng sōng de；38 / 243 / 505 / 1119 / 1120 本无行内 pinyin 键，照 11-20 惯例不补）；idSyllables 重算 8 行（wa·yang ku·lit、pin·dah ru·mah、le·ma·ri、ber·mak·na、pa·ti、de·ge·ne·ra·si、ba·dut is·ta·na、pe·da·gang）。退役首义钉入 src/zh-renames.json 7 键（疲惫 → tired、租赁 → rent、商业识别号码 → business identification number、印尼鸡汤 → chicken soto、仁当牛肉 → rendang、优异 → excellent、悠闲 → relaxed）；使用者 / 劳动者 / 分析员 / 侍者 / 小丑 / 住户 为 zh 词典词头，按词典豁免不钉；263 → 270 键，KEYS_FLAG v4.263 → v4.270。zh-pinyin.json 增 12 条（累、租、企业识别号、鸡肉索托、仁当、工人、分析师、服务员、弄臣、居民、优秀、放松的，皆 level 4）5070 → 5082。

重复对点名（11-02 起允许，E dup 计数 20 → 22 / 40 → 42）：首义 居民 ↔ #3727 resident、优秀 ↔ #2334 outstanding；id lemari ↔ #3874 cupboard、pedagang ↔ #2550 merchant。次义共享：疲惫 ↔ #2958 exhaustion 次义、柜子 等照旧。

V 实测迁移（最终 dist，旧 flag v4.263）：zh:疲惫 / 租赁 / 商业识别号码 / 印尼鸡汤 / 仁当牛肉 / 优异 / 悠闲 → zh:trio:<en>（zh:疲惫 与既有 zh:trio:tired 合并 reps 3+3、lapses 1+1）；zh:使用者 / zh:住户 原样（词典词头）；错词本 zh:疲惫 / zh:悠闲 改名、zh:使用者 原样；收藏 zh:租赁 → trio:rent（文本 租）；flag v4.270。B s4_migrate 7 例全过（v4.260 → v4.270 再过一遍只动新钉；词典 500 时 flag 不写）。

## 未改（全文见 reports/vg-2026-11-25.md）

**KEEP ★（明日优先复读，14）**：490 clinic hours zh 门诊时间；559 data cleaning zh 数据清洗（第 3 轮）；796 instrumental variable id variabel instrumen（今日两读者 + 11-17 R1，VG 视为术语形式偏好——点头即改）；974 mop id alat pel（同读者第 3 轮）；1083 storefront id bagian depan toko（昨日 SPLIT 今日两读者收敛，VG 不认为 muka toko 错——点头即改）；1513 lane id lajur（3 读者 3 轮，VG 同意 11-15「精确度偏好」裁定）；1609 hospitality id keramahtamahan；2260 conversation zh 对话（两读者；会话 在语言学习语境标准——点头即改）；2309 cheese zh 奶酪（两读者；大陆 / 台湾变体属主人 09-16 / 11-22 未决问题——点头即改）；2708 lining id furing；2787 liter zh 升；2879 appropriation id alokasi anggaran（09-15 马来倾向扫描 + R2）；3247 pellet zh 颗粒；3612 adulteration id pengoplosan（两读者；VG 不能确认语域：oplos KBBI 标 cak、wordfreq 0.00——点头即改）。

**KEEP 无旗（29）**：单读者偏好或既有裁定（如 3144 submissive penurut 两读者同值但 10-12 词典裁定 patuh 领首；3695 id unggul 反转 11-05；2134 / 2954 受术语 / 成语规则所挡）。失效旗：844 kebaikan suai、765 id panci。注：3083 cannibalism 仍带成语 自相残杀 且在 business 类，今日两读者未收敛。

**OWNER（12）**：见日报「需要主人决定的事」。

**SPLIT（4）**：765 saucepan zh（炖锅 vs 小锅；主人待定 长柄锅）；2488 warrior id（prajurit vs kesatria）；3348 idly id（dengan bermalas-malasan vs dengan malas；11-15 已接受现值）；3716 meal id（makanan vs hidangan；09-17 santapan）。
