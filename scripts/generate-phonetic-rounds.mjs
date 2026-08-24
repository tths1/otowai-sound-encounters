import fs from "node:fs";

const source = fs.readFileSync(new URL("../static-site/app.js", import.meta.url), "utf8").split("const DEFAULT_PHRASE_ROWS")[0];
const rows = [...source.matchAll(/chars: "([^"]+)",\s*kana: "([^"]+)",\s*romaji: "([^"]+)"/g)];
const known = new Set(rows.flatMap((match) => match[1].split(/[,，]/)));
const kanaByPinyin = new Map(rows.map((match) => [match[3], match[2]]));

const candidates = {
  ai:"碍艾哀挨癌矮隘暧蔼唉", an:"岸案暗俺胺鞍庵桉黯", ao:"奥傲熬澳凹敖翱袄懊", ba:"拔爸罢霸坝芭疤靶跋", bai:"败摆拜柏掰佰稗", ban:"板半般搬版伴扮斑颁瓣", bang:"邦傍磅膀蚌谤", bao:"保宝抱暴薄胞堡豹苞褒", bei:"北背倍悲贝辈碑蓓惫", ben:"苯本奔笨", bi:"比笔必闭毕壁避币彼鼻逼碧弊臂", bian:"扁遍辨辩鞭贬辫卞", biao:"彪飙镖膘裱", bie:"瘪鳖别憋", bin:"彬鬓缤濒", bing:"病并饼丙柄秉禀", bo:"玻拨剥脖搏驳簸钵", bu:"补捕卜怖簿埠", cai:"财材裁采猜睬", can:"餐惨灿惭残参蚕", ce:"策厕恻", cha:"插叉察岔茬刹", chan:"禅蝉铲颤掺搀", chang:"场厂唱尝肠昌畅偿倡", che:"扯彻撤车", chen:"尘臣衬趁辰沉晨陈", cheng:"程乘诚承撑呈秤橙惩", chi:"齿尺翅赤斥耻驰痴", chong:"宠崇虫冲充", chou:"仇筹臭绸酬稠瞅", chu:"处除楚触厨储畜础锄", chuan:"串喘船穿川传", ci:"慈瓷磁辞赐雌", cong:"聪葱丛从匆", cu:"簇粗促醋", cui:"崔摧粹翠脆催", cun:"村存寸", cuo:"搓磋挫措错", da:"打达搭答大", dai:"带代待袋戴呆贷逮怠", dan:"胆担丹旦诞淡蛋但单", dang:"当党档荡挡裆", dao:"道刀岛倒盗稻导悼", de:"德得的", deng:"凳瞪灯登等邓", di:"地第低底弟敌帝递滴堤笛", dian:"点典垫殿淀颠滇", diao:"掉钓吊雕调刁", die:"跌叠蝶爹谍迭", ding:"定顶订丁钉鼎盯", dong:"动洞冬冻董栋懂东", dou:"斗豆抖逗兜陡", du:"堵肚渡杜赌督毒独度读", duan:"锻短端断段", dui:"兑堆队对", dun:"蹲炖盾顿吨", duo:"朵夺躲跺舵多都", er:"而尔饵贰", fa:"发法罚伐乏阀筏", fan:"番繁返犯范烦帆贩", fang:"访纺仿芳坊妨", fei:"费废肥肺沸匪菲", fen:"纷坟焚愤芬粪", feng:"丰峰疯锋逢缝蜂奉", fou:"否", fu:"父付副府妇扶浮附复腹幅符腐伏赴", gai:"改该盖概钙溉", gan:"干感敢赶甘肝杆柑", gang:"缸纲刚港钢岗", gao:"稿搞糕膏皋羔", ge:"哥歌革隔格割阁葛鸽", gen:"根跟", geng:"耕庚更梗耿", gong:"宫供弓攻恭巩拱贡", gou:"钩构垢苟狗够沟购", gu:"谷骨固顾股姑孤估雇辜", gua:"褂寡瓜挂刮", guai:"怪乖拐", guan:"官观冠灌罐贯惯馆管关", guang:"广逛光", gui:"柜桂跪轨龟贵归鬼规", guo:"果锅裹郭国过", hai:"害骇亥海还孩", han:"含韩旱函罕憾焊寒汉汗喊", hao:"毫豪耗浩郝皓嚎好号", he:"何盒荷核贺赫禾鹤和喝河合", hen:"恨狠痕很", heng:"哼横恒衡", hong:"洪宏轰鸿红虹", hou:"厚侯猴吼候后", hu:"呼护乎互壶糊狐弧虎户湖胡", hua:"画划华化滑哗桦花话", huai:"怀坏淮", huan:"缓幻唤患环换欢", huang:"慌皇晃谎荒煌凰黄", hui:"灰挥汇辉毁惠慧徽会回", hun:"荤浑昏婚魂混", huo:"货祸获惑霍豁火活", ji:"极级几己技际计集急基寄既鸡机记季", jia:"价假架甲嫁佳夹颊贾家加", jian:"减检剑坚尖肩简监剪舰键见间件建", jiang:"将浆僵酱疆姜匠江讲奖降", jiao:"教交较胶焦轿骄郊脚角叫", jie:"接节解借街姐介阶杰洁戒", jin:"金仅紧尽斤禁津锦筋近进今", jing:"净竟境井惊镜敬晶警径京经静景", jiu:"救久究舅纠揪旧就九酒", ju:"具剧拒距聚巨矩橘拘居局举句", jue:"掘爵诀倔决觉绝", jun:"菌郡军君均俊", kai:"慨楷开凯", kan:"砍坎勘看刊", kang:"糠慷康抗扛", kao:"烤拷考靠", ke:"科课客刻克棵渴壳颗可", ken:"恳肯啃", kong:"孔恐控空", kou:"叩寇口扣", ku:"苦裤库酷枯哭", kua:"挎胯跨夸垮", kuai:"筷快块", kuang:"旷眶狂矿框况", kun:"捆昆坤困", la:"腊蜡辣拉啦", lai:"赖莱来", lan:"烂拦篮懒览栏蓝", lang:"廊朗浪狼郎", lao:"牢姥烙捞老劳", lei:"垒蕾勒类雷累泪", li:"力立利离礼历丽例黎粒梨厘励莉", lian:"联莲廉链帘怜连脸练恋", liang:"量粮梁辆晾谅两亮凉良", liao:"料聊疗辽僚撩", lie:"劣咧列烈裂猎", lin:"琳鳞磷林临邻淋", ling:"铃龄另岭陵凌领零令灵", liu:"留柳刘瘤溜六流", long:"陇聋拢龙笼隆", lou:"搂陋楼漏露", lu:"陆录鲁炉鹿卢芦碌路", lü:"律率滤绿旅", luan:"乱卵峦", lun:"轮论伦", luo:"落罗裸洛骆螺", ma:"骂码蚂妈麻马吗", mai:"麦脉买卖埋", man:"漫曼瞒慢满蛮", mang:"忙盲芒茫", mao:"贸冒矛茂貌猫毛帽", mei:"没枚梅眉煤霉美每妹", men:"门闷们", mi:"密蜜秘弥眯米迷", ming:"鸣铭命明名", mo:"膜魔模抹陌莫末摸磨墨", mu:"目母木墓幕牧亩慕", na:"拿哪纳娜那", nai:"奶耐乃奈", nan:"南难男楠", nao:"恼挠闹脑", nei:"内", neng:"能", ni:"泥拟逆腻你", nian:"粘捻念年", niao:"鸟尿", nie:"捏聂孽", ning:"宁凝拧", nong:"农浓弄", nu:"怒奴努", nuan:"暖", nuo:"诺挪懦", ou:"欧偶呕藕", pa:"怕爬趴帕", pai:"排牌派拍", pan:"盘判盼攀潘", pang:"旁胖庞", pao:"跑炮泡袍", pei:"配陪培赔佩", pen:"喷盆", peng:"碰捧蓬鹏朋棚", pi:"批皮匹屁疲披劈", pian:"片篇偏骗", piao:"票漂飘", pin:"品贫拼频", ping:"平评瓶凭苹", po:"破坡婆迫颇", pu:"铺普谱朴葡", qi:"企启棋旗汽骑奇妻气器起七期", qian:"千签欠牵浅迁潜前钱", qiang:"枪墙强抢腔", qiao:"桥巧敲瞧乔侨", qie:"切且窃", qin:"亲琴勤侵秦寝", qing:"请晴庆倾情轻清", qiu:"求球秋丘囚", qu:"取区曲驱屈趣渠去", quan:"全权拳劝圈泉", que:"却缺确雀", qun:"群裙", ran:"燃染然", rang:"嚷壤让", rao:"绕扰", re:"热惹", ren:"认忍任刃仁人", reng:"仍扔", ri:"日", rong:"容荣融绒", rou:"肉柔揉", ru:"入乳辱儒", ruan:"软", rui:"锐瑞", run:"润", ruo:"若弱", sa:"撒洒", sai:"赛塞", san:"伞散三", sang:"桑丧嗓", sao:"扫嫂骚", se:"色涩", sen:"森", sha:"沙杀傻纱", shan:"闪善扇衫删山", shang:"赏尚裳商伤上", shao:"烧绍哨稍少", she:"设社射蛇舍", shen:"深神审甚身申", sheng:"声胜升剩圣生", shi:"师诗试室史识食失十时石使是事市世", shou:"受收守授售手首", shu:"树数熟术属束鼠书输", shua:"刷", shuai:"帅摔衰", shuan:"栓", shuang:"双爽霜", shui:"税谁水睡", shun:"顺瞬", shuo:"硕朔说", si:"思私丝似寺司四死", song:"送松宋颂", sou:"搜艘", su:"素速宿诉俗苏", suan:"算酸蒜", sui:"岁随碎虽", sun:"孙损", suo:"所锁缩索", ta:"塔踏塌他她它", tai:"太台抬态泰", tan:"谈探叹坦贪摊", tang:"糖唐趟堂躺汤", tao:"逃套讨陶桃", te:"特", teng:"疼腾藤", ti:"体题提替踢梯", tian:"甜填添田天", tiao:"条跳挑调", tie:"铁贴", ting:"停庭挺亭听厅", tong:"通痛统铜筒同童", tou:"透偷头投", tu:"吐兔土徒图", tuan:"团", tui:"退推腿", tun:"吞屯", tuo:"脱托拖妥驼", wa:"娃挖瓦袜", wai:"歪外", wan:"完弯湾腕晚万玩碗", wang:"王往网忘望", wei:"为位未味围伟尾卫危微", wen:"温闻纹吻文问稳", weng:"翁", wo:"握卧窝我", wu:"物务无误屋武午五舞", xi:"席洗系希戏吸惜稀西习喜细", xia:"夏瞎峡霞下", xian:"鲜险献闲仙显现先线县", xiang:"香乡箱响项象像想", xiao:"校消晓效孝小笑", xie:"鞋血协写谢", xin:"欣薪辛心新信", xing:"行醒形星性幸", xiong:"兄胸雄熊", xiu:"修秀袖羞", xu:"需许续序虚徐", xuan:"选宣旋悬玄", xue:"雪血穴学", xun:"寻训迅询巡", ya:"压牙雅亚鸭夜也", yan:"言盐严烟延燕验眼演沿", yang:"养样扬阳羊杨洋", yao:"药摇咬腰遥耀要", ye:"页叶业爷野夜也", yi:"意议易依移异艺忆益一衣医以", yin:"因音银引印饮阴", ying:"营迎赢鹰影英应硬", yong:"用永勇拥涌", you:"游油优邮幼友有右又", yu:"育玉遇鱼余预域欲语雨羽宇", yuan:"原员院愿圆源远园", yue:"约阅跃悦月越", yun:"云运晕允孕", za:"杂砸", zai:"灾载宰在再", zan:"赞暂咱", zang:"脏葬藏", zao:"造枣澡糟早找", ze:"则责泽", zei:"贼", zen:"怎", zeng:"增赠曾", zha:"炸扎闸渣", zhai:"债摘窄宅", zhan:"站战展占粘", zhang:"张章长掌涨账", zhao:"招朝昭照赵罩", zhe:"折哲遮着这者", zhen:"阵震镇珍振真针", zheng:"政蒸征挣正整争证", zhi:"直知指制治职值志支纸只", zhong:"终钟忠肿众中种重", zhou:"轴皱舟周州洲粥", zhu:"竹逐筑祝珠猪助住主注", zhua:"抓", zhuai:"拽", zhuan:"转专砖赚", zhuang:"装状庄撞", zhui:"追坠锥", zhun:"准", zhuo:"浊啄桌捉卓", zi:"资姿滋紫仔子字自", zong:"总宗综踪", zou:"奏走", zu:"组足族祖租", zuan:"钻", zui:"罪嘴醉最", zun:"尊遵", zuo:"座昨作坐左佐"
};

const pool = [];
for (const [pinyin, chars] of Object.entries(candidates)) {
  const kana = kanaByPinyin.get(pinyin);
  if (!kana) continue;
  for (const char of chars) {
    if (known.has(char) || pool.some((item) => item.char === char)) continue;
    pool.push({ char, pinyin, kana });
  }
}
if (pool.length < 400 && !process.argv.includes("--map-only")) throw new Error(`候选生字不足：${pool.length}/400`);

const selected = pool.slice(0, 400).map((item, index) => ({ ...item, round: Math.floor(index / 20) + 1 }));
const grouped = new Map();
for (const item of selected) {
  const key = `${item.round}|${item.pinyin}`;
  if (!grouped.has(key)) grouped.set(key, { ...item, chars: [] });
  grouped.get(key).chars.push(item.char);
}
const result = [...grouped.values()];
const pinyinByChar = {};
for (const [pinyin, chars] of Object.entries(candidates)) for (const char of chars) if (!pinyinByChar[char]) pinyinByChar[char] = pinyin;
console.log(JSON.stringify({ selected, grouped: result, pinyinByChar }, null, 2));
