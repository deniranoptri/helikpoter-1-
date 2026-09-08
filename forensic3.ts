import { HotspotEntity } from './src/engine/HotspotEntity';
import { HotspotEngine } from './src/engine/HotspotEngine';

const engine = new HotspotEngine();

// Target 1: CORRECT (250 liter)
const target = new HotspotEntity('target', 200, 777, 40);
target.role = 'TARGET';
engine.registerHotspot(target);

// Target 2: WRONG (750 liter)
const distractor = new HotspotEntity('distractor', 800, 777, 40);
distractor.role = 'DISTRACTOR';
engine.registerHotspot(distractor);

console.log("=== BEFORE GEOMETRY (Conceptual) ===");
console.log("Logical Hotspot Center: y = 777");
console.log("Visual Fire Top: y = 537");
console.log("Visual Fire Bottom: y = 777");
console.log("Visual Fire Center: y = 657");

console.log("\n=== AFTER GEOMETRY (Conceptual) ===");
console.log("Logical Hotspot Center: y = 777");
console.log("Visual Fire Top: y = 657");
console.log("Visual Fire Bottom: y = 897");
console.log("Visual Fire Center: y = 777");
console.log("transform: translate(-50%, -50%) scale(1.5)");
console.log("transform-origin: center");

let dt = 1/60;
let waterRadius = 160;

// Test A: Target Center
let dropX = 200;
let dropY = 777; // Logical center
engine.update(dt, true, dropX, dropY, waterRadius, 'P1', (hs) => hs.role === 'TARGET');
console.log(`\nTest A (Target Center dropY=777) => TARGET intensity: ${target.intensity}`);

// Reset
target.intensity = 100;
distractor.intensity = 100;

// Test B: Visual Fire Center (now the same as logical center!)
dropX = 200;
dropY = 777; // Visual fire center is now 777
engine.update(dt, true, dropX, dropY, waterRadius, 'P1', (hs) => hs.role === 'TARGET');
console.log(`Test B (Visual Fire Center dropY=777) => TARGET intensity: ${target.intensity}`);

// Reset
target.intensity = 100;
distractor.intensity = 100;

// Test C: Reasonable aiming position inside visible fire (e.g. dropY=700, near the top visual flame)
dropX = 200;
dropY = 700; // 77px away from logical center (77 <= 200 is true)
engine.update(dt, true, dropX, dropY, waterRadius, 'P1', (hs) => hs.role === 'TARGET');
console.log(`Test C (Reasonable Aim dropY=700) => TARGET intensity: ${target.intensity}`);

// Reset
target.intensity = 100;
distractor.intensity = 100;

// Test D: Wrong target
dropX = 800;
dropY = 777;
engine.update(dt, true, dropX, dropY, waterRadius, 'P1', (hs) => hs.role === 'TARGET');
console.log(`Test D (Wrong Target dropX=800) => DISTRACTOR intensity: ${distractor.intensity}`);

// Reset
target.intensity = 100;
distractor.intensity = 100;

// Test E: Just outside spray zone (dropY = 777 - 201 = 576)
dropX = 200;
dropY = 576; // 201px away
engine.update(dt, true, dropX, dropY, waterRadius, 'P1', (hs) => hs.role === 'TARGET');
console.log(`Test E (Just outside spray zone dropY=576) => TARGET intensity: ${target.intensity}`);

