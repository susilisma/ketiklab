# 释义候选（2026-10-09 结转）

只有一方确定、或两方都未确定的条目；明日派查找者 + 校验者再判。规则同主人决定：两方独立同意才改。

## A. en-toefl 与池不一致的 11 行（refresh 会把池值复制进 en-toefl，今日已拦下，保留 en-toefl 原值）

池里的值（en-core/en-plus/en-upper）疑似更差，应先在池中修：

| 词头 | en-toefl 现值（保留） | 池值（库） |
|---|---|---|
| share | saham, bagian, berbagi | bagian, saham, jatah (en-core) |
| considerable | banyak, besar | banyak, ramai, besar (en-plus；ramai 非 considerable) |
| guild | serikat | persatuan (en-plus) |
| bronze | perunggu | gangsa, perunggu (en-plus；gangsa 为马来语) |
| duration | durasi, jangka waktu, selama | durasi, jangka waktu, lama waktu (en-plus) |
| commodity | barang dagangan, komoditas, komoditi | komoditas, barang dagangan (en-plus) |
| entity | entitas, hakikat, keberadaan | entitas, wujud (en-plus) |
| luxury | kemewahan, barang mewah, kementerengan | kemewahan, mewah, kementerengan (en-core) |
| command | perintah, komando, menguasai | perintah, instruksi, komando (en-core) |
| monk | biksu, rahib | rahib, biksu, biarawan (en-plus) |
| traumatic | traumatis, menyebabkan trauma, menyakitkan | traumatis, trauma, cedera (en-upper) |

## B. VE 单方提出的额外改动（D 未提，未应用）

### en-core

| 词头 | 字段 | 建议 |
|---|---|---|
| accept | idtrans | menerima、menyetujui |
| channel | idtrans | saluran、kanal |
| committed | idtrans | berkomitmen |
| universal | trans | 普遍的、通用的 |
| gate | idtrans | gerbang、pintu gerbang |
| wage | idtrans | upah、gaji |
| salary | idtrans | gaji |
| breast | trans | 乳房、胸部 |
| cry | idtrans | menangis、tangisan |
| crying | idtrans | menangis、tangisan |
| represent | idtrans | mewakili |
| fail | idtrans | gagal |
| advantage | idtrans | keuntungan、keunggulan |
| sector | idtrans | sektor |
| treat | idtrans | memperlakukan、mengobati |
| contribute | trans | 贡献 |

### en-plus

| 词头 | 字段 | 建议 |
|---|---|---|
| accommodate | trans | 容纳、迁就 |
| container | trans | 容器、集装箱 |
| frog | idtrans | katak、kodok |
| tap | idtrans | keran、ketukan |

## C. VE 对 D 的 8 行「不确定」（D 的值不算错，VE 会换首项）

gain idtrans（memperoleh, keuntungan）、rise（naik, kenaikan）、roll（berguling, gulungan）、facing（menghadapi 先于 menghadap）、chamber（会议厅、室）、burned（烧（burn 过去式）、烧伤的）、clearance trans（许可 先于 清仓）、fitted（cocok, dipasang 或同时改 trans）；另 universal trans 全世界→普遍的、通用的，container trans 集装箱→容器、集装箱，accommodate trans 符合→容纳、迁就（VE 单方）。

## D. words.json：VD 对 U1（48 行名词作定语）与 U3 的判断（D 不确定、VD 单方）

U1 list: pypinyin gives 石灰质的 →
"shí huī zhì dì" (wrong, must be de), 电子的 → "diàn zi de" and 原子的 → "yuán zi de" (the file pins
电子/原子 as zǐ) — if any of those three U1 rows is adopted it needs a pin. Side effects worth
knowing: toll, straight and nuclear currently appear in the Chinese ladder only because their old first
sense is a zh-* headword in zh-pinyin.json; with a new first sense they join the 1,233 trio rows the
ladder already skips (ledgered) — acceptable, but add the inline pinyin so the practice card still shows
a reading. The 似天使 / 似马 pins in pinyin-fixes.json become dead after the change (harmless).


U3 — single doubts (my verdict only)

