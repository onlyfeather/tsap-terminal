import seedrandom from 'seedrandom';

// ==========================================
// 1. 特殊档案数据库 (在这里修改特定名字的值)
// ==========================================
const SPECIAL_DATABASE = {
  // 示例：甘雨 (敏感但稍微有点忍耐力)
  "雪音": {
    waist: 85,
    feet: 97,
    axilla: 50,
    ears: 90,
    endurance: 30, 
    volume: 60
  },
};

// ==========================================
// 工具函数
// ==========================================

// 极化函数
function polarize(rng) {
  let rand = rng();
  // 让数值更容易走极端 (要么很低，要么很高)
  if (rand < 0.5) {
    return Math.floor((1 - Math.pow(1 - rand * 2, 3)) * 40); 
  } else {
    return Math.floor(60 + Math.pow((rand - 0.5) * 2, 0.5) * 40); 
  }
}

// 🌟 修改点 1：评级计算逻辑升级
// 总分越高 = 越容易沦陷 (UR)
function calculateRank(stats) {
  // 计算基础敏感度总和 (腰+足+腋+耳+声量)
  const sensitivityScore = stats.waist + stats.feet + stats.axilla + stats.ears + stats.volume;
  
  // 🌟 核心修正：忍耐度是“减分项” (或者说：脆皮度 = 100 - 忍耐)
  // 忍耐越低，脆弱度越高，总分越高
  const fragilityScore = 100 - stats.endurance;

  const total = sensitivityScore + fragilityScore;

  // 调整阈值 (满分约 600)
  if (total > 500) return 'UR';  // 极度危险/极佳素材
  if (total > 420) return 'SSR';
  if (total > 340) return 'SR';
  if (total > 260) return 'R';
  return 'N'; // 毫无反应的木头
}

// ID 生成
function generateID(rng) {
  const prefix = "TK";
  const num = Math.floor(rng() * 10000).toString().padStart(4, '0');
  const suffixChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(rng() * 26)];
  return `${prefix}-${num}-${suffixChar}`;
}

// 诊断文案库
const DIAGNOSIS_DB = {
  waist: {
    analysis: "检测到腰腹部神经回路异常密集，对微弱触碰呈现过度防御反应。",
    suggestion: "建议束缚上肢，使用电动牙刷沿肋骨下缘进行持续高频刺激。"
  },
  feet: {
    analysis: "足底筋膜层对细微震动极度敏感，痛觉阈值与痒觉阈值发生倒置。",
    suggestion: "建议使用更斯勒(Gensler)式固定架锁定踝关节，配合硬质毛刷进行测试。"
  },
  axilla: {
    analysis: "淋巴系统周边的神经末梢处于持续亢奋状态，极易触发痉挛。",
    suggestion: "建议采取悬吊姿势充分暴露腋窝，交替使用冰块与羽毛。"
  },
  ears: {
    analysis: "听觉神经与触觉神经发生联觉反应，呼吸声即可引发全身颤栗。",
    suggestion: "建议佩戴眼罩剥夺视觉，针对耳廓使用吹气与指尖轻抚。"
  },
  // 🌟 针对高忍耐的特殊文案
  high_endurance: {
    analysis: "受试者意志力呈钢铁化特征，常规刺激手段会被大脑皮层自动屏蔽。",
    suggestion: "警告：常规方案无效。建议启用「长期剥夺感官」协议或使用神经增敏剂。"
  },
  // 针对低忍耐的特殊文案
  low_endurance: {
    analysis: "受试者心理防线极其脆弱，尚未接触即可观测到求饶行为。",
    suggestion: "无需复杂刑具，简单的语言恐吓或倒计时即可击穿意志。"
  },
  high_volume: {
    analysis: "声带共鸣腔体发达，受激后分贝数极易突破安全阈值。",
    suggestion: "警告：必须在隔音室内进行测试，或强制佩戴口球类消音装置。"
  }
};

// 🌟 修改点 2：诊断逻辑修正
function getDiagnosis(stats) {
  // 先判断极值情况
  
  // 如果忍耐度极高 (>90)，这是最显著的特征，优先报出
  if (stats.endurance > 90) return DIAGNOSIS_DB.high_endurance;

  // 如果忍耐度极低 (<15)，也是最显著特征
  if (stats.endurance < 15) return DIAGNOSIS_DB.low_endurance;
  
  // 如果声量极高 (>95)
  if (stats.volume > 95) return DIAGNOSIS_DB.high_volume;

  // 否则，找最敏感的身体部位
  // 排除掉 endurance 和 volume，只比对身体部位
  const bodyParts = {
    waist: stats.waist,
    feet: stats.feet,
    axilla: stats.axilla,
    ears: stats.ears
  };

  const sortedKeys = Object.keys(bodyParts).sort((a, b) => bodyParts[b] - bodyParts[a]);
  const maxKey = sortedKeys[0];
  const maxVal = bodyParts[maxKey];

  // 如果连最敏感的部位都没过 40，说明这人是木头
  if (maxVal < 40) {
    return {
      analysis: "各项神经反应处于平均水平，属于典型的低敏感个体。",
      suggestion: "建议加大刺激强度，或配合肌肉松弛剂进行深度开发。"
    };
  }
  
  return DIAGNOSIS_DB[maxKey] || DIAGNOSIS_DB.waist;
}

// ==========================================
// 主生成函数
// ==========================================
export function generateReport(name) {
  const rng = seedrandom(name);
  const cleanName = name.trim();
  
  let stats;

  if (SPECIAL_DATABASE[cleanName]) {
    stats = SPECIAL_DATABASE[cleanName];
  } else {
    stats = {
      waist: polarize(rng),
      feet: polarize(rng),
      axilla: polarize(rng),
      ears: polarize(rng),
      endurance: polarize(rng),
      volume: polarize(rng)
    };
  }

  return {
    name,
    stats,
    rank: calculateRank(stats), // 🌟 传入整个 stats 对象给新逻辑计算
    id: generateID(rng), 
    diagnosis: getDiagnosis(stats)
  };
}