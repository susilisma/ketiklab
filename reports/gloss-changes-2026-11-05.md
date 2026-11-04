# 释义修正明细 · 2026-11-05

方法：words.json 3600–3878（最后 279 行）双盲读（R1 顺读 / R2 倒读，R2 另读 3268 ulcer）。两位读者都没有标出达到 WRONG 门槛的行，共标 UNSURE 52 处（并集；两人同标 15 处）。独立裁定者 VG 只见 live 与读者提议值（不见读者身份与理由）盲判：17 APPLY / 35 KEEP。按主人 2026-11-02 决定「正确优先于唯一」，VG 判 APPLY 且替换值与至少一位读者相同即改：提交 `d5db37a` 共 **17 处**（id 11 / zh 6），6 个旧首义钉入 zh-renames.json、删除被 娱乐 遮蔽的 `娱乐 → recreational`（KEYS_FLAG v4.204 → v4.209），zh-pinyin.json 新增 娱乐 / 装饰（沿用旧首义的等级）。11 个新值与另一词头共享（见表）。

## 已改（17）

| 行 | 词头 | 字段 | before → after | 同意者 | 理由 |
|---|---|---|---|---|---|
| 3646 | haptic | id | sentuhan → haptik | R1+VG | sentuhan is the noun touch; haptic is an adjective and KBBI has haptik |
| 3695 | excellent | id | sangat baik → unggul | R1+R2+VG | sangat baik is a two-word paraphrase (very good); unggul is a KBBI adjective used for excellent |
| 3696 | exist | id | eksis → ada | R1+R2+VG | eksis is marked cakapan in KBBI; the standard word is ada |
| 3697 | electric | id | elektris → listrik | R1+R2+VG | elektris is a rare loan form; every bilingual dictionary gives listrik (mobil listrik, arus listrik) |
| 3704 | usual | zh | 常见 → 通常；平常；惯常 | R1+VG | 常见 means common/frequently seen, not usual; usual is 通常/平常/惯常 |
| 3742 | investigate | zh | 侦查；调查研究 → 调查；侦查；调查研究 | R1+R2+VG | 侦查 is the narrow criminal-investigation sense; the common translation 调查 is missing |
| 3763 | grandma | id | oma → nenek | R1+R2+VG | oma is a Dutch-derived colloquial form; the standard word is nenek |
| 3765 | provincial | id | kedaerahan → provinsial | R2+VG | kedaerahan is a noun (regionalism); provincial is an adjective and KBBI has provinsial |
| 3776 | litigation | zh | 诉讼案件；打官司 → 诉讼；诉讼案件；打官司 | R2+VG | litigation is 诉讼; 诉讼案件 is a litigation case, a narrower noun |
| 3788 | adjacent | id | sebelah → bersebelahan | R1+R2+VG | sebelah is a noun (side, next door); adjacent is an adjective, bersebelahan |
| 3801 | distinctive | id | berciri khas → khas | R1+R2+VG | berciri khas is a paraphrase; khas is the KBBI adjective meaning distinctive |
| 3825 | enthusiastic | id | penuh semangat → antusias | R2+VG | penuh semangat is a paraphrase; antusias is the KBBI adjective |
| 3826 | entertain | id | menjamu → menghibur | R1+VG | menjamu is the narrow secondary sense (host guests); the primary sense amuse is menghibur |
| 3826 | entertain | zh | 招待 → 娱乐；款待；招待 | R1+VG | 招待 is only the secondary host sense; the primary sense 娱乐 is missing |
| 3829 | decoration | zh | 装潢 → 装饰；装饰品；装潢 | R2+VG | 装潢 is narrow (interior finishing/mounting); the common translation 装饰/装饰品 is missing |
| 3837 | probable | id | berkemungkinan → mungkin | R1+VG | berkemungkinan is a verb (to have a possibility); probable is an adjective, glossed mungkin in bilingual dictionaries |
| 3870 | kidnap | zh | 拐带；绑票 → 绑架；诱拐；绑票 | R1+VG | 拐带 is rare; the common translation of kidnap is 绑架 |

共享新值：unggul（excel）、listrik（electricity）、nenek（grandmother）、mungkin（maybe）、antusias（eager）、menghibur（comfort）、通常（usually）、调查（survey）、诉讼（lawsuit）、装饰（adornment）、绑架（abduction）——词头不同，不合并；阶梯按练习值只练一次。

## 未改（VG KEEP，35）

