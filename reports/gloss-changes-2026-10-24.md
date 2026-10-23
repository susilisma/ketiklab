# 释义修正全表 · 2026-10-24

规则同主人决定：查找者（或前一位读者）与独立盲读者两方都判错且首项一致才改；words.json 首义与印尼语唯一；库行钉入 scripts/en-gloss-fixes.json / zh-gloss-fixes.json；apply-gloss.py（D 重写，今日修一处钉值缓存 bug）对每个变更校验 live 值、唯一性与字符规则并重算 pinyin / idSyllables 与 coverage。

## 一、提交 e2f486a — 6 字段（10-23 结转争议行，第七位盲读者 R5 与 10-23 读者 R6 / D 一致）

| 库 / 行 | 词头 | 字段 | before | after | 理由 |
|---|---|---|---|---|---|
| words #950 | old-age security | zh | 养老储蓄保障 | 养老保障 | 储蓄 是多余扩展（R6 + R5） |
| words #1116 | fried rice | zh | 印尼炒饭 | 炒饭 | 印尼 是扩展，英文是泛指 fried rice（R6 + R5） |
| words #844 | goodness of fit | zh | 模型拟合优度 | 拟合优度 | 模型 是扩展（R6 + R5）；id kecocokan model 留（R5 UNSURE） |
| en-toefl | highlight | trans | n. v. 显著强调 | v. 强调, 突出；n. 重点, 亮点 | 一项含两词性、两义粘连（R6 + R5 首项一致；D 的名词义作第二项） |
| en-toefl | discharge | trans[0] | n. v. 释放排出 | v. 释放, 排出 | 同上（R6 + R5）；免职 保留 |
| zh-plus | 祈求 | def | the act of communicating with a deity (…adoration or contrition or thanksgiving) | to pray for; to beseech | WordNet 取了名词 prayer 的义（D + R5） |

## 二、提交 4011221 — 64 字段（D 扫描 en-core / en-plus / en-upper / en-academic 首义 85 行 + words.json 1 行，盲读者 R6 只见 live 值；两方判错且首项完全一致者改）

去重说明：当新首义已在原列表后面出现时（如 forum 公共集会场地；座谈会；论坛 → 论坛；座谈会），工具删去重复项，其余次义原样保留。

