# 释义修正 · 2026-11-20

样本：`random.seed(20261120)` 从 words.json 3879 行抽 320 行（scratchpad/G/sample-320.tsv）；R1 顺读、R2 倒读（互不可见、不看项目文件与账本），VG 裁定（可见先例 gloss-changes-11-17/18/19 全文 + grep 全部先例），主代理复核机械项并实测迁移。

两位读者：R1 OK 597 / UNSURE 36 / WRONG 7（id 306/10/4，zh 291/26/3）；R2 OK 608 / UNSURE 25 / WRONG 7（id 309/5/6，zh 298/20/2，含 R2 交回时自行补正的 1416 undergraduate id）。并集 50 字段 / 49 行，26 字段两读者同标。VG：AGREE 15 字段 / 15 行（13 zh + 2 id）、KEEP 25（10 带旗 ★）、OWNER 8、SPLIT 3（885 同时为 OWNER）。

提交 `0faa99c`（分支 claude/daily-2026-11-20，合入 main）：15 行改义；6 个退役首义（服务抵扣 轮胎没气 结果是 政策移植 诗 健壮）钉入 src/zh-renames.json（248 → 254 键，KEYS_FLAG v4.248 → v4.254；均非 zh-core/plus/upper 词头）；行内 pinyin 重算 3 行（policy transfer zhèng cè zhuǎn yí、poetry shī gē、robust wěn jiàn；service credit / flat tire / as a result 三行本无行内 pinyin，读 zh-pinyin.json，不新增——VG 对 apply-gloss.py 的一行修正）；idSyllables 重算 2 行（bleeding per·da·ra·han、idiomatic i·di·o·ma·tik）；zh-pinyin.json 增 服务抵扣额 瘪胎 结果 政策转移 诗歌 稳健（等级 4，5050 → 5056）。共享首义：结果（as a result ↔ #2141 so it becomes，practisedOnce 去重）。次义共享（允许）：因此（as a result ↔ #1825 therefore 首义）、疲惫（exhaustion ↔ #38 tired 首义）。孤键：服务抵扣 / 轮胎没气 / 结果是 在 zh-pinyin.json 中成为无引用键（既有留账项）。

迁移实测（V1/migrate254.js，最终构建）：种子 zh:健壮(s3 r5) / zh:诗 / zh:结果是 / zh:轮胎没气 / zh:服务抵扣 / zh:政策移植 + 既有 zh:trio:robust(s1 r2) + 错词本 + 收藏，ketiklab-keys v4.248 → 加载后六键全部改名为 zh:trio:<en>，zh:健壮 并入 zh:trio:robust（step 3、reps 7、lapses 2，高档领先），错词本随迁，收藏 健壮 → trio:robust 文本 稳健，flag v4.254，0 pageerror。

以下为 VG 裁定原文（英文）。


Readers' union: 50 flagged fields / 49 rows (seashell has two fields); 26 fields flagged by BOTH readers, 24 by one.
VG: **AGREE 15 fields / 15 rows** (13 zh + 2 id) · **KEEP 25 fields / 24 rows** (10 flagged for the next round) · **OWNER 8** · **SPLIT 3** (one of them also OWNER).
Precedent read in full: gloss-changes 11-17 / 11-18 / 11-19; grep of all gloss-changes / gloss-candidates for every union row (verdict history quoted per row below). KBBI is unreachable from the sandbox (as every day); KBBI statements rest on editorial knowledge + the project's own dictionaries + wordfreq.

Data checks run (`check.py` in this dir, `python3 -I check.py <rows> <candidates>`): for every candidate — the row (category / level / inline pinyin / idSyllables), whether the new first sense is already another row's first or later sense, whether the retired first sense is a zh-core / zh-plus / zh-upper headword (`name`), in zh-pinyin.json or already a zh-renames key, and the project's own renderings in zh-*.json (trans / idtrans) and en-*.json (trans / idtrans). The 30-row uppercase/digit id set was recomputed from words.json: it contains #1416 mahasiswa S1, #1880 UMP, #1881 UMK (and Idulfitri, KITAS, NPWP …), so those three are OWNER.

---

## 1. AGREE (to change) — 15 fields / 15 rows