- satiate zh 吃饱；饱足 — CERTAIN wrong: 吃饱 is intransitive "eat one's fill" (and 吃饱的 is full's first sense); satiate is transitive (id mengenyangkan is causative). 使饱足；使满足 — both free.
- evocative zh 引起联想 — CERTAIN wrong: verb phrase for an adjective → 引起联想的 (free).
- furtive zh 偷偷；偷偷摸摸；暗中 — CERTAIN wrong: 偷偷 is an adverb → 偷偷摸摸的；鬼鬼祟祟的 (both free; pinyin tōu tōu mō mō de).
- absorbent zh 吸收性 / id penyerap — UNSURE: absorbent is also a noun (吸收剂 / penyerap); the adjective 吸水的 is free if the owner wants the adjective reading.
- memorial zh 纪念馆 — UNSURE: a real sense of memorial; 纪念碑 is taken by monument; leave.
- bomber zh 轰炸机 / id pengebom — UNSURE: both are senses of bomber; leave.
- conservation zh 自然保护 — UNSURE: narrower than the word but 保护 is protect's; leave.
- crackers zh 脆饼 — UNSURE: kerupuk ≈ 虾片/脆片; 脆饼 is a stretch but not wrong for "crackers".
- excellent id sangat baik — UNSURE: a phrase, not a KBBI headword; unggul is free and would be better, but sangat baik is not wrong.
- provincial id kedaerahan — UNSURE: kedaerahan is the noun "regional character/parochialism"; the plain sense would be provinsi (taken by province). Lean wrong, no free single-word fix.
- regulatory id regulasi — UNSURE: attributive noun, Indonesian has no adjective (U2 pattern); leave.
- t-test zh 均值检验 — UNSURE: the term is t检验, which the charset rule forbids; 均值检验 is the workaround; owner's call.
- resettle id menetap — UNSURE lean wrong: menetap = settle/stay, no "re-"; bermukim kembali is a phrase; no single KBBI word.
- waive id mengesampingkan — UNSURE: acceptable (set aside); melepaskan would be a different acceptable synonym.
- alimony id nafkah — UNSURE/acceptable: nafkah is the legal term for spousal maintenance; leave.
- ratio id perbandingan — UNSURE/acceptable: KBBI sense 3 of perbandingan is the mathematical ratio; rasio is free if preferred.
- easel id kuda-kuda — UNSURE: KBBI kuda-kuda sense 1 is the three-legged stand for a blackboard (penopang papan tulis), which is the easel object; acceptable.
- bilge id lambung — UNSURE lean wrong: lambung = hull side; bilge is the bottom (dasar lambung); no single KBBI word.
- apprenticed id terikat — UNSURE lean wrong: terikat = bound, generic; magang is taken by internship.
- rebellious id memberontak — UNSURE: verb used attributively, idiomatic; leave.
- laundry zh 洗衣 — UNSURE: id cucian = the clothes (待洗衣物, free); 洗衣 is the activity; acceptable.
- ladder id tangga lipat — UNSURE: forced by uniqueness (tangga = stairs); acceptable.
- invulnerable zh 刀枪不入；不可战胜的；攻不破 — CERTAIN wrong by the owner's 成语 rule: 不可战胜的；无懈可击的 (both free; pinyin bù kě zhàn shèng de) — already owner-pending per D.


## E. 其它

- thermal 热→热力的：D、VD 都不确定，保留。current saat ini：保留。
- causeway 今日改为 jalan tambak（因 embankment 取走 tanggul；两方都提此值但都标不确定）——主人若偏好单词词头可删行。
- toll road 的 zh 是 高速公路（= expressway）；toll 首义改为 通行费 后，收费公路 可给 toll road（VD 附注）。
- scripts/pinyin-fixes.json 里 似天使、似马 两个钉值今日起失效（无害）；连同 F4 列的 夹肢窝、运动夹克、子宫、咽 四个死钉值一起清理。
- 往日结转照旧：因子/算子 读音 yīn zi / suàn zi（应 zǐ，未钉）、indonesian.json wan 晚上、kindly/situate、x-ray、headphones、power bank、planogram、grounded theory、regulatory sandbox/capture、gas melon、korban jiwa、C.1/C.3/C.4 体例组。
