# 释义候选 · 2026-10-25（未改，待下一位读者或主人）

读者：R1 / R2 盲读 words.json 2400–2799（OK 393 / 394，WRONG 1 / 0）；R3 / R4 盲读 2800–3199（OK 394 / 391，WRONG 0 / 0）；R5 第八位读者读 10-24 候选第二、三节 34 项（WRONG 27 / UNSURE 7）；R6 读两方分歧 21 项（WRONG 11 / UNSURE 6 / OK 7）。

## 一、两方判错但被唯一性规则挡住（需要主人）

| 行 | 词头 | 字段 | live | 提议 | 占位 |
|---|---|---|---|---|---|
| 1677 | appraisal | zh | 绩效考核 | 评估（R2 + R5） | #317 evaluation |
| 823 | performance review | zh / id | 绩效评审 / tinjauan kinerja | 绩效考核 / penilaian kinerja（10-24 R6 WRONG、R5 UNSURE） | 1677 的旧值今日已腾出 penilaian kinerja；绩效考核 仍在 1677 |
| 2870 | satisfactory | id | cukup baik | memuaskan（R3 + R4 均 UNSURE） | #2635 |
| 2875 | humiliation | id | aib | penghinaan（R3 + R4 均 UNSURE） | #2809 |

## 二、只有一方判错、或替换词不一致

| 行 / 库 | 词头 | 字段 | live | 各方 |
|---|---|---|---|---|
| 2572 | ignorance | id / zh | kebodohan / 愚昧 | id：R6 WRONG ketidaktahuan，R1 R2 UNSURE 同词；zh：R2 R6 UNSURE 无知 |
| 1874 | subsidized lpg | zh | 补贴煤气 | R5 WRONG 补贴液化气；R1 R6 UNSURE 同词 |
| 2909 | metabolic | id | metabolisme | R6 WRONG metabolik；R3 UNSURE 同词；R4 OK（名词作定语惯例） |
| 2498 | retain | id | menyimpan | R1 R2 R6 UNSURE mempertahankan |
| 2762 | excel | id | berprestasi | R1 R2 UNSURE unggul；R6 OK |
| 765 | saucepan | zh / id | 小炖锅 / panci kecil | R5 R6 UNSURE 长柄锅；id R6 OK |
| 1752 | x-ray | zh | 伦琴射线 | R5 UNSURE 爱克斯光；R6 OK；R2 提 X光 不合字符规则 |
| 1682 | online motorbike taxi | id | ojol | R5 UNSURE ojek online；R2 ojek daring（被 #1110 占） |
| 1598 | headline | zh | 头条 | 10-24 R6 WRONG 标题；R5 UNSURE 新闻标题；今日 R6 OK |
| 3149 | bubbling | id | berbusa | R3 UNSURE bergelembung、R4 UNSURE berbuih、R6 UNSURE bergelembung |
| en-upper | spectator | zh | 旁观者 | D + R5 WRONG 观众；10-24 R6 OK；今日 R6 UNSURE 观众 |
| en-upper | binge | zh | 使吃得过饱 | D 狂欢 / 10-24 R6 放纵 / R5 暴饮暴食 / R6 暴食（都判错，词不一致） |
| en-upper | evangelical | zh | 基督教福音派 | R6 WRONG 福音派的；R5 UNSURE 福音派；10-24 R6 OK |
| en-upper | chevy | zh | 使困扰 | D 雪佛兰 / R5 烦扰 |
| en-upper | bypass 次义 | | 环形公路、环形路 | 未判 |
| 2458 / 2551 | transaction / predict | zh | 买卖 / 预言 | R2 UNSURE 交易 / 预测（均被占）；R6 OK |
| 2615 | kindly | zh | 亲切地；请 | 未判（id 已改） |

## 三、单方 UNSURE（留档）

2400–2799：2449 useless sia-sia；2525 mild lunak；2743 righteous saleh。2800–3199：2822 dietary diet；2846 remark ucapan；2876 meltdown peleburan；3004 celestial surgawi；3058 grossly terlampau；3126 resent benci；3158 clutter mengacaukan；3167 nutty kacang。

## 四、D 扫描 en-toefl / zh-* def 的 80 行（R7 盲读）

en-toefl 32 行：D 与 R7 首项一致的 20 行已改（见 gloss-changes-2026-10-25.md，提交 dd8b4b8）。两方都判错但首项不一致、未改：irritate（D 激怒 / R7 刺激 先）、dynamic（动态的 / 活力的）、allegedly（据说 ‖ 据称 / 据说, 据称 ‖ 涉嫌地）、legitimate（合法的 先 / 合理的 先）、characteristic（n. 特点, 品质 / n. 特点, 特征）、notorious（臭名昭著的 / 臭名昭著的, 声名狼藉的）、subduction（(板块) 俯冲, 潜没 / 俯冲 (地壳板块下沉)）、wakefulness（清醒, 不眠 / 清醒 (状态)）、edge（n. 边线 … / n. 边缘 …）。R7 判 OK：modest、isolate、insulate。

zh-core / zh-plus `def` 48 行：D 与 R7 都判错（R7 47 WRONG + 充足 UNSURE），都是 WordNet 名词义或错义挂在动词 / 形容词词头上（无力 = 阳痿、潜力 = 性能力、证据 = 数学证明、一天 = 行星自转周期、经营 = 大企业 …）。英文定义为自由文本，两方措辞不同，按"替换一致"规则未改；且 App.tsx 1184/1191 与 build-seo-pages.py 246 只对英语学习项读取 def，zh-* 的 def 目前任何地方都不显示（P3 卫生项）。根因在 build-zh-dicts.py 选 WordNet 同义词集时不按词头词性过滤——建议在 builder 里按 trans 的词性选集（沙箱无 wn 词典，不能重建），或主人认可后以 D 的 48 条建议文本（D 的建议全文存于 reports/gloss-candidates-2026-10-25-D-scan.md，R7 的判定存于 reports/gloss-candidates-2026-10-25-R7-verdicts.md）钉入 zh-gloss-fixes.json。
