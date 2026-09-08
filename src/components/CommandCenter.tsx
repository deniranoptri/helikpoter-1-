import React, { useState, useMemo } from 'react';
import { SAMPLE_EDUCATIONAL_CONTENT } from '../engine/EducationalEngine';
import { Leaderboard } from './Leaderboard';
import { AdSenseDisplay } from './AdSenseDisplay';
import { TeacherBankModal } from './TeacherBankModal';
import { TeacherBankStore } from '../storage/TeacherBankStore';
import { EducationalEngine } from '../engine/EducationalEngine';

export interface ArenaConfig {
  jenjang: string;
  mataPelajaran: string;
  topik?: string;
  gameMode: 'SOLO' | 'DUEL' | 'SQUAD';
  duration: number;
  sumberSoal?: 'BAWAAN' | 'GURU';
}

interface CommandCenterProps {
  onStart: (config: ArenaConfig) => void;
}

const Background = () => (
  <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-sky-300 to-sky-100 pointer-events-none">
    {/* Sun/Light Source */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/40 rounded-full blur-[100px] opacity-80" />
    
    {/* Distant Clouds (CSS) */}
    <div className="absolute top-[10%] w-[400px] h-16 bg-white/40 rounded-full blur-2xl animate-cloud" style={{ animationDuration: '90s' }} />
    <div className="absolute top-[20%] w-[300px] h-12 bg-white/30 rounded-full blur-xl animate-cloud" style={{ animationDuration: '60s', animationDelay: '-30s' }} />

    {/* Distant Mountains SVG */}
    <svg className="absolute bottom-[15%] w-full h-[40vh] md:min-w-[1000px]" preserveAspectRatio="none" viewBox="0 0 1440 400">
      <path d="M0,300 C150,200 300,100 450,150 C600,200 750,50 900,100 C1050,150 1200,50 1440,150 L1440,400 L0,400 Z" fill="#38bdf8" opacity="0.3"/>
      <path d="M0,350 C200,200 400,250 600,150 C800,50 1000,200 1440,100 L1440,400 L0,400 Z" fill="#0284c7" opacity="0.4"/>
    </svg>

    {/* Midground Forest Silhouette */}
    <svg className="absolute bottom-[8%] w-full h-[25vh] md:min-w-[1000px]" preserveAspectRatio="none" viewBox="0 0 1440 200">
      <path d="M0,150 L0,200 L1440,200 L1440,150 C1200,120 1000,170 800,130 C600,90 400,180 200,140 C100,120 50,160 0,150 Z" fill="#0f766e" opacity="0.9"/>
      <path d="M0,170 L0,200 L1440,200 L1440,170 C1100,150 900,190 700,160 C500,130 300,180 100,160 C50,150 20,175 0,170 Z" fill="#042f2e"/>
    </svg>

    {/* Smoke Columns & Hotspots */}
    <div className="absolute bottom-[20%] left-[25%] w-24 h-48 bg-slate-400/30 blur-2xl animate-pulse" />
    <div className="absolute bottom-[18%] left-[27%] w-4 h-4 bg-orange-500/80 blur-[2px] animate-pulse rounded-full" />
    
    <div className="absolute bottom-[22%] right-[22%] w-20 h-40 bg-slate-400/30 blur-2xl animate-pulse" />
    <div className="absolute bottom-[20%] right-[23%] w-3 h-3 bg-orange-400/70 blur-[2px] animate-pulse rounded-full" />

    {/* Water layer */}
    <div className="absolute bottom-0 w-full h-[12%] bg-gradient-to-b from-sky-700 to-sky-900 border-t-2 border-sky-400/50" />
  </div>
);

export function CommandCenter({ onStart }: CommandCenterProps) {
  const [jenjang, setJenjang] = useState<string>('');
  const [mapel, setMapel] = useState<string>('');
  const [gameMode, setGameMode] = useState<'SOLO' | 'DUEL' | 'SQUAD' | ''>('');
  const [sumberSoal, setSumberSoal] = useState<'BAWAAN' | 'GURU'>('BAWAAN');
  const [showTeacherBank, setShowTeacherBank] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [duration, setDuration] = useState<number>(180);
  const [errorMsg, setErrorMsg] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const availableJenjangs = useMemo(() => {
    const j = new Set<string>();
    SAMPLE_EDUCATIONAL_CONTENT.forEach(c => { 
        if (c.jenjang) j.add(c.jenjang); 
        else if (c.gradeBand) j.add(c.gradeBand); 
    });
    return Array.from(j).sort();
  }, []);

  const availableMapels = useMemo(() => {
    if (!jenjang) return [];
    const m = new Set<string>();
    SAMPLE_EDUCATIONAL_CONTENT.forEach(c => {
      if (c.jenjang === jenjang || c.gradeBand === jenjang) {
        if (c.mataPelajaran) m.add(c.mataPelajaran);
        else if (c.subject) m.add(c.subject);
      }
    });
    return Array.from(m).sort();
  }, [jenjang]);

  const css = `
    @keyframes float-heli {
      0% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(1.5deg); }
      100% { transform: translateY(0px) rotate(0deg); }
    }
    .animate-heli-float {
      animation: float-heli 6s ease-in-out infinite;
    }
    @keyframes cloud-drift {
      from { transform: translateX(-10vw); }
      to { transform: translateX(110vw); }
    }
    .animate-cloud {
      animation: cloud-drift 60s linear infinite;
    }
    .glass-panel {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(148, 163, 184, 0.15);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1);
    }
    .btn-tactile {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .btn-tactile:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
    }
    .btn-tactile:active {
      transform: translateY(1px);
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
  `;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900 font-sans selection:bg-amber-400 selection:text-slate-900 text-slate-200">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      <Background />
      
      {/* Distant atmospheric helicopters - kept subtle */}
      <div className="absolute top-[20%] right-[10%] w-8 md:w-10 drop-shadow-xl animate-heli-float opacity-15 select-none z-0">
        <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh1wRCLOiafO4j-_RG5cyUgccRJBqjpKn2r5osJyH4euoj0T80kUEwojKyjNCBTgb1vLXfv_jy9tQhS4qv2_7_PtF7tUj-r7wlxCloM8gQEAnWmEvtFwyhESiOVSZRtbo-VCyznODkWDT44aMK-uk0fFUGYOsq-nLp9KIj-YNGkNOPThFnWxG87uZhiAUw/s320/Heli%20Biru.png" alt="" className="w-full h-auto object-contain" />
      </div>

      <div className="absolute inset-0 z-10 overflow-y-auto flex flex-col">
        <div className="w-full flex-1 flex flex-col lg:flex-row items-center lg:justify-center justify-start p-4 md:p-6 lg:p-8 gap-2 sm:gap-6 lg:gap-10 pt-8 sm:pt-4 shrink-0">
        
        {/* LEFT SIDE: Brand + Mascot + World */}
        <div className="w-full lg:w-[45%] flex flex-col items-center lg:items-start text-center lg:text-left drop-shadow-xl relative mt-2 sm:mt-4 lg:mt-0">
           <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-2 sm:mb-3 uppercase leading-none"
               style={{
                 background: "linear-gradient(180deg, #ffffff 0%, #e2e8f0 15%, #60a5fa 40%, #1e3a8a 48%, #172554 50%, #f59e0b 51%, #fbbf24 75%, #fef3c7 100%)",
                 WebkitBackgroundClip: "text",
                 WebkitTextFillColor: "transparent",
                 WebkitTextStroke: "2px #0f172a",
                 filter: "drop-shadow(0px 4px 0px #0f172a) drop-shadow(0px 8px 15px rgba(0,0,0,0.6))"
               }}>
             HELI RESCUE
           </h1>
           <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-amber-400 tracking-[0.2em] mb-4 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
             MISI PENYELAMAT HUTAN
           </h2>
           <div className="flex flex-row flex-wrap justify-center items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
             <p className="text-slate-300 font-medium text-[9px] sm:text-[10px] md:text-xs tracking-[0.3em] uppercase bg-slate-900/40 backdrop-blur-sm px-4 sm:px-6 py-1.5 sm:py-2 rounded-full border border-slate-700/50 shadow-inner whitespace-nowrap">
               Belajar • Terbang • Padamkan Api
             </p>
             <button 
               onClick={() => setShowLeaderboard(true)}
               className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black text-xs sm:text-sm rounded-full shadow-[0_10px_20px_-5px_rgba(245,158,11,0.5)] border-2 border-amber-300/50 btn-tactile whitespace-nowrap flex items-center gap-1.5 sm:gap-2 drop-shadow-xl z-20"
               title="Leaderboard"
             >
               <span className="text-sm sm:text-base filter drop-shadow-sm">🏆</span>
               <span>JUARA</span>
             </button>
             
             <button
               onClick={() => setShowSettings(true)}
               className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-b from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-black text-xs sm:text-sm rounded-full shadow-[0_10px_20px_-5px_rgba(71,85,105,0.5)] border-2 border-slate-500/50 btn-tactile whitespace-nowrap flex items-center gap-1.5 sm:gap-2 drop-shadow-xl z-20"
               title="Pengaturan"
             >
               <span className="text-sm sm:text-base filter drop-shadow-sm">⚙️</span>
               <span>SETTING</span>
             </button>
           </div>
           
            <div className="w-24 sm:w-32 md:w-48 lg:w-80 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] animate-heli-float z-10 relative max-h-[160px] sm:max-h-[200px] lg:max-h-[320px] flex justify-center lg:justify-start">
             <div className="absolute pointer-events-none z-0" style={{ width: '90%', height: '6.25%', top: '9.6%', left: '46.5%', transform: 'translateX(-50%)' }}>
               <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEKlLFfpdZuK2iCwu9K4P0fxw_KEVJJ4HabQ-t5K_KQEUyIa_g8VyredSQpxaqeGUJMFbacdLWpH-EoFY9lM0FrRMn_0hi0bQNjU3e-hwb0nJX988eD7BDl2qZ1oJeGloW4zm9YuvGdp9rgFfFSBLr8iQzXLeX__G_Tbq3-Ve3YHDEOM96JOjAEAIm_Do/s320/Rotor.png" alt="Main Rotor" className="rotor-spin-anim-pure select-none w-full h-full block" style={{ transformOrigin: 'center center' }} draggable={false} />
             </div>
             <img src="https://raw.githubusercontent.com/deniranoptri/media/sibungas/Helikopter%20Hijau.png" alt="Heli Rescue Mascot" className="w-full h-auto object-contain relative z-10" draggable={false} />
           </div>
        </div>

        {/* RIGHT SIDE: Mission Setup Panel */}
        <div className="w-full lg:w-[55%] max-w-xl lg:max-w-2xl">
          <div className="glass-panel p-3 sm:p-4 md:p-4 lg:p-5 rounded-3xl flex flex-col border-t-2 border-slate-600 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] animate-pop-in mb-4">
            
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white tracking-wide uppercase mb-2 text-center border-b border-slate-700/50 pb-2 drop-shadow-md">
               PENGATURAN MISI
            </h3>

            {errorMsg && (
              <div className="mb-2 text-rose-400 font-bold bg-rose-950/60 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-rose-500/40 animate-pop-in shadow-lg text-xs sm:text-sm uppercase tracking-wide text-center">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Dropdown Selectors */}
            <div className="space-y-2 mb-2 sm:mb-3">
              
              {/* Jenjang */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">JENJANG</label>
                <div className="relative group">
                  <select 
                    value={jenjang} 
                    onChange={(e) => { 
                      setJenjang(e.target.value); 
                      setMapel(''); 
                      setErrorMsg(''); 
                    }}
                    className="w-full appearance-none bg-slate-800 text-sm sm:text-base md:text-lg font-bold text-white p-2 md:p-2.5 rounded-xl border-2 border-slate-600 group-hover:border-slate-400 focus:border-amber-400 focus:outline-none transition-all cursor-pointer shadow-inner"
                  >
                    <option value="" disabled className="text-slate-500">Pilih Jenjang...</option>
                    {availableJenjangs.map(j => (
                      <option key={j} value={j} className="text-slate-800 bg-white font-bold">{j}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Mapel */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">MATA PELAJARAN</label>
                <div className="relative group">
                  <select 
                    value={mapel} 
                    onChange={(e) => { 
                      setMapel(e.target.value); 
                      setErrorMsg(''); 
                    }}
                    disabled={!jenjang}
                    className="w-full appearance-none bg-slate-800 text-sm sm:text-base md:text-lg font-bold text-white p-2 md:p-2.5 rounded-xl border-2 border-slate-600 group-hover:border-slate-400 focus:border-amber-400 focus:outline-none transition-all cursor-pointer shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled className="text-slate-500">Pilih Mata Pelajaran...</option>
                    {availableMapels.map(m => (
                      <option key={m} value={m} className="text-slate-800 bg-white font-bold">{m}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

            </div>

            
            {/* Duration Selection */}
            <div className="mb-2 sm:mb-3">
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 block mb-0.5 sm:mb-1">DURASI MISI</label>
              <div className="flex gap-2">
                {[
                  { value: 180, label: '3 MENIT', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { value: 300, label: '5 MENIT', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
                ].map(dur => {
                  const isSelected = duration === dur.value;
                  return (
                    <button
                      key={dur.value}
                      onClick={() => { setDuration(dur.value); setErrorMsg(''); }}
                      className={`flex-1 relative p-1.5 md:p-2 rounded-xl border-2 flex items-center justify-center gap-2 transition-all btn-tactile overflow-hidden
                        ${isSelected ? 'bg-slate-800 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'}
                      `}
                    >
                      {isSelected && <div className="absolute inset-0 bg-amber-400/5" />}
                      <div className={`p-1 sm:p-1.5 rounded-lg relative z-10 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={dur.icon} />
                        </svg>
                      </div>
                      <div className={`font-black text-sm sm:text-base tracking-wide relative z-10 ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                        {dur.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Selection */}
            <div className="mb-2 sm:mb-3">
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 block mb-0.5 sm:mb-1">PILIH MODE</label>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'SOLO', title: 'PETUALANG', label: 'Misi Sendiri • 1 Pemain', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { id: 'DUEL', title: 'DUEL', label: '2 Pemain • Real-Time', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                  { id: 'SQUAD', title: 'TEAM DUEL', label: '2 vs 2 • 4 Pemain', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
                ].map(mode => {
                  const isSelected = gameMode === mode.id;
                  return (
                    <button 
                      key={mode.id} 
                      onClick={() => { setGameMode(mode.id as any); setErrorMsg(''); }}
                      className={`relative w-full p-1.5 rounded-xl border-2 flex items-center justify-between text-left transition-all btn-tactile overflow-hidden
                        ${isSelected ? 'bg-slate-800 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'}
                      `}
                    >
                      {isSelected && <div className="absolute inset-0 bg-amber-400/5" />}
                      <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                        <div className={`p-1 sm:p-1.5 rounded-lg ${isSelected ? 'bg-amber-400/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mode.icon} />
                          </svg>
                        </div>
                        <div className={`font-black text-sm sm:text-base tracking-wide leading-tight ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                          {mode.title}
                        </div>
                      </div>
                      <div className={`relative z-10 transition-transform ${isSelected ? 'text-amber-400 translate-x-0' : 'text-slate-600 -translate-x-2'}`}>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Button */}
            <button 
              onClick={() => {
                if (!jenjang) setErrorMsg('Pilih jenjang terlebih dahulu.');
                else if (!mapel) setErrorMsg('Pilih mata pelajaran terlebih dahulu.');
                else if (!gameMode) setErrorMsg('Pilih mode terlebih dahulu.');
                else {
                  if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                  
                  if (sumberSoal === 'GURU') {
                    const ds = TeacherBankStore.loadByJenjangMapel(jenjang, mapel);
                    EducationalEngine.activeTeacherContent = ds ? ds.questions : [];
                  } else {
                    EducationalEngine.activeTeacherContent = [];
                  }
                  EducationalEngine.currentSumberSoal = sumberSoal;
                  
                  onStart({
                    jenjang,
                    mataPelajaran: mapel,
                    gameMode: gameMode as 'SOLO' | 'DUEL' | 'SQUAD',
                    duration,
                    sumberSoal
                  });
                }
              }}
              className="w-full py-2.5 md:py-3 px-4 sm:px-6 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border-b-4 border-emerald-800 btn-tactile uppercase tracking-widest text-sm sm:text-base md:text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 mt-auto"
            >
              <span>MULAI MISI</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>

          </div>
        </div>
        </div>
        
        {/* CREATOR FOOTER */}
        <div className="w-full p-4 flex flex-col items-center justify-center shrink-0 mt-auto z-20">
          <div className="flex flex-col items-center gap-2 bg-slate-900/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-700/50 shadow-lg">
            <span className="text-xs sm:text-sm font-medium text-slate-300 tracking-wide text-center">
              Media ini dibuat Oleh <strong className="text-amber-400 font-bold">Deni Ranoptri, M.Pd.</strong>
            </span>
            <div className="flex items-center gap-4 mt-1">
              <a href="https://web.facebook.com/demian.renovtri.3?rdid=DtnpFZV3KHzgf7Vt&share_url=https%3A%2F%2Fweb.facebook.com%2Fshare%2F1FwSzyNwVW%2F%3F_rdc%3D1%26_rdr#" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors p-2 rounded-full hover:bg-slate-800" aria-label="Facebook" title="Facebook">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
              <a href="https://www.youtube.com/@DeniRanoptri" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors p-2 rounded-full hover:bg-slate-800" aria-label="YouTube" title="YouTube">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@denipositif" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white transition-colors p-2 rounded-full hover:bg-slate-800" aria-label="TikTok" title="TikTok">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.15 5.54-3.33 7.32-1.93 1.57-4.47 2.2-6.9 1.94-2.8-.3-5.32-1.85-6.86-4.14-1.57-2.34-1.92-5.34-1.11-8.02.8-2.67 2.78-4.9 5.31-5.91 1.76-.7 3.73-.83 5.55-.41.01 1.49.02 2.97 0 4.46-1.1-.14-2.22-.04-3.23.4-1.13.49-2.03 1.45-2.42 2.61-.41 1.22-.24 2.6.43 3.65.68 1.05 1.86 1.74 3.12 1.9 1.54.19 3.13-.27 4.2-1.3.93-.9 1.4-2.21 1.42-3.51.05-5.94.01-11.88.02-17.82h-.02z"/></svg>
              </a>
              <a href="https://www.instagram.com/best_deny" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors p-2 rounded-full hover:bg-slate-800" aria-label="Instagram" title="Instagram">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* GOOGLE ADSENSE DISPLAY AD */}
        <div className="w-full shrink-0 flex justify-center z-20 pb-8 sm:pb-10 pt-2">
          <div className="w-full max-w-4xl px-2 sm:px-4 flex justify-center">
            <AdSenseDisplay />
          </div>
        </div>

      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-sm rounded-2xl border-2 border-slate-600 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-700 bg-slate-800 flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <h2 className="text-xl font-black text-white uppercase tracking-wide">Pengaturan</h2>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  <h3 className="font-bold text-slate-200">SOAL GURU</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mb-1 leading-relaxed">
                  Kelola soal pembelajaran kustom Anda. Unggah file XLSX dan gunakan dalam misi.
                </p>
                <button
                  onClick={() => { setShowSettings(false); setShowTeacherBank(true); }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-lg transition-colors border-b-4 border-indigo-800 tracking-wide text-sm"
                >
                  BUKA SOAL GURU
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-slate-700 bg-slate-800/50">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white font-bold rounded-lg transition-colors border-b-4 border-slate-800 tracking-wide text-sm"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}

      {showTeacherBank && (
        <TeacherBankModal onClose={() => setShowTeacherBank(false)} />
      )}
    </div>
  );
}
