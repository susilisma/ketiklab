# 释义修正 · 2026-11-26

样本：`random.seed(20261126)` 从 words.json 3879 行抽 320 行，另加昨日 KEEP ★ 14 行（490 / 559 / 796 / 974 / 1083 / 1513 / 1609 / 2260 / 2309 / 2708 / 2787 / 2879 / 3247 / 3612）与 SPLIT 4 行（765 / 2488 / 3348 / 3716；3348 已在随机样本内），共 337 行（scratchpad G/sample.tsv）。

两位读者盲读（R1 正序、R2 逆序，互不见对方）：R1 zh OK 318 / UNSURE 18 / WRONG 1，id OK 318 / UNSURE 19 / WRONG 0；R2 zh OK 321 / UNSURE 15 / WRONG 1，id OK 324 / UNSURE 12 / WRONG 1。并集 44 字段 / 42 行，23 字段两读者同标。VG 独立裁定（读全部先例 prec.out、昨日 vg 表与主人项）：**AGREE 16（zh 9 + id 7）· KEEP 19（8 ★）· OWNER 5 · SPLIT 4**。全表见 `reports/vg-2026-11-26.md`。主代理逐项复核 16 项后套用（G/apply.py：往返字节断言 → 改字段 → 行内 pinyin / idSyllables 重算 → 钉 / 词典豁免 → zh-pinyin 增条 → 钉键不得为活首义）。

提交 `2439a68`（分支 claude/daily-2026-11-26）：16 行 16 字段改义——

| i | en | before → after | 理由 |
|---|---|---|---|
| 586 | passport renewal | zh 护照续期 → 护照换发；护照更新；护照续期 | 续期 为港新用法；大陆官方 护照换发；两读者同值（indonesia B1） |
| 1363 | owe | zh 欠债 → 欠；欠债 | owe 泛指 欠；欠债 是「负债」窄义；首次两读者收敛（11-18 单读者 KEEP） |
| 2309 | cheese | zh 乳酪；奶酪；干酪 → 奶酪；芝士；乳酪 | 大陆标准词 奶酪，乳酪 为台港用法；连续两轮两读者同值，按「大陆标准词」规则套用昨日悬置项 |
| 2787 | liter | zh 公升；升 → 升；公升 | GB 3100 法定单位名 升；公升 台湾 / 旧用法；昨 ★ 今两读者 |
| 2844 | disagreement | zh 不一致；不协调；不和 → 分歧；意见不合；不一致 | 不一致 = inconsistency；意见分歧 才是 disagreement（study B1，id ketidaksepakatan）；R1 WRONG |
| 3173 | knitted | zh 编织；针织 → 针织；编织 | 编织 是动词，knitted 作定语 针织（R1 针织的 / R2 针织，按 11-15「缺 的 不算错」视同一首义）。**置信较低** |
| 3247 | pellet | zh 小球 → 颗粒；小球；弹丸 | 小球 含糊；饲料 / 燃料 / 弹粒 为 颗粒，弹丸 为射击义；昨 ★ |
| 3351 | luminosity | zh 亮度；光度；透光率 → 光度；亮度 | 物理 / 天文 luminosity = 光度，亮度 = brightness（study B2，id luminositas） |
| 3831 | flee | zh 奔逃；溃退；逃 → 逃跑；逃离；奔逃 | 奔逃 书面；日常词 逃跑；第二次两读者收敛（11-05 KEEP 推翻，同昨日 relaxed 的模式）；R2 WRONG |
| 1513 | lane | id jalur → lajur | KBBI 与 UU 22/2009：lajur 为车道，jalur 为路线 / 车行道；三轮单读者 KEEP 后首次两读者收敛（R2 WRONG）。**置信最低，主人可改回日常 jalur** |
| 1609 | hospitality | id keramahan → keramahtamahan | keramahan = 友善；KBBI keramahtamahan = 待客之道（en-plus 词典 10-12 已如此）；昨 ★ 今两读者 |
| 1791 | shelf share | id porsi rak → pangsa rak | share（市场份额义）全库用 pangsa（#620 pangsa pasar）；porsi 是份量，硬译 |
| 2530 | facial | id muka → wajah | 标准词 wajah（perawatan wajah、ekspresi wajah）；muka 口语 / 偏马来；与 #1987 face 共享 id（允许） |
| 3348 | idly | id bermalas-malasan → dengan malas | 该行为副词（zh 懒散地）；bermalas-malasan 是动词；昨 SPLIT 今收敛；全库 dengan + 形容词 副词惯例 |
| 3730 | routine | id rutin → rutinitas | 该行为名词（zh 常规；例行公事）；KBBI rutin 形容词、rutinitas 名词；11-05 单读者 KEEP |
| 3856 | adulthood | id kedewasaan → masa dewasa | kedewasaan 首读为 成熟；人生阶段 成年期 = masa dewasa；09-16 扫描亦如此 |

