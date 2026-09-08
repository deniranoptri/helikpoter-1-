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
console.log("Initial DISTRACTOR intensity:", distractor.intensity);

// Simulate player at x=200, y=645. dropGlobalX = 200, dropGlobalY = 645+75 = 720.
let dt = 1/60;
let waterActive = true;
let dropX = 200;
let dropY = 720;
let waterRadius = 160;

engine.update(dt, waterActive, dropX, dropY, waterRadius, 'P1', (hs) => {
    return hs.role === 'TARGET';
});

console.log("After update (centered on TARGET), TARGET intensity:", target.intensity);

