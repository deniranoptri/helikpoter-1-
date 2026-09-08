import { FireEntity } from './FireEntity';

export class FireEngine {
  private fires: FireEntity[] = [];

  public registerFire(fire: FireEntity) {
    this.fires.push(fire);
  }

  public getFires() {
    return this.fires;
  }

  public update(dt: number, waterActive: boolean, waterX: number, waterY: number, waterRadius: number, playerId: 'P1' | 'P2' | 'P3' | 'P4' = 'P1') {
    const DAMAGE_PER_SECOND = 40; // 2.5 seconds to extinguish

    for (const fire of this.fires) {
      if (fire.state === 'EXTINGUISHED') continue;
      // Educational lock check per player
      const edState = fire.educationalState[playerId];
      if (edState === 'CHALLENGE_REQUIRED' || edState === 'CHALLENGE_ACTIVE') continue;

      if (waterActive) {
        const dx = waterX - fire.x;
        const dy = waterY - fire.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= waterRadius + fire.radius) {
          const damage = Math.min(fire.intensity, DAMAGE_PER_SECOND * dt);
          fire.intensity -= damage;
          fire.damageContribution[playerId] += damage;

          if (fire.intensity <= 0) {
            fire.intensity = 0;
            fire.state = 'EXTINGUISHED';
            fire.extinguishedBy = playerId;
          }
        }
      }
    }
  }
}
