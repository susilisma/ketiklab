# 释义修正明细 · 2026-11-11

方法：种子 20261111 从 words.json 随机抽 320 行（`scratchpad/R/sample-20261111.json`），R1 顺读、R2 倒读，两人只见 row / en / id / zh / category / examples；R1 非 OK 21（zh UNSURE 7，id WRONG 2 / UNSURE 12，OK-ABBR 2），R2 非 OK 25（zh UNSURE 11，id WRONG 1 / UNSURE 11，OK-ABBR 2）；并集 32 个字段 → VG 盲判 APPLY 13 / KEEP 19；另 E 的共享首义核对提出 foray 一项，VG 单独裁定 APPLY。VG 判 APPLY 且替换值与至少一位读者相同即改（14/14 满足）。

## 已改（14：提交 c146b6e 13 处 + 1c57d81 1 处）

| 行 | 词头 | 字段 | before → after | 同意者 | 理由 |
|---|---|---|---|---|---|
| 1493 | wrinkle | zh | 褶皱 → 皱纹；褶皱 | R1 + VG | 日常类词条 wrinkle（对应 kerutan）首指皮肤皱纹，母语者说皱纹；褶皱指布料或地质的折痕，作首义属不同词义。 |
| 1702 | batik shirt | zh | 巴迪衫 → 蜡染衬衫；巴迪衫 | R2 + VG | 巴迪衫是马新华语说法，不是大陆普通话母语者会用的词；按大陆标准规则首义改为蜡染衬衫，保留巴迪衫作后义。 |
| 2522 | dental | id | gigi → dental | R1 + VG | 词头为形容词而 gigi 是名词，KBBI 收有形容词 dental（berkaitan dengan gigi），按 topografis 规则应用形容词形式。 |
| 2567 | cooling | zh | 冷却；致冷 → 冷却；制冷 | R1 + R2 + VG | 制冷是规范写法，致冷为非规范变体，两位读者一致。 |
| 2726 | organizational | id | organisasi → organisatoris | R1 + R2 + VG | 词头为形容词而 organisasi 是名词，KBBI 收有形容词 organisatoris，按 topografis 规则应改，两位读者均判 WRONG。 |
| 2761 | dilemma | zh | 困境；进退两难的境地；进退两难的局面 → 两难；困境；进退两难 | R2 + VG | dilemma 的本词是两难，困境泛指 predicament；后两义是释义短语而非词，属非词片段。 |
| 2932 | abdomen | zh | 肚子；胃；腹 → 腹部；肚子 | R1 + R2 + VG | 胃是器官 stomach 而非 abdomen，属错误义项必须删除；腹部为规范首义，两位读者一致。 |
| 3310 | dynamo | zh | 直流发电机；发电机 → 发电机；直流发电机 | R2 + VG | 日常类词条且 dinamo 泛指发电机/电机，直流发电机是技术性展开，不应作首义。 |
| 3410 | corset | zh | 紧身内衣；紧身褡 → 紧身胸衣；束腹；紧身褡 | R2 + VG | 紧身内衣是泛指贴身衣物的释义性说法而非 corset 本词，大陆通行说紧身胸衣/束腹。 |
| 3425 | senatorial | zh | 参议员的；参议院 → 参议员的；参议院的 | R2 + VG | 第二义参议院是名词 senate，与形容词词头不符，属不同词义项。 |
| 3532 | resettle | id | menetap → bermukim kembali | R1 + R2 + VG | menetap 只是定居，缺少 re- 的重新之义，属词义错误；官方用 bermukim kembali / pemukiman kembali。 |
| 3648 | tannin | zh | 丹宁酸；鞣酸 → 单宁；鞣酸；单宁酸 | R2 + VG | 规范译名是单宁/单宁酸，丹宁为非规范变体且易与丹宁布混淆；取保留义项更全的候选。 |
| 3759 | judicial | id | kehakiman → yudisial | R1 + VG | 词头为形容词而 kehakiman 是名词，KBBI 收有形容词 yudisial（如 Komisi Yudisial），按 topografis 规则应改。 |
| 3082 | foray | zh | 劫掠；奇袭；突袭 → 奇袭；突袭；劫掠 | E + VG | foray 的本词是突袭/奇袭（与 id serangan 一致），劫掠是 looting 的词义，不应作 foray 首义，降为后义保留历史用法。 |

- 每个 id 改动重生成 idSyllables；zh 改动中原有内联 pinyin 的行重生成（dilemma liǎng nán、abdomen fù bù、dynamo fā diàn jī、corset jǐn shēn xiōng yī、senatorial cān yì yuán de、tannin dān níng、foray qí xí），无内联者沿用 zh-pinyin.json；退休首义 褶皱 / 巴迪衫 / 困境 / 肚子 / 直流发电机 / 紧身内衣 / 丹宁酸 钉入 src/zh-renames.json（劫掠 不钉：仍是 looting 的活首义，且 zh:劫掠 是 zh-upper 词头、迁移本就豁免），腹部 因重新成为 abdomen 的活首义而从表中移除（原钉 abdominal）；KEYS_FLAG v4.216 → v4.222；zh-pinyin.json 新增 皱纹(3) 蜡染衬衫(4) 两难(4) 腹部(4) 紧身胸衣(4) 参议员的(4) 单宁(4)，等级沿用被替换首义。
- 共享值：发电机 现由 generator 与 dynamo 共享首义（practisedOnce 只练一次，属有意为之）；其余 13 个新值不与他行重复。