| i | en | field | current → new (complete value) | who agreed | reason | sharing / mechanics |
|---|---|---|---|---|---|---|
| 943 | service credit | zh | 服务抵扣 → **服务抵扣额** | R1 UNSURE 服务抵扣额；服务信用额 + R2 UNSURE 服务抵扣额；服务补偿额 (same first sense; later senses = intersection) | Two UNSURE converging on the first sense with a nameable rule: 服务抵扣 is a verb-like phrase (to offset / deduct service), not the noun service credit (hard rule: first sense is the word, not a verb phrase — stare 盯着看→凝视 11-18, overdo 做得过分→过度 11-19). 服务抵扣额 is the term Microsoft's Chinese Azure SLA uses for Service Credit, matching id kredit layanan (business B2). Later senses are the intersection (extractor 11-04 取两方共有的最小值): R1's 服务信用额 and R2's 服务补偿额 are each single-reader and neither is an established term, so neither is carried; the owner may add one. | 服务抵扣额 appears in no row. 服务抵扣 retires → pin 服务抵扣 → service credit (not a dictionary headword; no other row has it first). Row has **no inline pinyin** → left absent (script patched, see Mechanics); zh-pinyin.json + 服务抵扣额 fú wù dǐ kòu é (level 4); the existing key 服务抵扣 (level 4) becomes an orphan (ledger zh-pinyin-orphan-hanzi-keys). |
| 1517 | flat tire | zh | 轮胎没气 → **瘪胎；轮胎漏气** | R1 UNSURE 瘪胎；爆胎；轮胎漏气 + R2 UNSURE 瘪胎；轮胎漏气 (same first sense; later senses = intersection) | Two UNSURE converging on 瘪胎 for the first time (10-23 three-way split 瘪胎 / 轮胎漏气 / 爆胎; 10-29 R1 + R2 爆胎, which is blowout and wrong for id ban kempis; 11-14 R2 alone 瘪胎 → KEEP). 轮胎没气 is a subject + predicate clause (the tyre has no air), not the noun; the 09-24 verifier KEEP ("口语惯用说法，非定义片段") predates the verb-phrase line of precedent that has since changed first senses on two-reader convergence (stare 11-18, overdo 11-19), the same ground on which burial's 11-05 KEEP was reversed 11-19. **Stated reason to reverse**: first two-reader convergence on the lead + the settled verb-phrase precedent. 瘪胎 is the everyday noun (车瘪胎了) though not a 现汉 headword (the 09-24 objection; noted — if the verifier holds that a non-现汉 word cannot lead, downgrade to KEEP). 轮胎漏气 kept second (both readers); 爆胎 single-reader and wrong for ban kempis (11-14), dropped; 轮胎没气 dropped by both, not carried (tournament 竞赛 11-18). | 瘪胎 / 轮胎漏气 appear in no row. 轮胎没气 retires → pin 轮胎没气 → flat tire (not a dictionary headword). No inline pinyin → left absent; zh-pinyin.json + 瘪胎 biě tāi (level 4); existing key 轮胎没气 (level 4) becomes an orphan. Lowest-confidence AGREE of the set. |
| 1849 | as a result | zh | 结果是 → **结果；因此** | R1 UNSURE 结果；因此 + R2 UNSURE 结果；因此 (identical) | Two UNSURE with the identical replacement and a nameable rule: 结果是 is a clause fragment with the copula (result is …), not the connective (hard rule: non-word fragment / verb phrase — citizenship 公民的身份 11-17, stare 11-18). 结果 is the connective that renders akibatnya (akibat = result + -nya); 因此 the standard second rendering. 09-15 scan flagged only the id breadth. | **Shared first sense**: 结果 is #2141 so it becomes (jadinya)'s first sense (结果；于是) → deliberate share under practisedOnce (发电机 11-11, 锦标赛 11-18, 保护 11-19), must be listed. 因此 as a later sense = #1825 therefore's first sense (allowed later-sense share, listed). A non-shared alternative lead would be 因而, but it is the formal written connective and less faithful to akibatnya than 结果, so VG follows the two readers (correctness outranks uniqueness; owner may prefer 因而). 结果是 retires → pin 结果是 → as a result (not a dictionary headword). No inline pinyin → left absent; zh-pinyin.json + 结果 jié guǒ (level 4; #2141 had none — the normal state); existing key 结果是 becomes an orphan. |
| 2173 | policy transfer | zh | 政策移植 → **政策转移；政策移植** | R1 UNSURE 政策转移；政策移植 + R2 UNSURE 政策转移；政策移植 (identical) | Two UNSURE with the identical replacement and a nameable rule: 政策移植 is the rendering of policy transplant (the 法律移植 analogue), another term's meaning; the established mainland academic term for policy transfer (Dolowitz & Marsh) is 政策转移 (大陆标准 / another word's meaning; study B2, id transfer kebijakan). 政策移植 kept second as both readers did (it is used loosely for policy transfer in some Chinese papers). Never adjudicated before. | 政策转移 appears in no row. 政策移植 retires (stays second) → pin 政策移植 → policy transfer (not a dictionary headword). Inline pinyin zhèng cè yí zhí → **regen** zhèng cè zhuǎn yí. zh-pinyin.json + 政策转移 (level 4); 政策移植 is not in zh-pinyin.json (nothing orphaned). |
| 2286 | actor | zh | 演员；演奏者；艺人 → **演员；男演员** | R1 WRONG 演员；男演员 + R2 UNSURE 演员；男演员 (identical) | WRONG + UNSURE with the identical value (service delivery / cortical 11-19). 演奏者 is an instrumental performer, another word's meaning (hard rule: wrong later sense removed — abdomen 胃 11-11, advertiser 拉广告者 11-19). 艺人 (entertainer) dropped by both readers, not carried. 男演员 pairs with #2350 actress 女演员 (daily A1 / A2). The row's zh was copied from en-core actor trans [演员, 演奏者, 艺人] — the dictionary carries the same defect (follow-up for the dictionary pipeline, not this change). | First sense unchanged → no pin, inline pinyin yǎn yuán unchanged. 男演员 appears in no row; 演奏者 / 艺人 not in zh-pinyin.json. |
| 2358 | ceremony | zh | 仪式；典礼；式 → **仪式；典礼** | R1 WRONG 仪式；典礼 + R2 UNSURE 仪式；典礼 (identical) | WRONG + UNSURE with the identical value. **Reverses the 11-17 KEEP**, which was a single-reader call (R1 UNSURE, R2 OK) and itself said "Seashell 贝 was removed only with a finder + independent verifier pair (11-12); note for the next round": today two independent readers converge, the convergence rule that reversed tournament (11-18) and burial (11-19). 式 is a bound morpheme (开幕式 / 毕业式), not a standalone word — the exact 贝 (seashell 11-12) case. zh-core 仪式 ↔ ceremony / upacara and 典礼 ↔ ceremony confirm the two kept senses. en-core ceremony trans has the same 式 (dictionary follow-up). | First sense unchanged → no pin, inline pinyin yí shì unchanged. 式 is in no other row and not in zh-pinyin.json. |
| 2372 | poetry | zh | 诗；诗歌；诗集 → **诗歌；诗** | R1 UNSURE 诗歌；诗 + R2 UNSURE 诗歌；诗 (identical) | Two UNSURE with the identical value and a nameable rule: 诗集 is a poetry collection / anthology, another word's meaning (hard rule, abdomen 胃 11-11). Both readers independently also lead with 诗歌, which is the collective noun matching puisi (poetry as a genre), while 诗 is poem / poetry; the identical reorder from two blind readers is taken as the agreed value (tournament 11-18). If the owner prefers the minimal change, 诗；诗歌 is equally correct and avoids the pin + regen. en-core poetry trans has the same 诗集 (dictionary follow-up). | 诗歌 is this row's later sense today, in no other row. 诗 retires as a first sense (stays second) → pin 诗 → poetry (诗 is not a zh-core / plus / upper headword — checked). Inline pinyin shī → **regen** shī gē. zh-pinyin.json + 诗歌 (level 4); 诗 not in zh-pinyin.json. |
| 2534 | disagree | zh | 不同意；异议；意见不同 → **不同意；意见不同** | R1 UNSURE 不同意；意见不同 + R2 UNSURE 不同意；意见不合 (same first sense; agreed deletion) | Two UNSURE on the same field with the first sense undisputed; both name the same hard-rule defect: 异议 is the noun objection on a verb row (another word's part of speech — senatorial 11-11, galactic 11-18, charismatic / cortical 11-19). The agreed change is the deletion (apprenticed 受约束 11-17); R2's substitution 意见不合 for the live 意见不同 is single-reader and not adopted (both are fine). en-plus disagree trans has the same 异议 (dictionary follow-up). | First sense unchanged → no pin, inline pinyin bù tóng yì unchanged. 异议 in no other row, not in zh-pinyin.json. |
| 2542 | bleeding | id | pendarahan → **perdarahan** | R1 UNSURE perdarahan + R2 WRONG perdarahan (identical) | WRONG + UNSURE with the identical value and the "Indonesian = KBBI baku form" hard rule: KBBI lists perdarahan (keluarnya darah dari pembuluh darah) and marks pendarahan as bentuk tidak baku — the same case as detergen (11-18, R2 + V1) and 致冷→制冷 (11-11). Everyday frequency favours pendarahan (wordfreq 4.08 vs 3.57), which is why both forms sit in the project's en-plus bleeding idtrans and zh-plus 出血 idtrans [pendarahan, perdarahan]; the gloss rule is the KBBI form. Study A2. | id perdarahan is used by no other row. **idSyllables regen** pen·da·ra·han → per·da·ra·han. No zh effect. |
| 2653 | spouse | zh | 配偶；夫妻 → **配偶** | R1 WRONG 配偶 + R2 UNSURE 配偶；夫或妻 (same first sense; agreed deletion) | WRONG + UNSURE, first sense undisputed, both name the same defect: 夫妻 is the married couple as a pair, another word's meaning (hard rule). The project's own data already ruled this: zh-core 夫妻 trans was changed 10-14 from "spouse; partner; mate" to "husband and wife" (agree-first+intersection) and the 10-25 D-scan / R7 fixed its def the same way. R2's extra 夫或妻 is a phrase and single-reader, not carried. zh-plus 配偶 ↔ spouse / pasangan confirms the lead. | First sense unchanged → no pin, inline pinyin pèi ǒu unchanged. 夫妻 is a zh-core headword and in zh-pinyin.json (fū qī, level 4) — irrelevant since it is a later sense, no key retires. |
| 2870 | satisfactory | zh | 令人满意；满意；符合要求 → **令人满意；符合要求** | R1 UNSURE 令人满意；符合要求 + R2 UNSURE 令人满意的；合格的 (agreed deletion; lead not substantively disputed) | Both readers name the same hard-rule defect: 满意 is satisfied (the person), another word's meaning — zh-core 满意 ↔ satisfied / puas confirms. The agreed change is that deletion (apprenticed 11-17). R2's 的 on the lead is the bare-form style point the owner has not treated as an error (outer / systematic 11-15, blooming 11-18), so the first sense is not in dispute in substance; R2's 合格的 for 符合要求 is single-reader (and 符合要求 is a Collins rendering), not adopted. The row's zh was copied from en-upper satisfactory trans [令人满意, 满意, 符合要求] (dictionary follow-up). id memuaskan was fixed 11-03. | First sense unchanged → no pin, inline pinyin lìng rén mǎn yì unchanged. 满意 is a zh-core headword with a zh-pinyin entry — later sense, nothing retires. |
| 2958 | exhaustion | zh | 疲劳；极度疲劳；疲惫不堪；筋疲力尽 → **疲劳；极度疲劳；疲惫** | R1 UNSURE 疲惫；极度疲劳；衰竭 + R2 UNSURE 疲劳；极度疲劳；疲惫 (agreed deletions; R2 keeps the live lead, R1 reorders without disputing it) | Both readers drop 筋疲力尽 (four-character idiom — hard rule: idiom is not a lexical sense; sleepiness 昏昏睡睡 11-12) and both drop 疲惫不堪 (R1 calls it an idiomatic phrase; R2 replaces it with its head 疲惫); both keep 极度疲劳 and both have 疲惫. R1's lead swap 疲劳→疲惫 states no defect in 疲劳 (zh-plus 疲劳 ↔ fatigue / keletihan, matching id kepenatan), so it is the "ordering of equally valid senses is style" case and the live lead stands; R1's 衰竭 (failure, as in 肾衰竭) is single-reader, not carried. Result = R2's exact value and a subset-reorder of R1's. The 09-15 row (极度疲劳；疲惫不堪；筋疲力尽, = en-academic exhaustion trans) shows the idioms came from the dictionary copy. | First sense unchanged → no pin, inline pinyin pí láo unchanged. **Later-sense share to list**: 疲惫 is #38 tired's first sense (lelah, A1) — allowed as a later sense (再现 / 葬礼 11-19); this is also why R1's 疲惫 lead would have been the worse choice (it would create a first-sense share). 疲惫不堪 / 筋疲力尽 not in zh-pinyin.json. |
| 3449 | synergistic | zh | 协同的；协同作用 → **协同的；增效的** | R1 UNSURE 协同的；增效的 + R2 WRONG 协同的；增效的 (identical) | WRONG + UNSURE with the identical value: 协同作用 is the noun synergy on an adjective row (senatorial 11-11 / galactic 11-18 / charismatic, cortical 11-19) and is literally #3156 synergy's first sense (ledger words-json-secondary-sense-is-another-rows-headword, the 竞赛 ground 11-18). 增效的 (增效作用 = synergistic effect) is the standard second adjective. 09-16 candidate wanted 协同 bare; the 的 form is this row's established style. id sinergis unchanged. | First sense unchanged → no pin, inline pinyin xié tóng de unchanged. 增效的 appears in no row; 协同作用 stays #3156's first sense (nothing retires here). |
| 3647 | idiomatic | id | idiomatis → **idiomatik** | R1 UNSURE idiomatik + R2 UNSURE idiomatik (identical) | Two UNSURE with the identical value and the KBBI-form hard rule: both readers independently state KBBI lists the adjective as idiomatik and that idiomatis is a non-KBBI variant (the -ik vs -is pair, as KBBI has sistematik / sistematis both but only idiomatik here). Supporting data: the 09-15 scan already flagged idiomatis as "wordfreq 印尼语料查无此词（可能是马来语或误拼）" (zipf 0.0; idiomatik is also 0.0 — the word is rare in both forms, so frequency decides nothing). No project dictionary carries idiomatic. **Verifier**: KBBI is unreachable here; if V1 can show idiomatis as a KBBI headword (not a cross-reference), downgrade to KEEP. | id idiomatik is used by no other row. **idSyllables regen** i·di·o·ma·tis → i·di·o·ma·tik. No zh effect. |
| 3806 | robust | zh | 健壮 → **稳健；强健；健壮；坚固** | R1 UNSURE 稳健；强健；健壮 + R2 UNSURE 稳健；强健；坚固 (same first and second sense; later senses = union) | Two UNSURE converging on 稳健 (and 强健 second) with a nameable rule: study B1 row with id kukuh (KBBI: kuat terpancang; tidak mudah goyah), and the live 健壮 is the bodily-health sense only — a different sense of an ambiguous headword leading a row whose id and category point elsewhere (citizenship 公民权 11-17, virtuous 善良 11-18, reproduce 11-19 category rule). 稳健 is the project's own study-sense rendering (#724 robustness check = 稳健性检验; #918 / #921 聚类稳健标准误 / 双重稳健估计量). The 09-16 scan already said "强健/稳健 might fit better; defensible as is" (single, no change). Later senses: union of real senses, one from each reader — 健壮 kept (R1; the bodily sense survives, as 漏油 / 土葬 did) and 坚固 (R2; sturdy, the kukuh-of-things sense). Owner may trim to three. en-plus robust trans [健壮, 强壮] is the daily-sense dictionary line (not this row's category). | 稳健 / 强健 / 坚固 appear in no row (first or later); 健壮 only here. 健壮 retires as a first sense (stays third) → pin 健壮 → robust (not a dictionary headword). Inline pinyin jiàn zhuàng → **regen** wěn jiàn. zh-pinyin.json + 稳健 (level 4); 健壮 not in zh-pinyin.json. |

