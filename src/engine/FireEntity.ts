export type EducationalChallengeState = 'UNLOCKED' | 'CHALLENGE_REQUIRED' | 'CHALLENGE_ACTIVE' | 'PASSED';

export class FireEntity {
  id: string;
  x: number;
  y: number;
  radius: number;
  intensity: number = 100;
  state: 'ACTIVE' | 'EXTINGUISHED' = 'ACTIVE';
  
  // Squad tracking
  educationalState: Record<'P1' | 'P2' | 'P3' | 'P4', EducationalChallengeState> = {
    P1: 'CHALLENGE_REQUIRED',
    P2: 'CHALLENGE_REQUIRED',
    P3: 'CHALLENGE_REQUIRED',
    P4: 'CHALLENGE_REQUIRED'
  };
  extinguishedBy: 'P1' | 'P2' | 'P3' | 'P4' | null = null;
  damageContribution: Record<'P1' | 'P2' | 'P3' | 'P4', number> = {
    P1: 0,
    P2: 0,
    P3: 0,
    P4: 0
  };

  constructor(id: string, x: number, y: number, radius: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
}
