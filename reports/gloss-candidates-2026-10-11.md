# 释义候选（2026-10-11 结转）

只有一方确定、两方措辞不同、或两方都未确定的条目；下次派查找者 + 校验者再判。规则同主人决定：两方独立同意才改。VG 的独立笔记在当日 scratchpad（audit/VG/independent-notes.txt），仅当日有效；本文件自含。

## A. VG（今日校验者）对 10-10 候选的保留行（held.json，`before` 为 cf5624b 当前值）

HELD-AGREE = VG 的值与提议相同，但查找者当时不确定或两方分歧，按「任一方不确定不改」保留，明日查找者确认即可应用；AGREE-WITH-WORDING = 同义但 VG 坚持另一写法，明日查找者二选一。

| library | headword | field | before | VG after | verdict | note |
|---|---|---|---|---|---|---|
| en-upper | casualty | idtrans | korban, mangsa | korban | HELD-AGREE | my value is korban too, but the finder marked this row unsure (and the ledger has it unsure since 09-21) — any-party-unsure rule holds it; today's finder must c |
| en-upper | upheld | trans | 保持、维持 | 维护（uphold 过去式）、支持 | AGREE-WITH-WORDING | house style marks inflected headwords: snapped → 折断（snap 过去式）, flown, barrels, years |
| en-upper | cologne | idtrans | kolong, pewangi | kolonye, minyak wangi | AGREE-WITH-WORDING | "cologne" is the English spelling; KBBI has the loan as kolonye |
| en-upper | commute | idtrans | berulang-alik, mengubah | pulang pergi, bepergian pulang pergi | AGREE-WITH-WORDING | KBBI writes pulang pergi without hyphen; komuter is KBBI, berkomuter is not |
| en-upper | hazel | idtrans | perang | cokelat muda, cokelat kekuningan | AGREE-WITH-WORDING | "hazel" is not a KBBI lemma and adds nothing in Indonesian |
| en-upper | outlaw | idtrans | gajul, penjahat | penjahat, buronan | AGREE-WITH-WORDING | orang buangan = exile/banished person; outlaw at large = buronan |
| words | thermal | zh | 热；热量 | 热力的；热的 | HELD-AGREE | my value identical; both D and VD unsure → held. before 热 ≠ file 热；热量. 热的 as first sense would collide with hot; rè lì de |
| words | juridical | zh | 司法上；法院；裁判上 | 法律上的；司法的 | HELD-AGREE | my value identical; D unsure → held. before 法律 ≠ file 司法上；法院；裁判上; fǎ lǜ shàng de |
| words | horizontal | zh | 横；横向；水平 | 水平的；横向的 | HELD-AGREE | D unsure → held; before 水平 ≠ file 横；横向；水平; I would keep 横向的 as second sense |
| words | supportive | zh | 支持；支援 | 支持的；支援的 | HELD-AGREE | D unsure → held; before 支持 ≠ file 支持；支援 |
| words | tensile | zh | 抗拉；拉伸 | 拉伸的；抗拉的 | HELD-AGREE | D unsure → held; before 拉伸 ≠ file 抗拉；拉伸; id tegangan (= tension, noun) deserves its own candidate |
| words | traditional | zh | 传统；惯例 | 传统的 | HELD-AGREE | D unsure → held; before 传统 ≠ file 传统；惯例 |
| words | binary | zh | 二进制 | 二进制的；二元的 | HELD-AGREE | I agree with VD (adjective use dominates; èr jìn zhì de) but D says keep → parties split, not applied; before matches file |
| words | ratio | id | perbandingan | rasio | HELD-AGREE | my value rasio (KBBI); VD rasio; D rasio but unsure → held for today's finder; before matches file; idSyllables must become ra·sio |
| en-core | luxury | trans | 华贵、奢侈、奢华 | 奢侈、奢华、奢侈品 | HELD-AGREE | my value and order identical; D unsure about order → held; before matches file |
| en-upper | casualty | idtrans | korban, mangsa | korban | HELD-AGREE | same as A row |

补充（VG）：D 段 8 行的「现值」列在 10-10 文件里写错（operational 文件值 操作；运转、thermal 热；热量、juridical 司法上；法院；裁判上、horizontal 横；横向；水平、monumental 纪念性、supportive 支持；支援、tensile 抗拉；拉伸、traditional 传统；惯例），上表已用当前值。monumental：VG 不同意 纪念碑的，建议 巨大的；不朽的；纪念性的（明日查找者独立判）。operational：VG/VD 操作的；运行的，D 运营的；操作的 → 主人或明日两方再判。excellent 保留 sangat baik（VG 反对 unggul）。
words.json 的 zh 改动需重算 pinyin（如 热力的 rè lì de）；ratio → rasio 需 idSyllables ra·sio。

## B. 27 个 en-upper 行今日改了 trans，但 `def` 仍描述旧义项（VG 指出）

cultivation, divers, groom, temporal, tally, courthouse, pseudo, stint, bouncing, hale, prick, quarry, crusade, economical, liaison, prostitute, parameter, planetary, reversal, acquaintance, prevail, diversion, organise, peaked, stalls 等（全表见 10-11 当日 audit/VG/verdicts.md，已不可得；明日查找者按 en-upper.json 中这些词头的 def 与 trans 对照即可）。先例：B 段 advantage/sector/treat/committed 今日已改 def。

