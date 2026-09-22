# 释义复核清单 · 2026-09-23

> 今日查找者复核了 09-21 清单 D 节的约 40 项并通读 words.json / indonesian.json，提出 35 + 56 项；独立校验者逐行复核后，**31 行 words.json（266418e）与 55 行 indonesian.json（a121076）已改**（见报告「释义修正」）。下列各行**未改**，请主人决定。09-21 清单的 A–C、E 节仍待答复。

## A. 校验者不同意查找者（现值保留）

| en | 现 id | 现 zh | 查找者建议 | 校验者意见 |
|---|---|---|---|---|
| nasty | jahat | 令人厌恶；令人讨厌；卑鄙 | 恶劣的；令人厌恶的；卑鄙的 | 令人厌恶 本身就是 nasty 的惯用译法，改动只是风格 |
| interlude | jeda | 间歇 | selingan / 插曲；间奏 | interlude 首义是「间隔时段」，jeda / 间歇 成对；selingan/插曲 只盖音乐义，插曲 还有「事件」义 |

## B. 校验者不确定 / 首义不一致

| en / 词头 | 现值 | 查找者建议 | 校验者意见 |
|---|---|---|---|
| regulatory capture | penangkapan regulator / 监管俘获 | kooptasi regulator | 现值读作「逮捕监管者」确实不对，但 kooptasi regulator 也不是通行术语；印尼文献多保留英文或写 teori penangkapan (regulasi)。主人在英文借词（如 regulatory sandbox）与 kooptasi regulator 之间定 |
| appeasement | peredaan / 平息 | 绥靖；安抚 | 校验者认为商务表里首义应是 安抚（绥靖 是狭义政治义），首义不一致未改；平息 是动词，现值偏松 |
| marmot（D 节） | marmut / 土拨鼠 | — | KBBI marmut = 豚鼠（guinea pig），en 与 id 不对应；改 id（tupai tanah？）或改 en 由主人定 |
| wan / wobo / zafran / sejauh（indonesian.json） | — | — | 查找者不确定；sejauh 缺「就……而言」义但省略号不合 zh 字符规则 |

## C. 校验者同意但附注（已改，供复核）

| en | 已改为 | 附注 |
|---|---|---|
| cluster-robust standard error | galat baku kukuh klaster | 印尼统计论文多写 robust 或 kekar，主人若偏好 galat baku kekar klaster 也未被占用 |
| hoof | teracak | KBBI 词，口语少见（口语说 kuku kuda） |
| truffle | jamur truffle | 无 KBBI 词，印尼美食媒体与电商通用 |
| disreputable | tercela | tidak terhormat 也可，若主人偏好短语 |

## D. 数据检查者另提（未进入校验）

- indonesian.json 81 行是定义式长释义（含「，」「。」，如 kaskuser「印尼最大的在线论坛Kaskus的用户」、instagram 一整句），内容不错但作为一行释义偏长；dira「指示代词…」未能确认是印尼语词。
- words.json 147 行 en == id（target、hotel、data、visa…）：学印尼语配英文释义时释义等于词本身，是借词事实，非数据错误。
- append-batch.mjs 是否加门槛拒绝「无法找到 / 未找到 / 找不到」类释义（ikn/egianus 这次靠人工发现）。
