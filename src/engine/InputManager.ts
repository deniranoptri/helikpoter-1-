export class InputManager {
  private static instance: InputManager;
  
  // Expose aggregated state for backward compatibility and simple polling
  public pointerX: number = 0;
  public pointerY: number = 0;
  public isPointerDown: boolean = false;
  
  public isDropActive: boolean = false;

  // Track independent pointers
  private activePointers = new Map<number, {x: number, y: number}>();
  // We define a primary pointer to avoid teleporting if multiple touches are on screen
  private primaryPointerId: number | null = null;

  private constructor() {}

  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  public handlePointerDown(id: number, x: number, y: number) {
    this.activePointers.set(id, { x, y });
    
    // Promote to primary if there's no primary, or the previous primary was lost
    if (this.primaryPointerId === null || !this.activePointers.has(this.primaryPointerId)) {
      this.primaryPointerId = id;
    }
    
    this.updateAggregatedState();
  }

  public handlePointerMove(id: number, x: number, y: number) {
    if (this.activePointers.has(id)) {
      this.activePointers.set(id, { x, y });
      this.updateAggregatedState();
    }
  }

  public handlePointerUp(id: number) {
    this.activePointers.delete(id);
    
    // If the primary pointer is released, promote another active pointer if available
    if (this.primaryPointerId === id) {
      if (this.activePointers.size > 0) {
        // Promote the first available pointer
        this.primaryPointerId = this.activePointers.keys().next().value || null;
      } else {
        this.primaryPointerId = null;
      }
    }
    
    this.updateAggregatedState();
  }

  private updateAggregatedState() {
    if (this.primaryPointerId !== null && this.activePointers.has(this.primaryPointerId)) {
      this.isPointerDown = true;
      const primary = this.activePointers.get(this.primaryPointerId)!;
      this.pointerX = primary.x;
      this.pointerY = primary.y;
    } else {
      this.isPointerDown = false;
    }
  }

  // Deprecated: kept for compatibility if needed elsewhere
  public setTarget(x: number, y: number) {
    this.pointerX = x;
    this.pointerY = y;
  }
  public setPointerDown(isDown: boolean) {
    this.isPointerDown = isDown;
  }

  public setDropActive(isActive: boolean) {
    this.isDropActive = isActive;
  }
}