## C. en-core chamber trans

D 会议厅、室（不确定）；VD 腔室 vs 腔；VG 室、会议厅、腔。三方均不确定，待一位确定的查找者。

## D. 拼音轻声（F3 提出 54，VP 校验 50 已应用 54b8639）

VP 不同意（保留全调）：实在 shí zài（本库义「真实」为可轻读）、人家 rén jiā（本库义「住户」）、大意 dà yì（本库义「大概的意思」）、体面 tǐ miàn（可轻读）。不再提。

## E. 其它

- VG 顺带看到：en-core comfortable 的 idtrans 仍为 lumayan, selesa, senang（selesa 马来语）；bandwidth 接受为 lebar pita, bandwidth（bandwidth 非 KBBI，若主人要纯 KBBI 则去掉）。
- 往日结转照旧：因子/算子 读音、indonesian.json wan 晚上、kindly/situate、x-ray、headphones、power bank、planogram、grounded theory、regulatory sandbox/capture、gas melon、korban jiwa、C.1/C.3/C.4 体例组、U1 剩余 5 行、causeway jalan tambak（待主人）。

## F. en-academic — VA 保留行（AGREE-WITH-WORDING = VA 坚持另一写法，见 note；DISAGREE/UNSURE 不改）

| # | headword | field | before | D after | verdict | VA note |
|---|---|---|---|---|---|---|
| 90 | crossroads | idtrans | ketika, persimpangan, saat | persimpangan, perempatan | AGREE-WITH-WORDING | def is the crisis sense; "perempatan" is only the literal junction. Mine: persimpangan, titik kritis |
| 105 | frontal | idtrans | perenggan | frontal, bagian depan | AGREE-WITH-WORDING | "bagian depan" is a noun for an adjective headword. Mine: frontal |
| 114 | motivational | idtrans | (empty) | motivasional | UNSURE | not sure "motivasional" is a KBBI lemma (motivasi/memotivasi are); cannot check KBBI offline |
| 149 | cascade | idtrans | melata | mengalir deras, berjenjang | AGREE-WITH-WORDING | "berjenjang" is the tiered sense, def is the verb. Mine: mengalir deras, tercurah |
| 172 | notation | trans | 注解、注释 | 记号、符号、标记法 | AGREE-WITH-WORDING | live 注解、注释 matches the def (added comment); keep it alongside. Mine: 记号、符号、注释 |
| 172 | notation | idtrans | nota, anotasi, catatan | notasi | AGREE-WITH-WORDING | Mine: notasi, catatan (keep def sense) |
| 290 | gadget | idtrans | acang, gawai, alat | gawai, gadget, perangkat | AGREE-WITH-WORDING | "gadget" is not a KBBI lemma (KBBI: gawai). Mine: gawai, perangkat |
| 343 | burglary | idtrans | kecurian, menceroboh, pencurian | perampokan rumah, pembongkaran, pencurian | AGREE-WITH-WORDING | "pembongkaran" alone reads as demolition. Mine: pencurian, perampokan rumah |
| 373 | patio | idtrans | teres | teras, patio | AGREE-WITH-WORDING | "patio" is not a KBBI lemma. Mine: teras, pelataran |
| 394 | simulate | idtrans | membebek, membeo, mencontoh | mensimulasikan, meniru | AGREE-WITH-WORDING | KBBI standard form is menyimulasikan (meN- + s). Mine: menyimulasikan, meniru |
| 545 | voodoo | idtrans | (empty) | vodou, ilmu gaib | UNSURE | "vodou" is not a KBBI spelling I can confirm offline; ilmu gaib fine |
| 552 | boxers | idtrans | celana pendek, seluar pendek | celana boxer, celana dalam | AGREE-WITH-WORDING | "boxer" is not a KBBI lemma. Mine: celana dalam, celana kolor |
| 558 | collegiate | idtrans | maktab | kolegial, perguruan tinggi | DISAGREE | "kolegial" = collegial (of colleagues), a false friend; collegiate = of a college. Mine: perguruan tinggi, mahasiswa |
| 642 | insure | trans | 保证、担保、确保 | 投保、给……保险 | AGREE-WITH-WORDING | def is "make certain of"; keep 确保 and avoid "给……保险" ellipsis in a gloss. Mine: 保险、投保、确保 |
| 642 | insure | idtrans | menanggung, menentukan, menetapkan | mengasuransikan | AGREE-WITH-WORDING | drops the def sense (make certain). Mine: mengasuransikan, memastikan |
| 656 | riff | trans | 用拇指翻书页、翻书页、翻动书页 | 即兴重复段、riff | AGREE-WITH-WORDING | a Latin-letter "riff" inside a Chinese gloss. Mine: 即兴重复段、翻阅 |
| 656 | riff | idtrans | (empty) | riff, melodi pendek berulang | AGREE-WITH-WORDING | "riff" is not a KBBI lemma. Mine: melodi pendek berulang |
| 682 | buns | trans | 后部、尾部、屁股 | 小圆面包、屁股（俚） | AGREE-WITH-WORDING | （俚） register marker is not the house style. Mine: 小圆面包、屁股 |
| 682 | buns | idtrans | belakang, bokong, burit | roti bun, roti bulat | AGREE-WITH-WORDING | "bun" is not KBBI and the def sense (buttocks) is dropped. Mine: roti bundar, bokong |
| 748 | barrow | idtrans | usungan | gerobak dorong, kereta sorong | AGREE-WITH-WORDING | "kereta sorong" is the Malaysian term (kereta = car); Indonesian is gerobak dorong. Mine: gerobak dorong, gerobak sorong |
| 843 | endemic | trans | 地方病 | 地方性的、特有的、流行的 | AGREE-WITH-WORDING | 流行的 reads as epidemic, not endemic. Mine: 地方性的、特有的 |
| 844 | enlist | idtrans | mendaftarkan, mendapatkan, mengambil | mendaftar (tentara), merekrut, meminta bantuan | AGREE-WITH-WORDING | parenthesised "(tentara)" inside a gloss string. Mine: mendaftar, merekrut, meminta bantuan |
| 855 | judas | trans | 猫眼、窥视孔 | 犹大、叛徒 | DISAGREE | live 猫眼、窥视孔 matches the def (one-way peephole); lowercase "judas" is that sense. D swaps in the proper-noun sense, which contradicts the def |
| 951 | realty | idtrans | harta | properti, real estat | AGREE-WITH-WORDING | not sure "real estat" (two words) is the KBBI spelling. Mine: properti, harta tak bergerak |
| 971 | withholding | idtrans | (empty) | pemotongan (pajak), penahanan | AGREE-WITH-WORDING | parenthesised "(pajak)" inside a gloss string. Mine: pemotongan, penahanan |
| 988 | cords | trans | 灯芯绒裤子 | 绳子、电线 | AGREE-WITH-WORDING | def is the corduroy-trousers sense, which the live gloss matches; keep it beside the plain sense. Mine: 绳子、灯芯绒裤 |
| 988 | cords | idtrans | (empty) | tali, kabel | AGREE-WITH-WORDING | Mine: tali, celana korduroi (keep def sense) |
| 1044 | bends | trans | 减压病、减压症、气泡栓塞症 | 弯道、弯曲 | DISAGREE | def is decompression sickness ("the bends"); live 减压病 is right for that def, D replaces it with the plural of bend |
| 1044 | bends | idtrans | (empty) | tikungan, lengkungan | DISAGREE | same: def is decompression sickness. Mine: penyakit dekompresi |
| 1066 | involuntary | idtrans | tiba-tiba | tidak sengaja, tanpa sadar, involunter | AGREE-WITH-WORDING | cannot confirm "involunter" as a KBBI lemma. Mine: tidak disengaja, tanpa sadar |
| 1119 | deficient | idtrans | canggung, cupet, kepalang | kurang, tidak mencukupi, defisien | AGREE-WITH-WORDING | cannot confirm "defisien" as a KBBI lemma (defisiensi is). Mine: kurang, tidak mencukupi |
| 1132 | fudge | idtrans | bakut, melancung, melancungkan | fudge, mengelak, memalsukan | AGREE-WITH-WORDING | "fudge" is not a KBBI lemma. Mine: mengelak, memalsukan, permen lunak |
| 1227 | quid | trans | 交换物、回报、报酬 | 一英镑（俚） | AGREE-WITH-WORDING | （俚） register marker is not the house style. Mine: 一英镑 |
| 1227 | quid | idtrans | (empty) | pound sterling (slang) | AGREE-WITH-WORDING | English "(slang)" inside the gloss. Mine: pound sterling |
| 1251 | bray | idtrans | menggetap, mengules, meremukkan | meringkik (keledai), bunyi keledai | AGREE-WITH-WORDING | parenthesised "(keledai)" inside a gloss string. Mine: meringkik, suara keledai |
| 1263 | denomination | idtrans | nama, sebutan | denominasi, pecahan (uang), aliran | AGREE-WITH-WORDING | parenthesised "(uang)" inside a gloss string. Mine: denominasi, pecahan uang, aliran |
| 1313 | tanning | idtrans | (empty) | berjemur (menjadi cokelat), penyamakan | AGREE-WITH-WORDING | parenthesised "(menjadi cokelat)" inside a gloss string. Mine: penyamakan, berjemur |
| 1358 | prelude | idtrans | (empty) | pendahuluan, prelude | AGREE-WITH-WORDING | "prelude" is not a KBBI lemma. Mine: pendahuluan, pembukaan |
| 1443 | budding | idtrans | bertunas, tunas | yang sedang berkembang, calon | AGREE-WITH-WORDING | "yang sedang berkembang" is a relative clause, not a gloss. Mine: bertunas, berkembang, calon |
| 1461 | glaze | idtrans | menggelas | mengglasir, melapisi dengan glasir | AGREE-WITH-WORDING | "mengglasir" is not a KBBI verb form. Mine: glasir, melapisi, mengilap |
| 1545 | picket | idtrans | piket, pengawal | pemogok penjaga, pagar pancang | AGREE-WITH-WORDING | "pemogok penjaga" is not a collocation. Mine: piket, pemogok, pagar pancang |
| 1607 | hover | idtrans | berbayang-bayang, berbolak-balik, bergetar | melayang-layang, berputar-putar di udara | AGREE-WITH-WORDING | def is "be undecided"; keep that sense. Mine: melayang-layang, ragu-ragu |
| 1694 | spectra | trans | 系列、范围 | 光谱（复数）、范围 | AGREE-WITH-WORDING | house style for inflections names the base word. Mine: 光谱（spectrum 复数）、范围 |
| 1737 | hanger | idtrans | penyangkut | gantungan baju, hanger | AGREE-WITH-WORDING | "hanger" is not a KBBI lemma. Mine: gantungan baju, gantungan |
| 1778 | waive | trans | 不坚持、弃绝、抛弃 | 放弃（权利）、免除 | AGREE-WITH-WORDING | （权利） qualifier inside the gloss is not the house style. Mine: 放弃、免除 |
| 1791 | commemorative | idtrans | memperingati, peringatan | peringatan, komemoratif | AGREE-WITH-WORDING | "komemoratif" is not a KBBI lemma. Mine: peringatan, untuk mengenang |
| 1871 | galley | trans | 军舰 | 厨房（船/飞机）、单层甲板大帆船 | AGREE-WITH-WORDING | （船/飞机） qualifier with a slash inside the gloss. Mine: 船上厨房、单层甲板大帆船 |
| 1876 | levied | idtrans | melancarkan, memaksakan, membebani | dipungut, mengenakan (pajak) | AGREE-WITH-WORDING | parenthesised "(pajak)" inside a gloss string. Mine: dipungut, memungut, mengenakan |
| 1943 | inquest | idtrans | selidik | pemeriksaan kematian, inkues | AGREE-WITH-WORDING | "inkues" is not a KBBI lemma. Mine: pemeriksaan kematian, penyelidikan |
| 1980 | wield | idtrans | berlatih, mempertahankan, menegakkan | mengayunkan, menggunakan, memegang (kekuasaan) | AGREE-WITH-WORDING | parenthesised "(kekuasaan)" inside a gloss string. Mine: mengayunkan, menggunakan, memegang |
| 2049 | staunch | trans | 止住、止血 | 坚定的、忠实的 | AGREE-WITH-WORDING | def is "stop the flow"; live 止血 matched it, keep it beside the adjective. Mine: 坚定的、忠实的、止血 |
| 2049 | staunch | idtrans | henti, membebat, membendung | setia, teguh, kukuh | AGREE-WITH-WORDING | Mine: setia, teguh, membendung (keep def sense) |
| 2219 | tout | idtrans | beraga, bercakap, berpongah-pongah | mempromosikan gencar, menjajakan | AGREE-WITH-WORDING | "mempromosikan gencar" is ungrammatical. Mine: menjajakan, memuji-muji, calo |
| 2259 | hone | trans | 磨石 | 磨练、磨砺 | AGREE-WITH-WORDING | def is the whetstone; live 磨石 matched it, keep it beside the verb. Mine: 磨练、磨刀石 |
| 2259 | hone | idtrans | batu kilir | mengasah, menajamkan | AGREE-WITH-WORDING | Mine: mengasah, batu asah (keep def sense) |
| 2299 | blackjack | trans | 包皮短棒 | 二十一点（牌）、短棍 | AGREE-WITH-WORDING | （牌） qualifier inside the gloss. Mine: 二十一点、短棍 |
| 2299 | blackjack | idtrans | (empty) | blackjack (permainan kartu) | AGREE-WITH-WORDING | "blackjack (permainan kartu)" has parentheses and a non-KBBI word; def is the cosh. Mine: permainan dua puluh satu, pentungan |
| 2342 | thong | idtrans | cambuk, cemeti | celana dalam tali (thong), sandal jepit | AGREE-WITH-WORDING | parenthesised "(thong)" inside a gloss string. Mine: celana dalam tali, sandal jepit, tali kulit |
| 2400 | merchandising | idtrans | iklan | promosi barang, perdagangan eceran | AGREE-WITH-WORDING | "perdagangan eceran" is retail, not merchandising. Mine: promosi barang, pemasaran barang |

