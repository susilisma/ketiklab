# 释义候选 · 2026-09-25（未应用 / 待主人决定）

今日已应用（见 reports/2026-09-25.md「释义修正」）：words.json 23 行、indonesian.json 64 行、en-core.json 61 行（trans + idtrans + def，钉在 scripts/en-gloss-fixes.json）。以下为查找者提出、校验者不同意或不确定，或属体例/系统性、需主人定的项。

## A. words.json — 校验者不确定，保留

| 行 | en | 字段 | 现值 | 查找者提议 | 校验者意见 |
|---|---|---|---|---|---|
| 2175 | regulatory capture | id | penangkapan regulator | penangkapan regulasi | 不确定：两者都读作「逮捕」；文献分裂；若改，直接保留英文（同 1888 regulatory sandbox）更干净 |

## B. indonesian.json — 校验者不同意 / 不确定

| 行 | 词头 | 现值 | 提议 | 校验者意见 |
|---|---|---|---|---|
| 1134 | mui | 印尼伊斯兰教士理事会 | 印尼伊斯兰学者理事会 | 不同意：新华社等用「印尼伊斯兰教士理事会」，专名保留既定译法 |
| 2178 | wan | 晚上 | 朋友；伙伴 | 不确定：晚上 肯定错，但 wan=kawan 非 Kaskus 常见形；建议删除该行 |
| — | sejauh | 到目前为止 | — | sejauh 单独 = 「就…而言」，到目前为止 是 sejauh ini；可保留 |

## C. 体例组（主人定）

1. **37 行「（印尼人名）/；印尼人名」后缀**：anies→阿尼斯、ahy→阿古斯·尤多约诺、mahfud、pranowo、heru、ridwan、mulyani、sambo、koster、susi、megawati、erick、kamil、yohanies、thohir、uno、dira、kaesang、erika、adi、soekarno、bekasi、egianus、subianto、tangerang、benny、plumpang、hera、bima、andi、ferdy、trisambodo、wkwkw、banyuwangi、adam、cianjur、gio。今日已把 nanda/anggi/bambang/ganjar 改成译名；其余是否统一，请主人定。
2. **~120 行 di- 被动**：一半译「被…」一半译主动，仅体例；唯 2709 dikeluarkan 缺「发布/颁布」义。
3. **~45 个形容词词头两侧用名词**（dental/gigi/牙齿、cardiac/jantung/心脏、vaginal、retinal、uterine、metabolic、galactic、equatorial…）：印尼语名词作定语合法，中文可加「的」；今日只改了真正错义的 anal（直肠）。
4. **30 个大写缩写 id**（KPR、STNK、e-Samsat、KITAS/KITAP、NPWP、SIM、APBD、PKWT/PKWTT、UMP/UMK、BPJS Kesehatan、Pancasila、Idulfitri…）违反小写规则但不是释义错误。
5. 拼写一致性：2157 import licence vs 1864 license；3431 tranquillity；2120 delphi 小写；rupiah words.json 印尼卢比 vs indonesian.json 印尼盾。

## D. en-*.json / zh-*.json — 生成器的系统性问题（needs-owner）

- **义项选择**：生成器取词元第一个 WordNet synset，en-core 约 10% 行（≈250/2590）是罕见义；今日钉住 61 行（water、dog、song、sorry、training、entire、thus、kid、horse、cake、chicken、none、till、fifth、trip、flight、feed、shoes、arrest、ban、plate、incident、gang、graduate、appointment、heading、province、rolling、founder、formal、gross、bath、naked、swimming、rail、repair、steal、congratulations、translation、drove、reader、column、constitutional、shake、purple、discrimination、devil、window、spread、iron、flat、ray、developing、hang、delivery、singing、global、very、keep、company、wild）。**查找者另列 ~190 行同类**（years 年老、made 成功、still 不起泡、love 爱的对象、better 健康、group 化学族、mean 似乞丐、check 支票、future 将来时、market 副食商店、king 企业界大亨、policy 保险单、bank 岸、sound 资金充实的、felt 毛毡、august 贵族的、die 色子、capital 周转资产、double 特技替身演员、station 地位、ass、ministry 部办公楼、democracy 共和国、philosophy 人生观、operator 算子、conference 讨论会、investigate 深入研究…），en-plus/upper/academic 抽样同比例（anime→树脂、cope→压顶砖、hobby→木马、junk→中国式帆船、taxi→滑行、pupil→瞳孔、discourse→布道、cheque、itinerary→小径、napkin→尿布、tenderness→触痛…）。彻底修法：build-en-dicts.py 按词元频率选义 + 钉住列表（今日已建 scripts/en-gloss-fixes.json 机制，可继续往里加）。
- **zh-*.json**：`trans`（英文）同样取罕见义（应该→behoove、将军→check、保险→safety、悲剧→calamity、金钱→boodle/bread/cabbage、混凝土→cement、探索→grope、审判→hear/try、修士→monk 而 idtrans biksu…）。
- **idtrans 马来西亚拼写**（严格计数：zh-core 40/1200、zh-plus 18/1000、zh-upper 34/1013、en-core 75/2590、en-plus 30、en-upper 16、en-business 1、en-academic 26、en-toefl 22；校验者：matra、piawai、komidi、gros、kanak-kanak、muncung、kolese 其实在 KBBI 内，实际数略低）：ubat→obat、polis→polisi、wang→uang、rahsia→rahasia、kelab→klub、jiran→tetangga、tuala→handuk、amaran→peringatan、kemuncak→puncak、hujung→ujung、sijil→sertifikat、peratus→persen、kasut→sepatu、kecederaan→cedera、kemalangan→kecelakaan、syarikat→perusahaan、telefon→telepon、bilik→kamar、pejabat→kantor、bas→bus、doktor→dokter、oren→jeruk、sami→biksu、gincu→lipstik、takwim→kalender、sekak→skak、saintis→ilmuwan…（替换表需按义项核对：piawai 只在「标准」义换 standar，kawalan 按上下文 kendali/pengawasan）。
- **en-toefl** 另有 5 行残片类：male/narrative 尾随「自」、birth「[bɜrθ」、schedule「美  n.」、bronze 百科句、yawn/finch/pump 拟声注、desertificatio 截断——属已记账的「385 条截断定义」，等主人跑 Rebuild（build-toefl-dict.py 今日已加汉字/加号过滤）。

## E. 沿用往日未决

09-24：street level bureaucracy、flat tire、berinisial、dirinya/keluarganya（校验者认为现值成立）；headphones id、power bank、planogram、grounded theory、regulatory sandbox、pod、walrus、senna（无 KBBI 形，保留英文）。09-21 A–C、E 与 09-23 A–B 中今日已应用：invulnerable、obvious、beloved、appeasement、marmot、kkb、kombes、irjen、psi、nan、liwet、soto、oknum、jengkol、yogyakarta、wild；其余同上。
