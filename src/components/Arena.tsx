import React, { useEffect, useRef } from 'react';
import { AssetLoader } from '../registry/AssetLoader';
import { UNIVERSAL_ROTOR_URL } from '../registry/HelicopterRegistry';
import { InputManager } from '../engine/InputManager';
import { HelicopterEntity } from '../engine/HelicopterEntity';
import { FireEngine } from '../engine/FireEngine';
import { FireEntity } from '../engine/FireEntity';
import { EducationalEngine, SAMPLE_EDUCATIONAL_CONTENT, AnswerResult } from '../engine/EducationalEngine';
import { sharedAudioEngine } from '../engine/AudioEngine';
import { ScoreEngine, SessionResultSnapshot } from '../engine/ScoreEngine';
import { LocalSessionStore } from '../storage/LocalSessionStore';
import { HotspotEngine } from '../engine/HotspotEngine';
import { HotspotEntity } from '../engine/HotspotEntity';
import { ArenaConfig } from './CommandCenter';

// --- PRNG Utilities for Answer Position Randomization ---
function cyrb53(str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
// --------------------------------------------------------

type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'MASTER';

type ObstacleType = 'CLOUD';
interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  width?: number;
  height?: number;
}

interface MissionDifficultyConfig {
  level: DifficultyLevel;
  distractorCount: number;
  minSpacing: number;
  sequenceLength: number;
}

const getDifficultyConfig = (missionIndex: number): MissionDifficultyConfig => {
  if (missionIndex <= 2) return { level: 'EASY', distractorCount: 1, minSpacing: 100, sequenceLength: 2 };
  if (missionIndex <= 4) return { level: 'MEDIUM', distractorCount: 2, minSpacing: 150, sequenceLength: 3 };
  if (missionIndex <= 6) return { level: 'HARD', distractorCount: 3, minSpacing: 200, sequenceLength: 4 };
  return { level: 'MASTER', distractorCount: 4, minSpacing: 250, sequenceLength: 5 };
};

const PineTree = ({ className, scale = 1, style }: { className?: string, scale?: number, style?: React.CSSProperties }) => (
  <svg className={`absolute pointer-events-none drop-shadow-2xl ${className}`} style={{ ...style, transform: `scale(${scale}) translate(-50%, -100%)`, transformOrigin: 'bottom center' }} width="100" height="150" viewBox="0 0 80 120">
     <rect x="35" y="90" width="10" height="30" fill="#4E342E"/>
     <path d="M10,95 Q40,90 70,95 L40,40 Z" fill="#2E7D32"/>
     <path d="M40,95 L70,95 L40,40 Z" fill="#1B5E20"/>
     <path d="M15,65 Q40,60 65,65 L40,15 Z" fill="#388E3C"/>
     <path d="M40,65 L65,65 L40,15 Z" fill="#2E7D32"/>
     <path d="M20,35 Q40,30 60,35 L40,0 Z" fill="#4CAF50"/>
     <path d="M40,35 L60,35 L40,0 Z" fill="#388E3C"/>
  </svg>
);

const arenaStyles = `
@keyframes popIn {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes waterFlow {
  0% { background-position: 0 0; }
  100% { background-position: 0 40px; }
}
@keyframes pulseGlow {
  0%, 100% { opacity: 0.6; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
}
@keyframes waterImpact {
  0% { transform: scale(0.5); opacity: 0.8; }
  100% { transform: scale(2); opacity: 0; }
}
.animate-pop-in {
  animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
.water-stream {
  background-image: repeating-linear-gradient(to bottom, #93c5fd, #3b82f6 20px, #93c5fd 40px);
  background-size: 100% 40px;
  animation: waterFlow 0.3s linear infinite;
}
.refill-active {
  animation: pulseGlow 1s ease-in-out infinite;
}

@keyframes floatUpFade {
  0% { transform: translateY(0) scale(0.8); opacity: 0; }
  20% { transform: translateY(-20px) scale(1.1); opacity: 1; }
  80% { transform: translateY(-50px) scale(1); opacity: 1; }
  100% { transform: translateY(-70px) scale(0.9); opacity: 0; }
}
.reward-float {
  animation: floatUpFade 2s ease-out forwards;
}
`;

export type GameMode = 'SOLO' | 'DUEL' | 'SQUAD';

interface RewardVisual {
  id: string;
  x: number;
  y: number;
  score: number;
  playerId: string;
}
export type GameState = 'MODE_SELECT' | 'READY' | 'PLAYING' | 'MISSION_COMPLETE' | 'EDUCATIONAL_CHALLENGE';

const TouchButton = ({ 
  label, 
  onPress, 
  onRelease,
  className = ""
}: { 
  label: React.ReactNode, 
  onPress: () => void, 
  onRelease: () => void,
  className?: string
}) => {
  const [pressed, setPressed] = React.useState(false);
  const activePointers = React.useRef<Set<number>>(new Set());

  const addPointer = (id: number) => {
    if (activePointers.current.size === 0) {
      setPressed(true);
      onPress();
    }
    activePointers.current.add(id);
  };

  const removePointer = (id: number) => {
    if (activePointers.current.has(id)) {
      activePointers.current.delete(id);
      if (activePointers.current.size === 0) {
        setPressed(false);
        onRelease();
      }
    }
  };

  const handleDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    addPointer(e.pointerId);
  };

  const handleEnter = (e: React.PointerEvent) => {
    if (e.buttons > 0 || e.pointerType === 'touch') {
      addPointer(e.pointerId);
    }
  };

  const handleLeave = (e: React.PointerEvent) => {
    removePointer(e.pointerId);
  };

  const handleUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    removePointer(e.pointerId);
  };

  return (
    <button
      className={`touch-none select-none transition-transform ${pressed ? 'scale-90 bg-opacity-80 brightness-75' : 'scale-100'} ${className}`}
      onPointerDown={handleDown}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      {label}
    </button>
  );
};