## 未改（VG KEEP，19）

| 行 | 词头 | 字段 | live | 读者建议 | VG 理由 |
|---|---|---|---|---|---|
| 565 | air conditioner | id | pendingin udara | AC | pendingin udara 是 KBBI 规范词，语义无误；AC 只是口语另一好选择，且含大写字母不符合 id 字符规则。 |
| 758 | chi-square test | id | uji khi-kuadrat | uji chi-kuadrat | khi-kuadrat 是语文局术语表给出的规范形式，chi-kuadrat 只是教材中的另一常见写法，现值并非错误。 |
| 781 | liquidated damages | zh | 约定损害赔偿 | 违约金；约定损害赔偿金 | 约定损害赔偿是法律文本中的标准译法，语义准确；违约金只是另一种可选说法，不构成错误。 |
| 934 | power bank | id | power bank | bank daya | 印尼人日常只说 power bank，交通部等官方通告亦直接使用该词，符合借词可接受的条件；bank daya 是无人使用的推荐译名。 |
| 1100 | star rating | id | penilaian bintang | rating bintang | penilaian 为规范词，语义无误；rating bintang 只是口语中的另一好选择。 |
| 1803 | waybill | id | resi pengiriman | surat jalan | 电商物流语境下运单即 resi，与中文运单对应；surat jalan 偏正式货运单据，属另一种选择而非纠错。 |
| 1888 | regulatory sandbox | id | regulatory sandbox | ruang uji coba terbatas | OJK 与 BI 的法规（POJK 13/2018、PBI 19/12/2017）均以 Regulatory Sandbox 为正式定义词，ruang uji coba terbatas 只是其释义，业内也直接说该英文词。 |
| 2144 | wick | zh | 导油棉 | 棉芯；导油棉；灯芯 | 无例句无法排除该行为电子烟行业语境，导油棉在该语境中正是行业通用词；若确认为通用词条再改为灯芯为首义。 |
| 2354 | temple | zh | 寺；寺庙；庙宇 | 寺庙；庙宇；寺 | 寺是可独立使用的词，寺庙亦已列为第二义，调整顺序只是风格偏好，不构成错误。 |
| 2429 | hilarious | id | lucu | kocak | lucu 与 hilarious 只是程度差异而非词义不同，kocak 属另一好选择。 |
| 2527 | noon | zh | 中午；日中；正午 | 中午；正午 | 首义中午正确，日中是书面语中确实存在的正午义，并非错误义项，仅为不常用的后置替代。 |
| 2743 | righteous | id | saleh | benar / lurus | saleh 是 righteous 在宗教语境的通行对应词，两位读者候选不一致（lurus/benar），无确凿错误。 |
| 2782 | accreditation | zh | 认证；鉴定 | 认可；认证 | akreditasi 在印尼多指高校认证，中文高校语境常说认证；认可只是认证认可体系中的另一规范说法，现值非错。 |
| 3005 | residue | zh | 剩余物；残渣；滤渣 | 残留物；残渣；剩余物 | 剩余物见于词典释义且与 sisa 对应，残渣亦已列出；改为残留物属另一好选择而非纠错。 |
| 3313 | geopolitical | id | geopolitik | geopolitis | KBBI 未收 geopolitis，两位读者亦不确定；KBBI 无形容词形式时名词作定语可接受。 |
| 3326 | brazen | id | tak tahu malu | tidak tahu malu | tak 是 KBBI 收录的 tidak 短形式（未标 cak），tak tahu malu 为通行说法，不属非规范形式。 |
| 3425 | senatorial | id | senator | senator | KBBI 无对应形容词，名词 senator 作定语可接受，候选与现值相同。 |
| 3517 | predilection | id | minat | kegemaran / kesukaan | minat 与 predilection 仅有细微差别，两位读者候选不一致（kesukaan/kegemaran），不构成确凿错误。 |
| 3609 | insubordinate | id | membangkang | tidak patuh | 印尼语常以动词作谓语形容，中文释义不服从；违抗亦为动词，membangkang 语义准确，无需改动。 |

- 两读者都把 1814 APBD、1877 PKWTT 记为 OK-ABBR（大写缩写 = 主人项，不改）。
- 工具：`scratchpad/G/apply-gloss.py <repo> <changes.json> [--write]`（live ≠ before 拒绝、字符集校验、自动钉 zh-renames 并删重新活跃的键、补 zh-pinyin 沿用旧首义等级、重生成 pinyin / idSyllables、紧凑序列化与仓库字节一致、写前全库校验）；随沙箱丢失，报告附源码摘要见末尾。
