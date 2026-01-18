<script setup>
import { computed } from 'vue';
import { Radar } from 'vue-chartjs';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const props = defineProps({
  stats: { type: [Object, Array], required: true },
  mode: { type: String, default: 'SINGLE' },
  names: { type: Array, default: () => [] }
});

const chartData = computed(() => {
  const defLabels = ['腰部', '足底', '腋下', '耳根', '忍耐', '声量'];
  const atkLabels = ['指法技巧', '场面支配', '弱点洞察', '施虐欲望', '体能续航', '器械精通'];
  const versusLabels = ['支配/腰部', '道具/足底', '技巧/腋下', '洞察/耳根', '施虐/忍耐', '续航/声量'];

  let labels = defLabels;
  if (props.mode === 'ATTACK') labels = atkLabels;
  if (props.mode === 'VERSUS') labels = versusLabels;

  if (Array.isArray(props.stats)) {
    // === 双人模式 ===
    let color1, color2, data1, data2;
    if (props.mode === 'VERSUS') {
      const s = props.stats[0];
      data1 = [s.control, s.tools, s.tech, s.obs, s.sadism, s.stamina];
      data2 = Object.values(props.stats[1]);
      color1 = { bg: 'rgba(244, 63, 94, 0.2)', border: '#f43f5e' }; 
      color2 = { bg: 'rgba(156, 163, 175, 0.2)', border: '#9ca3af' };
    } else {
      data1 = Object.values(props.stats[0]);
      data2 = Object.values(props.stats[1]);
      color1 = { bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308' }; 
      color2 = { bg: 'rgba(34, 211, 238, 0.2)', border: '#22d3ee' }; 
    }
    return {
      labels,
      datasets: [
        {
          label: props.mode === 'VERSUS' ? `[S] ${props.names[0]}` : props.names[0],
          backgroundColor: color1.bg, borderColor: color1.border,
          pointBackgroundColor: color1.border, pointBorderColor: '#fff', data: data1
        },
        {
          label: props.mode === 'VERSUS' ? `[M] ${props.names[1]}` : props.names[1],
          backgroundColor: color2.bg, borderColor: color2.border,
          pointBackgroundColor: color2.border, pointBorderColor: '#fff', data: data2
        }
      ]
    };
  } else {
    // === 单人模式 ===
    const isAtk = props.mode === 'ATTACK';
    const color = isAtk ? { bg: 'rgba(168, 85, 247, 0.2)', border: '#a855f7' } : { bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308' };
    return {
      labels,
      datasets: [{
        label: isAtk ? '支配指标' : '敏感指标',
        backgroundColor: color.bg, borderColor: color.border,
        pointBackgroundColor: color.border, pointBorderColor: '#fff', 
        data: Object.values(props.stats)
      }]
    };
  }
});

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  scales: {
    r: {
      angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
      grid: { color: 'rgba(255, 255, 255, 0.1)' },
      pointLabels: { 
        color: 'rgba(255, 255, 255, 0.9)', // 调亮颜色
        // 🌟 字体放大：从 9 改为 12
        font: { size: 12, family: 'monospace', weight: 'bold' } 
      },
      ticks: { display: false, maxTicksLimit: 5 },
      suggestedMin: 0, suggestedMax: 100
    }
  },
  plugins: {
    legend: {
      display: props.mode !== 'SINGLE' && props.mode !== 'ATTACK',
      labels: { 
        color: '#ffffff', 
        // 🌟 图例字体放大
        font: { size: 12, family: 'monospace' } 
      }
    }
  }
};
</script>

<template>
  <div class="w-full h-[280px]"><Radar :data="chartData" :options="chartOptions" /></div>
</template>