# 释义修正明细 · 2026-11-01（words.json 2400–2799）

方法：R1 顺读 / R2 倒读盲读 400 行；R5 只看 live 值重判两位读者标出的 52 处（WRONG 38 / OK 14）。只改「R5 WRONG + 至少一位读者同一首义 + 首义在 words.json 与队列中唯一 + 字符集合规」的行；2688 reproduce 因 id 是 berkembang biak（生物义）与 R5 的商务义 复制 相抵，主代理不确定，留档。提交 e2db4c3（22 处，15 个首义改名 → zh-renames.json，KEYS_FLAG v4.163）+ 971d96a（zh-pinyin.json 4 条）。V1 迁移种子测试指出：旧首义中 坚信、塑像、必需品、鼓掌（zh-plus）与 名作（zh-upper）同时是中文词典词头，迁移按既定设计（App.tsx:1142 词典豁免）让 zh:<旧义> 行保留词典名——这些行在改义前就经词典先行解析为词典词，今日不新增丢失；新首义 盟友、雕像、图表 也是词典词头，但主题键自 474a115 起为 zh:trio:<en>，不相撞。

## 已改（22）

| 行 | 词头 | 字段 | before → after | 同意者 | 理由 |
|---|---|---|---|---|---|
| 2476 | metropolitan | zh | 大城市；大都会；属大城市 → 大都市的；大都会的；大都市 | r1+r2+R5 | en is an adjective; 大城市 is a noun |
| 2487 | legislature | id | legislatif → badan legislatif | r1+R5 | legislatif is an adjective in KBBI; the noun is badan/lembaga legislatif |
| 2493 | ally | zh | 同盟；盟友；盟国 → 盟友；盟国；同盟者 | r1+R5 | 同盟 = alliance, not ally |
| 2502 | conviction | zh | 坚信；确信 → 信念；定罪；坚信 | r1+R5 | 坚信/确信 are verbs; the noun is 信念 (also legal 定罪) |
| 2527 | noon | id | siang → tengah hari | r1+r2+R5 | siang = daytime/midday broadly; noon = tengah hari |
| 2532 | bee | zh | 蜂；蜜蜂 → 蜜蜂；蜂 | r1+R5 | 蜂 is near-bound; 蜜蜂 is the standalone word |
| 2540 | statue | zh | 塑像；雕像 → 雕像；塑像 | r1+R5 | 雕像 is the plainly standard word |
| 2556 | administrator | zh | 管理人；管理员；管理者 → 管理员；管理者；行政人员 | r1+R5 | 管理人 is a narrow legal term; 管理员 is standard |
| 2575 | crushed | zh | 压破；压碎；碾碎 → 压碎的；碾碎的；被压垮的 | r1+R5 | 压破 is odd; en is an adjective/participle |
| 2610 | seller | zh | 卖主；卖方；小贩 → 卖家；卖方；销售者 | r1+R5 | 卖主 is dated; 卖家 is the everyday word |
| 2664 | necessity | zh | 必需品 → 必要性；必需品；需要 | r1+R5 | primary sense is abstract 必要性; 必需品 is only the countable sense |
| 2672 | optimistic | id | optimis → optimistis | r2+R5 | KBBI: optimis n (person), optimistis a; adjective form needed (optimis is common colloquially) |
| 2695 | affection | id | kasih → kasih sayang | r1+R5 | kasih alone is love; affection = kasih sayang |
| 2703 | fist | zh | 拳；拳头 → 拳头 | r1+R5 | 拳 is near-bound; 拳头 is the standalone word |
| 2716 | diagram | zh | 图；图表；图解 → 图表；示意图；图解 | r1+r2+R5 | 图 is just 'picture'; diagram = 图表/示意图 |
| 2723 | applause | zh | 鼓掌 → 掌声；鼓掌 | r1+r2+R5 | 鼓掌 is the verb; the noun is 掌声 |
| 2730 | evolutionary | id | evolusi → evolusioner | r2+R5 | evolusi is the noun; KBBI adjective is evolusioner |
| 2736 | masterpiece | zh | 名作；杰作 → 杰作；名作；代表作 | r1+R5 | 名作 = famous work; masterpiece = 杰作 |
| 2739 | colorful | id | warna-warni → berwarna-warni | r2+R5 | KBBI: warna-warni n; adjective is berwarna-warni |
| 2752 | continuity | id | keberlangsungan → kesinambungan | r1+r2+R5 | keberlangsungan = continuance/sustainability; continuity = kesinambungan (kontinuitas) |
| 2755 | voiced | zh | 有声；有浊音；浊音 → 浊音的；有声的；说出的 | r2+R5 | 有声 means 'with sound' (有声书); phonetic sense is 浊音的 |
| 2774 | akin | zh | 同性质；同类；有类似性 → 类似的；相似的；同类的 | r1+r2+R5 | 同性质 is a fragment; akin = 类似的 |

