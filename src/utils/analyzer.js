import seedrandom from 'seedrandom';

// ==========================================
// 1. 特殊档案数据库
// ==========================================
const SPECIAL_DATABASE = {
  "甘雨": { waist: 95, feet: 40, axilla: 50, ears: 80, endurance: 30, volume: 60 },
  "铁壁": { waist: 10, feet: 10, axilla: 10, ears: 10, endurance: 100, volume: 10 }
};

// ==========================================
// 工具函数
// ==========================================
function polarize(rng) {
  let rand = rng();
  if (rand < 0.5) {
    return Math.floor((1 - Math.pow(1 - rand * 2, 3)) * 40); 
  } else {
    return Math.floor(60 + Math.pow((rand - 0.5) * 2, 0.5) * 40); 
  }
}

function calculateRank(stats) {
  const sensitivityScore = stats.waist + stats.feet + stats.axilla + stats.ears + stats.volume;
  const fragilityScore = 100 - stats.endurance;
  const total = sensitivityScore + fragilityScore;
  if (total > 500) return 'UR';
  if (total > 420) return 'SSR';
  if (total > 340) return 'SR';
  if (total > 260) return 'R';
  return 'N';
}

function generateID(rng) {
  const prefix = "TK";
  const num = Math.floor(rng() * 10000).toString().padStart(4, '0');
  const suffixChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(rng() * 26)];
  return `${prefix}-${num}-${suffixChar}`;
}

const DIAGNOSIS_DB = {
  waist: "检测到腰腹部神经回路异常密集，对微弱触碰呈现过度防御反应。",
  feet: "足底筋膜层对细微震动极度敏感，痛觉阈值与痒觉阈值发生倒置。",
  axilla: "淋巴系统周边的神经末梢处于持续亢奋状态，极易触发痉挛。",
  ears: "听觉神经与触觉神经发生联觉反应，呼吸声即可引发全身颤栗。",
  high_endurance: "受试者意志力呈钢铁化特征，常规刺激手段会被大脑皮层自动屏蔽。",
  low_endurance: "受试者心理防线极其脆弱，尚未接触即可观测到求饶行为。",
  high_volume: "声带共鸣腔体发达，受激后分贝数极易突破安全阈值。",
  default: "各项神经反应处于平均水平，建议加大刺激强度。"
};

function getDiagnosis(stats) {
  if (stats.endurance > 90) return DIAGNOSIS_DB.high_endurance;
  if (stats.endurance < 15) return DIAGNOSIS_DB.low_endurance;
  if (stats.volume > 95) return DIAGNOSIS_DB.high_volume;

  const bodyParts = { waist: stats.waist, feet: stats.feet, axilla: stats.axilla, ears: stats.ears };
  const maxKey = Object.keys(bodyParts).sort((a, b) => bodyParts[b] - bodyParts[a])[0];
  
  if (bodyParts[maxKey] < 40) return DIAGNOSIS_DB.default;
  return DIAGNOSIS_DB[maxKey];
}

function generateStats(name) {
  const rng = seedrandom(name.trim());
  if (SPECIAL_DATABASE[name.trim()]) return SPECIAL_DATABASE[name.trim()];
  return {
    waist: polarize(rng), feet: polarize(rng), axilla: polarize(rng),
    ears: polarize(rng), endurance: polarize(rng), volume: polarize(rng)
  };
}

// ==========================================
// 🌟 模式 1：单体报告
// ==========================================
export function generateReport(name) {
  const stats = generateStats(name);
  const rng = seedrandom(name);
  return {
    type: 'SINGLE',
    name, stats,
    rank: calculateRank(stats),
    id: generateID(rng),
    diagnosis: {
      analysis: getDiagnosis(stats),
      suggestion: "建议依据弱点部位进行针对性神经耐受训练。"
    }
  };
}

// ==========================================
// 🌟 模式 2：神经共鸣 (Resonance)
// ==========================================
export function generateResonanceReport(name1, name2) {
  const stats1 = generateStats(name1);
  const stats2 = generateStats(name2);
  const rng = seedrandom(name1 + '&' + name2);

  // 计算差异 (差异越小，同步率越高)
  let totalDiff = 0;
  ['waist', 'feet', 'axilla', 'ears', 'endurance', 'volume'].forEach(k => {
    totalDiff += Math.abs(stats1[k] - stats2[k]);
  });
  const syncRate = Math.max(0, Math.min(100, Math.floor(100 - (totalDiff / 4))));

  let text = "";
  if (syncRate > 85) text = `极度危险的共鸣状态（同步率 ${syncRate}%）。两者的敏感带完全重合，刺激一方将在另一方产生镜像反射。`;
  else if (syncRate < 20) text = `神经相性极差（同步率 ${syncRate}%）。痛觉屏蔽机制互斥，无法建立有效链接。`;
  else text = `中等程度的神经耦合（同步率 ${syncRate}%）。需要长时间的调试才能实现感官同步。`;

  return {
    type: 'RESONANCE',
    names: [name1, name2],
    stats: [stats1, stats2],
    id: generateID(rng),
    syncRate,
    analysis: text
  };
}

// ==========================================
// 🌟 模式 3：攻防模拟 (Versus)
// ==========================================
export function generateVersusReport(name1, name2) {
  const stats1 = generateStats(name1);
  const stats2 = generateStats(name2);
  const rng = seedrandom(name1 + 'VS' + name2);

  // 计算 A 对 B 的压制力
  // 公式：(A忍耐 + A声量/2) - (B忍耐)
  // 如果分数为正，A 压制 B；如果为负，B 抵抗 A
  const dominance = (stats1.endurance + stats1.volume * 0.5) - stats2.endurance;
  
  let resultText = "";
  let winner = "";
  
  if (dominance > 40) {
    winner = name1;
    resultText = `[${name1}] 拥有绝对支配权。预计 [${name2}] 的心理防线将在 30秒内 彻底崩溃。建议准备束缚带。`;
  } else if (dominance < -40) {
    winner = name2;
    resultText = `[${name2}] 的精神壁垒坚不可摧，[${name1}] 的攻势将被完全化解并遭到强烈反击。猎人变成了猎物。`;
  } else {
    winner = "DRAW";
    resultText = `势均力敌的拉锯战。双方将在漫长的攻防中交替崩溃，预计测试时长将超过 4 小时。`;
  }

  return {
    type: 'VERSUS',
    names: [name1, name2],
    stats: [stats1, stats2],
    id: generateID(rng),
    dominance,
    winner,
    analysis: resultText
  };
}