import seedrandom from 'seedrandom';

// ==========================================
// 1. 命运盐值数据库 (SALT DATABASE)
// ==========================================
const SALT_DB = {
  "甘雨": "_SALT_COCO_V2"
};

const DEFAULT_SALT = "";

// ==========================================
// 工具函数
// ==========================================
function polarize(rng) {
  let rand = rng();
  // 保持经典的 U 型分布 (0-40 或 60-100)
  if (rand < 0.5) return Math.floor((1 - Math.pow(1 - rand * 2, 3)) * 40); 
  return Math.floor(60 + Math.pow((rand - 0.5) * 2, 0.5) * 40); 
}

function generateID(rng) {
  const prefix = "TK";
  const num = Math.floor(rng() * 10000).toString().padStart(4, '0');
  const suffixChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(rng() * 26)];
  return `${prefix}-${num}-${suffixChar}`;
}

function calculateRank(score) {
  if (score > 520) return 'EX'; // 突破极限
  if (score > 500) return 'UR';
  if (score > 420) return 'SSR';
  if (score > 340) return 'SR';
  if (score > 260) return 'R';
  return 'N';
}

// ==========================================
// 3. 📝 受方诊断库 (M-Diagnosis) - 升级版
// ==========================================
const DIAGNOSIS_DB = {
  waist: "【腰腹防御溃散】腰部神经丛对接触极度过敏。检测到强烈的扭动闪避反射，束缚该部位可瞬间解除受试者的所有物理防线。",
  feet: "【足底痛觉倒置】足底筋膜层连接直通大脑边缘系统。对羽毛级轻微刺激呈现过载反应，极易诱发哭笑失禁的神经短路现象。",
  axilla: "【淋巴神经亢奋】腋下防御机制完全失效。该区域的刺激将直接绕过理智层，引发躯体痉挛和无意识的求饶语言流出。",
  ears: "【听觉联觉反应】耳部神经与性唤起中枢存在异常连接。针对耳根的气息或低语攻击可造成贯穿全身的生物电流麻痹。",
  
  high_endurance: "【钢铁意志】受试者的大脑皮层具备高级痛觉屏蔽功能。常规强度的刺激如泥牛入海，建议启用精神羞辱或极限长时间作业。",
  low_endurance: "【易碎玻璃心智】心理防线如纸般薄弱。尚未建立实质性连接，仅凭刑具展示或语言威压即可诱发崩溃反应。",
  high_volume: "【声带共鸣过载】受激后的发声分贝极易突破生理阈值。其尖叫声具有强烈的穿透力，建议在隔音室进行操作。",
  
  // 🌟 新增：迟钝判定
  low_sensitivity: "【神经迟钝】检测到全身末梢神经传导阻滞。受试者对大多数物理刺激表现冷淡，如同“木头”一般。常规手段难以生效，建议尝试极高强度的唤醒疗法。",
  
  default: "【标准样本】各项神经反应处于基准水平。无明显短板也无突出弱点，是一张完美的白纸，等待执行官染上颜色。"
};

// ==========================================
// 4. 📝 攻方诊断库 (S-Diagnosis) - 升级版
// ==========================================
const S_DIAGNOSIS_DB = {
  tech: "【神经解剖专家】拥有外科医生般的手指灵活性。擅长剥离神经缝隙，能精准控制“痛”与“痒”的黄金比例，让受试者求生不得求死不能。",
  control: "【绝对支配王权】拥有捕食者顶点的压迫感。无需动手，仅凭视线接触和气场释放，即可让受试者产生条件反射式的臣服。",
  obs: "【深渊凝视者】具备超凡的微表情捕捉能力。能瞬间看穿受试者伪装的坚强，精准打击其内心最羞耻、最想隐藏的角落。",
  sadism: "【愉悦捕食回路】多巴胺分泌机制变异。受试者的悲鸣和泪水是其最高级的精神食粮，施虐欲望随对方的崩溃程度呈指数级上升。",
  stamina: "【永动执行机器】体能储备突破人类极限。能够维持高强度、高频率的处刑作业长达数小时，给予受试者“永远不会结束”的绝望感。",
  tools: "【器械工匠宗师】对物理法则的残酷应用。无论是丝绸还是电流，任何物体在其手中都会化为演奏惨叫乐章的精密仪器。",
  
  default: "【实习执行官】基础能力均衡，但尚未形成鲜明的个人风格。建议通过大量实战摸索适合自己的处刑流派。"
};

// ==========================================
// 5. 生成器逻辑 (融入 Salt)
// ==========================================

