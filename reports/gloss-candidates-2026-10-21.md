# 释义候选（2026-10-21 结转）

今日未改的行；`live` 为 2026-10-21 合入后的值。

## 一、10-20 结转 39 行中第五读者 R5 后仍未达成两方首项一致的 7 行

| 库 | 词头 | 字段 | live | 各方首项 | 说明 |
|---|---|---|---|---|---|
| zh-upper | 堂兄 | trans | cousin; cousin-german | 查找者 older male cousin (on father's side) / 盲校者 older male cousin / R1 OK / R5 cousin（WRONG 但首项不变） | R5 认为 cousin 可留首位、cousin-german 古旧；两方 WRONG 首项不一 |
| zh-upper | 水汽 | trans | vapor; vapour | R1 OK / R5 OK | 结案 |
| en-upper | inferior | trans | 下等; 下级 | R4 OK / R5 OK | 结案 |
| en-upper | unpaid | trans | 不取报酬地服务; 不受报酬; 不带薪 | 查找者 无报酬的 / R4 未支付的 / R5 无偿的 | 三方都判错、首项各异（词性都对）；下次读者定首项 |
| en-upper | sweetie | trans | 亲爱的人; 宝贝; 恋人 | 查找者 亲爱的 / R4 甜心 / R5 宝贝 | 同上 |
| en-academic | eased | trans | 使缓和; 放松 | R4 缓解 / R5 OK | 一方 OK，留 |
| en-core | ride | idtrans | pandu; perjalanan; tunggang | 查找者 tunggangan / R4 tumpangan / R5 naik | 三方判错（pandu 马来形式）首项各异；下次读者定 |
| en-core | works | idtrans | pabrik; kilang | R4 OK / R5 OK | 结案 |

## 二、D 扫描 30 行中 R4 首项不同或判 OK 的 8 行

| 库 | 词头 | 字段 | live | D | R4 |
|---|---|---|---|---|---|
| words | police report | zh | 报警记录 | 报案记录 | WRONG 警方报告；报案记录 |
| words | population administration | zh | 人口行政 | 户籍管理 | WRONG 人口管理；户籍管理 |
| words | heart | id | hati | jantung | WRONG jantung（被 cardiac 行占用，需同时改 cardiac → kardiak，需要主人） |
| en-plus | booth | idtrans | bilik; stan; gerai | gerai | OK |
| en-upper | counterpart | trans | 对应的人或物 | 对应方 | WRONG 对应的人 |
| en-academic | chipping | trans | 削下或凿下碎片; … | 碎裂 | WRONG 碎片 |
| en-toefl | resilience | trans | n. 快速恢复的能力; 弹性 | n. 韧性, 恢复力 | WRONG n. 恢复力, 韧性 |
| en-toefl | notation | trans | n. 音乐数学的符号 | n. 记号, 符号 | WRONG n. 符号, 记号 |

## 三、words.json 400–799 行 + 待定行：两位读者 R2 / R3 只有一方判错或双方 UNSURE 的行

| 行 | en | 字段 | live | R2 | R3 |
|---|---|---|---|---|---|
| 719 | p-value | zh | 概率值 | WRONG p值 | WRONG p值 | 
| 759 | t-test | zh | 均值检验 | WRONG t检验 | WRONG t检验 |
| 797 | regression discontinuity design | zh | 回归不连续设计 | WRONG 断点回归设计 | UNSURE 断点回归设计 |
| 24 | day | zh | 日子 | UNSURE 天 | WRONG 天（天 与其它行冲突待查） |
| 267 | immigration | zh | 入境；移民；移居 | WRONG 移民（被 immigrant 占用） | UNSURE 移民 |
| 870 | police report | zh | 报警记录 | UNSURE 报案记录 | UNSURE 报案记录 |
| 1982 | heart | id | hati | UNSURE jantung | OK |
| 422 | letter of credit | id | surat kredit | UNSURE surat kredit berdokumen | UNSURE 同 |
| 491 | laundry | zh | 洗衣 | UNSURE 待洗衣物 | UNSURE 待洗衣物 |
| 539 | withholding tax | id | pajak penghasilan dipotong | UNSURE pemotongan pajak | UNSURE pemotongan pajak penghasilan |
| 547 | village office | id / zh | kantor kelurahan / 村镇办事处 | UNSURE kantor desa / 村公所 | UNSURE 同 |
| 548 | district office | zh | 区政府办事处 | UNSURE 乡镇公所 | UNSURE 区公所 |
| 550 | legalization | zh | 认证手续 | UNSURE 认证 | UNSURE 认证 |
| 661 | net payment period | zh | 净付款期限 | UNSURE 付款期限 | UNSURE 付款期限 |
| 665 | population administration | zh | 人口行政 | UNSURE 户籍管理 | UNSURE 户籍管理 |
| 724 | robustness check | id | uji ketahanan | UNSURE uji kekokohan | UNSURE uji kekokohan |
| 765 | saucepan | zh / id | 小炖锅 / panci kecil | UNSURE 单柄锅 | UNSURE 奶锅 / panci |
| 787 | religious affairs office | zh | 宗教事务所 | UNSURE 宗教事务办公室 | UNSURE 同 |
| 790 | urban village head | zh | 城市行政村长 | UNSURE 村长 | UNSURE 村长 |
| 791 | neighborhood association letter | zh / id | 邻里证明信 / surat pengantar RT | UNSURE 邻长介绍信 / 小写 | UNSURE 邻长介绍信 |
| 198 / 254 / 300 / 347 / 502 / 546 / 567 / 586 / 781 / 789 / 795 / 3282 | campaign / queue / authority / urban village / penalty / immigration counter / extension cord / passport renewal / liquidated damages / subdistrict head / difference-in-differences / inaugurate | | | 一方或双方 UNSURE | 见 scratch 读者表（r2.md / r3.md 已随报告丢失，值已摘录于此行之前各条） |

备注：p-value / t-test 两位读者一致判错且替换一致（p值 / t检验），但 zh 字段只允许汉字与 ；，无法应用 → 需要主人决定是否放宽规则或改词头。
