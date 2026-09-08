const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

const oldFuncStart = 'const handleDirectAnswer = (opt: string) => {';
const oldFuncEnd = 'const handleSelectMode = (mode: GameMode) => {';

const newFunc = `  const handleDirectAnswer = (opt: string) => {
    const hs = hotspotEngine.getHotspots();
    const targetFire = hs.find(h => h.displayContent === opt);
    
    if (targetFire) {
      const pId = 'P1';
      
      const isDistractor = targetFire.role === 'DISTRACTOR';
      const isOutOfSequence = targetFire.role === 'TARGET' && targetFire.orderIndex !== undefined && targetFire.orderIndex !== activeMissionSequenceRef.current;
      
      if (isDistractor || isOutOfSequence) {
         // Incorrect answer
         sharedEducationalEngine.checkAnswer(targetFire.contentId!, targetFire.displayContent!);
         
         streaksRef.current[pId] = 0;
         setStreaks({ ...streaksRef.current });
         
         const msg = 'Belum tepat. Coba lagi!';
         setMissionFeedback({message: msg, isError: true});
         setTimeout(() => setMissionFeedback(null), 2000);
         sharedAudioEngine.play('error');
         
      } else {
         // Correct answer
         sharedEducationalEngine.checkAnswer(targetFire.contentId!, targetFire.displayContent!);
         scoreEngineP1.recordFireExtinguished(targetFire.id);
         
         targetFire.extinguishedBy = pId;
         targetFire.state = 'EXTINGUISHED';
         hotspotEngine.removeHotspot(targetFire.id);
         
         if (targetFire.orderIndex !== undefined) {
             activeMissionSequenceRef.current = targetFire.orderIndex + 1;
         }
         
         if (missionProgressRef.current) {
            missionProgressRef.current.completed++;
            setMissionProgress({ ...missionProgressRef.current });
         }
         
         streaksRef.current[pId] += 1;
         if (streaksRef.current[pId] >= 5) {
             streaksRef.current[pId] = 0;
             if (livesRef.current[pId] < 5) {
                 livesRef.current[pId] += 1;
             }
             triggerStreakReward(pId);
         }
         setStreaks({ ...streaksRef.current });
         setLives({ ...livesRef.current });
         
         setMissionFeedback({message: 'API PADAM!', isError: false});
         setTimeout(() => setMissionFeedback(null), 1500);
         sharedAudioEngine.playExtinguish();
      }
      
      // Update scores
      const newEdSession = sharedEducationalEngine.getSessionState();
      setHudScores({
         P1: scoreEngineP1.getScore(newEdSession.correctAnswers, newEdSession.incorrectAnswers).fireScore,
         P2: scoreEngineP2.getScore(newEdSession.correctAnswers, newEdSession.incorrectAnswers).fireScore,
         P3: scoreEngineP3.getScore(newEdSession.correctAnswers, newEdSession.incorrectAnswers).fireScore,
         P4: scoreEngineP4.getScore(newEdSession.correctAnswers, newEdSession.incorrectAnswers).fireScore,
      });
      
      // Check for mission completion
      const targetsLeft = hotspotEngine.getHotspots().filter(f => f.role === 'TARGET' && f.state === 'ACTIVE').length;
      setActiveFiresCount(targetsLeft);
      activeFiresCountRef.current = targetsLeft;
      
      if (targetsLeft <= 0) {
          setTimeout(() => spawnNextMission(), 1000);
      }
    }
  };

  `;

code = code.substring(0, code.indexOf(oldFuncStart)) + newFunc + code.substring(code.indexOf(oldFuncEnd));
fs.writeFileSync('src/components/Arena.tsx', code);
console.log('Fixed handleDirectAnswer');