### Mechanics (dry run, `python3 -I apply-gloss.py changes.json --dry`, log in `dry-run.log`; nothing written, repo `git status` clean)

```
LOG 943 service credit: no inline pinyin on this row -> left absent (zh-pinyin.json carries it)
LOG 943 service credit: pin 服务抵扣 -> service credit
LOG 943 service credit: zh-pinyin.json + 服务抵扣额 = fú wù dǐ kòu é|fu wu di kou e|4
LOG 1517 flat tire: no inline pinyin on this row -> left absent (zh-pinyin.json carries it)
LOG 1517 flat tire: pin 轮胎没气 -> flat tire
LOG 1517 flat tire: zh-pinyin.json + 瘪胎 = biě tāi|bie tai|4
LOG 1849 as a result: no inline pinyin on this row -> left absent (zh-pinyin.json carries it)
LOG 1849 as a result: pin 结果是 -> as a result
LOG 1849 as a result: zh-pinyin.json + 结果 = jié guǒ|jie guo|4
LOG 1849 as a result: SHARED first sense 结果 with ['so it becomes'] (practisedOnce)
LOG 2173 policy transfer: pinyin -> zhèng cè zhuǎn yí
LOG 2173 policy transfer: pin 政策移植 -> policy transfer
LOG 2173 policy transfer: zh-pinyin.json + 政策转移 = zhèng cè zhuǎn yí|zheng ce zhuan yi|4
LOG 2372 poetry: pinyin -> shī gē
LOG 2372 poetry: pin 诗 -> poetry
LOG 2372 poetry: zh-pinyin.json + 诗歌 = shī gē|shi ge|4
LOG 2542 bleeding: idSyllables -> 'per·da·ra·han'
LOG 3647 idiomatic: idSyllables -> 'i·di·o·ma·tik'
LOG 3806 robust: pinyin -> wěn jiàn
LOG 3806 robust: pin 健壮 -> robust
LOG 3806 robust: zh-pinyin.json + 稳健 = wěn jiàn|wen jian|4
zh-renames 254 keys -> KEYS_FLAG v4.254
```

