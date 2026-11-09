# 释义修正明细 · 2026-11-09

方法：种子 20261109 从 words.json 随机抽 320 行（`scratchpad/sample-20261109.json`），R1 顺读、R2 倒读，两人只见 row / en / id / zh / category / example；R1 非 OK 7（WRONG 2 / UNSURE 5，全部 id），R2 非 OK 13（id WRONG 3 / UNSURE 7，zh UNSURE 3）；并集 14 个字段 → VG 盲判 APPLY 9 / KEEP 5；VG 判 APPLY 且替换值与至少一位读者相同即改（9/9 满足）。

## 已改（9，提交 07d4712）

| 行 | 词头 | 字段 | before → after | 同意者 | 理由 |
|---|---|---|---|---|---|
| 451 | thermometer | zh | 体温计 → 温度计；体温计 | R2 + VG | thermometer 的词本身是“温度计”，“体温计”只是测体温的一种下位词，把普通词义收窄了，母语者会觉得不对。 |
| 840 | lagged variable | id | variabel tertunda → variabel lag | R1 + R2 + VG | tertunda 意为“被推迟”，印尼计量经济学教材一律用 variabel lag（或 variabel kelambanan），“variabel tertunda”不是该领域术语。 |
| 1906 | too much | id | terlalu → terlalu banyak | R2 + VG | terlalu 只是程度副词“太”，“吃得太多”必须说 makan terlalu banyak，单用 terlalu 不能表示数量过多。 |
| 1906 | too much | zh | 太 → 太多；过多 | R2 + VG | “太”单独只是程度副词 too，不能独立表达“过多”的数量义，too much 的词是“太多／过多”。 |
| 2165 | port of entry | id | pelabuhan masuk → tempat pemeriksaan imigrasi | R1 + R2 + VG | 印尼移民法规（UU Keimigrasian）对 port of entry 的正式术语是 Tempat Pemeriksaan Imigrasi（TPI），pelabuhan masuk 是直译而非行政用语，违反“行政术语从印尼实践”的规则。 |
| 2655 | anal | id | dubur → anal | R1 + R2 + VG | dubur 是名词“肛门”，而词头是形容词“肛门的”，KBBI 收有形容词 anal（berkenaan dengan dubur），词类错误须改。 |
| 3543 | gnarled | id | berkerut-kerut → berbonggol-bonggol | R1 + VG | berkerut-kerut 是“皮肤起皱”，而 gnarled 指树干、手指多瘤节且扭曲，对应 KBBI 的 bonggol（批量瘤节用重叠式 berbonggol-bonggol），母语者不会用 berkerut-kerut 形容树干。 |
| 3556 | topographical | id | topografi → topografis | R1 + R2 + VG | 词头是形容词而 topografi 是名词，KBBI 收有形容词 topografis（bersifat topografi），与库中 geografis、hormonal 等处理方式一致，词类错误须改。 |
| 3598 | calcareous | id | kapur → berkapur | R1 + R2 + VG | kapur 是名词“石灰”，calcareous 是“含石灰质的”形容词，KBBI berkapur 释为 mengandung kapur（tanah berkapur），词类错误须改。 |

- 每个 id 改动重生成 idSyllables；zh 改动的旧首义 体温计 / 太 钉入 src/zh-renames.json（214 → 216，KEYS_FLAG v4.214 → v4.216）；zh-pinyin.json 新增 温度计（等级沿用 体温计 = 4）与 太多（沿用 太 = 1）。
- 共享值：9 个新值无一与其它行的首义 / id 重复（zh 首义重复 33、id 重复 19 不变）。

## 未改（VG KEEP，5）

| 行 | 词头 | 字段 | live | 读者建议 | VG 理由 |
|---|---|---|---|---|---|
| 594 | deed of establishment | zh | 设立契约 | R2 UNSURE → 设立契据；公司设立公证书 | akta pendirian 实质上是发起人经公证的设立协议，“设立契约”虽不如“设立契据”贴近 deed 一词，但并非错误，母语者可以接受。 |
| 2535 | disappear | id | hilang | R2 UNSURE → menghilang | KBBI 将 hilang 标为动词（tidak ada lagi; lenyap; tidak kelihatan），词类正确且义项覆盖 disappear，menghilang 只是更贴近“消失于视线”，不构成错误。 |
| 2804 | stellar | id | bintang | R1 UNSURE → stelar | KBBI 未收 stelar，印尼天文学术语一律用 bintang 作定语（evolusi bintang、angin bintang），这是规范做法，不算错误。 |
| 3363 | frenzied | id | kalut | R2 UNSURE → kalap | KBBI kalut 为形容词（kacau; bingung; gugup），可表“慌乱狂乱”的状态，词类正确且与 frenzied 语义有重叠，kalap 偏指因怒失控，只是另一选择而非纠错。 |
| 3525 | stagnate | id | terhenti | R2 UNSURE → mandek | terhenti 是动词“停滞不前”，KBBI 对 mandek 的释义本身就是 terhenti; tidak lancar，且 mandek 被标为口语（cak），现值可接受。 |

## 读者判 OK 但留给主人的边缘项

- R1：451 thermometer 体温计（已按 R2 + VG 改为 温度计；体温计）、3680 liquefy 次义 溶解 = dissolve（首义 液化 正确）、1433 upgrade memutakhirkan（严格说是 update）、3217 seminal perintis / 3609 insubordinate membangkang（无干净的 KBBI 形容词）、3847 persecution penganiayaan（persekusi 亦已入 KBBI）。
- R2：apparition hantu（penampakan 更准）、retribution ganjaran（pembalasan 更准）、rehabilitate zh 首义 修复（恢复 或更好）；主人领域项（pod、regulatory sandbox、sell-in 一级出货、angklung、BPS / DPMPTSP 机构名）按实务保留。
- 两读者都把 1863 SPT tahunan、1163 kartu SIM 记为 OK-ABBR（大写缩写 = 主人项，不改）。