共 59 行。D 列出但标 unsure 的 121 行未校验，已抄入下方 G 段；明日查找者也可重扫 en-academic 剩余未钉行（2439 − 1004 钉 = 1435 行）。

## G. en-academic — D 自标 unsure 的行（未校验，明日查找者 + 校验者再判；格式：# / 词头 / trans before / trans after / idtrans before / idtrans after / 置信度 / 现 def）

| # | headword | trans (before) | trans (after) | idtrans (before) | idtrans (after) | confidence | def |
|---|---|---|---|---|---|---|---|
| 24 | flap | 口盖 | 翻盖、拍打、襟翼 | penutup, pintu, sayap | kelepak, penutup | unsure | any broad thin and limber covering attached at one edge; hangs loose or projects freely |
| 51 | pragmatic | 实用主义、实际 | 务实的、实用的 | - | - | unsure | of or concerning the theory of pragmatism |
| 75 | blazing | 火焰、烈火 | 熊熊燃烧的、炽热的 | api, kebakaran, memarak | menyala-nyala, membara | unsure | a strong flame that burns brightly |
| 87 | converse | 相反、逆向 | 交谈、相反 | (empty) | bercakap-cakap, kebalikan | unsure | of words so related that one reverses the relation denoted by the other |
| 116 | ordained | 指定、约定、规定 | 被授予圣职的、注定的 | (empty) | ditahbiskan, ditakdirkan | unsure | fixed or established especially by order or command |
| 176 | shire | 夏尔马 | 郡、夏尔马 | (empty) | county (wilayah), kuda shire | unsure | British breed of large heavy draft horse |
| 178 | snapping | 吼叫、咆哮 | 折断、怒声说 | membelungsing, menggertak, putus | membentak, mematahkan | unsure | utter in an angry, sharp, or abrupt tone |
| 186 | trimmed | 整齐 | 修剪过的、修整的 | (empty) | dipangkas, rapi | unsure | made neat and tidy by trimming |
| 187 | twisting | 旋转 | 扭曲、扭转、蜿蜒 | pusaran, pusingan, putar | berkelok-kelok, memutar | unsure | the act of rotating rapidly |
| 219 | estimation | 估价、评价、鉴定表 | 估计、评价 | anggaran, taksiran | perkiraan, taksiran | unsure | a document appraising the value of something (as for insurance or taxation) |
| 229 | intensified | - | - | menggiatkan, menghebatkan, memperamat | meningkat, diperkuat, mengintensifkan | unsure | increase in extent or intensity |
| 243 | plight | - | - | kesusahan, masalah, sedih | kesulitan, nasib buruk, keadaan sulit | unsure | a situation from which extrication is difficult especially an unpleasant or trying one |
| 249 | smear | - | - | titik, conteng, kotoran | noda, coreng | unsure | a blemish made by dirt |
| 263 | astounding | 令人惊骇、发愣的、哑然失声的 | 令人震惊的 | (empty) | mencengangkan | unsure | bewildering or striking dumb with wonder |
| 289 | enroll | 征募、注册、登记 | 注册、登记、报名 | memasukkan, mendaftar, mendaftarkan | mendaftar | unsure | register formally as a participant or member |
| 315 | qualitative | 与性质有关、定性、性质 | 定性的、质的 | - | - | unsure | relating to or involving comparisons based on qualities |
| 323 | stature | 声望 | 身高、声望 | kaliber, kedudukan, status | perawakan, tinggi badan, kaliber | unsure | high level of respect gained by impressive development or achievement |
| 326 | stripper | 剥离剂、清除剂、除漆剂 | 脱衣舞者、剥离剂 | (empty) | penari telanjang | unsure | a chemical compound used to remove paint or varnish |
| 332 | unfold | 呈现、显露 | 展开、呈现 | memampangkan, membeberkan, membentang | membuka, membentangkan, terungkap | unsure | open to the view |
| 353 | episcopal | 主教、属于主教 | 主教的、圣公会的 | keuskupan | episkopal, keuskupan | unsure | denoting or governed by or relating to a bishop or bishops |
| 357 | indifferent | 不感兴趣 | 漠不关心的、无所谓的 | (empty) | acuh tak acuh | unsure | marked by a lack of interest |
| 369 | orient | 导向、指向 | 使适应、定向 | menghadapkan | mengorientasikan, menyesuaikan | unsure | be oriented |
| 381 | reclaim | 再拿到手、取回 | 收回、开垦、回收 | (empty) | merebut kembali, mereklamasi | unsure | claim back |
| 401 | swarm | 充满、到处都是、有很多 | 蜂群、成群、挤满 | banyak, berkerubung, berkerumun | kerumunan, kawanan, berkerumun | unsure | be teeming, be abuzz |
| 410 | wrought | 制成一定形状 | 锻造的、精制的 | potongan, tempaan, tempawan | tempaan | unsure | shaped to fit by or as if by altering the contours of a pliable mass (as by work or effort |
| 423 | chow | 中国家犬、松狮犬 | 食物、松狮犬 | (empty) | makanan | unsure | breed of medium-sized dogs with a thick coat and fluffy curled tails and distinctive blue- |
| 434 | flaming | 火、火焰、火舌 | 燃烧的、熊熊的 | api, kebakaran | menyala-nyala, berkobar | unsure | the process of combustion of inflammable materials producing heat and light and (often) sm |
| 452 | lucifer | 火柴 | 路西法、魔鬼 | gores api, macis, mancis | Lucifer, iblis | unsure | lighter consisting of a thin piece of wood or cardboard tipped with combustible chemical;  |
| 502 | flea | - | - | hama, kutu, pinjal | kutu, pinjal | unsure | any wingless bloodsucking parasitic insect noted for ability to leap |
| 511 | inverse | 对立面 | 相反、倒数、逆 | berhadapan, berlawanan, bertentangan | kebalikan, invers | unsure | something inverted in sequence or character or effect |
| 535 | sneaking | 未公开宣布、未公开承认、秘密 | 偷偷的、暗中的 | (empty) | diam-diam, sembunyi-sembunyi | unsure | not openly expressed |
| 563 | coronary | 冠、冠状 | 冠状动脉的 | (empty) | koroner | unsure | surrounding like a crown (especially of the blood vessels surrounding the heart) |
| 565 | cucumber | 青瓜、黄瓜 | 黄瓜 | - | - | unsure | cylindrical green fruit with thin green rind and white flesh eaten as a vegetable; related |
| 571 | enquiry | 审问、探问、询问 | 询问、调查 | persoalan, pertanyaan, interogasi | pertanyaan, penyelidikan | unsure | an instance of questioning |
| 582 | hurdle | 跨栏用栏 | 障碍、跨栏 | gawang, pagar, palang | rintangan, gawang | unsure | a light movable barrier that competitors must leap over in certain races |
| 586 | monstrous | 凶恶、极恶、残忍 | 可怕的、巨大的、骇人的 | bengis, dahsyat, kejam | mengerikan, raksasa, keji | unsure | shockingly brutal or cruel |
| 599 | signalling | - | - | alamat, isyarat, petunjuk | pemberian isyarat, persinyalan | unsure | any nonverbal action or gesture that encodes a message |
| 606 | vitality | - | - | daya usaha, kekuatan, semangat | vitalitas, daya hidup, semangat | unsure | a healthy capacity for vigorous activity |
| 613 | bender | 使弯曲的工具 | 弯管器、狂饮 | (empty) | alat penekuk | unsure | a tool for bending |
| 619 | cohort | 年龄层、年龄组 | 群组、同期组 | (empty) | kohort, kelompok | unsure | a group of people having approximately the same age |
| 628 | embark | 上船、乘船 | 上船、着手 | memuat, menaiki, mengambil | naik kapal, memulai | unsure | go on board |
| 649 | motif | 花边、装饰的图案或式样 | 图案、主题 | - | - | unsure | a design or figure that consists of recurring shapes or colors, as in architecture or deco |
| 659 | scripted | 剧本 | 有剧本的、照稿的 | (empty) | bernaskah, sesuai naskah | unsure | written as for a film or play or broadcast |
| 669 | turnaround | 转变、逆转、颠倒 | 周转、转变、好转 | kebalikan, pengembalian, terbalik | perputaran, pembalikan, perubahan haluan | unsure | turning in the opposite direction |
| 731 | spherical | 球、球体、球形 | 球形的 | - | - | unsure | of or relating to spheres or resembling a sphere |
| 732 | spotting | - | - | melihat, menelik, menyelidiki | melihat, menemukan | unsure | catch sight of |
| 743 | adversity | - | - | bencana, kecelakaan, kegetiran | kesengsaraan, kemalangan, kesulitan | unsure | a state of misfortune or affliction |
| 768 | elemental | 元素、单一、基本 | 基本的、元素的、自然力的 | alamiah, anasir, asasi | dasar, elemental | unsure | relating to or being an element |
| 786 | lash | 鞭梢 | 鞭打、鞭子、睫毛 | - | - | unsure | leather strip that forms the flexible part of a whip |
| 809 | surrogate | 候补者、替换者 | 代理人、替代者、代孕 | - | - | unsure | someone who takes the place of another person |
| 881 | rustic | 乡下、乡土气、村野 | 乡村的、质朴的 | desa, kampung | pedesaan, bergaya desa | unsure | characteristic of rural life |
| 887 | spartan | 勇敢无畏、斯巴达、斯巴达式 | 简朴的、斯巴达式的 | (empty) | sederhana, keras | unsure | resolute in the face of pain or danger or adversity |
| 907 | analogous | 同功的、类似 | 类似的、相似的 | (empty) | analog, serupa | unsure | corresponding in function but not in evolutionary origin |
| 918 | deductible | 可免除项目 | 可扣除的、免赔额 | (empty) | dapat dikurangkan, deduktibel | unsure | (taxes) an amount that can be deducted (especially for the purposes of calculating income  |
| 930 | gripping | - | - | mengagumkan, mengesankan | mencekam, memikat | unsure | capable of arousing and holding the attention |
| 945 | overrun | 侵扰、大批出没、大批出没于 | 侵占、泛滥、超支 | melanda, melanggar, meluas | menyerbu, membanjiri, melebihi | unsure | invade in great numbers |
| 954 | sensual | 肉欲 | 感官的、肉欲的 | hawa nafsu | sensual | unsure | marked by the appetites and passions of the body |
| 966 | unification | - | - | gabungan, ikatan, penyatuan | penyatuan, unifikasi | unsure | the state of being joined or united or linked |
| 992 | dui | 一对 | 酒驾（DUI） | pasang, penjepit, sepasang | mengemudi dalam keadaan mabuk | unsure | two items of the same kind |
| 996 | encompassing | 包括一切、多方面、宽阔 | 包含的、涵盖的 | luas, melapisi, meliputi | mencakup, meliputi | unsure | broad in scope or content |
| 1004 | ignite | - | - | bernyala, memantik, memarakkan | menyulut, menyalakan, membakar | unsure | cause to start burning; subject to fire or great heat |
| 1009 | masonry | - | - | batu | pasangan bata, tembok batu | unsure | structure built of stone or brick by a mason |
| 1039 | amplified | - | - | meluaskan, memperbesar, memperluas | diperkuat, memperkuat, diperbesar | unsure | increase in size, volume or significance |
| 1068 | jammed | - | - | berasak, berjejal, berjejal-jejal | macet, terjepit, penuh sesak | unsure | press tightly together or cram |
| 1084 | rector | 教区牧师、牧师 | 校长、教区长 | pendeta, rektor, pastor | rektor, pendeta | unsure | a person authorized to conduct religious worship |
| 1089 | sleek | 时髦 | 光滑的、流线型的、时髦的 | anggun | licin mengilap, ramping | unsure | well-groomed and neatly tailored; especially too well-groomed |
| 1125 | dun | 灰兔褐色马 | 暗褐色、催讨 | (empty) | kelabu kecokelatan | unsure | horse of a dull brownish grey color |
| 1153 | millennial | 一千年 | 千禧年的、千禧一代 | (empty) | milenial | unsure | relating to a millennium or span of a thousand years |
| 1159 | penetrating | 厉害、敏锐、有识别力 | 敏锐的、刺耳的、穿透的 | melengking, meruncing, pedih | tajam, menusuk | unsure | having or demonstrating ability to recognize or draw fine distinctions |
| 1163 | pristine | 干净、清洁 | 原始的、崭新的 | bersih | asli, murni, masih baru | unsure | immaculately clean and unused |
| 1171 | shiva | 七日丧期、七日服丧期 | 湿婆、七日丧期 | (empty) | Syiwa | unsure | (Judaism) a period of seven days of mourning after the death of close relative |
| 1180 | unfolding | 兴旺、成熟、演变 | 展开、发展 | (empty) | berlangsung, terungkap | unsure | a developmental process |
| 1209 | irons | 枷锁、镣铐 | 熨斗（复数）、镣铐 | rangkaian, rantai | setrika, belenggu | unsure | metal shackles; for hands or legs |
| 1213 | manifold | 多支管 | 多种多样的、歧管 | (empty) | berbagai macam, manifold | unsure | a pipe that has several lateral outlets to or from other pipes |
| 1215 | mellow | 成熟 | 柔和的、醇厚的、成熟的 | merdu | lembut, matang | unsure | in a mellow manner |
| 1219 | nip | 一杯、尤指一杯酒 | 捏、夹、刺骨的寒冷 | seteguk | cubitan, gigitan kecil | unsure | a small drink of liquor |
| 1248 | barb | - | - | cangkuk, mata kail | kait, duri kawat | unsure | the pointed part of barbed wire |
| 1256 | chunky | 多团、多块 | 厚实的、粗壮的、大块的 | bergumpal, berketul-ketul | berbongkah, kekar | unsure | like or containing small sticky lumps |
| 1266 | effected | 已确认、已经制定、已被确认 | 实现的、产生的 | (empty) | dilaksanakan, dihasilkan | unsure | settled securely and unconditionally |
| 1284 | jamming | - | - | berasak, berjejal, berjejal-jejal | macet, terjepit, penuh sesak | unsure | press tightly together or cram |
| 1287 | latency | 执行时间、潜伏时间、等待时间 | 延迟、潜伏期 | (empty) | latensi, waktu tunda | unsure | (computer science) the time it takes for a specific block of data on a data track to rotat |
| 1297 | plotted | 事先考虑 | 策划好的、绘制的 | (empty) | direncanakan, dipetakan | unsure | with planning and intention |
| 1378 | adversary | - | - | pembangkang, seteru, antagonis | lawan, musuh, seteru | unsure | someone who offers opposition |
| 1414 | payback | 投资的回收 | 回报、报复 | (empty) | balasan, pengembalian modal | unsure | financial return or reward (especially returns equal to the initial investment) |
| 1417 | physique | - | - | bentuk, jasmani, rangka | perawakan, bentuk tubuh | unsure | alternative names for the body of a human being |
| 1426 | truss | 托架 | 桁架 | (empty) | rangka batang | unsure | (architecture) a triangular bracket of brick or stone (usually of slight extent) |
| 1455 | excused | 辩解 | 被准许离开的、免除的 | (empty) | dimaafkan, dibebaskan | unsure | granted exemption |
| 1456 | finder | 取景器 | 发现者、取景器 | - | - | unsure | optical device that helps a user to find the target of interest |
| 1472 | predicament | - | - | kesusahan, masalah, sedih | kesulitan, keadaan sulit | unsure | a situation from which extrication is difficult especially an unpleasant or trying one |
| 1496 | whim | - | - | olah, ragam, tingkah | keinginan sesaat, kehendak tiba-tiba | unsure | a sudden desire |
| 1534 | invoice | 开发票 | 发票 | (empty) | faktur | unsure | send a bill to |
| 1571 | uplift | 抬起 | 提升、振奋、隆起 | (empty) | mengangkat, membangkitkan semangat | unsure | lift up from the earth, as by geologic forces |
| 1579 | bandwagon | 乐队花车 | 潮流、风潮 | (empty) | arus populer, ikut-ikutan | unsure | a large ornate wagon for carrying a musical band |
| 1583 | camper | 野营挂车 | 露营者、露营车 | (empty) | pekemah, mobil kemah | unsure | a recreational vehicle equipped for camping out while traveling |
| 1589 | curing | 凝固、淬火、淬硬 | 固化、腌制、治愈 | pemadatan, pengerasan | pengawetan, pengerasan | unsure | the process of becoming hard or solid by cooling or drying or crystallization |
| 1639 | wannabe | 怀抱大志者、野心家 | 想成为……的人、模仿者 | aspiran | orang yang ingin jadi, peniru | unsure | an ambitious and aspiring young person |
| 1681 | modelled | 雕刻、雕刻般 | 塑造的、模制的 | (empty) | dibentuk, dimodelkan | unsure | resembling sculpture |
| 1687 | payoff | 偿清、结算 | 回报、报酬、结果 | (empty) | hasil, imbalan | unsure | the final payment of a debt |
| 1698 | strata | 社会阶级 | 阶层、地层 | - | - | unsure | people having the same social, economic, or educational status |
| 1728 | denounce | - | - | kutuk, melaporkan, mengadukan | mengecam, mencela, mengutuk | unsure | speak out against |
| 1841 | virtuous | - | - | saleh | berbudi luhur, bajik, saleh | unsure | morally excellent |
| 1844 | accompaniment | 伴随发生的事、伴随物 | 伴奏、伴随物 | (empty) | iringan, pengiring | unsure | an event or situation that happens at the same time as or in connection with another |
| 1855 | choral | 合唱队 | 合唱的 | (empty) | koral, paduan suara | unsure | related to or written for or performed by a chorus or choir |
| 1858 | cretaceous | 白垩、白垩质 | 白垩纪的、白垩质的 | (empty) | kapur, zaman Kapur | unsure | abounding in chalk |
| 1875 | landscaping | 园林 | 景观美化、园林绿化 | (empty) | pertamanan, penataan lanskap | unsure | a garden laid out for esthetic effect |
| 1881 | mindless | 不小心、不注意、不留心 | 无意识的、愚蠢的、不动脑筋的 | (empty) | tanpa berpikir, bodoh | unsure | not mindful or attentive |
| 1899 | straining | 忍耐力的严格考验、费力 | 用力、过滤 | berat | mengejan, menyaring | unsure | taxing to the utmost; testing powers of endurance |
| 1948 | kink | 扭曲 | 纠结、扭结、怪癖 | liku | kusut, belitan, kelainan | unsure | a sharp bend in a line produced when a line having a loop is pulled tight |
| 1968 | septic | 腐烂、腐败 | 感染的、败血性的、化粪的 | - | - | unsure | containing or resulting from disease-causing organisms |
| 1972 | suggestive | 指示、提示性、表示 | 暗示性的、引起联想的 | indikatif | sugestif, mengandung isyarat | unsure | (usually followed by ‘of’) pointing out or revealing clearly |
| 1984 | affirm | - | - | berikrar, bersumpah, membuktikan | menegaskan, mengiakan, menyatakan | unsure | to declare or affirm solemnly and formally as true |
| 2019 | flaps | - | - | kepak, pukul | sayap belakang (flap), penutup | unsure | a movable airfoil that is part of an aircraft wing; used to increase lift or drag |
| 2047 | sizing | 上浆、浆料、浆糊 | 尺寸调整、上浆 | perekat | penentuan ukuran, kanji | unsure | any glutinous material used to fill pores in surfaces or to stiffen fabrics |
| 2072 | batted | 眨眼 | 击球、眨（眼） | mengedipkan, mengejapkan | memukul (bola), mengerjapkan | unsure | wink briefly |
| 2160 | bagged | 宽松地下垂、松散地垂挂 | 装袋的、袋状下垂的 | menggeleber | dikantongi, dimasukkan ke kantong | unsure | hang loosely, like an empty bag |
| 2168 | castor | 调味瓶 | 蓖麻、脚轮、调味瓶 | kastroli | jarak (minyak jarak), roda kecil | unsure | a shaker with a perforated top for sprinkling powdered sugar |
| 2191 | marquee | 华盖 | 大帐篷、门楣灯箱 | (empty) | tenda besar | unsure | permanent canopy over an entrance of a hotel etc. |
| 2211 | sitter | 模特、被画像的人 | 看护者、临时保姆、模特 | (empty) | pengasuh, penjaga anak | unsure | a person who poses for a painter or sculptor |
| 2251 | enrolling | 征募、注册、登记 | 注册、登记、报名 | memasukkan, mendaftar, mendaftarkan | mendaftar | unsure | register formally as a participant or member |
| 2287 | weakly | 体弱、弱、老朽 | 虚弱地、无力地 | lemah | dengan lemah | unsure | lacking bodily or muscular strength or vitality |
| 2416 | regenerate | 再生的、新生、革新的 | 再生、使再生 | (empty) | meregenerasi, memperbarui | unsure | reformed spiritually or morally |

共 121 行。
