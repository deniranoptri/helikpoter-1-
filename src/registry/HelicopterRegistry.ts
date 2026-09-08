export type HelicopterId = 'HELI_GREEN' | 'HELI_BLUE' | 'HELI_YELLOW' | 'HELI_RED';

export interface Vector2 {
  x: number;
  y: number;
}

export interface HelicopterAssetDefinition {
  id: HelicopterId;
  displayName: string;
  assetUrl: string;
  width: number;       // Base logical width
  height: number;      // Base logical height
  aspectRatio: number;
  visualScale: number; // Normalized scale factor
  
  // Anchor points in local pixel coordinates [0, width] and [0, height]
  helicopterAnchor: Vector2;
  tankAnchor: Vector2;
  cableAnchor: Vector2;
  valveAnchor: Vector2;
  dropPoint: Vector2;  // Origin for future water drops (matches valve)
  rotorOffset: { x: number; y: number }; // Offset in percentage (x: left, y: top)
}

// Note: Dimensions and anchors were calibrated based on physical audit of 213x320 PNGs.
export const HELICOPTER_REGISTRY: Record<HelicopterId, HelicopterAssetDefinition> = {
  HELI_GREEN: {
    id: 'HELI_GREEN',
    displayName: 'Heli Hijau',
    assetUrl: 'https://raw.githubusercontent.com/deniranoptri/media/sibungas/Helikopter%20Hijau.png',
    width: 213,
    height: 320,
    aspectRatio: 213 / 320,
    visualScale: 1.0,
    helicopterAnchor: { x: 106.5, y: 80 },
    tankAnchor: { x: 106.5, y: 240 },
    cableAnchor: { x: 106.5, y: 160 },
    valveAnchor: { x: 106.5, y: 310 },
    dropPoint: { x: 106.5, y: 310 },
    rotorOffset: { x: 46.5, y: 9.6 },
  },
  HELI_BLUE: {
    id: 'HELI_BLUE',
    displayName: 'Heli Biru',
    assetUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhYDVoRnmkwz7tzJ8gCbdCE2MTCDkCpthRnaD6finiz_qOS43Y03FBorL9bje9AuhFswztA8TPBP0F_71PzHCbfJTlWUq_wA7AB6HdsD78n7vcEnkvS6mIdJcbeR6RWGa5S-Osnpz0qV0i4HEFBsVmmky5EWCeK6av8Xr-BRzRL_6RCHIAP4btmmRayw9E/s320/Helikopter%20Biru.png',
    width: 213,
    height: 320,
    aspectRatio: 213 / 320,
    visualScale: 1.0,
    helicopterAnchor: { x: 106.5, y: 80 },
    tankAnchor: { x: 106.5, y: 240 },
    cableAnchor: { x: 106.5, y: 160 },
    valveAnchor: { x: 106.5, y: 310 },
    dropPoint: { x: 106.5, y: 310 },
    rotorOffset: { x: 46, y: 7.8125 },
  },
  HELI_YELLOW: {
    id: 'HELI_YELLOW',
    displayName: 'Heli Kuning',
    assetUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEju5Dt5y3eA3p89ykz9XM1nqyXnlfn4Egiu3KDOb3hCzb18UrUgInfLBGlpbv89CD8yLh1xM_r8WW-kPRHM7EEf7mbjfjaUHMLzO9fS_CokENkTg5Idv_f8asMNVCxJk2fumbCV12N6AtDryfLBijb-NcPHKIOPg_mK2cTXTjYvgs82hq_96e68KMj7fN0/s320/Helikopter%20Kuning.png',
    width: 213,
    height: 320,
    aspectRatio: 213 / 320,
    visualScale: 1.0,
    helicopterAnchor: { x: 106.5, y: 80 },
    tankAnchor: { x: 106.5, y: 240 },
    cableAnchor: { x: 106.5, y: 160 },
    valveAnchor: { x: 106.5, y: 310 },
    dropPoint: { x: 106.5, y: 310 },
    rotorOffset: { x: 46, y: 7.8125 },
  },
  HELI_RED: {
    id: 'HELI_RED',
    displayName: 'Heli Merah',
    assetUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgZcSbGvMwYlzI8MUXDSW8PzB8C-Z461-SYWqBEhzJiKlj9j4oyf9IqSWuJbV2yfE2Ljf9X_lSPnSHcU-lbqkKQ9vE5cdSvyJYlUxnkeo-WtLyPIUx6PzA3kMZFoiueRrLIWWNFFze6oLSBDY2e3UzvpDZuFUFTC13Nul4vVjnXHGFFalJa9mbnyNhtuiQ/s320/Helikopter%20Merah.png',
    width: 213,
    height: 320,
    aspectRatio: 213 / 320,
    visualScale: 1.0,
    helicopterAnchor: { x: 106.5, y: 80 },
    tankAnchor: { x: 106.5, y: 240 },
    cableAnchor: { x: 106.5, y: 160 },
    valveAnchor: { x: 106.5, y: 310 },
    dropPoint: { x: 106.5, y: 310 },
    rotorOffset: { x: 46, y: 7.8125 },
  },
};

export const UNIVERSAL_ROTOR_URL = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEKlLFfpdZuK2iCwu9K4P0fxw_KEVJJ4HabQ-t5K_KQEUyIa_g8VyredSQpxaqeGUJMFbacdLWpH-EoFY9lM0FrRMn_0hi0bQNjU3e-hwb0nJX988eD7BDl2qZ1oJeGloW4zm9YuvGdp9rgFfFSBLr8iQzXLeX__G_Tbq3-Ve3YHDEOM96JOjAEAIm_Do/s320/Rotor.png';
