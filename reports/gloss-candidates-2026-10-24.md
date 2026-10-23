# 释义候选（2026-10-24 结转）

今日未改的行；`live` 为 2026-10-24 合入后的值。改法同前：两位读者都判错且首项一致才改。

## 一、两方判错但被唯一性规则挡住（需要主人）

| 行 | en | 字段 | live | 两方 | 冲突 |
|---|---|---|---|---|---|
| 267 | immigration | zh | 入境；移民；移居 | R2(10-21) + R6(10-23) 移民 | 移民 是 #2599 immigrant 首义 |
| 1407 | contamination | zh | 沾染；污染 | R3 + R6(10-23) 污染 | 污染 是 #1394 pollution 首义 |
| 790 | urban village head | zh | 城市行政村长 | R6(10-23) + R5 村长 | 村长 是 #1146 village head 首义 |
| 550 | legalization | zh | 认证手续 | R6(10-23) + R5 认证 | 认证 是 #2782 accreditation 首义 |
| 1692 | ladder | id | tangga lipat | R1 + R2 tangga | tangga 是 #646 stairs 的 id |
| 2370 | marry | zh | 娶；嫁；结婚 | R3 + R4 结婚 | 结婚 是 #1958 get married 首义 |
| 840 | lagged variable | id | variabel tertunda | R6(10-23) + R5 variabel lag | lag 非 KBBI 词（借词，属主人） |
| 2101 | health insurance scheme | id | BPJS Kesehatan | R3 + R4 大写专名违反小写规则 | 30 个含大写 id 的既有需要主人项 |
| 719 / 759 | p-value / t-test | zh | 概率值 / 均值检验 | p值 / t检验 | zh 只允许汉字（10-21 需要主人项） |
| 1982 | heart | id | hati | D + R4(10-23) + R1 jantung | jantung 被 cardiac 占（10-21 需要主人项） |

## 二、只有一方判错、或首项不一致（下一位读者定）

| 行 / 库 | 词头 | 字段 | live | 各方 |
|---|---|---|---|---|
| 1677 | appraisal | zh / id | 绩效考核 / penilaian kinerja | R2 WRONG 评估 / penilaian；R1 UNSURE 同（评估 被 evaluation 占） |
| 1685 | martial art | zh / id | 印尼武术 / pencak silat | R2 WRONG 武术 / seni bela diri；R1 UNSURE 武术 |
| 1752 | x-ray | zh | 伦琴射线；放射线 | R2 WRONG X光（含拉丁字母不可用）；R1 UNSURE |
| 1682 | online motorbike taxi | id | ojol | R2 WRONG ojek daring（被 #1110 占）；R1 UNSURE |
| 1874 | subsidized lpg | zh / id | 补贴煤气 / gas melon | R2 WRONG elpiji bersubsidi；R1 UNSURE 补贴液化气 / elpiji bersubsidi |
| 1830 / 1852 | apparently / it turns out | id | ternyata / rupanya | R1 WRONG 1852 → ternyata、UNSURE 1830 → rupanya；R2 UNSURE 两行（两位读者都指出两行疑似互换） |
| 2230 | multiple | id | berganda | R3 WRONG ganda；R4 UNSURE ganda |
| 765 | saucepan | zh / id | 小炖锅 / panci kecil | R5 WRONG 长柄锅 / UNSURE panci；R6 单柄锅 / panci；R2 单柄锅 R3 奶锅 |
| 787 | religious affairs office | zh | 宗教事务所 | R6 WRONG 宗教事务办公室 / R5 UNSURE 同 |
| 1598 | headline | zh / id | 头条 / judul berita | R6 WRONG 标题 / R5 OK；R5 UNSURE id tajuk berita |
| 823 | performance review | zh / id | 绩效评审 / tinjauan kinerja | R6 WRONG 绩效考核（被 appraisal 占）/ R5 UNSURE 绩效考核；R5 UNSURE penilaian kinerja（被 appraisal 占） |
| 665 / 870 / 547 / 724 / 539 / 1396 / 1433 / 1533 / 950(id) / 1517 / 1037 / 1555 | 见 10-23 表 | | | R5 全部 UNSURE 或 OK，维持 |

## 三、D 扫描 86 行中盲读者 R6 首项不一致或未判错的 22 行

| 库 | 词头 | live | 各方 |
|---|---|---|---|
| en-core | crew | 全体机务人员 | D 船员 / R6 全体船员 |
| en-core | replacement | 候补者 | D 替换 / R6 替代品 |
| en-core | mac | 橡皮布防水衣 | D 雨衣 / R6 UNSURE 雨衣 |
| en-plus | relate | 使发生联系 | D 相关 / R6 联系 |
| en-plus | distinctive | 与众不同 | D 独特的 / R6 OK 独特的 |
| en-upper | notified | 使注意 | D 通知（notify 过去式） / R6 通知 |
| en-upper | aligned | 使结盟 | D 对齐的 / R6 对齐 |
| en-upper | binge | 使吃得过饱 | D 狂欢 / R6 放纵 |
| en-upper | chevy | 使困扰 | D 雪佛兰 / R6 UNSURE 雪佛兰 |
| en-upper | bypass | 环城高速公路 | D 旁路 / R6 绕道 |
| en-upper | flipped | 用拇指翻书页 | D 翻转（flip 过去式） / R6 翻转 |
| en-upper | evangelical | 基督教福音派 | D 福音派的 / R6 OK 福音派的 |
| en-upper | subscriber | 用户 | D 订户 / R6 订阅者 |
| en-upper | stricken | 使苦恼 | D 受灾的 / R6 受打击的 |
| en-upper | spectator | 旁观者 | D 观众 / R6 OK 观众 |
| en-upper | spun | 使旋转 | D 旋转（spin 过去式） / R6 旋转 |
| en-academic | interconnected | 使互相连接 | D 相互关联的 / R6 相互连接的 |
| en-academic | intoxicated | 使陶醉 | D 醉的 / R6 喝醉的 |
| en-academic | misled | 使入歧途 | D 误导（mislead 过去式） / R6 误导 |
| en-academic | launcher | 火箭发射装置 | D 发射器 / R6 UNSURE 发射器 |
| en-academic | surrogate | 候补者 | D 代理人 / R6 替代者 |
| en-academic | emptied | 使空出 | D 倒空（empty 过去式） / R6 倒空 |

## 四、两位读者都只 UNSURE 的行（留档）

1600–1999：1614 backpacker pejalan ransel；1704 wrench kunci inggris；1787 vape device vape；1791 shelf share porsi rak；1850 by the way ngomong-ngomong；1993 message 讯息；1884 grounded theory；1888 regulatory sandbox；1609 hospitality keramahan；1654 solar tenaga surya；1770 organizational chart；1799 past due 欠款逾期；1822 toll road 高速公路；1919 but tapi。
2000–2399：2006 job 职业；2015 side 侧面；2052 advance payment panjar；2063 documentation 文献记录；2085 suddenly happen 冷不防；2130 furthermore 进一步；2170 employment insurance scheme 就业保险；2175 regulatory capture penangkapan regulator；2211 movie 影片；2212 central sentral；2261 cultural kultural；2276 industrial；2304 typical tipikal；2389 extraordinary 了不起 / istimewa；2370 marry id kawin；2309 cheese 乳酪；2361 kit 成套工具；2115 / 2116 质性 / 量化。
