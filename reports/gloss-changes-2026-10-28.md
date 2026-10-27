# 释义修正 · 2026-10-28（提交 1be6498，分支 claude/daily-2026-10-28）

方法：R1 / R2 盲读 words.json 800–1199（R1 顺读：zh OK 393 / WRONG 0 / UNSURE 7，id OK 384 / WRONG 0 / UNSURE 16；R2 倒读：zh OK 397 / 0 / 3，id OK 389 / 0 / 11）；R5 独立裁定者只看 live 值重读今日被标的 29 行 + 昨日表二的 26 行（55 行：zh WRONG 10 / UNSURE 17，id WRONG 14 / UNSURE 19）。只改「R5 判 WRONG + 至少一位读者提出同一替换词 + id 与首义在 words.json 中唯一」的行（与 10-27 law → hukum 的先例相同）；每行重算 `pinyin`（含 pinyin-fixes.json）与 `idSyllables`。

| 行 | 词头 | 字段 | before → after | 理由 |
|---|---|---|---|---|
| 1023 | hungry | zh | 饿的 → 饿；饥饿 | 的 使首义成为定义片段而非学习者打的词（R1、R5） |
| 1024 | thirsty | zh | 渴的 → 渴；口渴 | 同上（R1、R5） |
| 1025 | full (after eating) | zh | 吃饱的 → 饱；吃饱 | 同上，饱 对应 kenyang（R1、R5） |
| 1165 | domestic helper | zh | 家政助理 → 家政人员；家庭帮佣 | 家政助理 是生造词（R2、R5） |
| 343 | productivity | zh | 生产效率 → 生产率；生产力 | 生产效率 是另一指标；10-27 与 10-28 两位独立裁定者首义同为 生产率（R5 WRONG） |
| 3609 | insubordinate | zh | 不听话；不服从的；不顺从 → 不服从；违抗 | 不听话 是小孩不听话，职场义为 不服从（10-27 R5 UNSURE 不服从的、10-28 R5 WRONG 不服从） |
| 817 | statement of work | id | uraian pekerjaan → kerangka acuan kerja | uraian pekerjaan 是岗位说明（HR）；采购中的 SOW 是 KAK（R1、R2、R5） |
| 818 | milestone payment | id | pembayaran berdasarkan tahapan → pembayaran termin | 分期付款的合同用语是 termin（KBBI）（R1、R5） |
| 822 | bank guarantee | id | garansi bank → bank garansi | 银行业固定搭配（R1、R5） |
| 823 | performance review | id | tinjauan kinerja → penilaian kinerja | HR 标准用语（R1、R5）；id 侧唯一，昨日被挡的是别的字段 |
| 928 | boarding pass | id | kartu naik pesawat → pas naik | KBBI 对应词；live 值是描述（R2、R5；R1 也注明 KBBI padanan pas naik） |
| 278 | student | id | mahasiswa → pelajar | 本行汉语是泛指的 学生，mahasiswa 只指大学生（10-27 R1 R2 R5 UNSURE pelajar、10-28 R5 WRONG） |
| 3149 | bubbling | id | berbusa → bergelembung | busa 是泡沫；气泡是 gelembung（10-26 R3 R6 同、10-28 R5 WRONG） |

src/zh-renames.json +6（饿的 / 渴的 / 吃饱的 / 家政助理 / 生产效率 / 不听话 → 词头），KEYS_FLAG v4.125 → v4.131。无头浏览器种入旧键 `zh:饿的`（reps 5 / lapses 1）+ `zh:trio:hungry`（reps 1）→ 合并为 reps 6 / lapses 1，错词本改名，标志写成 v4.131，0 错误。
