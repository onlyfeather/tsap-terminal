<script setup>
import { ref, computed } from 'vue';
import { toPng } from 'html-to-image';
import QrcodeVue from 'qrcode.vue';
import { generateReport, generateResonanceReport, generateVersusReport, generateAttackReport } from './utils/analyzer';
import RadarChart from './components/RadarChart.vue';

const mode = ref('SINGLE');
const inputName1 = ref('');
const inputName2 = ref('');
const report = ref(null);
const isScanning = ref(false);
const cardRef = ref(null);
const showImageModal = ref(false);
const generatedImageUrl = ref('');
const qrValue = 'https://tsap-lab.asia';

const defLabelMap = { waist: '腰部防御', feet: '足底反应', axilla: '腋下敏感', ears: '耳根神经', endurance: '忍耐阈值', volume: '最大声量' };
const atkLabelMap = { tech: '指法技巧', control: '场面支配', obs: '弱点洞察', sadism: '施虐欲望', stamina: '体能续航', tools: '器械精通' };

const getThemeClass = (type) => {
  const m = mode.value;
  if (type === 'text') {
    if (m === 'SINGLE') return 'text-yellow-500';
    if (m === 'ATTACK') return 'text-purple-500';
    if (m === 'RESONANCE') return 'text-cyan-400';
    return 'text-rose-500';
  }
  if (type === 'border') {
    if (m === 'SINGLE') return 'border-yellow-500';
    if (m === 'ATTACK') return 'border-purple-500';
    if (m === 'RESONANCE') return 'border-cyan-400';
    return 'border-rose-500';
  }
  if (type === 'bg-blob') {
    if (m === 'SINGLE') return 'bg-yellow-600';
    if (m === 'ATTACK') return 'bg-purple-600';
    if (m === 'RESONANCE') return 'bg-cyan-600';
    return 'bg-rose-600';
  }
  if (type === 'button') {
    if (m === 'SINGLE') return 'bg-yellow-500 hover:bg-yellow-400 text-black';
    if (m === 'ATTACK') return 'bg-purple-600 hover:bg-purple-500 text-white';
    if (m === 'RESONANCE') return 'bg-gradient-to-r from-yellow-500 to-cyan-400 hover:opacity-90 text-black';
    return 'bg-rose-600 hover:bg-rose-500 text-white';
  }
};