const PlayerTouchControls = ({
  playerLabel,
  positionClass,
  reverse = false,
  dropColorClass,
  keyMap,
  keyStateRef,
  inputManager,
  compScale
}: {
  playerLabel: string;
  positionClass: string;
  reverse?: boolean;
  dropColorClass: string;
  keyMap: { up: string, down: string, left: string, right: string, drop: string };
  keyStateRef: React.MutableRefObject<any>;
  inputManager?: any;
}) => {
  const setKey = (key: string, isDown: boolean) => {
    if (keyStateRef.current && keyStateRef.current[key] !== undefined) {
      keyStateRef.current[key] = isDown;
      if (key === 'space' && inputManager) {
        inputManager.setDropActive(isDown);
      }
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center pointer-events-auto w-full ${positionClass}`} style={{ touchAction: 'none' }}>
      <div className={`text-[10px] md:text-[11px] font-black text-white/90 mb-0.5 pointer-events-none drop-shadow-md tracking-widest`}>{playerLabel}</div>
      <div className={`flex gap-1 min-[400px]:gap-3 md:gap-6 items-center justify-center ${reverse ? 'flex-row-reverse' : 'flex-row'} origin-center`}>
        {/* D-PAD */}
        <div className="flex flex-col items-center -space-y-0.5">
          <TouchButton 
            label={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>} 
            onPress={() => setKey(keyMap.up, true)} 
            onRelease={() => setKey(keyMap.up, false)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-800/80 text-white flex items-center justify-center border-b-[3px] border-slate-900 active:border-b-0 active:translate-y-1"
          />
          <div className="flex -space-x-0.5">
            <TouchButton 
              label={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>} 
              onPress={() => setKey(keyMap.left, true)} 
              onRelease={() => setKey(keyMap.left, false)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-800/80 text-white flex items-center justify-center border-b-[3px] border-slate-900 active:border-b-0 active:translate-y-1"
            />
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center pointer-events-none"><div className="w-3 h-3 rounded-full bg-slate-600/30"></div></div>
            <TouchButton 
              label={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>} 
              onPress={() => setKey(keyMap.right, true)} 
              onRelease={() => setKey(keyMap.right, false)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-800/80 text-white flex items-center justify-center border-b-[3px] border-slate-900 active:border-b-0 active:translate-y-1"
            />
          </div>
          <TouchButton 
            label={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>} 
            onPress={() => setKey(keyMap.down, true)} 
            onRelease={() => setKey(keyMap.down, false)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-800/80 text-white flex items-center justify-center border-b-[3px] border-slate-900 active:border-b-0 active:translate-y-1"
          />
        </div>
        
        {/* DROP BUTTON */}
        <TouchButton 
          label={<div className="flex flex-col items-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg><span className="text-[8px] md:text-[9px] font-bold mt-0.5 tracking-widest">SIRAM</span></div>} 
          onPress={() => setKey(keyMap.drop, true)} 
          onRelease={() => setKey(keyMap.drop, false)}
          className={`w-14 h-14 md:w-16 md:h-16 rounded-full text-white flex items-center justify-center border-b-[3px] active:border-b-0 active:translate-y-1 shadow-lg ${dropColorClass}`}
        />
      </div>
    </div>
  );
};

export function Arena({ config, onReturnToMenu }: { config?: ArenaConfig, onReturnToMenu?: () => void }) {
  const sessionSeedRef = useRef<number>(Math.floor(Math.random() * 1000000));
  const arenaRef = useRef<HTMLDivElement>(null);
  
  const arenaRectRef = useRef({ width: 1200, height: 800, left: 0, top: 0 });
  const compositionScaleRef = useRef(1);
  const [arenaSize, setArenaSize] = React.useState({ w: typeof window !== 'undefined' ? window.innerWidth : 1200, h: typeof window !== 'undefined' ? window.innerHeight : 800 });

  useEffect(() => {
    if (!arenaRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.target.getBoundingClientRect();
        arenaRectRef.current = {
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top
        };
        setArenaSize({ w: rect.width, h: rect.height });
      }
    });
    observer.observe(arenaRef.current);
    
    // Initial rect
    const rect = arenaRef.current.getBoundingClientRect();
    arenaRectRef.current = { width: rect.width, height: rect.height, left: rect.left, top: rect.top };
    setArenaSize({ w: rect.width, h: rect.height });
    
    return () => observer.disconnect();
  }, []);

  const visualP1Ref = useRef<HTMLDivElement>(null);
  const imgP1Ref = useRef<HTMLImageElement>(null);
  const streamP1Ref = useRef<HTMLDivElement>(null);
  const waterBarP1Ref = useRef<HTMLDivElement>(null);

  const visualP2Ref = useRef<HTMLDivElement>(null);
  const imgP2Ref = useRef<HTMLImageElement>(null);
  const streamP2Ref = useRef<HTMLDivElement>(null);
  const waterBarP2Ref = useRef<HTMLDivElement>(null);

  const visualP3Ref = useRef<HTMLDivElement>(null);
  const imgP3Ref = useRef<HTMLImageElement>(null);
  const streamP3Ref = useRef<HTMLDivElement>(null);
  const waterBarP3Ref = useRef<HTMLDivElement>(null);

  const visualP4Ref = useRef<HTMLDivElement>(null);
  const imgP4Ref = useRef<HTMLImageElement>(null);
  const streamP4Ref = useRef<HTMLDivElement>(null);
  const waterBarP4Ref = useRef<HTMLDivElement>(null);

  const input = InputManager.getInstance();
  
  const entityP1Ref = useRef(new HelicopterEntity());
  const entityP2Ref = useRef(new HelicopterEntity());
  const entityP3Ref = useRef(new HelicopterEntity());
  const entityP4Ref = useRef(new HelicopterEntity());
  const assetP1 = AssetLoader.getAssetState('HELI_GREEN');
  const assetP2 = AssetLoader.getAssetState('HELI_BLUE');
  const assetP3 = AssetLoader.getAssetState('HELI_YELLOW');
  const assetP4 = AssetLoader.getAssetState('HELI_RED');
  const hasStarted = useRef(false);

  const [gameMode, setGameMode] = React.useState<GameMode>(config ? config.gameMode : 'SOLO');
  const gameModeRef = useRef<GameMode>(config ? config.gameMode : 'SOLO');

  const [gameState, setGameState] = React.useState<GameState>(config ? 'READY' : 'MODE_SELECT');
  const gameStateRef = useRef<GameState>(config ? 'READY' : 'MODE_SELECT');
  const wasValveOpenRef = useRef(false);
  const [activeFiresCount, setActiveFiresCount] = React.useState(0);
  const activeFiresCountRef = useRef(0);
  const remainingMsRef = useRef<number | null>(null);
  const [timeLeft, setTimeLeft] = React.useState<number>(config ? config.duration : 180);

  const [sharedEducationalEngine] = React.useState(() => {
    const engine = new EducationalEngine();
    engine.registerContent(SAMPLE_EDUCATIONAL_CONTENT);
    return engine;
  });

  const [scoreEngineP1] = React.useState(() => new ScoreEngine());
  const [scoreEngineP2] = React.useState(() => new ScoreEngine());
  const [scoreEngineP3] = React.useState(() => new ScoreEngine());
  const [scoreEngineP4] = React.useState(() => new ScoreEngine());
  
  const [activeMission, setActiveMission] = React.useState<any>(null);
  const activeMissionRef = useRef<any>(null);
  const activeMissionSequenceRef = useRef<number>(0);

  const [sessionResultSnapshot, setSessionResultSnapshot] = React.useState<SessionResultSnapshot | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const [p1Name, setP1Name] = React.useState('');
  const [p2Name, setP2Name] = React.useState('');
  const [p3Name, setP3Name] = React.useState('');
  const [p4Name, setP4Name] = React.useState('');
  const sessionSnapshotCapturedRef = useRef<boolean>(false);

  const obstaclesRef = useRef<Obstacle[]>([]);
  const obstacleFeedbackCooldownRef = useRef<number>(0);
  const obstacleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wasInCloudRef = useRef(false);
  const [missionIndex, setMissionIndex] = React.useState<number>(1);
  const [missionDifficulty, setMissionDifficulty] = React.useState<DifficultyLevel>('EASY');
  const [missionProgress, setMissionProgress] = React.useState<{completed: number, required: number} | null>(null);
  const missionProgressRef = useRef<{completed: number, required: number} | null>(null);
  const [missionFeedback, setMissionFeedback] = React.useState<{message: string, isError: boolean} | null>(null);
  const [rewards, setRewards] = React.useState<RewardVisual[]>([]);
  const [streakRewards, setStreakRewards] = React.useState<{ id: string, pId: string }[]>([]);
  const [hudScores, setHudScores] = React.useState<{P1: number, P2: number, P3: number, P4: number}>({P1: 0, P2: 0, P3: 0, P4: 0});
  const [lives, setLives] = React.useState<{P1: number, P2: number, P3: number, P4: number}>({P1: 5, P2: 5, P3: 5, P4: 5});
  const livesRef = useRef<{P1: number, P2: number, P3: number, P4: number}>({P1: 5, P2: 5, P3: 5, P4: 5});
  const [streaks, setStreaks] = React.useState<{P1: number, P2: number, P3: number, P4: number}>({P1: 0, P2: 0, P3: 0, P4: 0});
  const streaksRef = useRef<{P1: number, P2: number, P3: number, P4: number}>({P1: 0, P2: 0, P3: 0, P4: 0});
  const cloudCooldownsRef = useRef<{P1: number, P2: number, P3: number, P4: number}>({P1: 0, P2: 0, P3: 0, P4: 0});
  const heliCollisionCooldownsRef = useRef<{P1: number, P2: number, P3: number, P4: number}>({P1: 0, P2: 0, P3: 0, P4: 0});
  const [isMuted, setIsMuted] = React.useState(false);
  const distractorFeedbackCooldownRef = useRef<number>(0);
  const hotspotProximityStateRef = useRef<{ [hotspotId: string]: { [pId: string]: 'NONE' | 'DETECTED' | 'READY' } }>({});
  const hotspotMessageTimerRef = useRef<{ [hotspotId: string]: { type: 'NONE' | 'DETECTED' | 'READY', expiresAt: number } }>({});
  const alignmentFeedbackCooldownRef = useRef<number>(0);
  const sprayConsumedRef = useRef<{ P1: boolean, P2: boolean, P3: boolean, P4: boolean }>({ P1: false, P2: false, P3: false, P4: false });

  const keyState = useRef({
    w: false, a: false, s: false, d: false, space: false,
    up: false, down: false, left: false, right: false, enter: false,
    i: false, j: false, k: false, l: false, o: false,
    t: false, f: false, g: false, h: false, y: false
  });

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    let interval: any;
    if ((gameState === 'PLAYING' || gameState === 'EDUCATIONAL_CHALLENGE') && remainingMsRef.current !== null) {
      interval = setInterval(() => {
        const remainingMs = Math.max(0, remainingMsRef.current || 0);
        setTimeLeft(Math.ceil(remainingMs / 1000));
      }, 500);
    } else if (gameState === 'READY' || gameState === 'MODE_SELECT') {
      setTimeLeft(config ? config.duration : 180);
      remainingMsRef.current = null;
    }
    return () => clearInterval(interval);
  }, [gameState, config]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        sharedAudioEngine.stopAll();
      } else {
        if (gameStateRef.current === 'PLAYING' || gameStateRef.current === 'EDUCATIONAL_CHALLENGE') {
          sharedAudioEngine.startRotor();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sharedAudioEngine]);


  useEffect(() => {
    if (config) {
      sharedAudioEngine.unlock();
    }
  }, [config]);

  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);

  const [hotspotEngine] = React.useState(() => new HotspotEngine());
  const hotspotRefs = useRef<(HTMLDivElement | null)[]>([]);

  // RESPONSIVE COMPOSITION SCALE
  const groundVisualHeight = Math.max(40, 80 * (arenaSize.h < 600 ? 0.7 : 1));
  const currentLakeWidth = Math.min(300, arenaSize.w * 0.35);
  const availablePlayableHeight = Math.max(100, arenaSize.h); // arenaRef is inside flex-1, already excludes HUD/Deck in DOM flow, except Question which is absolute but doesn't shrink main.
  const availablePlayableWidth = arenaSize.w;
  
  const scaleW = Math.min(1, availablePlayableWidth / 1024);
  const scaleH = Math.min(1, availablePlayableHeight / 600);
  
  // Dynamic composition scale
  const compositionScale = Math.max(0.45, Math.min(1, Math.min(scaleW, scaleH)));
  
  const VISUAL_SCALE = 0.5 * compositionScale;
  const FIRE_VISUAL_SCALE = 0.85 * compositionScale;
  compositionScaleRef.current = compositionScale;
  const scaledWidthP1 = assetP1.definition.width * VISUAL_SCALE;
  const scaledHeightP1 = assetP1.definition.height * VISUAL_SCALE;
  const scaledWidthP2 = assetP2.definition.width * VISUAL_SCALE;
  const scaledHeightP2 = assetP2.definition.height * VISUAL_SCALE;
  const scaledWidthP3 = assetP3.definition.width * VISUAL_SCALE;
  const scaledHeightP3 = assetP3.definition.height * VISUAL_SCALE;
  const scaledWidthP4 = assetP4.definition.width * VISUAL_SCALE;
  const scaledHeightP4 = assetP4.definition.height * VISUAL_SCALE;

  useEffect(() => {
    entityP1Ref.current.width = scaledWidthP1;
    entityP1Ref.current.height = scaledHeightP1;
    entityP1Ref.current.paddingTop = scaledHeightP1 * (assetP1.definition.rotorOffset.y / 100);

    entityP2Ref.current.width = scaledWidthP2;
    entityP2Ref.current.height = scaledHeightP2;
    entityP2Ref.current.paddingTop = scaledHeightP2 * (assetP2.definition.rotorOffset.y / 100);

    entityP3Ref.current.width = scaledWidthP3;
    entityP3Ref.current.height = scaledHeightP3;
    entityP3Ref.current.paddingTop = scaledHeightP3 * (assetP3.definition.rotorOffset.y / 100);

    entityP4Ref.current.width = scaledWidthP4;
    entityP4Ref.current.height = scaledHeightP4;
    entityP4Ref.current.paddingTop = scaledHeightP4 * (assetP4.definition.rotorOffset.y / 100);
  }, [scaledWidthP1, scaledHeightP1, scaledWidthP2, scaledHeightP2, scaledWidthP3, scaledHeightP3, scaledWidthP4, scaledHeightP4, assetP1, assetP2, assetP3, assetP4]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': keyState.current.w = true; break;
        case 'KeyA': keyState.current.a = true; break;
        case 'KeyS': keyState.current.s = true; break;
        case 'KeyD': keyState.current.d = true; break;
        case 'Space': 
          keyState.current.space = true; 
          if (gameStateRef.current === 'PLAYING' || gameStateRef.current === 'EDUCATIONAL_CHALLENGE') {
            input.setDropActive(true);
          }
          break;
        case 'ArrowUp': keyState.current.up = true; break;
        case 'ArrowDown': keyState.current.down = true; break;
        case 'ArrowLeft': keyState.current.left = true; break;
        case 'ArrowRight': keyState.current.right = true; break;
        case 'Enter': keyState.current.enter = true; break;
        case 'KeyI': keyState.current.i = true; break;
        case 'KeyJ': keyState.current.j = true; break;
        case 'KeyK': keyState.current.k = true; break;
        case 'KeyL': keyState.current.l = true; break;
        case 'KeyO': keyState.current.o = true; break;
        case 'KeyT': keyState.current.t = true; break;
        case 'KeyF': keyState.current.f = true; break;
        case 'KeyG': keyState.current.g = true; break;
        case 'KeyH': keyState.current.h = true; break;
        case 'KeyY': keyState.current.y = true; break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': keyState.current.w = false; break;
        case 'KeyA': keyState.current.a = false; break;
        case 'KeyS': keyState.current.s = false; break;
        case 'KeyD': keyState.current.d = false; break;
        case 'Space': 
          keyState.current.space = false; 
          input.setDropActive(false);
          break;
        case 'ArrowUp': keyState.current.up = false; break;
        case 'ArrowDown': keyState.current.down = false; break;
        case 'ArrowLeft': keyState.current.left = false; break;
        case 'ArrowRight': keyState.current.right = false; break;
        case 'Enter': keyState.current.enter = false; break;
        case 'KeyI': keyState.current.i = false; break;
        case 'KeyJ': keyState.current.j = false; break;
        case 'KeyK': keyState.current.k = false; break;
        case 'KeyL': keyState.current.l = false; break;
        case 'KeyO': keyState.current.o = false; break;
        case 'KeyT': keyState.current.t = false; break;
        case 'KeyF': keyState.current.f = false; break;
        case 'KeyG': keyState.current.g = false; break;
        case 'KeyH': keyState.current.h = false; break;
        case 'KeyY': keyState.current.y = false; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      sharedAudioEngine.stopAll();
    };
  }, [input]);

  useEffect(() => {
    let lastTime = performance.now();
    let rafId: number;
    let wasHidden = document.visibilityState !== 'visible';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const entityP1 = entityP1Ref.current;
    const entityP2 = entityP2Ref.current;
    const entityP3 = entityP3Ref.current;
    const entityP4 = entityP4Ref.current;
    const KEYBOARD_SPEED = 600;

    const loop = (time: number) => {
      const isHidden = document.visibilityState !== 'visible';
      const frameDelta = time - lastTime;
      lastTime = time;

      if (isHidden) {
        wasHidden = true;
        rafId = requestAnimationFrame(loop);
        return;
      }

      if (wasHidden) {
        wasHidden = false;
        // Skip processing for this exact frame to safely consume the large hidden time delta
        rafId = requestAnimationFrame(loop);
        return;
      }

      // ACTIVE TIME AUTHORITY
      if ((gameStateRef.current === 'PLAYING' || gameStateRef.current === 'EDUCATIONAL_CHALLENGE') && remainingMsRef.current !== null) {
        remainingMsRef.current -= frameDelta;

        if (remainingMsRef.current <= 0) {
          remainingMsRef.current = 0;
          captureSessionResult();
          gameStateRef.current = 'MISSION_COMPLETE';
          setGameState('MISSION_COMPLETE');
          sharedAudioEngine.stopRotor();
          return; // Stop processing this frame to prevent mutations
        }
      }

      const dt = Math.min(frameDelta / 1000, 0.1);

      if (arenaRef.current) {
        const rect = arenaRectRef.current;
        const groundY = rect.height - Math.max(40, 80 * (rect.height < 600 ? 0.7 : 1));
        const refillZoneWidth = Math.min(300, rect.width * 0.35) * 0.8;

        if (!hasStarted.current) {
          entityP1.x = rect.width / 2;
          entityP1.y = rect.height / 2;
          entityP1.targetX = rect.width / 2;
          entityP1.targetY = rect.height / 2;
          input.setTarget(rect.width / 2, rect.height / 2);

          entityP2.x = rect.width / 2 + 100;
          entityP2.y = rect.height / 2;
          entityP2.targetX = rect.width / 2 + 100;
          entityP2.targetY = rect.height / 2;

          entityP3.x = rect.width / 2 - 100;
          entityP3.y = rect.height / 2;
          entityP3.targetX = rect.width / 2 - 100;
          entityP3.targetY = rect.height / 2;

          entityP4.x = rect.width / 2 + 200;
          entityP4.y = rect.height / 2;
          entityP4.targetX = rect.width / 2 + 200;
          entityP4.targetY = rect.height / 2;

          hasStarted.current = true;
        }

        // Apply Keyboard Inputs for P1/P2 target adjustments
        if (gameStateRef.current === 'PLAYING') {
          const ks = keyState.current;
          
          if (gameModeRef.current === 'SOLO') {
            if (ks.w) input.pointerY -= KEYBOARD_SPEED * dt;
            if (ks.s) input.pointerY += KEYBOARD_SPEED * dt;
            if (ks.a) input.pointerX -= KEYBOARD_SPEED * dt;
            if (ks.d) input.pointerX += KEYBOARD_SPEED * dt;
            
            entityP1.targetX = input.pointerX;
            entityP1.targetY = input.pointerY;
          } else {
            if (ks.w) entityP1.targetY -= KEYBOARD_SPEED * dt;
            if (ks.s) entityP1.targetY += KEYBOARD_SPEED * dt;
            if (ks.a) entityP1.targetX -= KEYBOARD_SPEED * dt;
            if (ks.d) entityP1.targetX += KEYBOARD_SPEED * dt;

            if (ks.up) entityP2.targetY -= KEYBOARD_SPEED * dt;
            if (ks.down) entityP2.targetY += KEYBOARD_SPEED * dt;
            if (ks.left) entityP2.targetX -= KEYBOARD_SPEED * dt;
            if (ks.right) entityP2.targetX += KEYBOARD_SPEED * dt;
            
            if (gameModeRef.current === 'SQUAD') {
              if (ks.i) entityP3.targetY -= KEYBOARD_SPEED * dt;
              if (ks.k) entityP3.targetY += KEYBOARD_SPEED * dt;
              if (ks.j) entityP3.targetX -= KEYBOARD_SPEED * dt;
              if (ks.l) entityP3.targetX += KEYBOARD_SPEED * dt;
              
              if (ks.t) entityP4.targetY -= KEYBOARD_SPEED * dt;
              if (ks.g) entityP4.targetY += KEYBOARD_SPEED * dt;
              if (ks.f) entityP4.targetX -= KEYBOARD_SPEED * dt;
              if (ks.h) entityP4.targetX += KEYBOARD_SPEED * dt;
            }
          }


          // Heli vs Heli Collision (Target Displacement)
          if (gameModeRef.current === 'DUEL' || gameModeRef.current === 'SQUAD') {
            // Decrease cooldowns
            Object.keys(heliCollisionCooldownsRef.current).forEach(key => {
              const k = key as 'P1' | 'P2' | 'P3' | 'P4';
              if (heliCollisionCooldownsRef.current[k] > 0) {
                heliCollisionCooldownsRef.current[k] -= dt;
              }
            });

            const checkHeliCollision = (entityA: HelicopterEntity, idA: 'P1'|'P2'|'P3'|'P4', scaledWidthA: number, entityB: HelicopterEntity, idB: 'P1'|'P2'|'P3'|'P4', scaledWidthB: number) => {
              if (heliCollisionCooldownsRef.current[idA] > 0 || heliCollisionCooldownsRef.current[idB] > 0) return;

              const dx = entityA.x - entityB.x;
              const dy = entityA.y - entityB.y;
              const dist = Math.hypot(dx, dy);
              
              const radiusA = scaledWidthA * 0.4;
              const radiusB = scaledWidthB * 0.4;
              
              if (dist < (radiusA + radiusB)) {
                let nx = 1;
                let ny = 0;
                
                if (dist > 0) {
                  nx = dx / dist;
                  ny = dy / dist;
                } else {
                  // Fallback zero-distance: A pushes left, B pushes right
                  nx = -1;
                  ny = 0;
                }

                entityA.targetX += nx * 50;
                entityA.targetY += ny * 50;
                entityB.targetX -= nx * 50;
                entityB.targetY -= ny * 50;

                heliCollisionCooldownsRef.current[idA] = 0.5;
                heliCollisionCooldownsRef.current[idB] = 0.5;
              }
            };

            checkHeliCollision(entityP1, 'P1', scaledWidthP1, entityP2, 'P2', scaledWidthP2);

            if (gameModeRef.current === 'SQUAD') {
              checkHeliCollision(entityP1, 'P1', scaledWidthP1, entityP3, 'P3', scaledWidthP3);
              checkHeliCollision(entityP1, 'P1', scaledWidthP1, entityP4, 'P4', scaledWidthP4);
              checkHeliCollision(entityP2, 'P2', scaledWidthP2, entityP3, 'P3', scaledWidthP3);
              checkHeliCollision(entityP2, 'P2', scaledWidthP2, entityP4, 'P4', scaledWidthP4);
              checkHeliCollision(entityP3, 'P3', scaledWidthP3, entityP4, 'P4', scaledWidthP4);
            }
          }

          // Clamp targets to screen
          entityP1.targetX = Math.max(scaledWidthP1/2, Math.min(rect.width - scaledWidthP1/2, entityP1.targetX));
          entityP1.targetY = Math.max(scaledHeightP1/2 - entityP1.paddingTop, Math.min(rect.height - scaledHeightP1/2, entityP1.targetY));

          if (gameModeRef.current === 'SOLO') {
             // Reflect clamping back to input manager
             input.pointerX = entityP1.targetX;
             input.pointerY = entityP1.targetY;
          } else {
             entityP2.targetX = Math.max(scaledWidthP2/2, Math.min(rect.width - scaledWidthP2/2, entityP2.targetX));
             entityP2.targetY = Math.max(scaledHeightP2/2 - entityP2.paddingTop, Math.min(rect.height - scaledHeightP2/2, entityP2.targetY));
             
             if (gameModeRef.current === 'SQUAD') {
               entityP3.targetX = Math.max(scaledWidthP3/2, Math.min(rect.width - scaledWidthP3/2, entityP3.targetX));
               entityP3.targetY = Math.max(scaledHeightP3/2 - entityP3.paddingTop, Math.min(rect.height - scaledHeightP3/2, entityP3.targetY));
               
               entityP4.targetX = Math.max(scaledWidthP4/2, Math.min(rect.width - scaledWidthP4/2, entityP4.targetX));
               entityP4.targetY = Math.max(scaledHeightP4/2 - entityP4.paddingTop, Math.min(rect.height - scaledHeightP4/2, entityP4.targetY));
             }
          }

          // Set valve state
          entityP1.isValveOpen = keyState.current.space || (gameModeRef.current === 'SOLO' && input.isDropActive);
          entityP2.isValveOpen = keyState.current.enter;
          entityP3.isValveOpen = keyState.current.o;
          entityP4.isValveOpen = keyState.current.y;

          if (!entityP1.isValveOpen) sprayConsumedRef.current.P1 = false;
          if (!entityP2.isValveOpen) sprayConsumedRef.current.P2 = false;
          if (!entityP3.isValveOpen) sprayConsumedRef.current.P3 = false;
          if (!entityP4.isValveOpen) sprayConsumedRef.current.P4 = false;
        }

        const updatePlayer = (
          entity: HelicopterEntity, 
          playerId: 'P1' | 'P2' | 'P3' | 'P4',
          visualRef: React.RefObject<HTMLDivElement>, 
          imgRef: React.RefObject<HTMLImageElement>,
          streamRef: React.RefObject<HTMLDivElement>,
          waterBarRef: React.RefObject<HTMLDivElement>,
          assetData: any,
          scoreEng: ScoreEngine,
          scaledWidth: number,
          scaledHeight: number
        ) => {
          if (gameStateRef.current !== 'EDUCATIONAL_CHALLENGE') {
             entity.update(dt, rect.width, rect.height);
          }
          
          if (visualRef.current) {
            const bob = prefersReducedMotion ? 0 : Math.sin(time / 300 + (playerId === 'P2' ? Math.PI : playerId === 'P3' ? Math.PI / 2 : playerId === 'P4' ? Math.PI * 1.5 : 0)) * 8;
            const tilt = prefersReducedMotion ? 0 : (entity.vx / 600) * 15;
            visualRef.current.style.transform = `translate3d(${entity.x - scaledWidth / 2}px, ${entity.y - scaledHeight / 2 + bob}px, 0) rotate(${tilt}deg)`;
            
            if (imgRef.current) {
              imgRef.current.style.transform = `scaleX(${entity.facingDirection})`;
            }

            // Refill
            if (entity.x < refillZoneWidth && gameStateRef.current === 'PLAYING') {
              entity.refillWater();
            }

            // Stream
            let isWaterFlowing = false;
            let activeDropX = entity.x;
            let activeDropY = groundY;
            if (streamRef.current) {
              if (gameStateRef.current === 'PLAYING' && entity.isValveOpen && entity.currentWater > 0) {
                isWaterFlowing = true;
                const dropGlobalY = entity.y - scaledHeight / 2 + bob + assetData.definition.dropPoint.y * VISUAL_SCALE;
                const dropGlobalX = entity.x;
                activeDropX = dropGlobalX;
                activeDropY = dropGlobalY;
                
                let streamHeight = groundY - dropGlobalY + 20;
                let isHittingHotspot = false;
                
                const hotspots = hotspotEngine.getHotspots();
                let closestDist = Infinity;
                let closestHotspot = null;
                for (const h of hotspots) {
                  if (h.state === 'EXTINGUISHED') continue;
                  const dist = Math.abs(dropGlobalX - h.x);
                  if (dist <= 200 && dist < closestDist) {
                     closestDist = dist;
                     closestHotspot = h;
                  }
                }
                if (closestHotspot) {
                   streamHeight = closestHotspot.y - dropGlobalY;
                   isHittingHotspot = true;
                }

                streamRef.current.style.opacity = '1';
                streamRef.current.style.transform = `translate3d(${dropGlobalX}px, ${dropGlobalY}px, 0)`;
                streamRef.current.style.height = `${Math.max(0, streamHeight)}px`;

                if (!isHittingHotspot && alignmentFeedbackCooldownRef.current <= 0 && !sprayConsumedRef.current[playerId]) {
                   alignmentFeedbackCooldownRef.current = 2.0;
                   setMissionFeedback({message: 'Arahkan tangki ke target api.', isError: true});
                   setTimeout(() => setMissionFeedback(null), 2000);
                }
              } else if (gameStateRef.current === 'PLAYING' && entity.isValveOpen && entity.currentWater <= 0) {
                streamRef.current.style.opacity = '0';
                if (alignmentFeedbackCooldownRef.current <= 0) {
                   alignmentFeedbackCooldownRef.current = 2.0;
                   setMissionFeedback({message: 'Air habis. Isi air terlebih dahulu.', isError: true});
                   setTimeout(() => setMissionFeedback(null), 2000);
                }
              } else {
                streamRef.current.style.opacity = '0';
              }
            }

            // Hotspot interactions
            const waterRadius = 160; // 160 + 40 (hotspot radius) = 200px spray zone
            if (gameStateRef.current === 'PLAYING' || gameStateRef.current === 'EDUCATIONAL_CHALLENGE') {
              if (gameStateRef.current === 'PLAYING') {
                if (isWaterFlowing) {
                  scoreEng.recordWaterUsed(20 * dt);
                }
                if (isWaterFlowing && !sprayConsumedRef.current[playerId]) {
                   const inRange = [];
                   for (const hotspot of hotspotEngine.getHotspots()) {
                     if (hotspot.state === 'EXTINGUISHED') continue;
                     const dist = Math.abs(activeDropX - hotspot.x);
                     
                     // Effective responsive collision threshold
                     const effectiveCollisionThreshold = (waterRadius + hotspot.radius) * compositionScaleRef.current;
                     
                     if (dist <= effectiveCollisionThreshold) {
                        inRange.push({ hotspot, dist });
                     }
                   }
                   if (inRange.length > 0) {
                     inRange.sort((a, b) => a.dist - b.dist);
                     let ambiguous = false;
                     if (inRange.length > 1 && Math.abs(inRange[0].dist - inRange[1].dist) < 20) {
                       ambiguous = true;
                     }
                     if (!ambiguous) {
                       const target = inRange[0].hotspot;
                       const isDistractor = target.role === 'DISTRACTOR';
                       const isOutOfSequence = target.role === 'TARGET' && target.orderIndex !== undefined && target.orderIndex !== activeMissionSequenceRef.current;
                       if (!isDistractor && !isOutOfSequence) {
                         target.intensity = 0;
                         target.state = 'EXTINGUISHED';
                         target.extinguishedBy = playerId;
                         target.damageContribution[playerId] += 100;
                         sprayConsumedRef.current[playerId] = true;
                       }
                     }
                   }
                }
              }
            }

            if (waterBarRef.current) {
              waterBarRef.current.style.width = `${(entity.currentWater / entity.maxWater) * 100}%`;
            }
          }
        };

        updatePlayer(entityP1, 'P1', visualP1Ref, imgP1Ref, streamP1Ref, waterBarP1Ref, assetP1, scoreEngineP1, scaledWidthP1, scaledHeightP1);
        
        if (gameModeRef.current === 'DUEL' || gameModeRef.current === 'SQUAD') {
          updatePlayer(entityP2, 'P2', visualP2Ref, imgP2Ref, streamP2Ref, waterBarP2Ref, assetP2, scoreEngineP2, scaledWidthP2, scaledHeightP2);
        }
        
        if (gameModeRef.current === 'SQUAD') {
          updatePlayer(entityP3, 'P3', visualP3Ref, imgP3Ref, streamP3Ref, waterBarP3Ref, assetP3, scoreEngineP3, scaledWidthP3, scaledHeightP3);
          updatePlayer(entityP4, 'P4', visualP4Ref, imgP4Ref, streamP4Ref, waterBarP4Ref, assetP4, scoreEngineP4, scaledWidthP4, scaledHeightP4);
        }

        // Global Refill Indicator
        const globalRefillFeedback = document.getElementById('global-refill-feedback');
        if (globalRefillFeedback) {
          const isRefilling = 
            (entityP1Ref.current.x < refillZoneWidth) ||
            (gameModeRef.current !== 'SOLO' && entityP2Ref.current.x < refillZoneWidth) ||
            (gameModeRef.current === 'SQUAD' && (entityP3Ref.current.x < refillZoneWidth || entityP4Ref.current.x < refillZoneWidth));
          globalRefillFeedback.style.opacity = (isRefilling && gameStateRef.current === 'PLAYING') ? '1' : '0';
        }

        // Check empty water globally
        if (gameStateRef.current === 'PLAYING') {
          const anyEmpty = 
            (entityP1Ref.current.currentWater <= 0 && entityP1Ref.current.x >= refillZoneWidth) ||
            (gameModeRef.current !== 'SOLO' && entityP2Ref.current.currentWater <= 0 && entityP2Ref.current.x >= refillZoneWidth) ||
            (gameModeRef.current === 'SQUAD' && ((entityP3Ref.current.currentWater <= 0 && entityP3Ref.current.x >= refillZoneWidth) || (entityP4Ref.current.currentWater <= 0 && entityP4Ref.current.x >= refillZoneWidth)));
          
          if (anyEmpty && alignmentFeedbackCooldownRef.current <= 0) {
             alignmentFeedbackCooldownRef.current = 5.0; // Don't spam
             setMissionFeedback({message: 'Pergi ke tempat pengisian air.', isError: true});
             setTimeout(() => setMissionFeedback(null), 2000);
          }
        }

        // Obstacles
        if (gameStateRef.current === 'PLAYING') {
          if (obstacleFeedbackCooldownRef.current > 0) {
            obstacleFeedbackCooldownRef.current -= dt;
          }

          let anyInCloud = false;
          
          obstaclesRef.current.forEach((obs, idx) => {
             obs.x += obs.vx * dt;
             obs.y += obs.vy * dt;
             
             // Cloud bounce
             if (obs.type === 'CLOUD') {
                if (obs.x < refillZoneWidth + 100 || obs.x > rect.width - 100) {
                   obs.vx *= -1;
                }
             }

             const el = obstacleRefs.current[idx];
             if (el) {
                el.style.transform = `translate3d(${obs.x}px, ${obs.y}px, 0)`;
             }
          });

          // Decrease cloud cooldowns
          Object.keys(cloudCooldownsRef.current).forEach(key => {
            const k = key as 'P1' | 'P2' | 'P3' | 'P4';
            if (cloudCooldownsRef.current[k] > 0) {
              cloudCooldownsRef.current[k] -= dt;
            }
          });

          const players = [
            { entity: entityP1Ref.current, pId: 'P1' },
            ...(gameModeRef.current !== 'SOLO' ? [{ entity: entityP2Ref.current, pId: 'P2' }] : []),
            ...(gameModeRef.current === 'SQUAD' ? [{ entity: entityP3Ref.current, pId: 'P3' }, { entity: entityP4Ref.current, pId: 'P4' }] : [])
          ];

          players.forEach(({entity, pId}) => {
             const pidEnum = pId as 'P1' | 'P2' | 'P3' | 'P4';
             let playerInCloud = false;
             
             obstaclesRef.current.forEach(obs => {
                const dist = Math.hypot(entity.x - obs.x, entity.y - obs.y);
                if (obs.type === 'CLOUD') {
                   if (dist < obs.radius + 20) {
                      playerInCloud = true;
                      anyInCloud = true;
                      // optional mild disturbance
                      entity.vx += (Math.random() - 0.5) * 50 * dt;
                      entity.vy += (Math.random() - 0.5) * 50 * dt;
                   }
                }
             });
             
             if (playerInCloud && cloudCooldownsRef.current[pidEnum] <= 0) {
                 cloudCooldownsRef.current[pidEnum] = 2.0; // 2 seconds cooldown
                 livesRef.current[pidEnum] = Math.max(0, livesRef.current[pidEnum] - 1);
                 setLives({ ...livesRef.current });
                 
                 // Apply penalty via score engine
                 if (pidEnum === 'P1') scoreEngineP1.applyCloudPenalty();
                 if (pidEnum === 'P2') scoreEngineP2.applyCloudPenalty();
                 if (pidEnum === 'P3') scoreEngineP3.applyCloudPenalty();
                 if (pidEnum === 'P4') scoreEngineP4.applyCloudPenalty();
                 
                 const edSession = sharedEducationalEngine.getSessionState();
                 setHudScores({
                    P1: scoreEngineP1.getScore(edSession.correctAnswers, edSession.incorrectAnswers).fireScore,
                    P2: scoreEngineP2.getScore(edSession.correctAnswers, edSession.incorrectAnswers).fireScore,
                    P3: scoreEngineP3.getScore(edSession.correctAnswers, edSession.incorrectAnswers).fireScore,
                    P4: scoreEngineP4.getScore(edSession.correctAnswers, edSession.incorrectAnswers).fireScore,
                 });
                 
                 setMissionFeedback({message: 'Hati-hati! Terkena awan. -1 nyawa, -50 poin', isError: true});
                 setTimeout(() => setMissionFeedback(null), 2000);
             }
          });
          
          const fogOverlay = document.getElementById('global-fog-overlay');
          if (fogOverlay) {
             fogOverlay.style.opacity = anyInCloud ? '1' : '0';
          }

          if (!anyInCloud && wasInCloudRef.current && obstacleFeedbackCooldownRef.current <= 0) {
              obstacleFeedbackCooldownRef.current = 2.0;
              setMissionFeedback({message: 'Pandangan kembali jelas.', isError: false});
              setTimeout(() => setMissionFeedback(null), 1500);
          }
          
          wasInCloudRef.current = anyInCloud;
        }

        // Global hotspot sync
        if (gameStateRef.current === 'PLAYING') {
          if (distractorFeedbackCooldownRef.current > 0) {
             distractorFeedbackCooldownRef.current -= dt;
          }
          if (alignmentFeedbackCooldownRef.current > 0) {
             alignmentFeedbackCooldownRef.current -= dt;
          }

          const hotspots = hotspotEngine.getHotspots();
          let allTargetsExtinguished = true;
          let targetFound = false;

          hotspots.forEach(f => {
            if (f.role === 'TARGET') {
               targetFound = true;
               if (f.state === 'ACTIVE') {
                  allTargetsExtinguished = false;
               } else if (f.state === 'EXTINGUISHED' && !(f as any).resolved) {
                  // Valid resolve (since damage is prevented for out-of-order)
                  (f as any).resolved = true;
                  sharedAudioEngine.playExtinguish();
                  if (f.orderIndex !== undefined) activeMissionSequenceRef.current++;
                  
                  if (missionProgressRef.current) {
                    missionProgressRef.current.completed++;
                    setMissionProgress({ ...missionProgressRef.current });
                  }
                  
                  setMissionFeedback({message: 'API PADAM!', isError: false});
                  setTimeout(() => setMissionFeedback(null), 1500);
                  
                  const oldEdSession = sharedEducationalEngine.getSessionState();
                  const pId = f.extinguishedBy || 'P1';
                  let oldScore = 0;
                  if (pId === 'P1') oldScore = scoreEngineP1.getScore(oldEdSession.correctAnswers, oldEdSession.incorrectAnswers).fireScore;
                  if (pId === 'P2') oldScore = scoreEngineP2.getScore(oldEdSession.correctAnswers, oldEdSession.incorrectAnswers).fireScore;
                  if (pId === 'P3') oldScore = scoreEngineP3.getScore(oldEdSession.correctAnswers, oldEdSession.incorrectAnswers).fireScore;
                  if (pId === 'P4') oldScore = scoreEngineP4.getScore(oldEdSession.correctAnswers, oldEdSession.incorrectAnswers).fireScore;

                  sharedEducationalEngine.checkAnswer(f.contentId!, f.displayContent!);
                  if (f.extinguishedBy === 'P1') scoreEngineP1.recordFireExtinguished(f.id);
                  if (f.extinguishedBy === 'P2') scoreEngineP2.recordFireExtinguished(f.id);
                  if (f.extinguishedBy === 'P3') scoreEngineP3.recordFireExtinguished(f.id);
                  if (f.extinguishedBy === 'P4') scoreEngineP4.recordFireExtinguished(f.id);
                  
                  // Handle streak logic
                  const pIdKey = pId as 'P1' | 'P2' | 'P3' | 'P4';
                  streaksRef.current[pIdKey] += 1;
                  
                  if (streaksRef.current[pIdKey] >= 5) {
                      streaksRef.current[pIdKey] = 0;
                      if (livesRef.current[pIdKey] < 5) {
                          livesRef.current[pIdKey] += 1;
                          setLives({ ...livesRef.current });
                      }
                      triggerStreakReward(pIdKey);
                  }
                  setStreaks({ ...streaksRef.current });
                  
                  const edSession = sharedEducationalEngine.getSessionState();
                  setHudScores({
                    P1: scoreEngineP1.getScore(edSession.correctAnswers, edSession.incorrectAnswers).fireScore,
                    P2: scoreEngineP2.getScore(edSession.correctAnswers, edSession.incorrectAnswers).fireScore,
                    P3: scoreEngineP3.getScore(edSession.correctAnswers, edSession.incorrectAnswers).fireScore,
                    P4: scoreEngineP4.getScore(edSession.correctAnswers, edSession.incorrectAnswers).fireScore,
                  });
                  
                  let newScore = 0;
                  if (pId === 'P1') newScore = scoreEngineP1.getScore(edSession.correctAnswers, edSession.incorrectAnswers).fireScore;
                  if (pId === 'P2') newScore = scoreEngineP2.getScore(edSession.correctAnswers, edSession.incorrectAnswers).fireScore;
                  if (pId === 'P3') newScore = scoreEngineP3.getScore(edSession.correctAnswers, edSession.incorrectAnswers).fireScore;
                  if (pId === 'P4') newScore = scoreEngineP4.getScore(edSession.correctAnswers, edSession.incorrectAnswers).fireScore;
                  const delta = newScore - oldScore;
                  
                  const rewardId = `reward-${f.id}-${Date.now()}`;
                  setRewards(prev => [...prev, {
                     id: rewardId,
                     x: f.x,
                     y: f.y - 100,
                     score: delta,
                     playerId: pId
                  }]);
                  
                  setTimeout(() => {
                     setRewards(prev => prev.filter(r => r.id !== rewardId));
                  }, 2000);
               }
            }
          });

          const activeTargets = hotspots.filter(f => f.role === 'TARGET' && f.state === 'ACTIVE').length;
          if (activeTargets !== activeFiresCountRef.current) {
             activeFiresCountRef.current = activeTargets;
             setActiveFiresCount(activeTargets);
          }

          if (targetFound && allTargetsExtinguished && activeMissionRef.current) {
             activeMissionRef.current = null;
             setMissionFeedback({message: 'MISI SELESAI!', isError: false});
             setTimeout(() => {
                setMissionFeedback(null);
                loadNextMission();
             }, 2000);
          }
        }

        // Update Hotspot visuals and Detection
        hotspotEngine.getHotspots().forEach((hotspot, idx) => {
          const container = hotspotRefs.current[idx];
          if (container) {
            container.style.transform = `translate3d(${hotspot.x}px, ${hotspot.y}px, 0)`;
            const fireVisual = container.querySelector('.fire-visual-container') as HTMLDivElement;
            const smokeVisual = container.querySelector('.extinguished-visual-container') as HTMLDivElement;
            const scorchVisual = container.querySelector('.scorch-mark') as HTMLDivElement;
            const detectionRing = container.querySelector('.hotspot-detection-ring') as HTMLDivElement;
            const alignmentRing = container.querySelector('.hotspot-alignment-ring') as HTMLDivElement;
            const detectionLabel = fireVisual?.querySelector('.hotspot-detected-label') as HTMLDivElement;

            const contentLabel = fireVisual?.querySelector('.hotspot-content-label') as HTMLDivElement;
            
            let offsetX = 0;
            let offsetY = 0;
            if (rect.width > 0) {
               const halfW = rect.width < 600 ? 75 : 120;
               const margin = 10;
               const leftEdge = hotspot.x - halfW;
               const rightEdge = hotspot.x + halfW;
               
               if (leftEdge < margin) {
                  offsetX = margin - leftEdge;
               } else if (rightEdge > rect.width - margin) {
                  offsetX = (rect.width - margin) - rightEdge;
               }
               
               const labelTopOffset = rect.width < 600 ? 100 : (rect.width < 768 ? 160 : 210);
               const topEdge = hotspot.y - labelTopOffset;
               const topMargin = 50; 
               
               if (topEdge < topMargin) {
                  offsetY = topMargin - topEdge;
               }
            }
            
            if (contentLabel) {
                contentLabel.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
            }

            let isDetected = false;
            let isReady = false;
            let isBeingHit = false;
            let showDetectedMsg = false;
            let showReadyMsg = false;
            const hitters = new Set<string>();

            if (!hotspotProximityStateRef.current[hotspot.id]) {
               hotspotProximityStateRef.current[hotspot.id] = { P1: 'NONE', P2: 'NONE', P3: 'NONE', P4: 'NONE' };
            }
            if (!hotspotMessageTimerRef.current[hotspot.id]) {
               hotspotMessageTimerRef.current[hotspot.id] = { type: 'NONE', expiresAt: 0 };
            }

            const checkDetection = (entity: HelicopterEntity, pId: string, assetData: any, scaledHeight: number) => {
               const dropGlobalX = entity.x;
               const dist = Math.abs(dropGlobalX - hotspot.x);
               
               // Find closest active hotspot to avoid overlapping UI triggers
               let isClosest = true;
               for (const other of hotspotEngine.getHotspots()) {
                 if (other !== hotspot && other.state === 'ACTIVE') {
                   const otherDist = Math.abs(dropGlobalX - other.x);
                   if (otherDist < dist) {
                     isClosest = false;
                     break;
                   }
                 }
               }

               const currentCompScale = compositionScaleRef.current;
               let currentState: 'NONE' | 'DETECTED' | 'READY' = 'NONE';

               if (dist <= 250 * currentCompScale) {
                 isDetected = true;
                 currentState = 'DETECTED';
               }
               if (dist <= 200 * currentCompScale) {
                 isReady = true;
                 currentState = 'READY';
                 // Only become 'BeingHit' if this is the closest hotspot to the player
                 if (entity.isValveOpen && entity.currentWater > 0 && isClosest) {
                   isBeingHit = true;
                   hitters.add(pId);
                 }
               }

               const previousState = hotspotProximityStateRef.current[hotspot.id][pId];
               
               if (currentState !== previousState) {
                  hotspotProximityStateRef.current[hotspot.id][pId] = currentState;
                  const msgState = hotspotMessageTimerRef.current[hotspot.id];
                  
                  if (currentState === 'DETECTED') {
                     if (msgState.type !== 'READY' || time > msgState.expiresAt) {
                        msgState.type = 'DETECTED';
                        msgState.expiresAt = time + 800;
                     }
                  } else if (currentState === 'READY') {
                     msgState.type = 'READY';
                     msgState.expiresAt = time + 800;
                  }
               }
            };

            if (hotspot.state === 'ACTIVE') {
              checkDetection(entityP1, 'P1', assetP1, scaledHeightP1);
              if (gameModeRef.current === 'DUEL' || gameModeRef.current === 'SQUAD') {
                checkDetection(entityP2, 'P2', assetP2, scaledHeightP2);
              }
              if (gameModeRef.current === 'SQUAD') {
                checkDetection(entityP3, 'P3', assetP3, scaledHeightP3);
                checkDetection(entityP4, 'P4', assetP4, scaledHeightP4);
              }
            }

            const msgState = hotspotMessageTimerRef.current[hotspot.id];
            if (time < msgState.expiresAt) {
               if (msgState.type === 'DETECTED') showDetectedMsg = true;
               if (msgState.type === 'READY') showReadyMsg = true;
            }

            const readyLabel = fireVisual?.querySelector('.hotspot-ready-label') as HTMLDivElement;

            if (detectionRing && detectionLabel) {
              if (isDetected && hotspot.state === 'ACTIVE') {
                detectionRing.style.opacity = '1';
                if (alignmentRing) alignmentRing.style.opacity = '1';
                
                if (showDetectedMsg && !isBeingHit && !showReadyMsg) {
                  detectionLabel.style.opacity = '1';
                  detectionLabel.textContent = 'Dekati target api.';
                  detectionLabel.style.transform = `translate(calc(-50% + ${offsetX}px), ${offsetY}px)`;
                } else {
                  detectionLabel.style.opacity = '0';
                }
              } else {
                detectionRing.style.opacity = '0';
                if (alignmentRing) alignmentRing.style.opacity = '0';
                detectionLabel.style.opacity = '0';
              }
            }
            
            if (readyLabel) {
              if ((isBeingHit || (isReady && showReadyMsg)) && hotspot.state === 'ACTIVE') {
                readyLabel.style.opacity = '1';
                readyLabel.style.transform = `translate(calc(-50% + ${offsetX}px), ${offsetY}px)`;
                if (isBeingHit) {
                  readyLabel.textContent = 'SIRAM...';
                  readyLabel.classList.add('bg-blue-600');
                  readyLabel.classList.remove('bg-blue-500/90');
                  
                  // Feedback for wrong targets when spraying
                  const isDistractor = hotspot.role === 'DISTRACTOR';
                  const isOutOfSequence = hotspot.role === 'TARGET' && hotspot.orderIndex !== undefined && hotspot.orderIndex !== activeMissionSequenceRef.current;
                  if (isDistractor || isOutOfSequence) {
                     if (distractorFeedbackCooldownRef.current <= 0) {
                        distractorFeedbackCooldownRef.current = 2.0;
                        sharedEducationalEngine.checkAnswer(hotspot.contentId!, hotspot.displayContent!);
                        
                        hitters.forEach(pId => {
                           const key = pId as 'P1' | 'P2' | 'P3' | 'P4';
                           streaksRef.current[key] = 0;
                        });
                        setStreaks({ ...streaksRef.current });
                        
                        const msg = 'Belum tepat. Coba lagi!';
                        setMissionFeedback({message: msg, isError: true});
                        setTimeout(() => setMissionFeedback(null), 2000);
                     }
                  }
                } else {
                  readyLabel.textContent = 'Siap menyiram!';
                  readyLabel.classList.add('bg-blue-500/90');
                  readyLabel.classList.remove('bg-blue-600');
                }
              } else {
                readyLabel.style.opacity = '0';
              }
            }

            if (fireVisual && smokeVisual && scorchVisual) {
              if (hotspot.state === 'EXTINGUISHED') {
                if (smokeVisual.style.opacity !== '1') {
                  fireVisual.style.opacity = '0';
                  fireVisual.style.transform = 'translate(-50%, -100%) scale(0)';
                  smokeVisual.style.opacity = '1';
                  scorchVisual.style.opacity = '0.3';
                }
              } else {
                if (fireVisual.style.opacity !== '1') {
                  fireVisual.style.opacity = '1';
                  smokeVisual.style.opacity = '0';
                  scorchVisual.style.opacity = '1';
                }
                let scale = 0.85;
                if (hotspot.intensity > 75) scale = 0.85;
                else if (hotspot.intensity > 50) scale = 0.65;
                else if (hotspot.intensity > 25) scale = 0.45;
                else scale = 0.25;
                
                const flicker = 1 + (Math.sin(time / 80 + idx * 10) * 0.05);
                const targetTransform = `translate(-50%, -100%) scale(${scale * flicker})`;
                fireVisual.style.transform = targetTransform;
              }
            }
          }
        });

      }

      if (gameStateRef.current === 'PLAYING') {
        let anyValveOpen = false;
        if (entityP1.isValveOpen && entityP1.currentWater > 0) anyValveOpen = true;
        if (gameModeRef.current !== 'SOLO' && entityP2.isValveOpen && entityP2.currentWater > 0) anyValveOpen = true;
        if (gameModeRef.current === 'SQUAD') {
          if (entityP3.isValveOpen && entityP3.currentWater > 0) anyValveOpen = true;
          if (entityP4.isValveOpen && entityP4.currentWater > 0) anyValveOpen = true;
        }

        if (anyValveOpen && !wasValveOpenRef.current) {
          sharedAudioEngine.startWater();
        } else if (!anyValveOpen && wasValveOpenRef.current) {
          sharedAudioEngine.stopWater();
        }
        wasValveOpenRef.current = anyValveOpen;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [input, scaledWidthP1, scaledHeightP1, scaledWidthP2, scaledHeightP2, scaledWidthP3, scaledHeightP3, scaledWidthP4, scaledHeightP4]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (gameMode !== 'SOLO') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    input.handlePointerDown(e.pointerId, e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameMode !== 'SOLO') return;
    if (e.buttons > 0 || e.pointerType === 'touch') {
      const rect = e.currentTarget.getBoundingClientRect();
      input.handlePointerMove(e.pointerId, e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (gameMode !== 'SOLO') return;
    input.handlePointerUp(e.pointerId);
  };

  const triggerStreakReward = (pId: string) => {
    const id = `streak-${Date.now()}`;
    setStreakRewards(prev => [...prev, { id, pId }]);
    setTimeout(() => {
        setStreakRewards(prev => prev.filter(r => r.id !== id));
    }, 3000);
  };

  
    const handleSelectMode = (mode: GameMode) => {
    setGameMode(mode);
    
    // Reset lives
    const newLives = {P1: 5, P2: 5, P3: 5, P4: 5};
    livesRef.current = newLives;
    setLives(newLives);
    
    const newStreaks = {P1: 0, P2: 0, P3: 0, P4: 0};
    streaksRef.current = newStreaks;
    setStreaks(newStreaks);
    
    cloudCooldownsRef.current = {P1: 0, P2: 0, P3: 0, P4: 0};
    heliCollisionCooldownsRef.current = {P1: 0, P2: 0, P3: 0, P4: 0};

    setGameState('READY');
    sharedAudioEngine.unlock();
  };

  const loadNextMission = () => {
    const filter = config ? { 
        jenjang: config.jenjang, 
        mataPelajaran: config.mataPelajaran, 
        topic: config.topik 
    } : {};
    const nextMission = sharedEducationalEngine.getRandomQuestion(filter);
    if (nextMission) {
      const qCount = sharedEducationalEngine.getSessionState().questionsPresented;
      const difficultyState = getDifficultyConfig(qCount);
      setMissionIndex(qCount);
      setMissionDifficulty(difficultyState.level);

      setActiveMission(nextMission);
      activeMissionRef.current = nextMission;
      activeMissionSequenceRef.current = 0;
      
      hotspotEngine.clearHotspots();

      const newObstacles: Obstacle[] = [];
      const arenaRect = arenaRectRef.current;
      
      const cloudLakeW = 300;
      const spawnX = () => cloudLakeW + 150 + Math.random() * (arenaRect.width - cloudLakeW - 300);
      const spawnY = () => 100 + Math.random() * (arenaRect.height - 350);

      // Max 1 cloud per mission, spawn probability 30%
      if (Math.random() < 0.3) {
         newObstacles.push({
           id: `cloud_${qCount}`,
           type: 'CLOUD',
           x: spawnX(),
           y: spawnY(),
           vx: (Math.random() < 0.5 ? -1 : 1) * 20,
           vy: 0,
           radius: 45,
           width: 120,
           height: 70
         });
      }
      obstaclesRef.current = newObstacles;
      
      let requiredCount = 1;

      if (nextMission.challengeType === 'SEQUENCE' && nextMission.sequenceAnswers) {
        // ORDERED_TARGETS
        const itemsToSpawn = nextMission.sequenceAnswers.slice(0, difficultyState.sequenceLength);
        itemsToSpawn.forEach((ans: string, idx: number) => {
          const target = new HotspotEntity(`hs_m${qCount}_seq_${idx}`, 0, 0, 40);
          target.contentId = nextMission.id;
          target.role = 'TARGET';
          target.displayContent = ans;
          target.orderIndex = idx;
          hotspotEngine.registerHotspot(target);
        });
        requiredCount = itemsToSpawn.length;
        
        const options = nextMission.pengecoh || nextMission.options || [];
        const distsToSpawn = options.slice(0, difficultyState.distractorCount);
        distsToSpawn.forEach((opt: string, idx: number) => {
           const dist = new HotspotEntity(`hs_m${qCount}_dist_seq_${idx}`, 0, 0, 40);
           dist.contentId = nextMission.id;
           dist.role = 'DISTRACTOR';
           dist.displayContent = opt;
           hotspotEngine.registerHotspot(dist);
        });

      } else if (nextMission.challengeType === 'MULTI_TARGET' && nextMission.jawabanBenarMulti) {
        // MULTI_TARGET
        const itemsToSpawn = nextMission.jawabanBenarMulti.slice(0, Math.max(2, difficultyState.sequenceLength));
        itemsToSpawn.forEach((ans: string, idx: number) => {
          const target = new HotspotEntity(`hs_m${qCount}_multi_${idx}`, 0, 0, 40);
          target.contentId = nextMission.id;
          target.role = 'TARGET';
          target.displayContent = ans;
          hotspotEngine.registerHotspot(target);
        });
        requiredCount = itemsToSpawn.length;
        
        const options = nextMission.pengecoh || nextMission.options || [];
        const validOptions = options.filter((opt: string) => !nextMission.jawabanBenarMulti!.includes(opt));
        const distsToSpawn = validOptions.slice(0, difficultyState.distractorCount);
        distsToSpawn.forEach((opt: string, idx: number) => {
           const dist = new HotspotEntity(`hs_m${qCount}_dist_multi_${idx}`, 0, 0, 40);
           dist.contentId = nextMission.id;
           dist.role = 'DISTRACTOR';
           dist.displayContent = opt;
           hotspotEngine.registerHotspot(dist);
        });

      } else {
        // SINGLE_TARGET (IDENTIFY, CALCULATE, CLASSIFY, LOCATE, PRIORITIZE, LEGACY)
        const target1 = new HotspotEntity(`hs_m${qCount}_1`, 0, 0, 40);
        target1.contentId = nextMission.id;
        target1.role = 'TARGET';
        target1.displayContent = nextMission.jawabanBenar || nextMission.correctAnswer;
        hotspotEngine.registerHotspot(target1);
        requiredCount = 1;
        
        const options = nextMission.pengecoh || nextMission.options || [];
        const validOptions = options.filter((opt: string) => opt !== target1.displayContent);
        const distsToSpawn = validOptions.slice(0, difficultyState.distractorCount);
        distsToSpawn.forEach((opt: string, idx: number) => {
           const dist = new HotspotEntity(`hs_m${qCount}_dist_${idx}`, 0, 0, 40);
           dist.contentId = nextMission.id;
           dist.role = 'DISTRACTOR';
           dist.displayContent = opt;
           hotspotEngine.registerHotspot(dist);
        });
      }

      setMissionProgress({ completed: 0, required: requiredCount });
      missionProgressRef.current = { completed: 0, required: requiredCount };
      
      if (arenaRef.current) {
         const rect = arenaRectRef.current;
         const hs = hotspotEngine.getHotspots();
         const minSpacing = difficultyState.minSpacing;
         
         const groundY = rect.height - Math.max(40, 80 * (rect.height < 600 ? 0.7 : 1));
         const lakeW = Math.min(300, rect.width * 0.35);
         
         const avoidLake = (x: number, y: number) => {
           return x < lakeW + 50 && y > rect.height - 250;
         };
         
         // Deterministic spatial slots strictly relative to groundY
         const startY = groundY - 10;
         const endY   = groundY;
         const availableH = endY - startY;
         
         // Responsive horizontal spacing preventing negative available width on narrow screens
         let marginX = Math.max(40, rect.width * 0.15);
         let clampX = Math.max(30, rect.width * 0.10);
         if (rect.width >= 600) {
            marginX = 200;
            clampX = 150;
         }
         
         const startX = marginX;
         const endX = rect.width - marginX;
         const availableW = Math.max(50, endX - startX);
         
         // Pre-defined fractional grid (X, Y) relative to available space to guarantee maximum horizontal separation
         const fractions = [
            { x: 0.0, y: 0.0 }, // 0
            { x: 0.2, y: 1.0 }, // 1
            { x: 0.4, y: 0.0 }, // 2
            { x: 0.6, y: 1.0 }, // 3
            { x: 0.8, y: 0.0 }, // 4
            { x: 1.0, y: 1.0 }  // 5
         ];
         
         const orderedSlots = fractions.map(f => {
            let px = startX + f.x * availableW;
            let py = startY + f.y * availableH;
            
            if (avoidLake(px, py)) {
               // Move to the right of the lake safely
               px = Math.max(lakeW + 60 + (f.x * (availableW * 0.5)), px);
            }
            
            px = Math.min(Math.max(px, clampX), rect.width - clampX);
            
            return { x: px, y: py };
         });
         
         let selectedSlots: {x: number, y: number}[] = [];
         if (hs.length === 1) selectedSlots = [orderedSlots[2]];
         else if (hs.length === 2) selectedSlots = [orderedSlots[0], orderedSlots[5]];
         else if (hs.length === 3) selectedSlots = [orderedSlots[0], orderedSlots[3], orderedSlots[5]];
         else if (hs.length === 4) selectedSlots = [orderedSlots[0], orderedSlots[2], orderedSlots[4], orderedSlots[5]];
         else if (hs.length === 5) selectedSlots = [orderedSlots[0], orderedSlots[1], orderedSlots[3], orderedSlots[4], orderedSlots[5]];
         else selectedSlots = orderedSlots;
         
         // Use a deterministic seeded Fisher-Yates shuffle to randomize answer positions
         const seedStr = `${sessionSeedRef.current}-${activeMissionRef.current?.id || "unknown"}-${activeMissionSequenceRef.current}`;
         const prng = mulberry32(cyrb53(seedStr));
         
         // In-place Fisher-Yates shuffle of the hotspots array
         for (let i = hs.length - 1; i > 0; i--) {
            const j = Math.floor(prng() * (i + 1));
            [hs[i], hs[j]] = [hs[j], hs[i]];
         }
         
         hs.forEach((hotspot, i) => {
            const slot = selectedSlots[i % selectedSlots.length];
            hotspot.x = slot.x;
            hotspot.y = slot.y;
         });
      }
      
      const targetsCount = hotspotEngine.getHotspots().filter(f => f.role === 'TARGET').length;
      setActiveFiresCount(targetsCount);
      activeFiresCountRef.current = targetsCount;
    } else {
      captureSessionResult();
      setGameState('MISSION_COMPLETE');
      sharedAudioEngine.stopRotor();
    }
  };

  const captureSessionResult = () => {
    if (sessionSnapshotCapturedRef.current) return;
    sessionSnapshotCapturedRef.current = true;

    const edSession = sharedEducationalEngine.getSessionState();
    
    let winner = '';
    const scoreP1 = scoreEngineP1.getScore(edSession.correctAnswers, edSession.incorrectAnswers);
    const scoreP2 = scoreEngineP2.getScore(edSession.correctAnswers, edSession.incorrectAnswers);
    const scoreP3 = scoreEngineP3.getScore(edSession.correctAnswers, edSession.incorrectAnswers);
    const scoreP4 = scoreEngineP4.getScore(edSession.correctAnswers, edSession.incorrectAnswers);

    let teamA = 0;
    let teamB = 0;

    if (gameModeRef.current === 'SOLO') {
      winner = 'PEMAIN 1';
    } else if (gameModeRef.current === 'DUEL') {
      if (scoreP1.totalScore > scoreP2.totalScore) winner = 'PEMAIN 1 MENANG!';
      else if (scoreP2.totalScore > scoreP1.totalScore) winner = 'PEMAIN 2 MENANG!';
      else winner = 'SERI!';
    } else if (gameModeRef.current === 'SQUAD') {
      teamA = scoreP1.totalScore + scoreP2.totalScore;
      teamB = scoreP3.totalScore + scoreP4.totalScore;
      if (teamA > teamB) winner = 'TEAM A MENANG!';
      else if (teamB > teamA) winner = 'TEAM B MENANG!';
      else winner = 'SERI!';
    }

    const snapshot: SessionResultSnapshot = {
      sessionId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      jenjang: config?.jenjang || '',
      mataPelajaran: config?.mataPelajaran || '',
      gameMode: gameModeRef.current,
      duration: config?.duration || 180,
      globalStats: {
        questionsPresented: edSession.questionsPresented,
        correctAnswers: edSession.correctAnswers,
        incorrectAnswers: edSession.incorrectAnswers
      },
      players: {
        P1: scoreP1,
        ...(gameModeRef.current !== 'SOLO' && { P2: scoreP2 }),
        ...(gameModeRef.current === 'SQUAD' && { P3: scoreP3, P4: scoreP4 })
      },
      ...(gameModeRef.current === 'SQUAD' && {
        teamScore: { teamA, teamB }
      }),
      winner
    };

    setSessionResultSnapshot(snapshot);
  };

  const handleStart = () => {
    setGameState('PLAYING');
    gameStateRef.current = 'PLAYING';
    remainingMsRef.current = (config ? config.duration * 1000 : 180000);
    setTimeLeft(config ? config.duration : 180);
    sharedAudioEngine.startRotor();
    loadNextMission();
  };

  const handleSaveResult = () => {
    if (!sessionResultSnapshot || sessionResultSnapshot.isSaved) return;

    const p1Trimmed = p1Name.trim();
    const p2Trimmed = p2Name.trim();
    const p3Trimmed = p3Name.trim();
    const p4Trimmed = p4Name.trim();

    if (gameMode === 'SOLO' && !p1Trimmed) return;
    if (gameMode === 'DUEL' && (!p1Trimmed || !p2Trimmed)) return;
    if (gameMode === 'SQUAD' && (!p1Trimmed || !p2Trimmed || !p3Trimmed || !p4Trimmed)) return;

    const finalizedSnapshot = {
      ...sessionResultSnapshot,
      isSaved: true,
      p1Name: p1Trimmed || undefined,
      p2Name: p2Trimmed || undefined,
      p3Name: p3Trimmed || undefined,
      p4Name: p4Trimmed || undefined
    };

    LocalSessionStore.save(finalizedSnapshot);
    setSessionResultSnapshot(finalizedSnapshot);
  };

  const handlePlayAgain = () => {
    setSessionResultSnapshot(null);
    setP1Name('');
    setP2Name('');
    setP3Name('');
    setP4Name('');
    sessionSnapshotCapturedRef.current = false;
    setRewards([]);
    sprayConsumedRef.current = { P1: false, P2: false, P3: false, P4: false };
    entityP1Ref.current.currentWater = entityP1Ref.current.maxWater;
    entityP1Ref.current.isValveOpen = false;
    entityP2Ref.current.currentWater = entityP2Ref.current.maxWater;
    entityP2Ref.current.isValveOpen = false;
    entityP3Ref.current.currentWater = entityP3Ref.current.maxWater;
    entityP3Ref.current.isValveOpen = false;
    entityP4Ref.current.currentWater = entityP4Ref.current.maxWater;
    entityP4Ref.current.isValveOpen = false;
    input.setDropActive(false);

    sharedEducationalEngine.resetSession();
    scoreEngineP1.reset();
    scoreEngineP2.reset();
    scoreEngineP3.reset();
    scoreEngineP4.reset();
    
    setHudScores({P1: 0, P2: 0, P3: 0, P4: 0});
    
    const newLives = {P1: 5, P2: 5, P3: 5, P4: 5};
    livesRef.current = newLives;
    setLives(newLives);
    
    const newStreaks = {P1: 0, P2: 0, P3: 0, P4: 0};
    streaksRef.current = newStreaks;
    setStreaks(newStreaks);
    
    cloudCooldownsRef.current = {P1: 0, P2: 0, P3: 0, P4: 0};
    heliCollisionCooldownsRef.current = {P1: 0, P2: 0, P3: 0, P4: 0};
    
    
    // Reset positions back to start for next game
    if (arenaRef.current) {
      const rect = arenaRectRef.current;
      entityP1Ref.current.targetX = rect.width / 2;
      entityP1Ref.current.targetY = rect.height / 2;
      entityP1Ref.current.x = rect.width / 2;
      entityP1Ref.current.y = rect.height / 2;
      input.setTarget(rect.width / 2, rect.height / 2);
      
      entityP2Ref.current.targetX = rect.width / 2 + 100;
      entityP2Ref.current.targetY = rect.height / 2;
      entityP2Ref.current.x = rect.width / 2 + 100;
      entityP2Ref.current.y = rect.height / 2;

      entityP3Ref.current.targetX = rect.width / 2 - 100;
      entityP3Ref.current.targetY = rect.height / 2;
      entityP3Ref.current.x = rect.width / 2 - 100;
      entityP3Ref.current.y = rect.height / 2;

      entityP4Ref.current.targetX = rect.width / 2 + 200;
      entityP4Ref.current.targetY = rect.height / 2;
      entityP4Ref.current.x = rect.width / 2 + 200;
      entityP4Ref.current.y = rect.height / 2;
    }
    
    handleStart();
  };

  const renderSnapshotScore = (title: string, score: MissionScore) => {
    return (
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex-1 min-w-[250px] w-full">
        <h3 className="text-xl font-bold text-white mb-4 tracking-tight border-b border-slate-700 pb-2">{title}</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-bold text-sm">API PADAM</span>
            <span className="font-black text-white">{score.firesExtinguished}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-bold text-sm">AKURASI</span>
            <span className="font-black text-white">{Math.round(score.accuracy * 100)}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-bold text-sm">EFISIENSI</span>
            <span className="font-black text-white">{Math.round(score.efficiency * 100)}%</span>
          </div>
          <div className="h-px bg-slate-700 my-2"></div>
          <div className="flex justify-between items-center">
            <span className="font-black text-blue-400">SKOR</span>
            <span className="text-2xl font-black text-white">{score.totalScore.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderScore = (title: string, scoreEngine: ScoreEngine) => {
    const edSession = sharedEducationalEngine.getSessionState();
    const score = scoreEngine.getScore(edSession.correctAnswers, edSession.incorrectAnswers);
    return (
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex-1 min-w-[250px] w-full">
        <h3 className="text-xl font-bold text-white mb-4 tracking-tight border-b border-slate-700 pb-2">{title}</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-bold text-sm">API PADAM</span>
            <span className="font-black text-white">{score.firesExtinguished}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-bold text-sm">AKURASI</span>
            <span className="font-black text-white">{Math.round(score.accuracy * 100)}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-bold text-sm">EFISIENSI</span>
            <span className="font-black text-white">{Math.round(score.efficiency * 100)}%</span>
          </div>
          <div className="h-px bg-slate-700 my-2"></div>
          <div className="flex justify-between items-center">
            <span className="font-black text-blue-400">SKOR</span>
            <span className="text-2xl font-black text-white">{score.totalScore.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="flex flex-col w-full h-[100dvh] bg-gradient-to-b from-sky-800 to-sky-900 text-white overflow-hidden select-none relative"
      style={{ 
        WebkitTouchCallout: 'none', 
        WebkitUserSelect: 'none',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); return false; }}
    >
      <header className="shrink-0 z-10 bg-transparent flex justify-between items-center px-2 sm:px-4 py-1 relative pointer-events-auto">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setIsMuted(sharedAudioEngine.toggleMute())}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs sm:text-sm"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          
          <button 
            onClick={() => {
              if (!document.fullscreenElement) {
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              } else {
                if (document.exitFullscreen) {
                  document.exitFullscreen().catch(() => {});
                }
              }
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs sm:text-sm"
            title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
          >
            ⛶
          </button>

          {onReturnToMenu && (
            <button 
              onClick={() => {
                if (document.fullscreenElement && document.exitFullscreen) {
                  document.exitFullscreen().catch(() => {});
                }
                onReturnToMenu();
              }}
              className="px-2 py-1 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
            >
              MENU
            </button>
          )}
        </div>
        


        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm md:text-base font-black text-white drop-shadow-md bg-slate-900/50 px-2 sm:px-3 py-1 rounded-full border border-slate-700/50">
            <span className="text-[10px] sm:text-xs text-slate-400">⏱️</span>
            <span>{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</span>
          </div>
          {gameMode !== 'SQUAD' && (
            <div className="flex items-center">
              {gameMode === 'SOLO' && (
                <div className="flex items-center gap-1 font-mono text-xs sm:text-sm md:text-base font-bold text-rose-400 drop-shadow-md">
                  <span>❤️</span><span>{lives.P1}</span>
                </div>
              )}
              {gameMode === 'DUEL' && (
                <div className="flex items-center gap-1 font-mono text-xs sm:text-sm md:text-base font-bold text-rose-400 drop-shadow-md">
                  <span>❤️</span><span>{lives.P1}</span><span className="text-slate-600 px-0.5">|</span><span>{lives.P2}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center">
            {gameMode === 'SOLO' && (
              <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm md:text-base font-bold text-amber-400 drop-shadow-md">
                <span className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider text-amber-500">SKOR</span>
                <span>{hudScores.P1.toLocaleString('id-ID')}</span>
              </div>
            )}
            {gameMode === 'DUEL' && (
              <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm md:text-base font-bold drop-shadow-md">
                <span className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider text-amber-500">SKOR</span>
                <span className="text-emerald-400">{hudScores.P1.toLocaleString('id-ID')}</span>
                <span className="text-slate-600 px-0.5">|</span>
                <span className="text-blue-400">{hudScores.P2.toLocaleString('id-ID')}</span>
              </div>
            )}
            {gameMode === 'SQUAD' && (
              <div className="flex items-center gap-2 font-mono text-xs sm:text-sm md:text-base font-bold drop-shadow-md text-white">
                <span className="flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-300 tracking-widest">TEAM A</span>
                  <span className="text-[10px] sm:text-xs">🟢🔵</span> 
                  <span>{(hudScores.P1 + hudScores.P2).toLocaleString('id-ID')}</span>
                </span>
                <span className="text-slate-600 px-1">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-300 tracking-widest">TEAM B</span>
                  <span className="text-[10px] sm:text-xs">🟡🔴</span> 
                  <span>{(hudScores.P3 + hudScores.P4).toLocaleString('id-ID')}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </header>



      <main className="flex-1 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full bg-transparent py-1 px-2 flex flex-col items-center justify-start z-[60] pointer-events-none gap-2">
          {activeMission && (
             <div className="text-sm sm:text-base md:text-lg font-bold text-white px-3 py-1 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-sm text-center max-w-4xl w-full whitespace-normal break-words leading-tight pointer-events-auto shrink-0">
                {activeMission.pertanyaan || activeMission.question}
              </div>
          )}
          {missionFeedback && (
            <div className={`px-4 py-1 sm:px-6 sm:py-2 rounded-full font-black text-white shadow-2xl animate-pop-in text-xs sm:text-sm pointer-events-auto shrink-0 ${missionFeedback.isError ? 'bg-red-600 border border-red-400' : 'bg-emerald-500 border border-emerald-400'}`}>
              {missionFeedback.message}
            </div>
          )}
        </div>
        <style dangerouslySetInnerHTML={{ __html: arenaStyles }} />
        
        {streakRewards.map(reward => (
          <div key={reward.id} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] flex flex-col items-center pointer-events-none animate-pop-in">
             <div className="text-5xl mb-2 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]">⭐⭐⭐⭐⭐</div>
             <div className="text-3xl font-black text-white drop-shadow-xl text-center">LUAR BIASA {gameMode !== 'SOLO' ? reward.pId : ''}!</div>
             <div className="text-xl font-bold text-amber-300 drop-shadow-md text-center mt-1">5 jawaban benar beruntun!</div>
             <div className="text-2xl font-black text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.8)] mt-2 bg-slate-900/50 px-6 py-2 rounded-full border border-rose-500/30">+1 NYAWA ❤️</div>
          </div>
        ))}
        
        {gameState === 'MODE_SELECT' && (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-800 p-8 rounded-2xl border-2 border-slate-600 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-sm pointer-events-auto animate-pop-in">
              <h2 className="text-3xl font-black mb-6 text-white tracking-tight drop-shadow-md">PILIH MODE</h2>
              <div className="space-y-4">
                <button 
                  onClick={() => handleSelectMode('SOLO')}
                  className="w-full py-4 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xl rounded-xl shadow-lg transition-colors cursor-pointer border border-emerald-400/30"
                >
                  MISI SOLO
                </button>
                <button 
                  onClick={() => handleSelectMode('DUEL')}
                  className="w-full py-4 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-xl rounded-xl shadow-lg transition-colors cursor-pointer border border-blue-400/30"
                >
                  DUEL 2 PEMAIN
                </button>
                <button 
                  onClick={() => handleSelectMode('SQUAD')}
                  className="w-full py-4 bg-gradient-to-b from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-bold text-xl rounded-xl shadow-lg transition-colors cursor-pointer border border-yellow-400/30"
                >
                  SQUAD 4 PEMAIN
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'READY' && (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {gameMode === 'SQUAD' ? (
              <div className="bg-slate-800 p-4 sm:p-6 md:p-8 rounded-2xl border-2 border-slate-600 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-2xl w-full max-h-full overflow-y-auto animate-pop-in pointer-events-auto flex flex-col">
                <h2 className="text-3xl font-black mb-2 text-white tracking-tight drop-shadow-md">SIAPKAN TIMMU!</h2>
                <p className="text-slate-300 mb-6 font-medium max-w-lg mx-auto">
                  Kerja sama untuk memadamkan semua target api dan kumpulkan skor tim terbanyak.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 shadow-inner flex flex-col items-center">
                    <span className="text-slate-300 font-bold uppercase tracking-widest text-sm mb-2">TEAM A</span>
                    <span className="text-[10px] text-slate-400 font-bold mb-3 bg-slate-800 px-2 py-1 rounded">SKOR DIGABUNG</span>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1 font-black text-emerald-400"><span className="text-lg">🟢</span> P1</div>
                      <div className="flex items-center gap-1 font-black text-blue-400"><span className="text-lg">🔵</span> P2</div>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 shadow-inner flex flex-col items-center">
                    <span className="text-slate-300 font-bold uppercase tracking-widest text-sm mb-2">TEAM B</span>
                    <span className="text-[10px] text-slate-400 font-bold mb-3 bg-slate-800 px-2 py-1 rounded">SKOR DIGABUNG</span>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1 font-black text-yellow-400"><span className="text-lg">🟡</span> P3</div>
                      <div className="flex items-center gap-1 font-black text-rose-400"><span className="text-lg">🔴</span> P4</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mb-6 flex items-center justify-center gap-2 md:gap-3 flex-wrap text-xs md:text-sm">
                   <span className="font-bold text-slate-300">TERBANG</span>
                   <span className="text-slate-500">→</span>
                   <span className="font-bold text-slate-300">CARI API</span>
                   <span className="text-slate-500">→</span>
                   <span className="font-bold text-slate-300">DEKATI</span>
                   <span className="text-slate-500">→</span>
                   <span className="font-bold text-sky-400">SIRAM</span>
                   <span className="text-slate-500">→</span>
                   <span className="font-bold text-orange-400 drop-shadow-md">PADAMKAN</span>
                </div>

                <div className="text-sm font-bold text-slate-300 mb-8 max-w-md mx-auto">
                  <p className="mb-2">Gunakan kontrol <span className="text-white bg-slate-700 px-2 py-0.5 rounded">di bagian bawah layar</span> untuk menerbangkan helikoptermu.</p>
                  <p>Tekan <span className="text-sky-400 font-black">SIRAM</span> saat berada di dekat target api.</p>
                </div>

                <button 
                  onClick={handleStart}
                  className="w-full max-w-md mx-auto block py-4 shrink-0 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-2xl tracking-widest rounded-xl shadow-lg transition-colors cursor-pointer border border-emerald-400/30 touch-manipulation"
                >
                  SIAP, MULAI!
                </button>
              </div>
            ) : (
              <div className="bg-slate-800 p-8 rounded-2xl border-2 border-slate-600 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-sm pointer-events-auto animate-pop-in">
                <h2 className="text-3xl font-black mb-2 text-white tracking-tight drop-shadow-md">HELI RESCUE</h2>
                <p className="text-slate-300 mb-6 font-medium">Padamkan semua target api. Isi tangki air di danau.</p>
                
                {gameMode === 'DUEL' && (
                  <div className="bg-slate-900 p-4 rounded-xl mb-6 text-sm text-slate-300 text-left space-y-3 border border-slate-700 shadow-inner">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 font-black tracking-wider">PEMAIN 1 (HIJAU)</span>
                      <span className="font-mono bg-slate-800 px-2 py-1 rounded">WASD + Space</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400 font-black tracking-wider">PEMAIN 2 (BIRU)</span>
                      <span className="font-mono bg-slate-800 px-2 py-1 rounded">Arrows + Enter</span>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleStart}
                  className="w-full py-4 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xl rounded-xl shadow-lg transition-colors cursor-pointer border border-emerald-400/30"
                >
                  MULAI MISI
                </button>
              </div>
            )}
          </div>
        )}

        

        <div 
          ref={arenaRef}
          className="absolute inset-0 bg-transparent touch-none select-none overflow-hidden cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Distant Forest Silhouette (Organic) */}
          <svg viewBox="0 0 1440 320" className="absolute bottom-[80px] w-full h-[35vh] pointer-events-none drop-shadow-xl" preserveAspectRatio="none">
             <path fill="#064e3b" d="M0,160 C320,300 420,0 720,120 C1020,240 1200,60 1440,160 L1440,320 L0,320 Z" opacity="0.5"/>
             <path fill="#065f46" d="M0,220 C250,120 400,280 720,200 C1000,120 1200,260 1440,180 L1440,320 L0,320 Z" opacity="0.7"/>
             <path fill="#047857" d="M0,280 C200,200 300,320 600,250 C900,180 1100,290 1440,240 L1440,320 L0,320 Z" opacity="1"/>
          </svg>
          
          {/* Ground */}
          <div className="absolute bottom-0 w-full bg-emerald-900 border-t-[6px] border-emerald-700 pointer-events-none shadow-[inset_0_20px_30px_rgba(0,0,0,0.3)]" style={{ height: `${groundVisualHeight}px` }}>
            <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grass" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M10,90 Q15,70 20,90 M40,85 Q45,60 50,85 M70,95 Q75,75 80,95" stroke="#4ade80" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </pattern>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#grass)"/>
            </svg>
          </div>

          {/* Lake / Refill Zone */}
          <div className="absolute bottom-0 left-0 pointer-events-none drop-shadow-2xl" style={{ width: `${currentLakeWidth}px`, height: `${groundVisualHeight + 20}px` }}>
            <svg viewBox="0 0 300 100" width="100%" height="100%" preserveAspectRatio="none">
               <path d="M0,20 Q150,-10 250,30 T300,100 L0,100 Z" fill="#1e40af" />
               <path d="M0,30 Q140,5 240,40 T290,100 L0,100 Z" fill="#2563eb" />
               <path d="M0,40 Q130,20 230,50 T280,100 L0,100 Z" fill="#3b82f6" />
               <path d="M20,50 Q100,35 160,55" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6"/>
               <path d="M40,70 Q120,60 180,75" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span id="global-refill-feedback" className="text-blue-300 text-sm font-black opacity-0 transition-opacity duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] refill-active bg-black/40 px-3 py-1 rounded-full border border-blue-500/50">
                💧 ISI AIR
              </span>
            </div>
          </div>

          {/* Visual Trees */}
          <PineTree className="left-[15%]" style={{ bottom: '85px' }} scale={0.4} />
          <PineTree className="left-[260px] bottom-[80px]" scale={0.7} />
          <PineTree className="left-[340px] bottom-[75px]" scale={0.5} />
          <PineTree className="left-[45%]" style={{ bottom: '80px' }} scale={0.8} />
          <PineTree className="left-[65%]" style={{ bottom: '70px' }} scale={0.6} />
          <PineTree className="right-[15%]" style={{ bottom: '85px' }} scale={0.8} />
          <PineTree className="right-[5%]" style={{ bottom: '75px' }} scale={0.5} />

          {/* Fog Overlay */}
          <div id="global-fog-overlay" className="absolute inset-0 bg-slate-900/60 pointer-events-none opacity-0 transition-opacity duration-300 z-50 mix-blend-multiply"></div>

          {/* Obstacles */}
          {obstaclesRef.current.map((obs, idx) => (
            <div 
              key={obs.id}
              ref={el => obstacleRefs.current[idx] = el}
              className="absolute top-0 left-0 will-change-transform pointer-events-none z-30 opacity-80"
              style={{ transform: `translate3d(${obs.x}px, ${obs.y}px, 0)` }}
            >
              <div className="w-[120px] h-[70px] bg-slate-900 rounded-full blur-[15px] mix-blend-multiply -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          ))}

          {/* Hotspots / Fires */}
          {hotspotEngine.getHotspots().map((hotspot, idx) => (
            <div 
              key={hotspot.id}
              ref={el => hotspotRefs.current[idx] = el}
              className="absolute top-0 left-0 will-change-transform pointer-events-none"
            >
              {/* Detection Ring */}
              <div className="hotspot-detection-ring absolute top-0 left-0 w-[500px] h-[500px] rounded-full border-4 border-dashed border-red-500/30 opacity-0 transition-opacity duration-300 -translate-x-1/2 -translate-y-1/2" />
              
              {/* Alignment Ring */}
              <div className="hotspot-alignment-ring absolute top-0 left-0 w-[240px] h-[240px] rounded-full border-2 border-red-400/50 bg-red-500/10 opacity-0 transition-opacity duration-300 -translate-x-1/2 -translate-y-1/2" />
              
              {/* HOTSPOT DETECTED Label */}
              

              {/* SIAP MENYIRAM Label */}
              

              <div className="scorch-mark absolute top-0 left-0 w-48 h-12 bg-black/60 rounded-[100%] blur-sm -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000" />
              
              <div className="fire-visual-container origin-bottom absolute top-0 left-0 transition-transform duration-100 ease-out flex flex-col items-center" style={{ transform: `translate(-50%, -100%) scale(${FIRE_VISUAL_SCALE})` }}>
                  {/* HOTSPOT DETECTED Label */}
                  <div className="hotspot-detected-label absolute bottom-[100%] mb-12 bg-red-600/90 border-red-500 text-white font-black rounded-full opacity-0 transition-opacity duration-300 drop-shadow-lg whitespace-nowrap tracking-widest border" 
                       style={{ fontSize: `14px`, padding: `4px 12px` }}>
                    HOTSPOT DETECTED
                  </div>

                  {/* SIAP MENYIRAM Label */}
                  <div className="hotspot-ready-label absolute bottom-[100%] mb-6 bg-blue-500/90 text-white font-black rounded-full opacity-0 transition-opacity duration-300 drop-shadow-lg whitespace-nowrap tracking-widest border border-blue-400 animate-pulse" 
                       style={{ fontSize: `14px`, padding: `4px 12px` }}>
                    SIAP MENYIRAM
                  </div>

                  {/* Hotspot Content Label */}
                  {hotspot.displayContent && (
                    <div className="hotspot-content-label absolute bottom-[100%] mb-1 text-white font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] rounded-xl border bg-red-950/80 border-red-500/50 text-center leading-tight whitespace-nowrap"
                         style={{ fontSize: `18px`, padding: `4px 8px` }}>
                      {hotspot.displayContent}
                    </div>
                  )}

                  <svg width="120" height="160" viewBox="0 0 60 80" className="drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] shrink-0">
                    <path d="M30,5 Q55,30 40,65 A15,15 0 0,1 10,55 Q5,35 30,5 Z" fill="#ef4444" />
                    <path d="M30,25 Q45,45 35,62 A8,8 0 0,1 20,58 Q15,45 30,25 Z" fill="#f97316" />
                    <path d="M30,45 Q38,55 32,62 A3,3 0 0,1 25,60 Q20,55 30,45 Z" fill="#fcd34d" />
                  </svg>
              </div>

              <div className="extinguished-visual-container absolute top-0 left-0 opacity-0 transition-opacity duration-1000 origin-bottom" style={{ transform: `translate(-50%, -100%) scale(${1.2 * compositionScale})` }}>
                <svg width="40" height="60" viewBox="0 0 40 60" className="opacity-80 mix-blend-screen">
                  <circle cx="20" cy="50" r="10" fill="#cbd5e1">
                    <animate attributeName="cy" values="50;10" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="r" values="10;25" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="20" cy="50" r="8" fill="#f1f5f9">
                    <animate attributeName="cy" values="50;-10" dur="2.5s" begin="0.5s" repeatCount="indefinite"/>
                    <animate attributeName="r" values="8;20" dur="2.5s" begin="0.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.8;0" dur="2.5s" begin="0.5s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>

              
            </div>
          ))}

          {/* Visual Rewards */}
          {rewards.map(reward => {
            let colorClass = 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]';
            if (reward.playerId === 'P2') colorClass = 'text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]';
            if (reward.playerId === 'P3') colorClass = 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]';
            if (reward.playerId === 'P4') colorClass = 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.8)]';

            return (
              <div 
                key={reward.id}
                className="absolute z-50 pointer-events-none flex flex-col items-center justify-center reward-float"
                style={{
                  left: reward.x,
                  top: reward.y,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <span className={`text-4xl font-black ${colorClass}`}>+{reward.score}</span>
                <span className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">API PADAM!</span>
              </div>
            );
          })}

          {/* Water Streams */}
          <div ref={streamP1Ref} className="absolute top-0 left-0 w-4 water-stream origin-top opacity-0 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.9)] -translate-x-1/2 pointer-events-none" style={{ transition: 'opacity 0.1s' }}>
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-400 rounded-full blur-[4px] mix-blend-screen" style={{ animation: 'ping 0.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
            <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-200 rounded-full blur-[2px] mix-blend-screen" />
          </div>
          <div ref={streamP2Ref} className="absolute top-0 left-0 w-4 water-stream origin-top opacity-0 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.9)] -translate-x-1/2 pointer-events-none" style={{ transition: 'opacity 0.1s' }}>
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-400 rounded-full blur-[4px] mix-blend-screen" style={{ animation: 'ping 0.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
            <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-200 rounded-full blur-[2px] mix-blend-screen" />
          </div>
          <div ref={streamP3Ref} className="absolute top-0 left-0 w-4 water-stream origin-top opacity-0 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.9)] -translate-x-1/2 pointer-events-none" style={{ transition: 'opacity 0.1s' }}>
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-400 rounded-full blur-[4px] mix-blend-screen" style={{ animation: 'ping 0.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
            <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-200 rounded-full blur-[2px] mix-blend-screen" />
          </div>
          <div ref={streamP4Ref} className="absolute top-0 left-0 w-4 water-stream origin-top opacity-0 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.9)] -translate-x-1/2 pointer-events-none" style={{ transition: 'opacity 0.1s' }}>
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-400 rounded-full blur-[4px] mix-blend-screen" style={{ animation: 'ping 0.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
            <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-200 rounded-full blur-[2px] mix-blend-screen" />
          </div>

          {/* Helicopters */}
          <div ref={visualP1Ref} className="absolute top-0 left-0 will-change-transform pointer-events-none drop-shadow-[0_20px_20px_rgba(0,0,0,0.4)] z-40">
            <img src={UNIVERSAL_ROTOR_URL} alt="Main Rotor" className="absolute rotor-spin-anim select-none" style={{ width: scaledWidthP1 * 0.9, height: scaledHeightP1 * 0.0625, top: `${assetP1.definition.rotorOffset.y}%`, left: `${assetP1.definition.rotorOffset.x}%`, transformOrigin: 'center center' }} draggable={false} />
            <img ref={imgP1Ref} src={assetP1.definition.assetUrl} alt="P1 Helicopter" style={{ width: scaledWidthP1, height: scaledHeightP1 }} className="select-none relative z-10" draggable={false} />
          </div>

          {(gameMode === 'DUEL' || gameMode === 'SQUAD') && (
            <div ref={visualP2Ref} className="absolute top-0 left-0 will-change-transform pointer-events-none drop-shadow-[0_20px_20px_rgba(0,0,0,0.4)] z-30">
              <img src={UNIVERSAL_ROTOR_URL} alt="Main Rotor" className="absolute rotor-spin-anim select-none" style={{ width: scaledWidthP2 * 0.9, height: scaledHeightP2 * 0.0625, top: `${assetP2.definition.rotorOffset.y}%`, left: `${assetP2.definition.rotorOffset.x}%`, transformOrigin: 'center center' }} draggable={false} />
              <img ref={imgP2Ref} src={assetP2.definition.assetUrl} alt="P2 Helicopter" style={{ width: scaledWidthP2, height: scaledHeightP2 }} className="select-none relative z-10" draggable={false} />
            </div>
          )}

          {gameMode === 'SQUAD' && (
            <>
              <div ref={visualP3Ref} className="absolute top-0 left-0 will-change-transform pointer-events-none drop-shadow-[0_20px_20px_rgba(0,0,0,0.4)] z-20">
                <img src={UNIVERSAL_ROTOR_URL} alt="Main Rotor" className="absolute rotor-spin-anim select-none" style={{ width: scaledWidthP3 * 0.9, height: scaledHeightP3 * 0.0625, top: `${assetP3.definition.rotorOffset.y}%`, left: `${assetP3.definition.rotorOffset.x}%`, transformOrigin: 'center center' }} draggable={false} />
                <img ref={imgP3Ref} src={assetP3.definition.assetUrl} alt="P3 Helicopter" style={{ width: scaledWidthP3, height: scaledHeightP3 }} className="select-none relative z-10" draggable={false} />
              </div>
              <div ref={visualP4Ref} className="absolute top-0 left-0 will-change-transform pointer-events-none drop-shadow-[0_20px_20px_rgba(0,0,0,0.4)] z-10">
                <img src={UNIVERSAL_ROTOR_URL} alt="Main Rotor" className="absolute rotor-spin-anim select-none" style={{ width: scaledWidthP4 * 0.9, height: scaledHeightP4 * 0.0625, top: `${assetP4.definition.rotorOffset.y}%`, left: `${assetP4.definition.rotorOffset.x}%`, transformOrigin: 'center center' }} draggable={false} />
                <img ref={imgP4Ref} src={assetP4.definition.assetUrl} alt="P4 Helicopter" style={{ width: scaledWidthP4, height: scaledHeightP4 }} className="select-none relative z-10" draggable={false} />
              </div>
            </>
          )}

          {/* Touch Controls for IFP (Multi-Touch) moved to bottom bar */}
        </div>
      </main>

      {/* BOTTOM CONTROL BAR */}
      <div className="w-full bg-slate-950 border-t-2 border-slate-800 shrink-0 overflow-x-auto overflow-y-hidden select-none touch-none z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex items-center justify-around px-1 sm:px-2 py-1 sm:py-2 min-h-[75px]">
        {(gameMode === 'SOLO' || gameMode === 'DUEL' || gameMode === 'SQUAD') && (
          <div className="flex-1 min-w-[150px] flex flex-col items-center justify-center border-r border-slate-800/50 py-1">
            {gameMode === 'SQUAD' && (
              <div className="flex flex-col items-center gap-0 w-full px-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-rose-400 font-bold drop-shadow-md flex items-center gap-0.5">❤️ {lives.P1}</span>
                </div>
                <div className="w-14 sm:w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner mt-0.5 mb-1">
                  <div ref={waterBarP1Ref} className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-none will-change-[width]" style={{ width: '100%' }} />
                </div>
              </div>
            )}
            {(gameMode === 'SOLO' || gameMode === 'DUEL') && (
              <div className="flex flex-col items-center gap-0 w-full px-2">
                <div className="w-14 sm:w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner mt-1 mb-2">
                  <div ref={waterBarP1Ref} className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-none will-change-[width]" style={{ width: '100%' }} />
                </div>
              </div>
            )}
            <PlayerTouchControls 
              playerLabel="PEMAIN 1 (HIJAU)"
              positionClass=""
              dropColorClass="bg-emerald-500 border-emerald-700 shadow-emerald-900/50"
              keyMap={{ up: 'w', down: 's', left: 'a', right: 'd', drop: 'space' }}
              keyStateRef={keyState}
              inputManager={input}
            />
          </div>
        )}
        {(gameMode === 'DUEL' || gameMode === 'SQUAD') && (
          <div className={`flex-1 min-w-[150px] flex flex-col items-center justify-center py-1 ${gameMode === 'SQUAD' ? 'border-r border-slate-800/50' : ''}`}>
            {gameMode === 'SQUAD' && (
              <div className="flex flex-col items-center gap-0 w-full px-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-rose-400 font-bold drop-shadow-md flex items-center gap-0.5">❤️ {lives.P2}</span>
                </div>
                <div className="w-14 sm:w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner mt-0.5 mb-1">
                  <div ref={waterBarP2Ref} className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-none will-change-[width]" style={{ width: '100%' }} />
                </div>
              </div>
            )}
            {gameMode === 'DUEL' && (
              <div className="flex flex-col items-center gap-0 w-full px-2">
                <div className="w-14 sm:w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner mt-1 mb-2">
                  <div ref={waterBarP2Ref} className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-none will-change-[width]" style={{ width: '100%' }} />
                </div>
              </div>
            )}
            <PlayerTouchControls 
              playerLabel="PEMAIN 2 (BIRU)"
              positionClass=""
              reverse={true}
              dropColorClass="bg-sky-500 border-sky-700 shadow-sky-900/50"
              keyMap={{ up: 'up', down: 'down', left: 'left', right: 'right', drop: 'enter' }}
              keyStateRef={keyState}
            />
          </div>
        )}
        {gameMode === 'SQUAD' && (
          <>
            <div className="flex-1 min-w-[150px] flex flex-col items-center justify-center border-r border-slate-800/50 py-1">
              <div className="flex flex-col items-center gap-0 w-full px-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-rose-400 font-bold drop-shadow-md flex items-center gap-0.5">❤️ {lives.P3}</span>
                  
                </div>
                <div className="w-14 sm:w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner mt-0.5 mb-1">
                  <div ref={waterBarP3Ref} className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-none will-change-[width]" style={{ width: '100%' }} />
                </div>
              </div>
              <PlayerTouchControls 
                playerLabel="PEMAIN 3 (KUNING)"
                positionClass=""
                dropColorClass="bg-amber-500 border-amber-700 shadow-amber-900/50"
                keyMap={{ up: 'i', down: 'k', left: 'j', right: 'l', drop: 'o' }}
                keyStateRef={keyState}
              />
            </div>
            <div className="flex-1 min-w-[150px] flex flex-col items-center justify-center py-1">
              <div className="flex flex-col items-center gap-0 w-full px-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-rose-400 font-bold drop-shadow-md flex items-center gap-0.5">❤️ {lives.P4}</span>
                  
                </div>
                <div className="w-14 sm:w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner mt-0.5 mb-1">
                  <div ref={waterBarP4Ref} className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-none will-change-[width]" style={{ width: '100%' }} />
                </div>
              </div>
              <PlayerTouchControls 
                playerLabel="PEMAIN 4 (MERAH)"
                positionClass=""
                reverse={true}
                dropColorClass="bg-rose-500 border-rose-700 shadow-rose-900/50"
                keyMap={{ up: 't', down: 'g', left: 'f', right: 'h', drop: 'y' }}
                keyStateRef={keyState}
              />
            </div>
          </>
        )}
      
      {gameState === 'MISSION_COMPLETE' && sessionResultSnapshot && (
          <div 
            className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm overflow-y-auto pointer-events-auto"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="min-h-full flex flex-col items-center justify-start p-4 py-8 md:py-12"
            >
              <div className="my-auto flex flex-col items-center w-full">
              <div className="text-6xl mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)] animate-pop-in">🏆</div>
            
            {gameMode === 'SOLO' ? (
              <div className="max-w-md w-full animate-pop-in" style={{ animationDelay: '0.1s' }}>
                {renderSnapshotScore('MISI SELESAI', sessionResultSnapshot.players.P1!)}
              </div>
            ) : gameMode === 'DUEL' ? (
              <div className="w-full max-w-3xl flex flex-col items-center animate-pop-in" style={{ animationDelay: '0.1s' }}>
                <div className="text-4xl font-black text-white mb-8 tracking-tight drop-shadow-xl">
                  {(() => {
                    if (sessionResultSnapshot.winner.includes('PEMAIN 1')) return <span className="text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]">{sessionResultSnapshot.winner}</span>;
                    if (sessionResultSnapshot.winner.includes('PEMAIN 2')) return <span className="text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.5)]">{sessionResultSnapshot.winner}</span>;
                    return <span className="text-slate-300">{sessionResultSnapshot.winner}</span>;
                  })()}
                </div>
                <div className="flex gap-6 w-full mb-8 flex-col sm:flex-row">
                  {renderSnapshotScore('PEMAIN 1 (HIJAU)', sessionResultSnapshot.players.P1!)}
                  {renderSnapshotScore('PEMAIN 2 (BIRU)', sessionResultSnapshot.players.P2!)}
                </div>
              </div>
            ) : (
              <div className="w-full max-w-5xl flex flex-col items-center animate-pop-in" style={{ animationDelay: '0.1s' }}>
                <div className="text-4xl font-black text-white mb-4 tracking-tight drop-shadow-xl flex flex-col items-center">
                  <span className="text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">MISI SQUAD SELESAI</span>
                  <span className="text-lg text-emerald-400 mt-2 font-bold tracking-widest">
                    API: {missionProgressRef.current ? missionProgressRef.current.completed : 0} / {missionProgressRef.current ? missionProgressRef.current.required : 0}
                  </span>
                </div>
                <div className="text-4xl font-black text-white mb-8 tracking-tight drop-shadow-xl">
                  {(() => {
                    if (sessionResultSnapshot.winner.includes('TEAM A')) return <span className="text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]">{sessionResultSnapshot.winner}</span>;
                    if (sessionResultSnapshot.winner.includes('TEAM B')) return <span className="text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">{sessionResultSnapshot.winner}</span>;
                    return <span className="text-slate-300">{sessionResultSnapshot.winner}</span>;
                  })()}
                </div>
                <div className="flex gap-8 w-full mb-8 flex-col sm:flex-row justify-center">
                   <>
                     <div className="flex flex-col items-center bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl min-w-[280px]">
                       <span className="text-lg font-bold text-slate-300 mb-2 tracking-widest uppercase">TEAM A (🟢 + 🔵)</span>
                       <span className="text-4xl font-black text-white mb-4 drop-shadow-md">{sessionResultSnapshot.teamScore!.teamA.toLocaleString('id-ID')}</span>
                       <div className="flex gap-2 w-full text-xs">
                          <div className="flex-1 bg-slate-900/80 rounded p-2 text-center text-emerald-400 font-bold border border-slate-700">P1: {sessionResultSnapshot.players.P1!.totalScore.toLocaleString('id-ID')}</div>
                          <div className="flex-1 bg-slate-900/80 rounded p-2 text-center text-blue-400 font-bold border border-slate-700">P2: {sessionResultSnapshot.players.P2!.totalScore.toLocaleString('id-ID')}</div>
                       </div>
                     </div>
                     <div className="flex flex-col items-center bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl min-w-[280px]">
                       <span className="text-lg font-bold text-slate-300 mb-2 tracking-widest uppercase">TEAM B (🟡 + 🔴)</span>
                       <span className="text-4xl font-black text-white mb-4 drop-shadow-md">{sessionResultSnapshot.teamScore!.teamB.toLocaleString('id-ID')}</span>
                       <div className="flex gap-2 w-full text-xs">
                          <div className="flex-1 bg-slate-900/80 rounded p-2 text-center text-yellow-400 font-bold border border-slate-700">P3: {sessionResultSnapshot.players.P3!.totalScore.toLocaleString('id-ID')}</div>
                          <div className="flex-1 bg-slate-900/80 rounded p-2 text-center text-rose-400 font-bold border border-slate-700">P4: {sessionResultSnapshot.players.P4!.totalScore.toLocaleString('id-ID')}</div>
                       </div>
                     </div>
                   </>
                </div>
              </div>
            )}
            {!sessionResultSnapshot.isSaved ? (
              <div className="w-full max-w-2xl bg-slate-800/90 p-6 rounded-2xl border border-slate-700 shadow-xl mt-4 mb-8 flex flex-col items-center animate-pop-in shrink-0" style={{ animationDelay: '0.15s' }}>
                  <h3 className="text-xl font-bold text-white mb-4">ISI NAMA PEMAIN</h3>
                  <div className="w-full flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-6">
                      <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                          <label className="text-xs font-bold text-emerald-400">PEMAIN 1 (🟢)</label>
                          <input type="text" value={p1Name} onChange={e => setP1Name(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold" placeholder="Nama Pemain 1" />
                      </div>
                      {gameMode !== 'SOLO' && (
                          <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                              <label className="text-xs font-bold text-blue-400">PEMAIN 2 (🔵)</label>
                              <input type="text" value={p2Name} onChange={e => setP2Name(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold" placeholder="Nama Pemain 2" />
                          </div>
                      )}
                      {gameMode === 'SQUAD' && (
                          <>
                              <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                  <label className="text-xs font-bold text-yellow-400">PEMAIN 3 (🟡)</label>
                                  <input type="text" value={p3Name} onChange={e => setP3Name(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold" placeholder="Nama Pemain 3" />
                              </div>
                              <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                  <label className="text-xs font-bold text-rose-400">PEMAIN 4 (🔴)</label>
                                  <input type="text" value={p4Name} onChange={e => setP4Name(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold" placeholder="Nama Pemain 4" />
                              </div>
                          </>
                      )}
                  </div>
                  <button onClick={handleSaveResult} disabled={
                      (gameMode === 'SOLO' && !p1Name.trim()) ||
                      (gameMode === 'DUEL' && (!p1Name.trim() || !p2Name.trim())) ||
                      (gameMode === 'SQUAD' && (!p1Name.trim() || !p2Name.trim() || !p3Name.trim() || !p4Name.trim()))
                  } className="px-8 py-3 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-lg transition-colors border border-amber-400/30 w-full sm:w-auto">
                      SIMPAN HASIL
                  </button>
              </div>
            ) : (
              <div className="mt-4 mb-4 text-emerald-400 font-bold text-xl drop-shadow-md animate-pop-in shrink-0">
                  ✅ Hasil berhasil disimpan!
              </div>
            )}
            <button 
              onClick={handlePlayAgain}
              className="px-12 py-4 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-xl rounded-xl shadow-xl transition-colors cursor-pointer touch-manipulation flex-shrink-0 mb-8 border border-blue-400/30 animate-pop-in" style={{ animationDelay: '0.2s' }}
            >
              MAIN LAGI
            </button>
              </div>
            </div>
          </div>
        )}
</div>
    </div>
  );
}
