const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

const oldClamping = `          // Clamp targets to screen
          const safeTopZone = rect.width < 600 ? 90 : 110;
          entityP1.targetX = Math.max(scaledWidthP1/2, Math.min(rect.width - scaledWidthP1/2, entityP1.targetX));
          entityP1.targetY = Math.max(safeTopZone + scaledHeightP1/2, Math.min(rect.height - scaledHeightP1/2, entityP1.targetY));

          if (gameModeRef.current === 'SOLO') {
             // Reflect clamping back to input manager
             input.pointerX = entityP1.targetX;
             input.pointerY = entityP1.targetY;
          } else {
             entityP2.targetX = Math.max(scaledWidthP2/2, Math.min(rect.width - scaledWidthP2/2, entityP2.targetX));
             entityP2.targetY = Math.max(safeTopZone + scaledHeightP2/2, Math.min(rect.height - scaledHeightP2/2, entityP2.targetY));
             
             if (gameModeRef.current === 'SQUAD') {
               entityP3.targetX = Math.max(scaledWidthP3/2, Math.min(rect.width - scaledWidthP3/2, entityP3.targetX));
               entityP3.targetY = Math.max(safeTopZone + scaledHeightP3/2, Math.min(rect.height - scaledHeightP3/2, entityP3.targetY));
               
               entityP4.targetX = Math.max(scaledWidthP4/2, Math.min(rect.width - scaledWidthP4/2, entityP4.targetX));
               entityP4.targetY = Math.max(safeTopZone + scaledHeightP4/2, Math.min(rect.height - scaledHeightP4/2, entityP4.targetY));
             }
          }`;

const newClamping = `          // Clamp targets to screen
          entityP1.targetX = Math.max(scaledWidthP1/2, Math.min(rect.width - scaledWidthP1/2, entityP1.targetX));
          entityP1.targetY = Math.max(scaledHeightP1/2, Math.min(rect.height - scaledHeightP1/2, entityP1.targetY));

          if (gameModeRef.current === 'SOLO') {
             // Reflect clamping back to input manager
             input.pointerX = entityP1.targetX;
             input.pointerY = entityP1.targetY;
          } else {
             entityP2.targetX = Math.max(scaledWidthP2/2, Math.min(rect.width - scaledWidthP2/2, entityP2.targetX));
             entityP2.targetY = Math.max(scaledHeightP2/2, Math.min(rect.height - scaledHeightP2/2, entityP2.targetY));
             
             if (gameModeRef.current === 'SQUAD') {
               entityP3.targetX = Math.max(scaledWidthP3/2, Math.min(rect.width - scaledWidthP3/2, entityP3.targetX));
               entityP3.targetY = Math.max(scaledHeightP3/2, Math.min(rect.height - scaledHeightP3/2, entityP3.targetY));
               
               entityP4.targetX = Math.max(scaledWidthP4/2, Math.min(rect.width - scaledWidthP4/2, entityP4.targetX));
               entityP4.targetY = Math.max(scaledHeightP4/2, Math.min(rect.height - scaledHeightP4/2, entityP4.targetY));
             }
          }`;

code = code.replace(oldClamping, newClamping);
fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Fixed clamping');
