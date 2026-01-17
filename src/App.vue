<script setup>
import { ref } from 'vue';
import { toPng } from 'html-to-image';
import QrcodeVue from 'qrcode.vue';
import { generateReport } from './utils/analyzer';
import RadarChart from './components/RadarChart.vue';

const inputName = ref('');
const report = ref(null);
const isScanning = ref(false);
const cardRef = ref(null);

// 弹窗状态
const showImageModal = ref(false);
const generatedImageUrl = ref('');

const qrValue = 'https://tsap-lab.asia';

const labelMap = {
  waist: '腰部防御',
  feet: '足底反应',
  axilla: '腋下敏感',
  ears: '耳根神经',
  endurance: '忍耐阈值',
  volume: '最大声量'
};

const handleAnalyze = () => {
  if (!inputName.value) return;
  isScanning.value = true;
  report.value = null;
  
  setTimeout(() => {
    report.value = generateReport(inputName.value);
    isScanning.value = false;
  }, 1500);
};

// 🌟 智能导出函数：自动判断 PC 还是 手机
const handleExport = async () => {
  if (!cardRef.value) return;
  
  try {
    // 1. 生成图片数据
    const dataUrl = await toPng(cardRef.value, { 
      pixelRatio: 2, 
      backgroundColor: '#000000' 
    });

    // 2. 判断设备类型
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // 📱 手机端：打开弹窗，让用户长按保存 (解决微信/QQ拦截问题)
      generatedImageUrl.value = dataUrl;
      showImageModal.value = true;
    } else {
      // 💻 电脑端：直接触发下载 (体验更好)
      const link = document.createElement('a');
      link.download = `TSAP_${report.value.id}.png`;
      link.href = dataUrl;
      link.click();
    }
    
  } catch (err) {
    console.error('导出失败:', err);
    alert('导出失败，请重试');
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono selection:bg-yellow-500 selection:text-black">
    
    <div class="absolute inset-0 z-0 opacity-30 pointer-events-none" style="background-image: radial-gradient(#facc15 1px, transparent 1px); background-size: 30px 30px;"></div>
    <div class="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-yellow-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob pointer-events-none z-0"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-yellow-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000 pointer-events-none z-0"></div>
    <div class="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.9)_100%)]"></div>

    <div class="relative z-10 w-full max-w-md flex flex-col items-center">
      
      <h1 class="text-yellow-400 font-bold text-xl mb-8 tracking-[0.3em] opacity-90 border-b border-yellow-500/50 pb-2 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
        TSAP 终端系统
      </h1>

      <div class="mb-8 flex gap-2 w-full transition-all duration-500" :class="{ 'opacity-0 translate-y-4': isScanning }">
        <div class="flex-1 relative group">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 opacity-50 font-bold">></span>
          <input 
            v-model="inputName" 
            @keyup.enter="handleAnalyze"
            type="text" 
            placeholder="请输入受试者代号..." 
            class="w-full pl-8 pr-4 py-3 bg-black/60 border border-yellow-500/30 text-yellow-100 outline-none focus:border-yellow-400 focus:bg-black/90 transition-all shadow-lg backdrop-blur-sm"
          />
        </div>
        <button 
          @click="handleAnalyze" 
          class="px-6 py-2 bg-yellow-500 text-black font-bold hover:bg-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.6)] transition-all tracking-widest cursor-pointer active:scale-95"
        >
          扫描
        </button>
      </div>

      <div v-if="isScanning" class="relative w-full h-96 border border-yellow-500/30 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center animate-pulse">
        <div class="absolute left-0 w-full h-1 bg-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-scan z-20"></div>
        <div class="text-yellow-500 text-xs tracking-[0.2em] space-y-4 text-center">
          <div>连接神经回路...</div>
          <div>读取生物样本...</div>
          <div class="text-2xl font-black opacity-50">ANALYZING</div>
        </div>
      </div>

      <div v-else-if="report" class="flex flex-col items-center w-full animate-fade-in-up">
        
        <div ref="cardRef" class="relative w-full border border-yellow-500 bg-black p-1 shadow-2xl shadow-yellow-500/20">
          <div class="border border-yellow-500/30 p-5 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
            
            <div class="absolute top-0 left-0 w-2 h-2 bg-yellow-500 shadow-[0_0_5px_#facc15]"></div>
            <div class="absolute top-0 right-0 w-2 h-2 bg-yellow-500 shadow-[0_0_5px_#facc15]"></div>
            <div class="absolute bottom-0 left-0 w-2 h-2 bg-yellow-500 shadow-[0_0_5px_#facc15]"></div>
            <div class="absolute bottom-0 right-0 w-2 h-2 bg-yellow-500 shadow-[0_0_5px_#facc15]"></div>

            <div class="absolute top-3 left-3 text-[10px] text-yellow-500 border border-yellow-500 px-2 py-0.5 font-mono z-10 bg-black/80 backdrop-blur-md">
              档案编号: {{ report.id }}
            </div>

            <div class="flex justify-between items-end border-b-2 border-yellow-500/30 pb-4 mb-4 mt-8">
              <div>
                <div class="text-[10px] text-gray-400 mb-1 tracking-wider">受试者身份</div>
                <div class="text-2xl font-bold tracking-widest text-white uppercase drop-shadow-md">{{ report.name }}</div>
              </div>
              <div class="text-right">
                <div class="text-[10px] text-gray-400 mb-1 tracking-wider">敏感度评级</div>
                <div class="text-5xl font-black text-yellow-500 font-mono leading-none drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]">{{ report.rank }}</div>
              </div>
            </div>

            <div class="my-6 relative">
              <RadarChart :stats="report.stats" />
            </div>

            <div class="grid grid-cols-2 gap-px bg-yellow-500/20 border border-yellow-500/20">
               <div v-for="(val, key) in report.stats" :key="key" class="bg-black/90 p-2 flex justify-between items-center group hover:bg-gray-900 transition-colors">
                 <span class="text-[10px] text-gray-400 group-hover:text-yellow-500 transition-colors">{{ labelMap[key] }}</span>
                 <span class="text-yellow-500 font-bold font-mono">{{ val }}</span>
               </div>
            </div>

            <div class="mt-4 border-t-2 border-dashed border-yellow-500/30 pt-4">
              <div class="mb-3">
                <div class="text-[10px] text-yellow-500 font-bold tracking-widest mb-1 opacity-80">> 弱点分析 (ANALYSIS)</div>
                <p class="text-xs text-gray-400 font-mono leading-relaxed">{{ report.diagnosis.analysis }}</p>
              </div>
              <div>
                <div class="text-[10px] text-yellow-500 font-bold tracking-widest mb-1 opacity-80">> 处置协议 (PROTOCOL)</div>
                <p class="text-xs text-white font-mono leading-relaxed bg-yellow-500/10 p-2 border-l-2 border-yellow-500">{{ report.diagnosis.suggestion }}</p>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-yellow-500/20 flex justify-between items-end">
              <div>
                  <div class="inline-block border border-red-900 bg-red-900/20 text-red-500 text-[10px] px-2 py-1 tracking-widest mb-2">
                    警告：绝密数据 // 禁止外传
                  </div>
                  <div class="text-[8px] text-yellow-500 opacity-40 font-mono tracking-[0.2em] uppercase">
                    ACCESS TERMINAL: TSAP-LAB.ASIA
                  </div>
              </div>
              <div class="flex flex-col items-end">
                <div class="text-[8px] text-yellow-500 font-mono tracking-widest mb-1 opacity-80 flex items-center gap-1">
                  <span class="animate-pulse">></span> 扫描接入系统
                </div>
                <div class="border border-yellow-500/50 p-1 bg-black">
                  <QrcodeVue :value="qrValue" :size="50" level="M" background="#000000" foreground="#facc15" />
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="mt-6 flex gap-4">
          <button @click="report = null; inputName = ''" class="text-xs text-gray-500 hover:text-yellow-500 underline decoration-dashed underline-offset-4 cursor-pointer">
            < 返回终端
          </button>
          
          <button 
            @click="handleExport" 
            class="px-4 py-2 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 text-xs font-bold hover:bg-yellow-500 hover:text-black hover:shadow-[0_0_15px_rgba(250,204,21,0.4)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出加密档案
          </button>
        </div>

      </div>

      <div v-else class="text-gray-600 mt-20 font-mono text-xs animate-pulse tracking-widest opacity-50">
        _ WAITING FOR INPUT STREAM...
      </div>
    </div>

    <div v-if="showImageModal" class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in" @click.self="showImageModal = false">
      
      <button 
        @click="showImageModal = false"
        class="absolute top-4 right-4 text-gray-400 hover:text-white p-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="relative w-full max-w-sm">
        <img :src="generatedImageUrl" class="w-full h-auto border border-yellow-500/50 shadow-[0_0_30px_rgba(250,204,21,0.2)]" alt="生成的报告卡片" />
        
        <div class="mt-4 text-center">
          <div class="inline-block bg-yellow-500/20 border border-yellow-500/50 text-yellow-500 px-4 py-2 rounded-full text-xs font-bold tracking-widest animate-pulse">
            长按图片保存到相册 
          </div>
        </div>
      </div>
      
    </div>

  </div>
</template>

<style scoped>
@keyframes scan {
  0% { top: 0; opacity: 0.5; }
  50% { opacity: 1; }
  100% { top: 100%; opacity: 0.5; }
}
.animate-scan { animation: scan 1.5s linear infinite; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob { animation: blob 10s infinite; }
.animation-delay-2000 { animation-delay: 2s; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
</style>