// 🛡️ 生成受六维 (Defense)
function generateStats(name) {
  const cleanName = name.trim();

  // 获取盐值
  const salt = SALT_DB[cleanName] || DEFAULT_SALT;
  // 按照你的要求，保留 _M_MODE 后缀结构
  const rng = seedrandom(cleanName + salt + "_M_MODE_V13");
  
  return { 
    waist: polarize(rng), feet: polarize(rng), axilla: polarize(rng), 
    ears: polarize(rng), endurance: polarize(rng), volume: polarize(rng) 
  };
}

// ⚔️ 生成攻六维 (Attack)
function generateAttackStats(name) {
  const cleanName = name.trim();
  const salt = SALT_DB[cleanName] || DEFAULT_SALT;
  // 按照你的要求，保留 _S_MODE 后缀结构
  const rng = seedrandom(cleanName + salt + "_S_MODE_V8");
  
  return { 
    tech: polarize(rng), control: polarize(rng), obs: polarize(rng), 
    sadism: polarize(rng), stamina: polarize(rng), tools: polarize(rng) 
  };
}

// 诊断逻辑 (加入低敏感判定)
function getDiagnosis(stats) {
  if (stats.endurance > 90) return DIAGNOSIS_DB.high_endurance;
  if (stats.endurance < 15) return DIAGNOSIS_DB.low_endurance;
  if (stats.volume > 95) return DIAGNOSIS_DB.high_volume;
  
  // 找出最高敏感度 (不含忍耐和声量)
  const maxSens = Math.max(stats.waist, stats.feet, stats.axilla, stats.ears);
  // 如果最高都不到 45，说明是木头
  if (maxSens < 45) return DIAGNOSIS_DB.low_sensitivity;

  const maxKey = Object.keys(stats).filter(k => ['waist','feet','axilla','ears'].includes(k)).sort((a, b) => stats[b] - stats[a])[0];
  return DIAGNOSIS_DB[maxKey] || DIAGNOSIS_DB.default;
}

function getSDiagnosis(stats) {
  const maxKey = Object.keys(stats).sort((a, b) => stats[b] - stats[a])[0];
  // 如果攻击属性都很低
  if (stats[maxKey] < 45) return S_DIAGNOSIS_DB.default;
  return S_DIAGNOSIS_DB[maxKey];
}

// ==========================================
// 6. 导出接口
// ==========================================

// [单体链接]
export function generateReport(name) {
  const stats = generateStats(name);
  // 受方评分：敏感度越高分越高，忍耐越低分越高
  const total = stats.waist + stats.feet + stats.axilla + stats.ears + stats.volume + (100 - stats.endurance);
  const cleanName = name.trim();
  const salt = SALT_DB[cleanName] || DEFAULT_SALT;
  const rng = seedrandom(name + salt); // 保持ID一致性
  
  return {
    type: 'SINGLE', name, stats,
    rank: calculateRank(total), id: generateID(rng),
    diagnosis: { analysis: getDiagnosis(stats), suggestion: "建议依据弱点部位进行针对性神经耐受训练。" }
  };
}

// [支配协议]
export function generateAttackReport(name) {
  const stats = generateAttackStats(name);
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  const cleanName = name.trim();
  const salt = SALT_DB[cleanName] || DEFAULT_SALT;
  const rng = seedrandom(name + salt + "_S_MODE");
  
  return {
    type: 'ATTACK', name, stats,
    rank: calculateRank(total), id: generateID(rng),
    diagnosis: { analysis: getSDiagnosis(stats), suggestion: "建议寻找高耐受性志愿者进行实战演练。" }
  };
}