| 库 | 词头 | before (trans) | after (trans) | 理由 |
|---|---|---|---|---|
| en-core | issue | 争议中的事；待解决的事 | 问题；待解决的事 | 定义片段「争议中的事」，首义应为词本身 问题 ｜ 库内首义冲突: ['question'] |
| en-core | grow | 使成熟；成熟 | 生长；成熟 | grow 首义是 生长/成长，「使成熟」是罕见使动义 |
| en-core | line | 战斗编队系列；排队 | 线；排队 | 「战斗编队系列」是军事义的定义片段；首义 线/排 |
| en-core | forum | 公共集会场地；座谈会；论坛 | 论坛；座谈会 | 「公共集会场地」是古义定义；现代首义 论坛 |
| en-core | suppose | 使理论化；假定；假设 | 假设；假定 | 「使理论化」不是 suppose 的释义；首义 假设/认为 ｜ 库内首义冲突: ['guess'] |
| en-core | chemical | 与化学有关；化学 | 化学的；化学 | 「与化学有关」是定义片段；adj 化学的 / n 化学品 |
| en-core | residential | 与居住有关；住宅；住所 | 住宅的；住宅；住所 | 「与居住有关」是定义片段 |
| en-core | drunk | 使陶醉；喝醉了；酒醉 | 醉的；喝醉了；酒醉 | drunk 首义 醉的；「使陶醉」是 intoxicate 的使动义 |
| en-core | hitting | 使撞击；冲击；冲撞 | 打；冲击；冲撞 | 「使撞击」不是 hit 的常用释义；首义 打/击 |
| en-core | worried | 使不安；忧虑；担心 | 担心的；忧虑；担心 | worried 是形容词，「使不安」是 worry 的使动义 |
| en-core | ward | 受保护者；受监护人；被监护人 | 病房；受监护人；被监护人 | 「受保护者」是罕见义；ward 首义 病房/选区 |
| en-plus | focusing | 使聚集；对焦；聚焦 | 聚焦；对焦 | 「使聚集」不是 focus 的释义 |
| en-plus | heal | 使恢复正常；治愈 | 治愈 | 「使恢复正常」是定义片段 ｜ 库内首义冲突: ['recovered'] |
| en-plus | pour | 使流；倒；倾泻 | 倒；倾泻 | 「使流」是定义片段；首义 倒/倾倒 |
| en-plus | breed | 使生殖；使繁殖；培育 | 繁殖；使繁殖；培育 | 「使生殖」是定义片段；首义 繁殖 / n 品种 |
| en-plus | drain | 使流出；排掉水；放干 | 排水；排掉水；放干 | 「使流出」是定义片段 |
| en-plus | shine | 使光亮；发亮；发光 | 发光；发亮 | 「使光亮」是使动义；shine 首义 发光/照耀 ｜ 库内首义冲突: ['glow'] |
| en-plus | expose | 使了解；使接触到；使暴露 | 暴露；使接触到；使暴露 | 「使了解」不是 expose 的首义；首义 暴露/揭露 |
| en-plus | regulate | 使有秩序；使有规则；使有规律 | 调节；使有规则；使有规律 | 「使有秩序」是定义片段；首义 调节/管理 |
| en-plus | sync | 使合拍；使同时发生；使同步 | 同步；使同时发生；使同步 | 「使合拍」不是 sync 的释义 |
| en-plus | affiliate | 隶属者 | 附属机构 | 「隶属者」罕见；affiliate 首义 附属机构/分支 |
| en-plus | spinning | 使旋转；旋转；自旋 | 旋转；自旋 | 「使旋转」使动义；spinning 首义 旋转/纺纱 ｜ 库内首义冲突: ['rotation'] |
| en-upper | disclose | 使暴露；使曝光；揭示 | 披露；使曝光；揭示 | 「使暴露」是定义片段；首义 披露/透露 ｜ 库内首义冲突: ['disclosed'] |
| en-upper | spatial | 与空间有关；空间 | 空间的；空间 | 「与空间有关」是定义片段 |
| en-upper | merge | 使一元化；使成一体；合并 | 合并；使成一体 | 「使一元化」不是 merge 的释义 ｜ 库内首义冲突: ['consolidated', 'merged'] |
| en-upper | initiate | 使入门；引入 | 发起；引入 | 「使入门」是罕见义；首义 发起/开始 |
| en-upper | activate | 使活动；使活泼；激活 | 激活；使活泼 | 「使活动」是定义片段 |
| en-upper | advertise | 使引起注意；宣传；宣扬 | 做广告；宣传；宣扬 | 「使引起注意」是定义片段 |
| en-upper | optic | 与眼有关；眼 | 视觉的；眼 | 「与眼有关」是定义片段；首义 视觉的/光学的 |
| en-upper | tempting | 使发生兴趣；吸引人；诱人 | 诱人的；吸引人；诱人 | 「使发生兴趣」是定义片段 |
| en-upper | rotate | 使轮流；轮换；轮流 | 旋转；轮换；轮流 | 「使轮流」是次义；首义 旋转 ｜ 库内首义冲突: ['rotary'] |
| en-upper | consulate | 使馆；领事馆 | 领事馆 | 使馆 = embassy；consulate 是 领事馆（现为次义） |
| en-upper | angular | 用角测量 | 有角的 | 「用角测量」不是 angular 的释义；首义 有角的/角的 |
| en-upper | provoke | 使出现；唤起；引起 | 激怒；唤起；引起 | 「使出现」是定义片段；首义 激怒/引发 |
| en-upper | flipping | 用拇指翻书页；翻书页；翻动书页 | 翻转；翻书页；翻动书页 | 同上 |
| en-upper | hoax | 开某人玩笑；愚弄 | 骗局；愚弄 | 「开某人玩笑」是定义片段；hoax 首义 骗局 |
| en-upper | syndicate | 联合成辛迪加 | 辛迪加 | 「联合成辛迪加」是动词定义片段；首义 辛迪加/财团 |
| en-upper | pivot | 以为中心旋转；在枢轴上转动 | 枢轴；在枢轴上转动 | 「以为中心旋转」脱字且是定义片段；首义 枢轴/转动 |
| en-upper | impaired | 使苦恼；受折磨 | 受损的；受折磨 | 「使苦恼」是 afflict 的义；impaired 首义 受损的/有缺陷的 |
| en-upper | hog | 贪婪者 | 猪 | 「贪婪者」是次义；hog 首义 猪/肥猪 |
| en-upper | spokesman | 代表者；发言人 | 发言人 | 「代表者」是定义片段；首义 发言人 ｜ 库内首义冲突: ['spokesperson'] |
| en-upper | viewer | 旁观者；目击者 | 观众；目击者 | 「旁观者」是 bystander 义；viewer 首义 观众/观看者 |
| en-upper | announcer | 告知者 | 播音员 | 「告知者」是定义片段；首义 播音员 |
| en-upper | simplified | 使容易；使简化；使简单 | 简化的；使简化；使简单 | 「使容易」是定义片段 |
| en-upper | updating | 使合乎潮流；使现代化；更新 | 更新；使现代化 | 「使合乎潮流」是定义片段 ｜ 库内首义冲突: ['renewal'] |
| en-upper | bending | 使弯；使弯曲；使成弓形 | 弯曲；使弯曲；使成弓形 | 「使弯」是定义片段 ｜ 库内首义冲突: ['curved', 'crooked', 'warp'] |
| en-upper | tying | 使联合；接合；联合 | 系；接合；联合 | 「使联合」不是 tie 的首义；首义 系/捆 |
| en-upper | upsetting | 使不适；使心烦；打扰 | 令人不安的；使心烦；打扰 | 「使不适」是定义片段 |
| en-upper | compelled | 使不得不；强制；强迫 | 被迫的；强制；强迫 | 「使不得不」是 compel 的使动义；compelled 首义 被迫的 |
| en-academic | eddy | 使成漩涡；打旋；旋动 | 漩涡；打旋；旋动 | 「使成漩涡」是动词定义片段；首义 漩涡 |
| en-academic | deceptive | 使迷惑；欺诈；欺骗 | 欺骗性的；欺诈；欺骗 | 「使迷惑」是定义片段 |
| en-academic | afflicted | 使苦恼；受疾病折磨；患病 | 受折磨的；受疾病折磨；患病 | 「使苦恼」是使动义；afflicted 首义 受折磨的/患病的 |
| en-academic | cascade | 瀑布似地落下；瀑布般落下 | 瀑布；瀑布般落下 | 「瀑布似地落下」是定义短语；首义 瀑布/级联 |
| en-academic | diffusion | 分子扩散运动；扩散 | 扩散 | 「分子扩散运动」是定义短语 |
| en-academic | interdisciplinary | 不同学科之间；跨学科 | 跨学科的；跨学科 | 「不同学科之间」是定义片段 |
| en-academic | airbus | 空中公共汽车；空中巴士 | 空中客车；空中巴士 | 「空中公共汽车」是直译，不是中文名 |
| en-academic | kayak | 爱斯基摩划子；皮艇 | 皮划艇；皮艇 | 「爱斯基摩划子」是旧定义短语 |
| en-academic | tapered | 一头逐渐变尖细；尖端细；渐缩 | 逐渐变细的；尖端细；渐缩 | 「一头逐渐变尖细」是定义短语 |
| en-academic | weathered | 经受风雨侵蚀；经风吹日晒；风化 | 风化的；经风吹日晒；风化 | 「经受风雨侵蚀」是定义片段 |
| en-academic | ignite | 使灼热；使燃烧；点火 | 点燃；使燃烧；点火 | 「使灼热」不是 ignite 的释义 |
| en-academic | inhibit | 使止住；压抑；抑制 | 抑制；压抑 | 「使止住」是定义片段 |
| en-academic | infiltrate | 使潜入；渗入；渗透 | 渗透；渗入 | 「使潜入」是定义片段 |
| en-academic | uncover | 使暴露；使曝光；揭示 | 揭露；使曝光；揭示 | 「使暴露」是定义片段；首义 揭露/发现 |
| words.json | angular (id) | sudut | bersudut | sudut 是名词 角；形容词 bersudut |