const handleAnalyze = () => {
  if ((mode.value === 'SINGLE' || mode.value === 'ATTACK') && !inputName1.value) return;
  if ((mode.value === 'RESONANCE' || mode.value === 'VERSUS') && (!inputName1.value || !inputName2.value)) return;

  isScanning.value = true;
  report.value = null;
  setTimeout(() => {
    if (mode.value === 'SINGLE') report.value = generateReport(inputName1.value);
    else if (mode.value === 'ATTACK') report.value = generateAttackReport(inputName1.value);
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
    if (isMobile) { generatedImageUrl.value = dataUrl; showImageModal.value = true; } 
    else { const link = document.createElement('a'); link.download = `TSAP_${report.value.id}.png`; link.href = dataUrl; link.click(); }
  } catch (err) { console.error(err); alert('导出失败'); }
};
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono selection:bg-white selection:text-black">
    
    <div class="absolute inset-0 z-0 opacity-30 pointer-events-none" style="background-image: radial-gradient(#333 1px, transparent 1px); background-size: 30px 30px;"></div>
    <div class="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob pointer-events-none z-0 transition-colors duration-1000" :class="getThemeClass('bg-blob')"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000 pointer-events-none z-0 transition-colors duration-1000" :class="getThemeClass('bg-blob')"></div>
    <div class="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.9)_100%)]"></div>

    <div class="relative z-10 w-full max-w-md flex flex-col items-center">
      <h1 class="font-bold text-3xl mb-8 tracking-[0.2em] opacity-90 border-b pb-3 drop-shadow-lg transition-colors duration-500"
          :class="[getThemeClass('text'), getThemeClass('border').replace('border-', 'border-opacity-50 ')]">
        TSAP 终端系统
      </h1>

      <div class="grid grid-cols-2 gap-3 mb-8 text-xs font-bold tracking-widest w-full">
        <button @click="mode = 'SINGLE'; report = null" class="px-2 py-3 border transition-all duration-300" :class="mode === 'SINGLE' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 'border-gray-800 text-gray-600 hover:text-gray-400'">[ 单体链接 ]</button>
        <button @click="mode = 'ATTACK'; report = null" class="px-2 py-3 border transition-all duration-300" :class="mode === 'ATTACK' ? 'border-purple-500 text-purple-500 bg-purple-500/10' : 'border-gray-800 text-gray-600 hover:text-gray-400'">[ 支配协议 ]</button>
        <button @click="mode = 'RESONANCE'; report = null" class="px-2 py-3 border transition-all duration-300" :class="mode === 'RESONANCE' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10' : 'border-gray-800 text-gray-600 hover:text-gray-400'">[ 神经共鸣 ]</button>
        <button @click="mode = 'VERSUS'; report = null" class="px-2 py-3 border transition-all duration-300" :class="mode === 'VERSUS' ? 'border-rose-500 text-rose-500 bg-rose-500/10' : 'border-gray-800 text-gray-600 hover:text-gray-400'">[ 攻防模拟 ]</button>
      </div>

      <div class="mb-8 w-full transition-all duration-500 space-y-4" :class="{ 'opacity-0 translate-y-4': isScanning }">
        <div class="relative group">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 font-bold text-lg" :class="getThemeClass('text')">></span>
          <input v-model="inputName1" @keyup.enter="handleAnalyze" type="text" 
            :placeholder="mode === 'SINGLE' ? '请输入受试者代号...' : (mode === 'ATTACK' ? '请输入执行官代号...' : (mode === 'VERSUS' ? '执行官(S)...' : '受试者 Alpha...'))"
            class="w-full pl-10 pr-4 py-4 bg-black/60 border text-lg outline-none transition-all shadow-lg backdrop-blur-sm text-gray-200 border-opacity-30 focus:border-opacity-100 placeholder-gray-600"
            :class="getThemeClass('border')" />
        </div>
        
        <div v-if="mode === 'RESONANCE' || mode === 'VERSUS'" class="relative group animate-fade-in">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 font-bold text-lg" :class="mode === 'VERSUS' ? 'text-gray-400' : 'text-cyan-400'">></span>
          <input v-model="inputName2" @keyup.enter="handleAnalyze" type="text" 
            :placeholder="mode === 'VERSUS' ? '受试者(M)...' : '受试者 Beta...'"
            class="w-full pl-10 pr-4 py-4 bg-black/60 border text-lg outline-none transition-all shadow-lg backdrop-blur-sm text-gray-200 border-opacity-30 focus:border-opacity-100 placeholder-gray-600"
            :class="mode === 'VERSUS' ? 'border-gray-500' : 'border-cyan-400'" />
        </div>
        
        <button @click="handleAnalyze" class="w-full py-4 font-bold text-lg transition-all tracking-widest cursor-pointer active:scale-95 shadow-lg"
          :class="getThemeClass('button')">
          {{ (mode === 'SINGLE' || mode === 'ATTACK') ? '开始扫描' : (mode === 'VERSUS' ? '开始推演' : '建立连接') }}
        </button>
      </div>

      <div v-if="isScanning" class="relative w-full h-96 border bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center animate-pulse border-opacity-30" :class="getThemeClass('border')">
        <div class="absolute left-0 w-full h-1 shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-scan z-20" :class="getThemeClass('bg-blob').replace('bg-blob', 'bg')"></div>
        <div class="text-sm tracking-[0.2em] space-y-4 text-center text-gray-400"><div>读取生物样本...</div><div class="text-3xl font-black opacity-50">PROCESSING</div></div>
      </div>

      <div v-else-if="report" class="flex flex-col items-center w-full animate-fade-in-up">
        <div ref="cardRef" class="relative w-full border bg-black p-1 shadow-2xl transition-colors duration-500" :class="getThemeClass('border')">
          <div class="border p-6 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] border-opacity-30" :class="getThemeClass('border')">
            
            <div class="absolute top-0 left-0 w-2 h-2" :class="getThemeClass('bg-blob').replace('bg-blob', 'bg')"></div>
            <div class="absolute top-0 right-0 w-2 h-2" :class="getThemeClass('bg-blob').replace('bg-blob', 'bg')"></div>
            <div class="absolute bottom-0 left-0 w-2 h-2" :class="getThemeClass('bg-blob').replace('bg-blob', 'bg')"></div>
            <div class="absolute bottom-0 right-0 w-2 h-2" :class="getThemeClass('bg-blob').replace('bg-blob', 'bg')"></div>

            <div class="absolute top-3 left-3 text-xs border px-2 py-1 font-mono z-10 bg-black/80 backdrop-blur-md" :class="[getThemeClass('text'), getThemeClass('border')]">ID: {{ report.id }}</div>

            <div class="flex justify-between items-end border-b-2 pb-4 mb-6 mt-8 border-opacity-30" :class="getThemeClass('border')">
               <div v-if="mode === 'SINGLE' || mode === 'ATTACK'">
                 <div class="text-xs text-gray-400 mb-2">{{ mode === 'ATTACK' ? '执行官身份' : '受试者身份' }}</div>
                 <div class="text-3xl font-bold text-white uppercase">{{ report.name }}</div>
               </div>
               <div v-else>
                 <div class="text-xs text-gray-400 mb-2">{{ mode === 'VERSUS' ? '对抗模拟' : '连接对象' }}</div>
                 <div class="text-xl font-bold text-white uppercase">
                   <span :class="mode === 'VERSUS' ? 'text-rose-500' : 'text-yellow-500'">{{ report.names[0] }}</span> 
                   <span class="text-gray-500 mx-1">{{ mode === 'VERSUS' ? 'VS' : '/' }}</span> 
                   <span :class="mode === 'VERSUS' ? 'text-gray-400' : 'text-cyan-400'">{{ report.names[1] }}</span>
                 </div>
               </div>
               <div class="text-right">
                 <div class="text-xs text-gray-400 mb-1">{{ mode === 'SINGLE' ? '敏感度评级' : (mode === 'ATTACK' ? '危险度评级' : (mode === 'RESONANCE' ? '同步率' : '支配值')) }}</div>
                 <div class="text-6xl font-black font-mono leading-none" :class="getThemeClass('text')">
                   {{ (mode === 'SINGLE' || mode === 'ATTACK') ? report.rank : (mode === 'RESONANCE' ? report.syncRate + '%' : (report.dominance > 0 ? '+' : '') + Math.floor(report.dominance)) }}
                 </div>
               </div>
            </div>

            <div class="my-8 relative"><RadarChart :stats="report.stats" :mode="mode" :names="report.names || []" /></div>

            <div v-if="mode === 'SINGLE'" class="grid grid-cols-2 gap-px bg-yellow-500/20 border border-yellow-500/20">
               <div v-for="(val, key) in report.stats" :key="key" class="bg-black/90 p-3 flex justify-between items-center group hover:bg-gray-900 transition-colors">
                 <span class="text-xs text-gray-400 group-hover:text-yellow-500">{{ defLabelMap[key] }}</span>
                 <span class="text-yellow-500 font-bold font-mono text-base">{{ val }}</span>
               </div>
            </div>
            
            <div v-else-if="mode === 'ATTACK'" class="grid grid-cols-2 gap-px bg-purple-500/20 border border-purple-500/20">
               <div v-for="(val, key) in report.stats" :key="key" class="bg-black/90 p-3 flex justify-between items-center group hover:bg-gray-900 transition-colors">
                 <span class="text-xs text-gray-400 group-hover:text-purple-500">{{ atkLabelMap[key] }}</span>
                 <span class="text-purple-500 font-bold font-mono text-base">{{ val }}</span>
               </div>
            </div>
            
            <div v-else-if="mode === 'RESONANCE'" class="grid grid-cols-2 gap-px bg-cyan-500/20 border border-cyan-500/20">
               <div v-for="(val, key) in report.stats[0]" :key="key" class="bg-black/90 p-3 flex justify-between items-center group hover:bg-gray-900 transition-colors">
                 <span class="text-xs text-gray-400 group-hover:text-cyan-400">{{ defLabelMap[key] }}</span>
                 <div class="font-mono font-bold text-sm"><span class="text-yellow-500">{{ val }}</span> / <span class="text-cyan-400">{{ report.stats[1][key] }}</span></div>
               </div>
            </div>
            
            <div v-else-if="mode === 'VERSUS'" class="grid grid-cols-2 gap-3">
               <div class="flex flex-col gap-px bg-rose-500/20 border border-rose-500/20">
                 <div class="bg-black/80 text-xs text-rose-500 font-bold text-center py-2">执行官 [S]</div>
                 <div v-for="(val, key) in report.stats[0]" :key="key" class="bg-black/90 p-2 px-3 flex justify-between items-center">
                   <span class="text-xs text-gray-400">{{ atkLabelMap[key] }}</span>
                   <span class="text-rose-500 font-bold font-mono text-sm">{{ val }}</span>
                 </div>
               </div>
               <div class="flex flex-col gap-px bg-gray-500/20 border border-gray-500/20">
                 <div class="bg-black/80 text-xs text-gray-300 font-bold text-center py-2">受试者 [M]</div>
                 <div v-for="(val, key) in report.stats[1]" :key="key" class="bg-black/90 p-2 px-3 flex justify-between items-center">
                   <span class="text-xs text-gray-500">{{ defLabelMap[key] }}</span>
                   <span class="text-gray-300 font-bold font-mono text-sm">{{ val }}</span>
                 </div>
               </div>
            </div>

            <div class="mt-6 border-t-2 border-dashed pt-6 border-opacity-30" :class="getThemeClass('border')">
              <div v-if="mode === 'SINGLE'">
                <div class="mb-4"><div class="text-xs text-yellow-500 font-bold tracking-widest mb-2 opacity-80">> 弱点分析</div><p class="text-sm text-gray-300 font-mono leading-relaxed">{{ report.diagnosis.analysis }}</p></div>
                <div><div class="text-xs text-yellow-500 font-bold tracking-widest mb-2 opacity-80">> 处置协议</div><p class="text-sm text-white font-mono bg-yellow-500/10 p-3 border-l-2 border-yellow-500 leading-relaxed">{{ report.diagnosis.suggestion }}</p></div>
              </div>
              <div v-else-if="mode === 'ATTACK'">
                <div class="mb-4"><div class="text-xs text-purple-500 font-bold tracking-widest mb-2 opacity-80">> 处刑风格</div><p class="text-sm text-gray-300 font-mono leading-relaxed">{{ report.diagnosis.analysis }}</p></div>
                <div><div class="text-xs text-purple-500 font-bold tracking-widest mb-2 opacity-80">> 进阶建议</div><p class="text-sm text-white font-mono bg-purple-500/10 p-3 border-l-2 border-purple-500 leading-relaxed">{{ report.diagnosis.suggestion }}</p></div>
              </div>
              <div v-else>
                 <div class="text-xs font-bold tracking-widest mb-2 opacity-80" :class="getThemeClass('text')">> {{ mode === 'RESONANCE' ? '神经交互推演' : '攻防结果预测' }}</div>
                 <p class="text-sm text-white/90 font-mono leading-relaxed bg-opacity-10 p-3 border-l-2" 
                    :class="mode === 'RESONANCE' ? 'bg-cyan-900 border-cyan-400' : 'bg-rose-900 border-rose-500'">{{ report.analysis }}</p>
              </div>
            </div>

            <div class="mt-8 pt-4 border-t flex justify-between items-end border-opacity-20" :class="getThemeClass('border')">
               <div>
                 <div class="inline-block border bg-opacity-20 text-[10px] px-3 py-1 tracking-widest mb-2" 
                      :class="mode === 'SINGLE' ? 'border-red-900 bg-red-900 text-red-500' : (mode === 'RESONANCE' ? 'border-cyan-900 bg-cyan-900 text-cyan-400' : (mode === 'ATTACK' ? 'border-purple-900 bg-purple-900 text-purple-400' : 'border-rose-900 bg-rose-900 text-rose-500'))">
                    {{ (mode === 'SINGLE' || mode === 'ATTACK') ? '绝密数据 // 禁止外传' : (mode === 'RESONANCE' ? '状态：神经连接已建立' : '状态：对抗模拟结束') }}
                 </div>
                 <div class="text-[10px] opacity-40 font-mono tracking-[0.2em] uppercase text-white">ACCESS TERMINAL: TSAP-LAB.ASIA</div>
               </div>
               <div class="flex flex-col items-end">
                 <div class="border p-1 bg-black border-opacity-50" :class="getThemeClass('border')">
                   <QrcodeVue :value="qrValue" :size="60" level="M" background="#000000" :foreground="mode === 'SINGLE' ? '#facc15' : (mode === 'RESONANCE' ? '#22d3ee' : (mode === 'ATTACK' ? '#a855f7' : '#f43f5e'))" />
                 </div>
               </div>
            </div>
          </div>
        </div>

        <div class="mt-8 flex gap-4">
          <button @click="report = null; inputName1 = ''; inputName2 = ''" class="text-sm text-gray-500 hover:text-white underline decoration-dashed underline-offset-4 cursor-pointer">< 返回终端</button>
          <button @click="handleExport" class="px-6 py-3 bg-opacity-10 border text-sm font-bold transition-all flex items-center gap-2 cursor-pointer hover:bg-opacity-100 hover:text-black" 
            :class="getThemeClass('border') + ' ' + getThemeClass('text')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            导出加密档案
          </button>
        </div>
      </div>
      
      <div v-else class="text-gray-600 mt-20 font-mono text-sm animate-pulse tracking-widest opacity-50">_ WAITING FOR INPUT STREAM...</div>
    </div>
    
    <div v-if="showImageModal" 
         class="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fade-in"
         @click.self="showImageModal = false">
      
      <div class="flex flex-col items-center gap-8 pointer-events-none">
        
        <div class="flex flex-col items-center gap-2 text-center z-10">
          <div class="bg-white/10 border border-white/20 px-6 py-2 rounded-full backdrop-blur-md animate-bounce">
            <span class="text-white font-bold text-sm tracking-[0.2em]">⬇ 长按下方保存 ⬇</span>
          </div>
          <span class="text-[10px] text-gray-500 font-mono tracking-widest uppercase">分享给其它受试者</span>
        </div>

        <div class="relative pointer-events-auto group">
          <div class="absolute -inset-4 rounded-xl opacity-30 blur-xl transition-all duration-1000 group-active:opacity-60 group-active:scale-110"
               :class="getThemeClass('bg-blob')"></div>
          
          <img :src="generatedImageUrl" 
               class="relative w-48 h-auto rounded-lg border-2 shadow-[0_0_50px_rgba(0,0,0,0.8)] transform transition-transform duration-200 active:scale-95 active:rotate-1"
               :class="getThemeClass('border')"
               alt="Report Card" />
        </div>

        <button @click="showImageModal = false" class="pointer-events-auto mt-4 text-gray-600 hover:text-white transition-colors flex items-center gap-2">
          <span class="text-2xl">×</span>
          <span class="text-xs tracking-widest">点击任意处关闭</span>
        </button>

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