// [神经共鸣]
export function generateResonanceReport(name1, name2) {
  const s1 = generateStats(name1);
  const s2 = generateStats(name2);
  const rng = seedrandom(name1 + '&' + name2);
  
  let diff = 0;
  ['waist', 'feet', 'axilla', 'ears', 'endurance', 'volume'].forEach(k => diff += Math.abs(s1[k] - s2[k]));
  const syncRate = Math.max(0, Math.min(100, Math.floor(100 - (diff / 4))));

  let text = "";
  const avgEndurance = (s1.endurance + s2.endurance) / 2;
  const avgVolume = (s1.volume + s2.volume) / 2;
  
  // 查找共同弱点 (>70 且差值 <20)
  const sharedWeakness = ['waist','feet','axilla','ears'].find(k => s1[k] > 70 && s2[k] > 70 && Math.abs(s1[k]-s2[k]) < 20);
  const weakMap = { waist:'腰部', feet:'足底', axilla:'腋窝', ears:'耳根' };

  if (syncRate > 90) text = `【双生镜像】同步率 ${syncRate}%。及其罕见的神经同调现象。两者的感官图谱如出一辙，任何一方受到的刺激都会在另一方的大脑中产生真实的“幻痛”反馈。`;
  else if (avgEndurance < 25) text = `【连锁崩塌】警告：双个体的心理防线均处于临界值。一旦一方开始求饶，另一方将在 0.5秒 内受到情绪感染，发生多米诺骨牌式的理智断线。`;
  else if (avgVolume > 85) text = `【声学共振灾害】双个体的共鸣腔体频率极度接近。测试过程中产生的高频双重尖叫可能导致观察窗玻璃破裂。务必佩戴工业级降噪设备。`;
  else if (avgEndurance > 85) text = `【深渊死寂】无效的连接。双个体均拥有堡垒般的意志力，痛觉屏蔽机制相互抵消。无论施加何种刺激，双方只会维持令人窒息的沉默对抗。`;
  else if (sharedWeakness) text = `【弱点回响】虽然整体同步率一般，但在「${weakMap[sharedWeakness]}」区域存在致命的共鸣缺陷。针对该部位的双重刺激将产生“1+1>3”的感官过载效果。`;
  else if (syncRate < 20) text = `【神经排斥】同步率 ${syncRate}%。两者的感官逻辑完全相悖（一方的敏感带是另一方的钝感区）。强制链接会导致严重的认知错乱和生理性厌恶。`;
  else text = `【标准耦合】同步率 ${syncRate}%。两者的感官存在部分重叠区域。需要精细调整波段，经过漫长的前戏磨合才能实现神经同步。`;

  return { type: 'RESONANCE', names: [name1, name2], stats: [s1, s2], id: generateID(rng), syncRate, analysis: text };
}

// [攻防模拟]
export function generateVersusReport(name1, name2) {
  const atk = generateAttackStats(name1); // A攻
  const def = generateStats(name2);       // B受
  const rng = seedrandom(name1 + 'VS' + name2);

  const sensAvg = (def.waist + def.feet + def.axilla + def.ears) / 4;
  const totalAtk = Object.values(atk).reduce((a,b)=>a+b,0) / 6;
  const totalDef = (def.endurance + (100 - sensAvg)) / 2;
  
  const dominance = Math.floor((totalAtk - totalDef) * 1.5);
  
  let result = "";
  let winner = "";
  
  // S 最强项
  const maxStyle = Object.keys(atk).sort((a,b) => atk[b] - atk[a])[0];
  const styleMap = { tech: "精密指法", control: "绝对气场", obs: "弱点洞察", sadism: "暴虐手段", stamina: "持久消耗", tools: "器械辅助" };
  
  // M 最弱项
  const weakParts = { waist: def.waist, feet: def.feet, axilla: def.axilla, ears: def.ears };
  const maxWeak = Object.keys(weakParts).sort((a,b) => weakParts[b] - weakParts[a])[0];
  const weakMap = { waist:'腰肢', feet:'足心', axilla:'腋窝', ears:'耳根' };

  if (dominance > 40) {
    winner = name1;
    result = `【绝对捕食】[${name1}] 的「${styleMap[maxStyle]}」完全碾压了 [${name2}] 的防线。受试者在针对「${weakMap[maxWeak]}」的精确打击下，预计将在 30秒内 彻底丧失理智，沦为只会抽搐的玩物。`;
  } else if (dominance > 15) {
    winner = name1;
    result = `【高位压制】[${name1}] 掌握着绝对的主动权。虽然 [${name2}] 试图通过忍耐来抵抗，但在漫长的折磨和羞耻中，防线崩塌只是时间问题。`;
  } else if (dominance < -40) {
    winner = name2;
    result = `【攻守逆转】[${name2}] 的耐受力如同深渊般不可测。[${name1}] 的所有手段如泥牛入海，反因体力耗尽和挫败感而陷入被动。猎人变成了猎物。`;
  } else if (dominance < -15) {
    winner = name2;
    result = `【徒劳攻势】[${name2}] 的意志力极其顽强，成功格挡了 [${name1}] 的大部分攻击。这是一场注定失败的处刑，执行官将面临严重的精神反噬。`;
  } else {
    winner = "DRAW";
    result = `【动态平衡】棋逢对手。[${name1}] 的技巧与 [${name2}] 的耐受度形成完美闭环。这是一场持续整晚的拉锯战，双方都将在极限边缘反复试探，胜负仅在毫厘之间。`;
  }

  return { type: 'VERSUS', names: [name1, name2], stats: [atk, def], id: generateID(rng), dominance, winner, analysis: result };
}