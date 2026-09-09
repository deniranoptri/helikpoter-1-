export class HelicopterEntity {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  targetX: number = 0;
  targetY: number = 0;
  
  width: number = 100; 
  height: number = 100;
  facingDirection: number = 1;
  paddingTop: number = 0;

  // Water Tank State
  maxWater: number = 100;
  currentWater: number = 100;
  isValveOpen: boolean = false;
  wasValveOpen: boolean = false;
  isSpraying: boolean = false;
  sprayTimer: number = 0;

  public update(dt: number, arenaWidth: number, arenaHeight: number) {
    // Movement logic...
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Arcade physics parameters
    const MAX_SPEED = 600; // px per sec
    const ACCEL = 2000;    // px per sec^2
    const DECEL_DIST = 150; // start decelerating when this close

    let targetSpeed = MAX_SPEED;
    if (dist < DECEL_DIST) {
      targetSpeed = MAX_SPEED * (dist / DECEL_DIST);
    }

    let tvX = 0;
    let tvY = 0;
    
    // Snapping logic to prevent infinite micro-adjustments
    if (dist > 2) {
      tvX = (dx / dist) * targetSpeed;
      tvY = (dy / dist) * targetSpeed;
      if (tvX < -5) this.facingDirection = 1;
      else if (tvX > 5) this.facingDirection = -1;
    } else {
      this.x = this.targetX;
      this.y = this.targetY;
      this.vx = 0;
      this.vy = 0;
      tvX = 0;
      tvY = 0;
    }

    // Accelerate/Decelerate towards target velocity
    const accelFactor = Math.min((ACCEL * dt) / MAX_SPEED, 1);
    this.vx += (tvX - this.vx) * accelFactor;
    this.vy += (tvY - this.vy) * accelFactor;

    // Apply velocity
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Boundary check (clamping)
    const halfW = this.width / 2;
    const halfH = this.height / 2;

    if (this.x < halfW) {
      this.x = halfW;
      this.vx = 0;
    } else if (this.x > arenaWidth - halfW) {
      this.x = arenaWidth - halfW;
      this.vx = 0;
    }

    const minY = halfH - this.paddingTop;
    if (this.y < minY) {
      this.y = minY;
      this.vy = 0;
    } else if (this.y > arenaHeight - halfH) {
      this.y = arenaHeight - halfH;
      this.vy = 0;
    }

    // Water Depletion (Edge-Triggered)
    if (this.isValveOpen && !this.wasValveOpen) {
      if (this.currentWater > 0) {
        const WATER_COST_PER_ACTION = 100 / 3;
        this.currentWater -= WATER_COST_PER_ACTION;
        if (this.currentWater < 0.1) {
          this.currentWater = 0;
        }
        this.isSpraying = true;
        this.sprayTimer = 0.5; // 500ms spray
      }
    }

    if (this.isSpraying) {
      this.sprayTimer -= dt;
      if (this.sprayTimer <= 0 || !this.isValveOpen) {
        this.isSpraying = false;
        this.sprayTimer = 0;
      }
    }

    this.wasValveOpen = this.isValveOpen;
  }

  public refillWater() {
    this.currentWater = this.maxWater;
  }
}
