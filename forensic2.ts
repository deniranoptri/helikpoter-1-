import { HotspotEntity } from './src/engine/HotspotEntity';
import { HotspotEngine } from './src/engine/HotspotEngine';

const engine = new HotspotEngine();

// Target 1: CORRECT (250 liter)
const target = new HotspotEntity('target', 200, 720, 40);
target.role = 'TARGET';
engine.registerHotspot(target);

// Target 2: WRONG (750 liter)
const distractor = new HotspotEntity('distractor', 824, 720, 40);
distractor.role = 'DISTRACTOR';
engine.registerHotspot(distractor);

console.log("Initial TARGET intensity:", target.intensity);

// Simulate player aiming at TOP of visual fire (y=480)
let dt = 1/60;
let dropX = 200;
let dropY = 480;
let waterRadius = 160;

engine.update(dt, true, dropX, dropY, waterRadius, 'P1', (hs) => hs.role === 'TARGET');

console.log("After update (aiming at top of fire, dropY=480), TARGET intensity:", target.intensity);

