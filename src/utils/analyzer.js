import seedrandom from 'seedrandom';

// 极化函数
function polarize(rng) {
  let rand = rng();
  if (rand < 0.5) {
    return Math.floor((1 - Math.pow(1 - rand * 2, 3)) * 40); 
  } else {
    return Math.floor(60 + Math.pow((rand - 0.5) * 2, 0.5) * 40); 
  }
}

// 评级计算
function calculateRank(total) {
  if (total > 500) return 'UR';
  if (total > 400) return 'SSR';
  if (total > 300) return 'SR';
  if (total > 200) return 'R';
  return 'N';
}

// ID 生成
function generateID(rng) {
  const prefix = "TK";
  const num = Math.floor(rng() * 10000).toString().padStart(4, '0');
  const suffixChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(rng() * 26)];
  return `${prefix}-${num}-${suffixChar}`;
}

// 🌟 新增：诊断文案库
const DIAGNOSIS_DB = {
  // 针对[腰部]的文案
  waist: {
    analysis: "检测到腰腹部神经回路异常密集，对微弱触碰呈现过度防御反应。",
    suggestion: "建议束缚上肢，使用电动牙刷沿肋骨下缘进行持续高频刺激。"
  },
  // 针对[足底]的文案
  feet: {
    analysis: "足底筋膜层对细微震动极度敏感，痛觉阈值与痒觉阈值发生倒置。",
    suggestion: "建议使用更斯勒(Gensler)式固定架锁定踝关节，配合硬质毛刷进行测试。"
  },
  // 针对[腋下]的文案
  axilla: {
    analysis: "淋巴系统周边的神经末梢处于持续亢奋状态，极易触发痉挛。",
    suggestion: "建议采取悬吊姿势充分暴露腋窝，交替使用冰块与羽毛。"
  },
  // 针对[耳部]的文案
  ears: {
    analysis: "听觉神经与触觉神经发生联觉反应，呼吸声即可引发全身颤栗。",
    suggestion: "建议佩戴眼罩剥夺视觉，针对耳廓使用吹气与指尖轻抚。"
  },
  // 针对[忍耐低]的文案 (特殊判定)
  low_endurance: {
    analysis: "受试者心理防线极其脆弱，尚未接触即可观测到求饶行为。",
    suggestion: "无需复杂刑具，简单的语言恐吓或倒计时即可击穿意志。"
  },
  // 针对[声量大]的文案 (特殊判定)
  high_volume: {
    analysis: "声带共鸣腔体发达，受激后分贝数极易突破安全阈值。",
    suggestion: "警告：必须在隔音室内进行测试，或强制佩戴口球类消音装置。"
  }
};

// 🌟 新增：生成诊断结论逻辑
function getDiagnosis(stats) {
  // 1. 先把所有属性转成数组并排序，找出最高的那个
  const sortedKeys = Object.keys(stats).sort((a, b) => stats[b] - stats[a]);
  const maxKey = sortedKeys[0];      // 数值最高的属性
  const maxVal = stats[maxKey];      // 最高属性的值

  // 2. 特殊判定逻辑
  // 如果忍耐度极低 (<15)，优先触发“秒怂”文案
  if (stats.endurance < 15) return DIAGNOSIS_DB.low_endurance;
  
  // 如果声量极高 (>90)，优先触发“噪音”文案
  if (stats.volume > 90) return DIAGNOSIS_DB.high_volume;

  // 3. 否则，根据最高的那个弱点返回文案
  // 如果最高值都很低 (<40)，返回一个默认文案
  if (maxVal < 40) {
    return {
      analysis: "各项神经反应处于平均水平，属于典型的低敏感个体。",
      suggestion: "建议加大刺激强度，或配合肌肉松弛剂进行深度开发。"
    };
  }

  // 4. 返回对应部位的文案
  return DIAGNOSIS_DB[maxKey] || DIAGNOSIS_DB.waist; // 默认fallback
}

export function generateReport(name) {
  const rng = seedrandom(name);

  const stats = {
    waist: polarize(rng),
    feet: polarize(rng),
    axilla: polarize(rng),
    ears: polarize(rng),
    endurance: polarize(rng),
    volume: polarize(rng)
  };

  const totalScore = Object.values(stats).reduce((a, b) => a + b, 0);

  return {
    name,
    stats,
    rank: calculateRank(totalScore),
    id: generateID(rng),
    // 🌟 注入诊断结果
    diagnosis: getDiagnosis(stats)
  };
}