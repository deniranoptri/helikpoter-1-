export type HotspotState = 'ACTIVE' | 'EXTINGUISHED';
export type HotspotRole = 'TARGET' | 'DISTRACTOR' | 'HAZARD' | 'PRIORITY' | 'BONUS';

export class HotspotEntity {
  id: string;
  x: number;
  y: number;
  radius: number;
  intensity: number;
  waterRequired: number;
  state: HotspotState;
  
  extinguishedBy: 'P1' | 'P2' | 'P3' | 'P4' | null;
  damageContribution: Record<'P1' | 'P2' | 'P3' | 'P4', number>;

  // Content Representation
  contentId?: string;
  displayContent?: string;
  role?: HotspotRole;
  orderIndex?: number;
  educationalState?: Record<'P1' | 'P2' | 'P3' | 'P4', 'UNLOCKED' | 'CHALLENGE_REQUIRED' | 'CHALLENGE_ACTIVE'>;

  constructor(id: string, x: number, y: number, radius: number = 40) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.intensity = 100;
    this.waterRequired = 100;
    this.state = 'ACTIVE';
    this.extinguishedBy = null;
    this.damageContribution = { P1: 0, P2: 0, P3: 0, P4: 0 };
    this.educationalState = { P1: 'UNLOCKED', P2: 'UNLOCKED', P3: 'UNLOCKED', P4: 'UNLOCKED' };
  }
}
