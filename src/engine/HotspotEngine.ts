import { HotspotEntity } from './HotspotEntity';

export class HotspotEngine {
  private hotspots: HotspotEntity[] = [];

  public registerHotspot(hotspot: HotspotEntity) {
    this.hotspots.push(hotspot);
  }

  public getHotspots() {
    return this.hotspots;
  }

  public clearHotspots() {
    this.hotspots = [];
  }

  public update(dt: number, waterActive: boolean, waterX: number, waterY: number, waterRadius: number, playerId: 'P1' | 'P2' | 'P3' | 'P4' = 'P1', canDamage?: (hotspot: HotspotEntity) => boolean) {
    const DAMAGE_PER_SECOND = 40;

    if (!waterActive) return;

    const inRange = [];
    for (const hotspot of this.hotspots) {
      if (hotspot.state === 'EXTINGUISHED') continue;
      
      const dx = waterX - hotspot.x;
      const dy = waterY - hotspot.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= waterRadius + hotspot.radius) {
        inRange.push({ hotspot, dist });
      }
    }

    if (inRange.length === 0) return;

    inRange.sort((a, b) => a.dist - b.dist);

    if (inRange.length > 1) {
      if (Math.abs(inRange[0].dist - inRange[1].dist) < 20) {
        // Too ambiguous, do not damage either
        return;
      }
    }

    const target = inRange[0].hotspot;
    if (canDamage && !canDamage(target)) return;

    const damage = Math.min(target.intensity, DAMAGE_PER_SECOND * dt);
    target.intensity -= damage;
    target.damageContribution[playerId] += damage;

    if (target.intensity <= 0) {
      target.intensity = 0;
      target.state = 'EXTINGUISHED';
      
      let maxDamage = 0;
      let winner: 'P1' | 'P2' | 'P3' | 'P4' | null = null;
      for (const [pid, dmg] of Object.entries(target.damageContribution)) {
        if ((dmg as number) > maxDamage) {
          maxDamage = dmg as number;
          winner = pid as 'P1' | 'P2' | 'P3' | 'P4';
        }
      }
      target.extinguishedBy = winner;
    }
  }
}
