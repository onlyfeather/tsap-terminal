<script setup>
import { ref, computed } from 'vue';
import { toPng } from 'html-to-image';
import QrcodeVue from 'qrcode.vue';
import { generateReport, generateResonanceReport, generateVersusReport } from './utils/analyzer';
import RadarChart from './components/RadarChart.vue';

// 模式: 'SINGLE' | 'RESONANCE' | 'VERSUS'
const mode = ref('SINGLE');
const inputName1 = ref('');
const inputName2 = ref('');

const report = ref(null);
const isScanning = ref(false);
const cardRef = ref(null);
const showImageModal = ref(false);
const generatedImageUrl = ref('');

const qrValue = 'https://tsap-lab.asia';
const labelMap = { waist: '腰部防御', feet: '足底反应', axilla: '腋下敏感', ears: '耳根神经', endurance: '忍耐阈值', volume: '最大声量' };

// 🌟 动态主题色逻辑
const themeColor = computed(() => {
  if (mode.value === 'SINGLE') return 'text-yellow-500 border-yellow-500 shadow-yellow-500/50 bg-yellow-500';
  if (mode.value === 'RESONANCE') return 'text-cyan-400 border-cyan-400 shadow-cyan-400/50 bg-cyan-400';
  return 'text-rose-500 border-rose-500 shadow-rose-500/50 bg-rose-500'; // VERSUS
});

const handleAnalyze = () => {
  if (mode.value === 'SINGLE' && !inputName1.value) return;
  if (mode.value !== 'SINGLE' && (!inputName1.value || !inputName2.value)) return;

  isScanning.value = true;
  report.value = null;
  
  setTimeout(() => {
    if (mode.value === 'SINGLE') report.value = generateReport(inputName1.value);
    else if (mode.value === 'RESONANCE') report.value = generateResonanceReport(inputName1.value, inputName2.value);
    else report.value = generateVersusReport(inputName1.value, inputName2.value);
    isScanning.value = false;
  }, 1500);
};