| 行 | 词头 | 字段 | live | 读者提议 | VG 理由 |
|---|---|---|---|---|---|
| 3268 | ulcer | id | borok | R2: tukak | borok is a KBBI word for a festering sore/ulcer; tukak is the medical term but borok is not wrong |
| 3602 | sorption | zh | 吸收；吸附；吸附作用 | R1: 吸着；吸附；吸附作用 | sorption covers absorption and adsorption; 吸收/吸附 are listed in standard E-C dictionaries, 吸着 is a style preference |
| 3609 | insubordinate | id | membangkang | R1: tidak patuh | membangkang (defiant, refusing orders) is the standard dictionary gloss; tidak patuh is a paraphrase |
| 3648 | tannin | zh | 丹宁酸；鞣酸 | R1: 单宁；鞣质；鞣酸；R2: 单宁；鞣酸；单宁酸 | 丹宁 is an accepted variant of 单宁 and 鞣酸 is standard; ordering/spelling is a style choice |
| 3661 | seashell | zh | 海贝；海贝壳；贝 | R1: 贝壳；海贝壳；海贝 | 海贝/海贝壳 are legitimate translations of seashell; 贝壳 first is a preference |
| 3680 | liquefy | id | mencair | R2: mencairkan | liquefy is both transitive and intransitive; mencair covers the intransitive sense correctly |
| 3685 | site | zh | 位置 | R1: 地点；场所；位置；网站 | 位置 is listed for site in standard dictionaries; thin but not wrong |
| 3688 | marriage | id | nikah | R1: pernikahan；R2: pernikahan | nikah is a KBBI noun meaning marriage; pernikahan is fuller but nikah is not wrong |
| 3689 | holy | id | kudus | R2: suci | kudus is a standard KBBI adjective meaning holy/sacred |
| 3690 | drug | id | narkoba | R1: obat | narcotic sense of drug is a primary everyday sense and the entry is consistent with its zh gloss; not wrong |
| 3690 | drug | zh | 毒品；麻药；麻醉药 | R1: 药物；毒品；麻醉药 | 毒品 is a standard first translation of drug(s); coherent with the id gloss |
| 3691 | evening | id | petang | R2: malam | petang is the dictionary word for evening (selamat petang); malam is night |
| 3698 | regional | id | daerah | R2: regional | daerah is used attributively for regional (pemerintah daerah); legitimate gloss |
| 3709 | importance | id | kepentingan | R2: arti penting | kepentingan has the sense of importance alongside interest in KBBI; not wrong |
| 3710 | tournament | zh | 比赛；竞赛；锦标赛 | R2: 锦标赛；比赛；竞赛 | all three senses are correct; ordering is a style preference |
| 3727 | resident | id | penghuni | R2: penduduk | penghuni (occupant/inhabitant) is a standard gloss for resident |
| 3729 | merely | id | saja | R2: hanya | saja (only, just) is a standard gloss for merely |
| 3730 | routine | id | rutin | R1: rutinitas | rutin is the KBBI adjective for routine; routine is also an adjective in English |
| 3744 | treaty | zh | 协定；条约 | R2: 条约；协定 | both senses correct; ordering is style |
| 3748 | frequent | id | acap | R2: sering | acap is a standard KBBI word meaning sering/kerap |
| 3753 | attract | id | memikat | R2: menarik | memikat (captivate, attract) is a legitimate gloss for attract |
| 3755 | cargo | zh | 船货；装载物 | R2: 货物；船货；装载物 | 船货 is the standard E-C dictionary gloss for cargo; 货物 first is a preference |
| 3756 | gentleman | id | pria terhormat | R2: tuan | no clean single KBBI equivalent; tuan shifts the meaning to sir/master, so the descriptive gloss stands |
| 3790 | glorious | id | mulia | R2: gemilang | mulia (noble, glorious) is a standard gloss; gemilang is an alternative |
| 3796 | ignorant | id | jahil | R1: bodoh | KBBI sense 1 of jahil is bodoh/tidak tahu, i.e. ignorant |
| 3800 | relaxed | zh | 悠闲 | R1: 放松；轻松；悠闲；R2: 放松；轻松；悠闲 | 悠闲 is a legitimate translation of relaxed; 放松/轻松 are additions, not corrections |
| 3814 | burial | zh | 土葬；埋葬 | R1: 埋葬；葬礼；土葬；R2: 埋葬；葬礼；土葬 | 土葬 is a correct (specific) translation and 埋葬 is present; ordering is style |
| 3823 | clarify | id | menjelaskan | R2: memperjelas | menjelaskan (make clear, explain) is a standard gloss for clarify |
| 3825 | enthusiastic | zh | 热心 | R2: 热情；热心；热衷 | 热心 is listed for enthusiastic in standard dictionaries; 热情 is an alternative |
| 3831 | flee | zh | 奔逃；溃退；逃 | R1: 逃跑；逃离；逃；R2: 逃跑；逃离；奔逃 | 奔逃 and 逃 are correct translations of flee; 逃跑 first is a preference |
| 3841 | trader | id | saudagar | R2: pedagang | saudagar (merchant) is a standard KBBI word; pedagang is an alternative |
| 3844 | amusement | zh | 乐趣；兴味 | R1: 娱乐；消遣；乐趣 | 乐趣 is a legitimate sense of amusement (to my amusement); 娱乐 is an addition |
| 3853 | campaigning | id | berkampanye | R2: kampanye | campaigning as a gerund maps to berkampanye; kampanye is the base noun |
| 3856 | adulthood | id | kedewasaan | R2: masa dewasa | kedewasaan (state of being adult) is a legitimate gloss |
| 3877 | cuddle | zh | 偎依；偎抱 | R1: 搂抱；依偎；拥抱 | 偎依 (snuggle) is a legitimate translation of cuddle; 搂抱 is an alternative |
