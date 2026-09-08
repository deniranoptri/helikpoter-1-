import { HELICOPTER_REGISTRY, HelicopterId, HelicopterAssetDefinition } from './HelicopterRegistry';

export type LoadStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

export interface AssetState {
  id: HelicopterId;
  status: LoadStatus;
  element: HTMLImageElement | null;
  definition: HelicopterAssetDefinition;
  naturalWidth: number;
  naturalHeight: number;
}

class AssetLoaderService {
  private cache: Map<HelicopterId, AssetState> = new Map();

  constructor() {
    // Initialize cache with IDLE state
    Object.values(HELICOPTER_REGISTRY).forEach(def => {
      this.cache.set(def.id, {
        id: def.id,
        status: 'IDLE',
        element: null,
        definition: def,
        naturalWidth: 0,
        naturalHeight: 0
      });
    });
  }

  public async preloadAll(): Promise<void> {
    const promises = Object.values(HELICOPTER_REGISTRY).map(def => this.loadAsset(def.id));
    await Promise.all(promises);
  }

  public async loadAsset(id: HelicopterId): Promise<AssetState> {
    const state = this.cache.get(id);
    if (!state) throw new Error(`Unknown asset id: ${id}`);
    
    if (state.status === 'SUCCESS' || state.status === 'LOADING') {
      return state;
    }

    state.status = 'LOADING';
    this.cache.set(id, { ...state });

    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const successState: AssetState = {
          ...state,
          status: 'SUCCESS',
          element: img,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        };
        this.cache.set(id, successState);
        resolve(successState);
      };

      img.onerror = () => {
        console.error(`Failed to load helicopter asset: ${state.definition.assetUrl}`);
        const errorState: AssetState = {
          ...state,
          status: 'ERROR',
          element: null
        };
        this.cache.set(id, errorState);
        resolve(errorState);
      };

      // Set src after binding events
      img.src = state.definition.assetUrl;
    });
  }

  public getAssetState(id: HelicopterId): AssetState {
    const state = this.cache.get(id);
    if (!state) throw new Error(`Unknown asset id: ${id}`);
    return state;
  }

  public getAllAssets(): AssetState[] {
    return Array.from(this.cache.values());
  }
}

export const AssetLoader = new AssetLoaderService();