机械处理：行内 pinyin 重算 8 行（1363 qiàn、2309 nǎi lào、2787 shēng、2844 fēn qí、3173 zhēn zhī、3247 kē lì、3351 guāng dù、3831 táo pǎo；586 本无行内 pinyin 键，照 11-20 惯例不补）；idSyllables 重算 7 行（la·jur、ke·ra·mah·ta·ma·han、pang·sa rak、wa·jah、de·ngan ma·las、ru·ti·ni·tas、ma·sa de·wa·sa）；zh-renames +4 钉（护照续期 / 欠债 / 不一致 / 奔逃 → 各自 en），乳酪 / 公升 / 编织 / 小球 / 亮度 为 zh 词典词头不钉，270 → 274，KEYS_FLAG v4.274；zh-pinyin.json +9（护照换发、欠、奶酪、升、分歧、针织、颗粒、光度、逃跑，5082 → 5091）。无新首义是现有钉键；无整行重复产生。重复对点名（允许）：id wajah ↔ #1987 face。

另一数据提交 `7e2a8b4`（拼音声调，非释义）：脏的 zàng de → zāng de（daily A1 #154）、染发剂 rǎn fā jì → rǎn fà jì（zh-upper usphone + 映射）、妻子 qī zǐ → qī zi（daily A1 #131，等级 1）；钉入 scripts/pinyin-fixes.json。plain 音节不变，判分不受影响，仅认读 / 注音 / 词库卡 / Anki 显示。

## 未改（全文见 reports/vg-2026-11-26.md）

- **KEEP ★ 8（明日优先复读）**：490 clinic hours zh 门诊时间（同一读者第 2 轮）· 765 saucepan id panci（第 6 读，点头即改）· 1470 mixed rice zh（杂饭 为马新用法，VG 倾向 什锦饭；杂菜饭；杂饭）· 1934 make zh 做（daily A1）· 3202 binder id（活页夹 ≠ map；可试 ordner）· 3339 persevere zh 坚持（成语规则；与 #3798 insist 共享现已允许）· 3612 adulteration id pengoplosan（第 3 轮；KBBI 标 cak）· 3709 importance id arti penting（两读者 + 11-05 R2，点头即改）。
- **KEEP 11**：422 surat kredit berdokumen、1083 etalase、1799 逾期、1847 sebenarnya（= #1829 actually）、2070 执行差距、2212 pusat、3124 elementer、3164 masa pacaran、3189 感染、3716 zh 饭、3809 手稿——单读者或先例裁定。
- **OWNER 5**：765 saucepan zh 长柄锅（第 6 读；需 pinyin-fixes cháng）· 921 estimator kekar ganda（kukuh 家族，与 #918 / #724）· 1682 ojol（与 #1110 重复项；读者分歧 ojek daring / ojek online）· 1822 toll road 收费公路（被 zh-renames 钉 收费公路 → toll 挡住）· 3257 gout pirai（第 5–6 读，11-20 起悬置）。
- **SPLIT 4**：1508 size（大小 / 尺寸；VG 倾向 尺寸；大小；尺码）· 1612 cuisine（美食 / 菜系；VG 维持 菜肴）· 1882 neighborhood watch（社区治安联防 / 邻里守望；VG 倾向 邻里守望；社区联防；治安巡逻）· 3716 meal id（makanan / makan）。
- 今日失效的旧旗：1083 bagian depan toko（两读者皆未再给）；559 / 796 / 974 / 2260 / 2708 / 2879 在样本内两读者皆 OK。
