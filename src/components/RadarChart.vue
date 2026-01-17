<script setup>
import { computed } from 'vue';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Radar } from 'vue-chartjs';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const props = defineProps({
  stats: Object // 只接收数据，不再需要颜色
});

const chartData = computed(() => {
  const color = '#facc15'; // 锁定黄色
  
  return {
    labels: ['腰部', '足底', '腋下', '耳部', '忍耐', '声量'],
    datasets: [
      {
        label: '敏感度数据',
        // 核心改动：填充色改淡一点，更像全息投影
        backgroundColor: 'rgba(250, 204, 21, 0.1)', 
        borderColor: color,
        borderWidth: 2,
        pointBackgroundColor: color,
        pointBorderColor: '#000',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: color,
        data: [
          props.stats.waist,
          props.stats.feet,
          props.stats.axilla,
          props.stats.ears,
          props.stats.endurance,
          props.stats.volume
        ]
      }
    ]
  };
});

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(250, 204, 21, 0.2)' }, // 网格线也变黄
        grid: { color: 'rgba(250, 204, 21, 0.2)' },      // 网格圈也变黄
        pointLabels: {
          color: '#e5e5e5',
          font: { size: 12, family: "'Courier New', monospace" } // 强制字体
        },
        ticks: { display: false, stepSize: 20 },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: { legend: { display: false } }
  };
});
</script>

<template>
  <div class="w-full h-64">
    <Radar :data="chartData" :options="chartOptions" />
  </div>
</template>