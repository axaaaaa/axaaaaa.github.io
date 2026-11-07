export const foodSources=[
 {title:'中国营养学会：平衡膳食八准则（2022）',url:'https://dg.cnsoc.org/article/04/J4-AsD_DR3OLQMnHG0-jZA.html'},
 {title:'国家卫生健康委：健康饮食、合理膳食（2025）',url:'https://www.nhc.gov.cn/sps/c100088/202505/6b7a718abd4848e8a3e98fc561a8858b.shtml'},
 {title:'福建省卫健委：膳食指南核心推荐',url:'https://wjw.fujian.gov.cn/ztzl/jkjy/jkzgxd/202206/t20220615_5930367.htm'},
 {title:'国家卫生健康委：奶类与减盐答问',url:'https://www.nhc.gov.cn/xcs/c100122/202410/23f695c3e6b0442281701ba1426430ff.shtml'}
];
export const foodGroups=[
 {id:'staples',name:'谷薯与主食',icon:'文件',amount:'谷类每天 200～300g；其中全谷物和杂豆 50～150g；另有薯类 50～100g',basis:'谷类与杂豆按未烹调干重；薯类按生的可食部。全谷物和杂豆已包含在谷类总量中。',purpose:'提供日常活动所需能量，主食粗细搭配。',examples:['大米、面食','燕麦、糙米、红豆','土豆、红薯'],tips:'薯类属于主食搭配，不把一份薯类当作蔬菜再额外叠加大量米饭。',source:2},
 {id:'vegetables',name:'蔬菜',icon:'image',amount:'每天至少 300g，深色蔬菜约占一半',basis:'按生的可食部估算；不是每种蔬菜都要吃 300g。',purpose:'搭配不同颜色和种类，获取膳食纤维等营养。',examples:['菠菜、油菜','西兰花、胡萝卜','番茄、黄瓜'],tips:'餐餐安排蔬菜；注意清洗与合适烹调，少油少盐。',source:0},
 {id:'fruit',name:'新鲜水果',icon:'image',amount:'每天 200～350g',basis:'按可食部；果皮、果核等不计入可食重量。',purpose:'与蔬菜共同丰富食物种类，两者不是简单互相替代。',examples:['苹果、梨','橙子、猕猴桃','草莓、当季水果'],tips:'选择完整鲜果，果汁不能替代鲜果；按需要分次吃。',source:1},
 {id:'milk-soy',name:'奶类与大豆制品',icon:'Collection',amount:'奶类相当于每天 300～500mL 液态奶；经常安排大豆制品',basis:'酸奶、奶酪需按产品营养和等量关系换算，不按同重量直接等同液态奶。',purpose:'为蛋白质和钙等营养提供食物来源。',examples:['纯牛奶、无糖酸奶','豆腐、豆干','黄豆、无糖豆浆'],tips:'豆浆不天然等同牛奶的钙含量；乳糖不耐受可按耐受选择低乳糖产品，牛奶过敏与乳糖不耐受需区分。',source:3},
 {id:'protein',name:'鱼、禽、蛋与瘦肉',icon:'开发',amount:'鱼、禽、蛋、瘦肉合计平均每天 120～200g',basis:'是四类合计，不是每一类各 120～200g；通常按生的可食部估算。',purpose:'轮换选择动物性食物，而非每天把所有品种吃齐。',examples:['鱼、虾等水产品','鸡肉、瘦猪肉','鸡蛋、鸭蛋'],tips:'水产品可按周安排，成年人每周约 300～500g；少选加工肉，食材充分熟制。',source:1},
 {id:'nuts',name:'坚果与种子',icon:'Grid',amount:'适量、少量，可作为搭配',basis:'按去壳后的可食部分，不把一大袋当成一份。',purpose:'增加食物多样性，提供脂肪等营养；同样有较高能量。',examples:['核桃、杏仁','花生、开心果','南瓜子、葵花籽'],tips:'优先原味、少盐；存在坚果或花生过敏时避开对应食物，不要求每日每种都吃。',source:0},
 {id:'water',name:'饮水',icon:'导航',amount:'温和气候、低活动量成年人：男性约 1700mL／天，女性约 1500mL／天',basis:'指直接饮水参考，不是食物、汤、奶等所含水分合计的总水量。',purpose:'主动分次饮水，以白水为主。',examples:['白开水','符合饮用要求的饮用水','不加糖的淡茶水（按耐受）'],tips:'炎热与活动增多时需求会变化；有心肾疾病或限液要求者按医嘱，不套用固定饮水量。',source:2},
 {id:'seasoning',name:'油、盐与添加糖',icon:'password',amount:'烹调油约 25～30g／天；食盐不超过 5g／天；添加糖少吃',basis:'盐包含调味品、腌制品和加工食品中的贡献，不只是盐罐里加的盐。',purpose:'帮助形成清淡饮食习惯，不把调味料当成需要额外补足的目标。',examples:['按量使用植物油','少量盐与调味品','少选含糖饮料与甜点'],tips:'烹调油量也包括多餐用量；包装食品看配料和营养标签，少油炸、高盐零食。',source:2}
];
export const mealIdeas=[{name:'早餐搭配示例',items:'燕麦或全麦主食 + 奶类 + 鸡蛋 + 一份果蔬',note:'示例不是定量处方，按全天食物总量和个人情况调整。'},{name:'午餐搭配示例',items:'米饭搭配杂粮 + 两种蔬菜 + 鱼、禽或豆制品',note:'蛋白质食物可轮换，不要求每餐同时吃鱼、肉、蛋。'},{name:'晚餐搭配示例',items:'适量主食或薯类 + 蔬菜 + 豆腐或适量瘦肉',note:'不是越少越好；避免为“健康”而长期不吃主食。'}];
export function filterFoodGroups(query='',category=''){const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);return foodGroups.filter(g=>(!category||g.id===category)&&words.every(w=>[g.name,g.amount,g.purpose,g.tips,...g.examples].join(' ').toLowerCase().includes(w)));}
