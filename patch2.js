const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf8');

// 1. Add ref
code = code.replace(
  "const cloudCooldownsRef = useRef<{P1: number, P2: number, P3: number, P4: number}>({P1: 0, P2: 0, P3: 0, P4: 0});",
  "const cloudCooldownsRef = useRef<{P1: number, P2: number, P3: number, P4: number}>({P1: 0, P2: 0, P3: 0, P4: 0});\n  const heliCollisionCooldownsRef = useRef<{P1: number, P2: number, P3: number, P4: number}>({P1: 0, P2: 0, P3: 0, P4: 0});"
);

// 2. Add to resets
code = code.replace(
  /cloudCooldownsRef\.current = \{P1: 0, P2: 0, P3: 0, P4: 0\};/g,
  "cloudCooldownsRef.current = {P1: 0, P2: 0, P3: 0, P4: 0};\n    heliCollisionCooldownsRef.current = {P1: 0, P2: 0, P3: 0, P4: 0};"
);

// 3. Add to loop
const collisionCode = `
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

          // Clamp targets to screen`;

code = code.replace(
  "          // Clamp targets to screen",
  collisionCode
);

fs.writeFileSync('src/components/Arena.tsx', code);
