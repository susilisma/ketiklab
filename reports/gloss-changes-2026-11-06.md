# 释义修正明细 · 2026-11-06

方法：昨日 0–3878 顺序双读已收尾，今日改为**抽查**：以种子 20261106 从 words.json 随机抽 320 行（`scratchpad/sample-320.json`），R1 顺读、R2 倒读，两人只见 row / en / id / zh / category；并集 31 行（R1 非 OK 27：WRONG 3 / UNSURE 24；R2 非 OK 16：WRONG 2 / UNSURE 14；两人同标 12 行）交盲判裁定者 VG（不见读者意见，只见候选行与邻行），VG 判 11 APPLY / 51 KEEP（每行 id、zh 分判）。规则同前：VG 判 APPLY 且替换值与至少一位读者的替换值（或理由中点名的词）相同即改。KBBI 在线不可达，KBBI 判断依赖编辑知识。

## 已改（11，提交 6afa68a）

| 行 | 词头 | 字段 | before → after | 同意者 | 理由 |
|---|---|---|---|---|---|
| 472 | utility bill | zh | 公用事业账单 → 水电费账单；公用事业账单 | R1 + VG | 公用事业账单 是直译，口语与账单实务说 水电费账单 |
| 539 | withholding tax | id | pajak penghasilan dipotong → pemotongan pajak | R2 + VG | 原值是从句片段；DJP 表格用 pemotongan pajak（bukti pemotongan pajak） |
| 838 | time series | id | data runtun waktu → runtun waktu | R1 + R2 + VG | 词头无 data；同库 interrupted time series = runtun waktu terinterupsi |
| 1782 | woven cloth | zh | 编织布 → 手织布；织布 | R1 + VG | 编织 是针织 / 编结；kain tenun 是织机织布，中文叫 手织布 / 织布；编织布 是编织袋布 |
| 2355 | legend | zh | 传说；寓言 → 传说；传奇；图例 | R1 + VG | 寓言 是 fable；首义 传说 不变，补 传奇 / 图例（legenda 亦含图例义） |
| 3126 | resent | id | benci → membenci | R1 + R2 + VG | 动词词头取 meN- 形；benci 是词根 / 形容词 |
| 3293 | biochemical | id | biokimia → biokimiawi | R1 + VG | 形容词词头；biokimia 是名词 生物化学；同库 chemical = kimiawi |
| 3335 | unresponsive | zh | 反应迟钝；无答复 → 无反应；无答复；反应迟钝 | R1 + R2 + VG | unresponsive 主义 无反应（病人无反应）；反应迟钝 是 sluggish |
| 3374 | spillage | zh | 溅出量；溢出量 → 溢出；泄漏；溢出物 | R1 + R2 + VG | 溅出量 / 溢出量 是量词片段；词典首义 溢出 / 泄漏 |
| 3685 | site | zh | 位置 → 地点；场地；网站 | R2 + VG | 位置 是 position；site 是 地点 / 场地 / 网站 |
| 3698 | regional | id | daerah → regional | R1 + R2 + VG | 形容词词头；daerah 是名词；KBBI 有形容词 regional（同库 corporate = korporat、medical = medis） |

- 每行重生成 pinyin / idSyllables（scratchpad/G/apply-gloss.py，今日重写，随沙箱丢失）；5 个旧首义 公用事业账单 / 编织布 / 反应迟钝 / 溅出量 / 位置 钉入 src/zh-renames.json（209 → 214，KEYS_FLAG v4.209 → v4.214）；zh-pinyin.json 新增 水电费账单 / 手织布 / 无反应 / 溢出 / 地点（等级沿用旧首义，均为 4）。
- 共享值：本次 11 个新值都不与其它行的首义 / id 重复（zh 首义重复 33、id 重复 19 不变）。

## 未改（VG KEEP，51 项 / 31 行；节录）

- 读者标 WRONG 而 VG KEEP：1149 temporary residence card id KITAS（两读者都因大写判 WRONG；VG：缩写属主人项，释义本身正确）。
- 技术 / 事务用语按实务保留：419 freight ongkos kirim / 运费、546 immigration counter loket imigrasi / 移民服务窗口、547 village office kantor kelurahan / 村镇办事处、880 common support、913 tax payment code kode billing pajak（DJP 官方用语，借词规则让位）、948 participant number 参保人编号（BPJS 语境）、1894 institutional capacity 制度能力。
- KBBI 词形保留：1673 expiry kedaluwarsa、1844 on the contrary malah / 反而、2140 then terus（口语词簇）、2768 insecure tidak aman、3083 cannibalism kanibalisme / 同类相食、3140 morbid、3200 aba gamis（abaya 更近，主人可定）、3257 gout asam urat（pirai 罕用）、3429 adipose lemak、3543 gnarled berkerut-kerut、3646 haptic haptik、3823 clarify menjelaskan。
- 其余 zh 字段（时间序列 / 预扣税 / 怨恨 / 生化的 / 痛风 / 澄清 / 地区的 等）均 KEEP。

## 读者未标的边缘行（供下次参考）

2211 movie 影片；电影（序）、2721 urine 小便；尿（序）——R1 按「不计换序」未标。