## 未改（R5 WRONG，但无共识或被唯一性挡住）

| 行 | 词头 | 字段 | live | 读者 | R5 | 阻碍 |
|---|---|---|---|---|---|---|
| 2422 | interaction | zh | 相互作用 | r1 互动；相互作用 | 互动；相互作用；交流 | 首义/id 已被占 |
| 2451 | continuous | zh | 不断；不间断；连续 | r1 连续的；不断的 | 连续；持续；不间断 | 首义不同 |
| 2458 | transaction | zh | 买卖；交易；生意 | r1 交易；买卖; r2 交易；买卖 | 交易；买卖 | 首义/id 已被占 |
| 2498 | retain | id | menyimpan | r1 mempertahankan; r2 mempertahankan | mempertahankan | 首义/id 已被占 |
| 2525 | mild | id | lunak | r1 ringan; r2 ringan | lembut | 首义/id 已被占 |
| 2551 | predict | zh | 预言；预料；预知 | r1 预测；预言；预料; r2 预测；预言；预料 | 预测；预言；预料 | 首义/id 已被占 |
| 2572 | ignorance | zh | 愚昧；无知 | r1 无知；愚昧 | 无知；愚昧 | 首义/id 已被占 |
| 2585 | rehabilitation | zh | 复原；康复 | r1 康复；复原；改造 | 康复；修复；改造 | 首义/id 已被占 |
| 2587 | robbery | zh | 抢劫案；抢劫 | r1 抢劫；抢劫案; r2 抢劫；抢劫案 | 抢劫；抢劫案 | 首义/id 已被占 |
| 2600 | thermal | zh | 热；热量 | r1 热的；热力的; r2 热的；热力的；保暖的 | 热的；热力的；保暖的 | 首义/id 已被占 |
| 2623 | absent | zh | 不在场；缺席 | r1 缺席；不在 | 缺席；不在；缺席的 | 首义/id 已被占 |
| 2666 | troubled | zh | 困扰；不安；麻烦 | r1 不安的；陷入困境的 | 不安的；烦恼的；陷入困境的 | 首义/id 已被占 |
| 2668 | moisture | id | kadar air | r1 kelembapan | kelembapan | 首义/id 已被占 |
| 2671 | abusive | id | menghina | r2 kasar | kasar | 首义/id 已被占 |
| 2788 | looting | zh | 抢夺；洗劫 | r2 洗劫；劫掠；抢劫 | 劫掠；哄抢；洗劫 | 首义/id 已被占 |
| 2688 | reproduce | zh | 繁殖；复制；再造 | r1 复制；再现；繁殖 | 复制；再现；繁殖 | id berkembang biak 是生物义，主代理不确定意图义 |

## R5 判 OK 关闭（14）

2449 sia-sia、2456 操作的、2484 坝、2504 berarti、2535 hilang、2543 漫画、2554 教练员、2593 makar、2602 分析员、2650 批评家、2706 pengebom、2721 小便、2787 公升、2795 pinguin。
