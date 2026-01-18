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
  const labels = ['腰部', '足底', '腋下', '耳根', '忍耐', '声量'];
  
  if (Array.isArray(props.stats)) {
    // === 双人模式 ===
    let color1, color2;
    
    if (props.mode === 'VERSUS') {
      // 🔴 攻防模式：红色 vs 灰色
      color1 = { bg: 'rgba(244, 63, 94, 0.2)', border: '#f43f5e' }; // Rose-500
      color2 = { bg: 'rgba(156, 163, 175, 0.2)', border: '#9ca3af' }; // Gray-400
    } else {
      // 🔵 共鸣模式：黄色 vs 青色
      color1 = { bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308' }; // Yellow-500
      color2 = { bg: 'rgba(34, 211, 238, 0.2)', border: '#22d3ee' }; // Cyan-400
    }

    return {
      labels,
      datasets: [
        {
          label: props.names[0] || 'Alpha',
          backgroundColor: color1.bg, borderColor: color1.border,
          pointBackgroundColor: color1.border, pointBorderColor: '#fff',
          data: Object.values(props.stats[0])
        },
        {
          label: props.names[1] || 'Beta',
          backgroundColor: color2.bg, borderColor: color2.border,
          pointBackgroundColor: color2.border, pointBorderColor: '#fff',
          data: Object.values(props.stats[1])
        }
      ]
    };
  } else {
    // === 单人模式：黄色 ===
    return {
      labels,
      datasets: [{
        label: '敏感指标',
        backgroundColor: 'rgba(234, 179, 8, 0.2)', borderColor: '#eab308',
        pointBackgroundColor: '#eab308', pointBorderColor: '#fff',
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
      pointLabels: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 10, family: 'monospace' } },
      ticks: { display: false, maxTicksLimit: 5 },
      suggestedMin: 0, suggestedMax: 100
    }
  },
  plugins: {
    legend: {
      display: props.mode !== 'SINGLE',
      labels: { color: '#ffffff', font: { family: 'monospace' } }
    }
  }
};
</script>

<template>
  <div class="w-full h-[250px]"><Radar :data="chartData" :options="chartOptions" /></div>
</template>