const handleExport = async () => {
  if (!cardRef.value) return;
  try {
    const dataUrl = await toPng(cardRef.value, { pixelRatio: 2, backgroundColor: '#000000' });
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      generatedImageUrl.value = dataUrl;
      showImageModal.value = true;
    } else {
      const link = document.createElement('a');
      link.download = `TSAP_${report.value.id}.png`;
      link.href = dataUrl;
      link.click();
    }
  } catch (err) {
    console.error(err);
    alert('导出失败，请重试');
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono selection:bg-white selection:text-black">
    
    <div class="absolute inset-0 z-0 opacity-30 pointer-events-none" style="background-image: radial-gradient(#333 1px, transparent 1px); background-size: 30px 30px;"></div>
    
    <div class="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob pointer-events-none z-0 transition-colors duration-1000"
         :class="mode === 'SINGLE' ? 'bg-yellow-600' : (mode === 'RESONANCE' ? 'bg-cyan-600' : 'bg-rose-600')"></div>
         
    <div class="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000 pointer-events-none z-0 transition-colors duration-1000"
         :class="mode === 'SINGLE' ? 'bg-yellow-600' : (mode === 'RESONANCE' ? 'bg-cyan-600' : 'bg-rose-600')"></div>

    <div class="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.9)_100%)]"></div>

    <div class="relative z-10 w-full max-w-md flex flex-col items-center">
      
      <h1 class="font-bold text-xl mb-6 tracking-[0.3em] opacity-90 border-b pb-2 drop-shadow-lg transition-colors duration-500"
          :class="[mode === 'SINGLE' ? 'text-yellow-400 border-yellow-500/50' : (mode === 'RESONANCE' ? 'text-cyan-400 border-cyan-500/50' : 'text-rose-500 border-rose-500/50')]">
        TSAP 终端系统
      </h1>

      <div class="flex gap-2 mb-6 text-[10px] font-bold tracking-widest w-full justify-center">
        <button @click="mode = 'SINGLE'; report = null" class="px-3 py-2 border transition-all duration-300"
          :class="mode === 'SINGLE' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 'border-gray-800 text-gray-600 hover:text-gray-400'">
          [ 单体链接 ]
        </button>
        <button @click="mode = 'RESONANCE'; report = null" class="px-3 py-2 border transition-all duration-300"
          :class="mode === 'RESONANCE' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10' : 'border-gray-800 text-gray-600 hover:text-gray-400'">
          [ 神经共鸣 ]
        </button>
        <button @click="mode = 'VERSUS'; report = null" class="px-3 py-2 border transition-all duration-300"
          :class="mode === 'VERSUS' ? 'border-rose-500 text-rose-500 bg-rose-500/10' : 'border-gray-800 text-gray-600 hover:text-gray-400'">
          [ 攻防模拟 ]
        </button>
      </div>

      <div class="mb-8 w-full transition-all duration-500 space-y-3" :class="{ 'opacity-0 translate-y-4': isScanning }">
        
        <div class="relative group">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 font-bold" :class="mode === 'VERSUS' ? 'text-rose-500' : (mode === 'RESONANCE' ? 'text-cyan-400' : 'text-yellow-500')">></span>
          <input v-model="inputName1" @keyup.enter="handleAnalyze" type="text" 
            :placeholder="mode === 'SINGLE' ? '请输入受试者代号...' : (mode === 'VERSUS' ? '执行官 Alpha...' : '受试者 Alpha...')"
            class="w-full pl-8 pr-4 py-3 bg-black/60 border outline-none transition-all shadow-lg backdrop-blur-sm text-gray-200"
            :class="mode === 'SINGLE' ? 'border-yellow-500/30 focus:border-yellow-400' : (mode === 'RESONANCE' ? 'border-cyan-400/30 focus:border-cyan-400' : 'border-rose-500/30 focus:border-rose-500')"
          />
        </div>

        <div v-if="mode !== 'SINGLE'" class="relative group animate-fade-in">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 font-bold" :class="mode === 'VERSUS' ? 'text-gray-400' : 'text-cyan-400'">></span>
          <input v-model="inputName2" @keyup.enter="handleAnalyze" type="text" 
            :placeholder="mode === 'VERSUS' ? '受试者 Beta...' : '受试者 Beta...'"
            class="w-full pl-8 pr-4 py-3 bg-black/60 border outline-none transition-all shadow-lg backdrop-blur-sm text-gray-200"
            :class="mode === 'VERSUS' ? 'border-gray-500/30 focus:border-gray-400' : 'border-cyan-400/30 focus:border-cyan-400'"
          />
        </div>

        <button @click="handleAnalyze" class="w-full py-3 font-bold transition-all tracking-widest cursor-pointer active:scale-95 text-black shadow-lg"
          :class="[
             mode === 'SINGLE' ? 'bg-yellow-500 hover:bg-yellow-400' : 
             (mode === 'RESONANCE' ? 'bg-gradient-to-r from-yellow-500 to-cyan-400 hover:opacity-90' : 'bg-rose-600 hover:bg-rose-500 text-white')
          ]">
          {{ mode === 'SINGLE' ? '开始扫描' : (mode === 'VERSUS' ? '开始推演' : '建立连接') }}
        </button>
      </div>

      <div v-if="isScanning" class="relative w-full h-96 border bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center animate-pulse"
           :class="mode === 'SINGLE' ? 'border-yellow-500/30' : (mode === 'RESONANCE' ? 'border-cyan-400/30' : 'border-rose-500/30')">
        <div class="absolute left-0 w-full h-1 shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-scan z-20"
             :class="mode === 'SINGLE' ? 'bg-yellow-500' : (mode === 'RESONANCE' ? 'bg-cyan-400' : 'bg-rose-500')"></div>
        <div class="text-xs tracking-[0.2em] space-y-4 text-center text-gray-400">
          <div>读取生物样本...</div>
          <div class="text-2xl font-black opacity-50">PROCESSING</div>
        </div>
      </div>

      <div v-else-if="report" class="flex flex-col items-center w-full animate-fade-in-up">
        
        <div ref="cardRef" class="relative w-full border bg-black p-1 shadow-2xl transition-colors duration-500"
             :class="mode === 'SINGLE' ? 'border-yellow-500 shadow-yellow-500/20' : (mode === 'RESONANCE' ? 'border-cyan-500 shadow-cyan-500/20' : 'border-rose-500 shadow-rose-500/20')">
          
          <div class="border p-5 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"
               :class="mode === 'SINGLE' ? 'border-yellow-500/30' : (mode === 'RESONANCE' ? 'border-cyan-500/30' : 'border-rose-500/30')">
            
            <div class="absolute top-0 left-0 w-2 h-2" :class="mode === 'SINGLE' ? 'bg-yellow-500' : (mode === 'RESONANCE' ? 'bg-cyan-400' : 'bg-rose-500')"></div>
            <div class="absolute top-0 right-0 w-2 h-2" :class="mode === 'SINGLE' ? 'bg-yellow-500' : (mode === 'RESONANCE' ? 'bg-cyan-400' : 'bg-rose-500')"></div>
            <div class="absolute bottom-0 left-0 w-2 h-2" :class="mode === 'SINGLE' ? 'bg-yellow-500' : (mode === 'RESONANCE' ? 'bg-cyan-400' : 'bg-rose-500')"></div>
            <div class="absolute bottom-0 right-0 w-2 h-2" :class="mode === 'SINGLE' ? 'bg-yellow-500' : (mode === 'RESONANCE' ? 'bg-cyan-400' : 'bg-rose-500')"></div>

            <div class="absolute top-3 left-3 text-[10px] border px-2 py-0.5 font-mono z-10 bg-black/80 backdrop-blur-md"
                 :class="mode === 'SINGLE' ? 'text-yellow-500 border-yellow-500' : (mode === 'RESONANCE' ? 'text-cyan-400 border-cyan-400' : 'text-rose-500 border-rose-500')">
              ID: {{ report.id }}
            </div>

            <div v-if="mode === 'SINGLE'" class="flex justify-between items-end border-b-2 border-yellow-500/30 pb-4 mb-4 mt-8">
              <div><div class="text-[10px] text-gray-400 mb-1">受试者身份</div><div class="text-2xl font-bold text-white uppercase">{{ report.name }}</div></div>
              <div class="text-right"><div class="text-[10px] text-gray-400 mb-1">评级</div><div class="text-5xl font-black text-yellow-500 font-mono">{{ report.rank }}</div></div>
            </div>

            <div v-else-if="mode === 'RESONANCE'" class="flex justify-between items-end border-b-2 border-cyan-500/30 pb-4 mb-4 mt-8">
               <div><div class="text-[10px] text-gray-400 mb-1">连接对象</div><div class="text-lg font-bold text-white uppercase"><span class="text-yellow-500">{{ report.names[0] }}</span> / <span class="text-cyan-400">{{ report.names[1] }}</span></div></div>
              <div class="text-right"><div class="text-[10px] text-gray-400 mb-1">同步率</div><div class="text-4xl font-black text-cyan-400 font-mono">{{ report.syncRate }}%</div></div>
            </div>

            <div v-else class="flex justify-between items-end border-b-2 border-rose-500/30 pb-4 mb-4 mt-8">
               <div><div class="text-[10px] text-gray-400 mb-1">对抗模拟</div><div class="text-lg font-bold text-white uppercase"><span class="text-rose-500">{{ report.names[0] }}</span> VS <span class="text-gray-400">{{ report.names[1] }}</span></div></div>
              <div class="text-right"><div class="text-[10px] text-gray-400 mb-1">压制指数</div><div class="text-4xl font-black text-rose-500 font-mono">{{ report.dominance > 0 ? '+' : '' }}{{ Math.floor(report.dominance) }}</div></div>
            </div>

            <div class="my-6 relative"><RadarChart :stats="report.stats" :mode="mode" :names="report.names || []" /></div>

            <div v-if="mode === 'SINGLE'" class="grid grid-cols-2 gap-px bg-yellow-500/20 border border-yellow-500/20">
               <div v-for="(val, key) in report.stats" :key="key" class="bg-black/90 p-2 flex justify-between items-center"><span class="text-[10px] text-gray-400">{{ labelMap[key] }}</span><span class="text-yellow-500 font-bold font-mono">{{ val }}</span></div>
            </div>

            <div class="mt-4 border-t-2 border-dashed pt-4"
                 :class="mode === 'SINGLE' ? 'border-yellow-500/30' : (mode === 'RESONANCE' ? 'border-cyan-500/30' : 'border-rose-500/30')">
              
              <div v-if="mode === 'SINGLE'">
                <div class="mb-3"><div class="text-[10px] text-yellow-500 font-bold tracking-widest mb-1 opacity-80">> 弱点分析</div><p class="text-xs text-gray-400 font-mono">{{ report.diagnosis.analysis }}</p></div>
                <div><div class="text-[10px] text-yellow-500 font-bold tracking-widest mb-1 opacity-80">> 处置协议</div><p class="text-xs text-white font-mono bg-yellow-500/10 p-2 border-l-2 border-yellow-500">{{ report.diagnosis.suggestion }}</p></div>
              </div>

              <div v-else>
                 <div class="text-[10px] font-bold tracking-widest mb-1 opacity-80" :class="mode === 'RESONANCE' ? 'text-cyan-400' : 'text-rose-500'">> {{ mode === 'RESONANCE' ? '神经交互推演' : '攻防结果预测' }}</div>
                 <p class="text-xs text-white/90 font-mono leading-relaxed bg-opacity-10 p-2 border-l-2"
                    :class="mode === 'RESONANCE' ? 'bg-cyan-900 border-cyan-400' : 'bg-rose-900 border-rose-500'">
                   {{ report.analysis }}
                 </p>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t flex justify-between items-end" :class="mode === 'SINGLE' ? 'border-yellow-500/20' : (mode === 'RESONANCE' ? 'border-cyan-500/20' : 'border-rose-500/20')">
              <div>
                  <div class="inline-block border bg-opacity-20 text-[10px] px-2 py-1 tracking-widest mb-2"
                       :class="mode === 'SINGLE' ? 'border-red-900 bg-red-900 text-red-500' : (mode === 'RESONANCE' ? 'border-cyan-900 bg-cyan-900 text-cyan-400' : 'border-rose-900 bg-rose-900 text-rose-500')">
                    {{ mode === 'SINGLE' ? '绝密数据 // 禁止外传' : (mode === 'RESONANCE' ? '状态：神经连接已建立' : '状态：对抗模拟结束') }}
                  </div>
                  <div class="text-[8px] opacity-40 font-mono tracking-[0.2em] uppercase text-white">ACCESS TERMINAL: TSAP-LAB.ASIA</div>
              </div>
              <div class="flex flex-col items-end">
                <div class="border p-1 bg-black" :class="mode === 'SINGLE' ? 'border-yellow-500/50' : (mode === 'RESONANCE' ? 'border-cyan-500/50' : 'border-rose-500/50')">
                  <QrcodeVue :value="qrValue" :size="50" level="M" background="#000000" :foreground="mode === 'SINGLE' ? '#facc15' : (mode === 'RESONANCE' ? '#22d3ee' : '#f43f5e')" />
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="mt-6 flex gap-4">
          <button @click="report = null; inputName1 = ''; inputName2 = ''" class="text-xs text-gray-500 hover:text-white underline decoration-dashed underline-offset-4 cursor-pointer">
            < 返回终端
          </button>
          <button @click="handleExport" class="px-4 py-2 bg-opacity-10 border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer hover:bg-opacity-100 hover:text-black"
                  :class="mode === 'SINGLE' ? 'bg-yellow-500 border-yellow-500 text-yellow-500' : (mode === 'RESONANCE' ? 'bg-cyan-400 border-cyan-400 text-cyan-400' : 'bg-rose-500 border-rose-500 text-rose-500')">
            导出加密档案
          </button>
        </div>
      </div>

      <div v-else class="text-gray-600 mt-20 font-mono text-xs animate-pulse tracking-widest opacity-50">_ WAITING FOR INPUT STREAM...</div>
    </div>

    <div v-if="showImageModal" class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in" @click.self="showImageModal = false">
      <div class="relative w-full max-w-sm">
        <img :src="generatedImageUrl" class="w-full h-auto border shadow-[0_0_30px_rgba(255,255,255,0.2)]" :class="mode === 'SINGLE' ? 'border-yellow-500' : (mode === 'RESONANCE' ? 'border-cyan-400' : 'border-rose-500')" />
        <div class="mt-4 text-center"><div class="inline-block px-4 py-2 rounded-full text-xs font-bold tracking-widest animate-pulse border text-white border-white/30">长按图片保存到相册</div></div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@keyframes scan { 0% { top: 0; opacity: 0.5; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0.5; } }
.animate-scan { animation: scan 1.5s linear infinite; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
.animate-blob { animation: blob 10s infinite; }
.animation-delay-2000 { animation-delay: 2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
</style>