Summary for the apply step: 6 retiring first senses 服务抵扣 / 轮胎没气 / 结果是 / 政策移植 / 诗 / 健壮 → src/zh-renames.json (248 → 254 keys, KEYS_FLAG v4.248 → v4.254); **none is a zh-core / zh-plus / zh-upper headword** (the script printed no exemption note; checked by `name` in check.py too), so no dictionary-exemption question this round. 3 inline pinyin regens (policy transfer zhèng cè zhuǎn yí, poetry shī gē, robust wěn jiàn); 9 rows keep their inline pinyin or have none. zh-pinyin.json additions: 服务抵扣额, 瘪胎, 结果, 政策转移, 诗歌, 稳健 (level 4; 结果 is a B2 row, 诗歌 an A2 row — owner may lower the level). zh-pinyin.json keys that become later-sense-only or orphans: 服务抵扣, 轮胎没气, 结果是 (all level 4; ledger zh-pinyin-orphan-hanzi-keys +3). 2 id changes → idSyllables regens (bleeding per·da·ra·han, idiomatic i·di·o·ma·tik); both new ids unique. Shared first sense to list: 结果 (as a result ↔ #2141 so it becomes). Later-sense shares to list: 因此 (as a result ↔ #1825 therefore's first sense), 疲惫 (exhaustion ↔ #38 tired's first sense).

**Script patch (this dir only, `apply-gloss.py`; original kept as `apply-gloss.py.orig`)**: line 42 set `r["pinyin"]` unconditionally when the first sense changed, which would have ADDED an inline pinyin field to rows 943 / 1517 / 1849, which have none (1976 of 3879 rows carry no inline pinyin and rely on zh-pinyin.json; stare #1561 was correctly left without one 11-18). Patched to regenerate only when the row already has `pinyin`, and to log "no inline pinyin on this row -> left absent" otherwise. One-line diff:
```
-            r["pinyin"] = btq.toned(new_first); log.append(...)
+            if "pinyin" in r: r["pinyin"] = btq.toned(new_first); log.append(...)
+            else: log.append(f"{c['i']} {c['en']}: no inline pinyin on this row -> left absent (zh-pinyin.json carries it)")
```
Dictionary follow-ups the change exposes (not part of changes.json; the dictionary pipeline is separate): en-core actor trans [演员, 演奏者, 艺人]; en-core ceremony trans [仪式, 典礼, 式]; en-core poetry trans [诗, 诗歌, 诗集]; en-plus disagree trans [不同意, 异议, 意见不同]; en-upper satisfactory trans [令人满意, 满意, 符合要求]; en-plus bleeding idtrans / zh-plus 出血 idtrans list pendarahan before perdarahan.

### Quoted reader lines (verbatim from R1.tsv / R2.tsv: i, en, field, verdict, replacement, reason)

- 943 R1: `943	service credit	zh	UNSURE	服务抵扣额；服务信用额	服务抵扣 is a verbal phrase (deduction of service), not the noun used in SLA contracts.`
- 943 R2: `943	service credit	zh	UNSURE	服务抵扣额；服务补偿额	服务抵扣 is a verb-like description (to offset service) rather than the noun service credit.`
- 1517 R1: `1517	flat tire	zh	UNSURE	瘪胎；爆胎；轮胎漏气	轮胎没气 is a colloquial clause describing the state, not the noun term.`
- 1517 R2: `1517	flat tire	zh	UNSURE	瘪胎；轮胎漏气	轮胎没气 is a descriptive sentence fragment rather than the term; flat tire is 瘪胎/漏气的轮胎.`
- 1849 R1: `1849	as a result	zh	UNSURE	结果；因此	结果是 is a clause fragment with the copula; the connective itself is 结果 or 因此.`
- 1849 R2: `1849	as a result	zh	UNSURE	结果；因此	结果是 is a clause fragment (result is ...); the connective is 结果/因此.`
- 2173 R1: `2173	policy transfer	zh	UNSURE	政策转移；政策移植	The established academic term for policy transfer is 政策转移; 政策移植 corresponds to policy transplant.`
- 2173 R2: `2173	policy transfer	zh	UNSURE	政策转移；政策移植	Standard mainland term for policy transfer is 政策转移; 政策移植 corresponds to policy transplant.`
- 2286 R1: `2286	actor	zh	WRONG	演员；男演员	演奏者 means instrumental performer, another word's meaning, not a sense of actor.`
- 2286 R2: `2286	actor	zh	UNSURE	演员；男演员	Second sense 演奏者 means an instrumental performer/musician, another word's meaning.`
- 2358 R1: `2358	ceremony	zh	WRONG	仪式；典礼	式 alone is a bound morpheme, not a standalone mainland word for ceremony.`
- 2358 R2: `2358	ceremony	zh	UNSURE	仪式；典礼	Third sense 式 is a bound morpheme/fragment, not a standalone word for ceremony.`
- 2372 R1: `2372	poetry	zh	UNSURE	诗歌；诗	诗集 means a poetry collection or anthology, another word's meaning.`
- 2372 R2: `2372	poetry	zh	UNSURE	诗歌；诗	Third sense 诗集 means a poetry collection/anthology, another word's meaning.`
- 2534 R1: `2534	disagree	zh	UNSURE	不同意；意见不同	异议 is a noun (objection), another word's meaning where the row is a verb.`
- 2534 R2: `2534	disagree	zh	UNSURE	不同意；意见不合	Second sense 异议 is the noun objection/dissent, another word's meaning, while disagree is a verb.`
- 2542 R1: `2542	bleeding	id	UNSURE	perdarahan	KBBI gives perdarahan as the medical baku form; pendarahan is the colloquial variant.`
- 2542 R2: `2542	bleeding	id	WRONG	perdarahan	KBBI gives perdarahan (from berdarah) as the baku noun for bleeding; pendarahan is a bentuk tidak baku.`
- 2653 R1: `2653	spouse	zh	WRONG	配偶	夫妻 means a married couple (both parties), another word's meaning, not spouse.`
- 2653 R2: `2653	spouse	zh	UNSURE	配偶；夫或妻	Second sense 夫妻 means the married couple as a pair, not one spouse; another word's meaning.`
- 2870 R1: `2870	satisfactory	zh	UNSURE	令人满意；符合要求	满意 alone means satisfied (the person), another word's meaning.`
- 2870 R2: `2870	satisfactory	zh	UNSURE	令人满意的；合格的	Second sense 满意 is satisfied (another word) and 符合要求 is a verb phrase rather than a gloss.`
- 2958 R1: `2958	exhaustion	zh	UNSURE	疲惫；极度疲劳；衰竭	疲惫不堪 and 筋疲力尽 are idiomatic phrases, not lexical senses of the noun.`
- 2958 R2: `2958	exhaustion	zh	UNSURE	疲劳；极度疲劳；疲惫	Last sense 筋疲力尽 is a four-character idiom, not a word gloss.`
- 3449 R1: `3449	synergistic	zh	UNSURE	协同的；增效的	协同作用 is the noun synergy, another word's meaning where the row is an adjective.`
- 3449 R2: `3449	synergistic	zh	WRONG	协同的；增效的	Second sense 协同作用 is the noun synergy, another word's meaning, while the headword is the adjective synergistic.`
- 3647 R1: `3647	idiomatic	id	UNSURE	idiomatik	KBBI lists idiomatik; idiomatis is doubtful as a headword.`
- 3647 R2: `3647	idiomatic	id	UNSURE	idiomatik	KBBI lists the adjective as idiomatik; idiomatis appears to be a non-KBBI variant.`
- 3806 R1: `3806	robust	zh	UNSURE	稳健；强健；健壮	For the study sense (robust results or methods) the word is 稳健; 健壮 is the bodily sense only.`
- 3806 R2: `3806	robust	zh	UNSURE	稳健；强健；坚固	For the study sense (robust method/evidence) and matching kukuh (firm), the gloss should be 稳健/强健; 健壮 is the bodily-health sense.`

---

## 2. KEEP — 25 fields / 24 rows (★ = single reader names a hard rule the precedent record has applied → flag for the next round, still KEEP)

| i | en | field | current | proposal (by whom) | reason |
|---|---|---|---|---|---|
| 535 | equity | zh | 所有者权益 | 权益；股权；所有者权益 (R1 UNSURE) | Single reader, R2 OK. Identical single-reader proposal KEPT 11-13 ("会计标准词，与 ekuitas / business 一致；裸 权益 歧义"); 09-15 scan noted only length. No new argument. |
| 548 | district office | zh | 区政府办事处 | 区公所；镇政府 (R1 UNSURE) | Single reader, R2 OK. 10-21 two readers split (乡镇公所 / 区公所) and nothing was applied; today one reader with a third variant. kantor kecamatan has no fixed mainland equivalent (公所 is a Taiwan/HK-leaning administrative term); the live descriptive form is at least transparent. Not a nameable error with one reader. |
| 974 | mop | id | kain pel | alat pel (R1 UNSURE) | Single reader, R2 OK. kain pel is the everyday Indonesian word for the mop (KBBI pel / mengepel), and the cloth-vs-tool distinction R1 draws is precision; alat pel is an alternative, not a correction. |
| 1117 | satay | zh | 沙爹烤串 | 沙嗲；沙嗲烤串 (R2 UNSURE) ★ | Single reader, R1 OK. 11-15 KEEP was R1 alone with 沙爹；沙嗲 (R2 then OK). Two different single readers over two rounds, never two in one round. R2 names the 大陆标准 rule (沙嗲 the mainland spelling, 沙爹 HK/Malaysian) — a hard rule applied with two readers (巴迪衫 11-11). Flag: if a second reader confirms 沙嗲 next round, the pair 沙嗲；沙嗲烤串 (or 沙嗲烤串 alone, keeping the compound 11-15 called a menu name) is ready; neither appears in any row. |
| 1126 | avocado juice | id | jus alpukat | jus avokad (R2 WRONG) ★ | Single reader WRONG, R1 OK — KEEP by the rule (closed 关闭 11-17; laundry detergent deterjen 11-18 needed R2 + V1). But R2 names the KBBI-form hard rule and is right that KBBI's baku headword is avokad with alpukat marked bentuk tidak baku. Counter-fact for the owner: wordfreq alpukat 3.68 vs avokad 0.0 — the baku form is virtually unused, so the detergen precedent (changed) and the owner's learner-value judgement pull apart. No other row contains alpukat / avokad. Flag for next round / verifier. |
| 1704 | wrench | id | kunci inggris | kunci pas (R1 UNSURE) | Single reader, R2 OK. Identical candidate KEPT 11-17 (R2 then) and 10-24: kunci inggris is the generic everyday word, kunci pas the open-end spanner. No new argument. |
| 2395 | tennis | zh | 网球；草地网球 | 网球 (R1 UNSURE) | Single reader, R2 OK. First sense correct; 草地网球 (lawn tennis) is a hyponym later sense like 白痢 / 赤痢 (dysentery KEEP 11-19) and 土葬 third (burial 11-19), not a non-word. Precision only. |
| 2581 | dignity | zh | 尊严；自尊；自尊心 | 尊严；体面 (R1 UNSURE) | Single reader, R2 OK. First sense 尊严 = martabat correct; 自尊 / 自尊心 are Collins later renderings of dignity (sense of self-worth) — marginal, not another word's meaning outright. 体面 would be an addition. |
| 2616 | cylinder | zh | 圆柱；圆柱体；柱 | 圆柱；圆柱体；气瓶 (R1 UNSURE) | Single reader, R2 OK. First two senses correct; 柱 is a marginal later sense (汽缸/柱 for the engine part). Note for the owner: R1's 气瓶 would match id tabung (gas cylinder) better than 柱 — precision, single reader. |
| 2702 | historian | zh | 历史学家；历史家；史学家 | 历史学家；史学家 (R1 UNSURE) | Single reader, R2 OK. 历史家 is attested mainland usage (less common than 史学家) — marginal real word, not a fragment (翡翠 11-13 precedent). |
| 2706 | bomber | id | pengebom | pesawat pengebom (R1 UNSURE) | Single reader, R2 OK. 10-09 ruling: "both are senses of bomber; leave". KBBI pengebom covers the aircraft as well as the person in usage (pesawat pengebom is the fuller form); id/zh sense split is a precision item. |
| 2748 | exempt | zh | 免除；被豁免 | 免除；豁免 (R1 UNSURE) ★ | Single reader, R2 OK — KEEP by the rule. But 被豁免 is a passive verb phrase (被 + 豁免) as a later sense, the verb-phrase pattern changed with two readers (overturned 翻过来 11-16) and flagged for selected 挑选出来 11-18. R1's 豁免 is the plain word. Flag for next round. |
| 2757 | coma | zh | 昏迷；昏睡 | 昏迷 (R1 UNSURE) ★ | Single reader, R2 OK — KEEP by the rule. But the data supports R1 exactly as it supported courtesy 彬彬有礼 (11-19 flag): the 10-16 dictionary fix changed zh-upper 昏睡's trans from "coma; comatoseness" to "lethargy" (查找者 + VG-C), i.e. the project already ruled 昏睡 is not coma. Flag for next round; the replacement would be 昏迷 alone. |
| 2887 | omission | zh | 疏忽；遗漏；省略 | 遗漏；省略；不作为 (R2 UNSURE) ★ | Single reader, R1 OK ("all three valid"). The data leans R2's way: zh-plus 疏忽's trans was changed 10-13 from "omission; skip" to "negligence; oversight; carelessness" (agree-strict), so the project ruled 疏忽 ≠ omission; on the other hand id kelalaian is itself negligence, so the live lead matches the id and the legal act/omission sense (R2's 不作为). A lead change here would need the id reconsidered too (kelalaian / penghilangan). Flag as an id/zh-consistency check, single reader. |
| 2913 | motel | zh | 汽车旅馆；汽车游客旅馆 | 汽车旅馆 (R1 UNSURE) | Single reader, R2 OK. Identical single-reader candidate KEPT 11-19 (R1 then): 汽车游客旅馆 is a dictionary rendering, redundant but real. No new argument. |
| 2936 | amused | zh | 感到有趣的；觉得好笑 | 逗乐的；觉得有趣的；开心的 (R2 UNSURE) | Single reader, R1 OK ("both valid"). 感到有趣的 is the adjectival rendering (Collins: amused 感到有趣的), 觉得好笑 a verb phrase later sense — a later-sense edge like 间接提及 (11-16); R2's 逗乐的 / 开心的 are alternatives. Not a nameable first-sense error with one reader. |
| 3061 | precedence | zh | 优先；优先地位；在先 | 优先；优先权 (R1 UNSURE) | Single reader, R2 OK. First sense correct (id prioritas, changed 11-16). 在先 is a real word (事先 / 在先 = prior) and the legal "priority in time" sense — marginal later sense, not a fragment. |
| 3178 | overdo | zh | 过度；过分；过火；做得过分 | 做过头；过度；过分 (R1 UNSURE = R2 UNSURE, identical) ★ | **Two readers identical, but KEEP by the owner's instruction**: the live value is yesterday's two-reader convergence (11-19: R1 WRONG + R2 WRONG on 过度 first, V1 agreed 10/10), so today's proposal would reverse a decision one day old on two UNSURE. Substantively, 做过头 is 做 + 过头 (verb + complement), the same shape as the 做得过分 both rounds reject as a verb phrase, so adopting it as the lead would be inconsistent; 过度 as the lead for a verb headword was accepted by yesterday's readers (Chinese has no single-verb overdo). Flag the recurring point (verb-vs-adverb lead) for the owner; no change. |
| 3370 | dysentery | zh | 痢疾；白痢；赤痢 | 痢疾 (R1 UNSURE) | Single reader, R2 OK. Identical single-reader candidate KEPT 11-19 (R2 then): 白痢 / 赤痢 are real 现汉 hyponyms. Two single readers over two rounds, never two in one round; noted. |
| 3576 | extractor | id | pencabut | pengekstrak (R2 UNSURE) | Single reader, R1 OK ("KBBI derived form, baku"). Identical single-reader candidate 11-18 (R2 then) KEPT with the note that id (puller) and zh 提取器 (extractor device, 11-04) lean to different devices and pengekstrak is not a KBBI headword (ekstrak / mengekstrak only). Second round, same single reader: id/zh consistency item for the owner; no KBBI replacement agreed. |
| 3605 | underdevelopment | zh | 不发达；未开发 | 不发达；欠发达；发展不足 (R2 UNSURE) | Single reader, R1 OK ("both valid"). First sense correct; 未开发 (undeveloped / untapped) is loose but a dictionary rendering of underdevelopment in the economic sense; 欠发达 would be an addition. Precision only. |
| 3661 | seashell | id | cangkang | cangkang kerang (R1 UNSURE) | Single reader, R2 OK. KBBI cangkang = kulit keras (telur, kerang, siput); bare cangkang is the everyday word in context (daily row), cangkang kerang / kulit kerang a precision alternative. |
| 3661 | seashell | zh | 贝壳；海贝；海贝壳 | 贝壳；海贝壳 (R1 UNSURE) | Single reader, R2 OK. The live value was set 11-12 by R2 + V2 (finder + independent verifier), which deliberately kept 海贝 second and removed the morpheme 贝; 11-05 R1 had the same ordering preference. 海贝 is a Collins rendering of seashell (marginal later sense). No new argument. |
| 3678 | gangplank | zh | 跳板；踏板 | 跳板 (R2 WRONG) | Single reader WRONG, R1 OK ("both valid") — KEEP by the rule. 踏板 appears as a second rendering of gangplank in E-C dictionaries (Youdao 跳板；踏板), so it is a marginal dictionary sense rather than a clear other word's meaning; a 10-15 dictionary fix that removed gangplank from zh-upper 跳板's trans concerns the other direction and does not bear on this row. |
| 3823 | clarify | id | menjelaskan | memperjelas (R1 UNSURE) | Single reader, R2 OK. Identical candidate KEPT 11-05 (R2 then), 11-06 (KBBI 词形保留 list) and 09-16 verifier ("KBBI menjelaskan = menerangkan; membuat jelas, a legitimate rendering"). No new argument. |

---

## 3. OWNER — 8 (not changed; report as needs-owner)

| i | en | field | current | proposal | note for the owner |
|---|---|---|---|---|---|
| 1416 | undergraduate | id | mahasiswa S1 | mahasiswa sarjana (R1 WRONG = R2 WRONG, identical) | In the 30-row uppercase/digit set (recomputed today: #1416 is in it; ledger words-json-uppercase-ids refuted / owner). Both readers call only the form rule; the gloss is right. Proposal recorded (no row uses mahasiswa sarjana). Not changed. |
| 1880 | provincial minimum wage | id | UMP | upah minimum provinsi (R1 WRONG = R2 WRONG) | Uppercase set; same two-reader expansion recorded 11-14 for the owner. Not changed. |
| 1881 | district minimum wage | id | UMK | upah minimum kabupaten (R1 WRONG = R2 WRONG; R2 adds "(kota)") | Uppercase set; recorded 11-15. Note the readers' expansion drops the kota half of UMK (upah minimum kabupaten/kota); if the owner ever expands, upah minimum kabupaten/kota needs a slash, which the id charset rule forbids — one more reason the acronym stands. Not changed. |
| 1787 | vape device | id | perangkat vape | perangkat rokok elektrik (R1 UNSURE = R2 UNSURE) | English-loanword group (owner item since 10-31; disposable vape 11-17 OWNER). Both readers converge on rokok elektrik; same as the standing note. Not changed. |
| 2098 | disposable vape | id | vape sekali pakai | rokok elektrik sekali pakai (R1 UNSURE = R2 UNSURE) | Standing owner item (11-17 OWNER, loanword group). Same convergence as above — vape device and disposable vape would move together if the owner releases the group (neither replacement is used by any row). Not changed. |
| 1884 | grounded theory | id | grounded theory | teori dasar (R1 WRONG = R2 WRONG; R2 also teori beralas) | Standing owner item since 09-24 (English term kept: no KBBI form; 09-21 D proposed teori dasar). Both readers WRONG with the identical teori dasar — the strongest convergence yet, but the loanword-as-term decision is the owner's (grounded theory is used untranslated in most Indonesian methodology texts, and teori dasar also means "basic theory", an ambiguity worth weighing). Not changed. |
| 885 | laundry detergent | zh | 洗衣液 | R1 UNSURE 洗衣液；洗衣粉 / R2 UNSURE 洗衣剂；洗衣液；洗衣粉 | Put to the owner 11-18 (row's id qualifier cucian / pakaian); zh then KEEP on R1 alone. Today both readers flag the zh but the leads differ (R1 keeps 洗衣液 and adds 洗衣粉; R2 leads with the generic 洗衣剂) → also SPLIT. Agreed part: 洗衣粉 should be present. Minimal change the owner could nod to: **洗衣液；洗衣粉** (first sense kept → no pin, no regen; 洗衣粉 in no row). 洗衣剂 is the generic but much less used in daily speech (A2 row). Not changed. |
| 3257 | gout | id | asam urat | pirai (R1 UNSURE = R2 UNSURE, identical) | Formally an AGREE candidate (two readers, identical), **withheld by VG** as a terminology call (same handling as robustness check 11-19): (a) prior VG KEEP 11-06 with a stated reason ("gout asam urat — pirai 罕用"); (b) the project's own zh-upper 痛风 idtrans is [asam urat, pirai] — asam urat first, an accepted project rendering; (c) wordfreq pirai 0.0 — the KBBI headword is virtually unused, and R2 itself concedes "asam urat is common colloquially" (Kemenkes writes "asam urat (gout)"); (d) both UNSURE, neither calls asam urat wrong outright, so the reopening bar for a KEEP with a stated reason is not clearly met. Owner decides: pirai (KBBI disease headword; no row uses it; idSyllables pi·rai) or keep asam urat (everyday term; KBBI's own sense is uric acid). |

---

## 4. SPLIT — both readers see a defect, leads differ (minimal change the owner could nod to)

| i | en | field | current | R1 | R2 | VG would adopt | status |
|---|---|---|---|---|---|---|---|
| 1752 | x-ray | zh | 伦琴射线；放射线 | UNSURE 爱克斯光；爱克斯射线；伦琴射线 | UNSURE 爱克斯射线；爱克斯光 | Agreed part: 放射线 is radiation generally (= #1653 radiation's domain, 辐射), another word's meaning — both readers; and 伦琴射线 is dated (both). Leads differ (爱克斯光 vs 爱克斯射线), so no AGREE. History: 09-16 / 09-17 candidates (X光 / X射线 impossible under the characters-only rule; 伦琴射线 可保留 09-21), never two readers in one round until today. VG would adopt **爱克斯光；爱克斯射线；伦琴射线** (R1): 爱克斯光 is the everyday daily-B1 word (拍个X光 / 爱克斯光) matching id rontgen, and keeping 伦琴射线 third preserves continuity (as 土葬 / 漏油 were kept). Mechanics if nodded: pin 伦琴射线 → x-ray (not a dictionary headword, not in zh-pinyin.json), inline pinyin regen ài kè sī guāng, zh-pinyin + 爱克斯光; neither new sense is in any row; zh-pinyin.json's existing key X光 stays unaffected. The bare minimal alternative, dropping only the agreed-wrong 放射线 (→ 伦琴射线), keeps a lead both readers call dated. | **not applied** (first sense differs) |
| 3063 | ascending | zh | 上升 | UNSURE 升序；上升的 | UNSURE 上升的；升序 | Both readers add 升序 (ascending order, the study-B2 sense) and both give the same two senses; leads differ. R2's only objection to the live lead is the bare form (上升 vs 上升的), which the owner has not treated as an error (outer / systematic 11-15; evolutionary / fetal 11-17; blooming 11-18), so the agreed defect is the missing study sense, not the lead. Minimal change the owner could nod to: **上升；升序** (first sense kept → no pin, no regen; 升序 in no row). If the owner wants the study sense to lead (R1): 升序；上升的 — then id menaik (rising) still fits (urutan menaik = ascending order) and 上升 retires (also a later sense of #3099 ascent → "no pin" branch). en-academic ascending trans [上升] idtrans [mendaki] is the dictionary's daily-sense line. | **not applied** (first sense differs); flag for next round |
| 885 | laundry detergent | zh | 洗衣液 | UNSURE 洗衣液；洗衣粉 | UNSURE 洗衣剂；洗衣液；洗衣粉 | See OWNER: minimal 洗衣液；洗衣粉. | **not applied** (owner item 11-18 + first sense differs) |

---

## 5. Ten lowest-confidence decisions (least confident first)

1. **1517 flat tire AGREE 瘪胎；轮胎漏气** — reverses a 09-24 verifier KEEP (and 11-14 single KEEP); 瘪胎 is not a 现汉 headword (the 09-24 objection stands as a fact); the only new facts are the first two-reader convergence on this lead and the verb-phrase precedents (stare / overdo). If the verifier reads the reopening bar strictly, downgrade to KEEP (then 5 pins, v4.253, no 瘪胎 / 轮胎没气 mechanics).
2. **3647 idiomatic AGREE idiomatik** — rests on two independent KBBI claims that cannot be verified from the sandbox; wordfreq is 0.0 for both forms. If V1 shows idiomatis in KBBI, downgrade to KEEP.
3. **2958 exhaustion AGREE 疲劳；极度疲劳；疲惫** — R1's lead differs (疲惫); VG treated the swap as style because R1 states no defect in 疲劳; a stricter reading makes it SPLIT (minimal change would be identical anyway, since R2's value is the proposal).
4. **2870 satisfactory AGREE 令人满意；符合要求** — R2's lead is 令人满意的 (的-form); VG applied the agreed deletion of 满意 treating the 的 as style per precedent; a stricter reading makes it SPLIT.
5. **1849 as a result AGREE 结果；因此** — creates a first-sense share with #2141 so it becomes (结果) and a later-sense share with #1825 therefore (因此); 因而 would avoid the share but is less faithful to akibatnya. Both readers wrote 结果；因此.
6. **3806 robust AGREE 稳健；强健；健壮；坚固** — four senses by union; 坚固 is single-reader (R2) and 健壮 single-reader (R1) as later senses; 稳健；强健；健壮 (R1's exact value) is the shorter alternative. Lead 稳健 is solid (project's own 稳健性检验 / 聚类稳健标准误).
7. **2372 poetry AGREE 诗歌；诗** — the agreed defect is 诗集; the lead swap is the readers' identical value but unexplained in their reasons; 诗；诗歌 would avoid the pin + regen.
8. **943 service credit AGREE 服务抵扣额** — a lone first sense (intersection); 服务抵扣额 is attested (Azure SLA zh-CN) but not a dictionary word; the readers' later senses were each single-reader and weak.
9. **3257 gout OWNER (withheld)** — formally two readers identical = AGREE; VG withheld on the 11-06 KEEP, the project dictionary and pirai's non-use. If the verifier prefers the standing rule literally, apply pirai (ids unique, idSyllables pi·rai).
10. **3178 overdo KEEP** — two readers identical today against yesterday's two-reader value; kept on the owner's instruction and on the verb-phrase inconsistency of 做过头; the owner should settle the verb-vs-adverb lead question once.

(Also noted: 1126 avocado juice KEEP ★ — KBBI avokad is right but unused; 2757 coma and 2887 omission KEEP ★ — the project's own 10-16 / 10-13 dictionary fixes already side with the single reader.)

## Files in this dir
- `VG.md` (this), `changes.json` (15 AGREE items), `dry-run.log` (the LOG lines above), `check.py` (data checks), `apply-gloss.py` (patched: inline-pinyin guard) + `apply-gloss.py.orig` (as received).


## apply-gloss.py dry-run log

```
LOG 943 service credit: no inline pinyin on this row -> left absent (zh-pinyin.json carries it)
LOG 943 service credit: pin 服务抵扣 -> service credit
LOG 943 service credit: zh-pinyin.json + 服务抵扣额 = fú wù dǐ kòu é|fu wu di kou e|4
LOG 1517 flat tire: no inline pinyin on this row -> left absent (zh-pinyin.json carries it)
LOG 1517 flat tire: pin 轮胎没气 -> flat tire
LOG 1517 flat tire: zh-pinyin.json + 瘪胎 = biě tāi|bie tai|4
LOG 1849 as a result: no inline pinyin on this row -> left absent (zh-pinyin.json carries it)
LOG 1849 as a result: pin 结果是 -> as a result
LOG 1849 as a result: zh-pinyin.json + 结果 = jié guǒ|jie guo|4
LOG 1849 as a result: SHARED first sense 结果 with ['so it becomes'] (practisedOnce)
LOG 2173 policy transfer: pinyin -> zhèng cè zhuǎn yí
LOG 2173 policy transfer: pin 政策移植 -> policy transfer
LOG 2173 policy transfer: zh-pinyin.json + 政策转移 = zhèng cè zhuǎn yí|zheng ce zhuan yi|4
LOG 2372 poetry: pinyin -> shī gē
LOG 2372 poetry: pin 诗 -> poetry
LOG 2372 poetry: zh-pinyin.json + 诗歌 = shī gē|shi ge|4
LOG 2542 bleeding: idSyllables -> 'per·da·ra·han'
LOG 3647 idiomatic: idSyllables -> 'i·di·o·ma·tik'
LOG 3806 robust: pinyin -> wěn jiàn
LOG 3806 robust: pin 健壮 -> robust
LOG 3806 robust: zh-pinyin.json + 稳健 = wěn jiàn|wen jian|4
zh-renames 254 keys -> KEYS_FLAG v4.254
```
