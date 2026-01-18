/**
 * Panda & Dog - Design Tokens
 * Single source of truth for all visual styling
 *
 * Usage: import { PALETTE, SHADOWS, getAccent, getShadow } from './designTokens';
 */

// ============================================
// COLOR PALETTE
// ============================================

export const PALETTE = {
  // Primary (Backgrounds & Surfaces)
  deepVoid: 0x0d1117,
  slateGround: 0x21262d,
  stoneGray: 0x30363d,
  wallLight: 0x484f58,
  wallMid: 0x3a4048,

  // Accent Colors
  oceanBlue: 0x58a6ff,
  forestGreen: 0x3fb950,
  amberGold: 0xffd93d,
  sunsetOrange: 0xf0883e,

  // Semantic Colors
  dangerRed: 0xff6b6b,
  warningYellow: 0xffc107,
  successGreen: 0x238636,
  infoBlue: 0x388bfd,

  // Character Colors - Dog
  dogPrimary: 0x58a6ff,
  dogSecondary: 0x1f6feb,
  dogDark: 0x0d419d,

  // Character Colors - Panda
  pandaPrimary: 0x24292f,
  pandaSecondary: 0x0d1117,
  pandaLight: 0xf0f6fc,

  // Guard Colors
  guardBody: 0x3d424a,
  guardArmor: 0x484f58,
  guardCape: 0x4a1a1a,

  // Interactable Colors
  doorClosed: 0x6e4a2a,
  doorOpen: 0x4a3219,
  doorFrame: 0x3d2817,

  leverOff: 0x484f58,
  leverOn: 0x3fb950,
  leverBase: 0x30363d,

  buttonIdle: 0xf0883e,
  buttonPressed: 0xbd561d,
  buttonHover: 0xffa657,

  plateInactive: 0x484f58,
  plateActive: 0x3fb950,

  crateMain: 0xc9a227,
  crateDark: 0x9a7b1e,
  crateLight: 0xd4b52f,

  hazardActive: 0xff6b6b,
  hazardInactive: 0x6e7681,
  hazardGlow: 0xff4444,

  platformMain: 0x58a6ff,
  platformEdge: 0x388bfd,

  checkpointActive: 0x3fb950,
  checkpointInactive: 0x30363d,

  // Tile Colors
  tileGround: 0x21262d,
  tileGroundLight: 0x2d333b,
  tileGrass: 0x238636,
  tileGrassLight: 0x2ea043,
  tileStone: 0x30363d,
  tileStoneCrack: 0x21262d,
  tileWater: 0x1f6feb,
  tileWaterHighlight: 0x58a6ff,
  tileBridge: 0x6e4a2a,
  tileWall: 0x484f58,
  tileWallDark: 0x30363d,
  tileVoid: 0x0d1117,

  // UI Colors
  uiBackground: 0x161b22,
  uiSurface: 0x21262d,
  uiBorder: 0x30363d,
  uiText: 0xf0f6fc,
  uiTextSecondary: 0x8b949e,
  uiTextMuted: 0x6e7681,

  // Effects
  shadowColor: 0x000000,
  glowWhite: 0xffffff,
  outlineHighlight: 0xffd93d,
} as const;

// ============================================
// SHADOW PARAMETERS
// ============================================

export interface ShadowConfig {
  offsetX: number;
  offsetY: number;
  blur: number;
  alpha: number;
  color: number;
}

export const SHADOWS: Record<string, ShadowConfig> = {
  character: { offsetX: 4, offsetY: 3, blur: 0, alpha: 0.35, color: PALETTE.shadowColor },
  characterSmall: { offsetX: 3, offsetY: 2, blur: 0, alpha: 0.30, color: PALETTE.shadowColor },
  prop: { offsetX: 3, offsetY: 2, blur: 0, alpha: 0.30, color: PALETTE.shadowColor },
  interactable: { offsetX: 2, offsetY: 1, blur: 0, alpha: 0.25, color: PALETTE.shadowColor },
  subtle: { offsetX: 1, offsetY: 1, blur: 0, alpha: 0.20, color: PALETTE.shadowColor },
  none: { offsetX: 0, offsetY: 0, blur: 0, alpha: 0, color: PALETTE.shadowColor },
};

// ============================================
// OUTLINE PARAMETERS
// ============================================

export interface OutlineConfig {
  width: number;
  color: number;
  alpha: number;
  animated?: boolean;
}

export const OUTLINES: Record<string, OutlineConfig> = {
  playerAlways: { width: 1.5, color: PALETTE.glowWhite, alpha: 0.6 },
  selected: { width: 2, color: PALETTE.amberGold, alpha: 0.9, animated: true },
  hazard: { width: 1.5, color: PALETTE.dangerRed, alpha: 0.8, animated: true },
  interactable: { width: 1.5, color: PALETTE.amberGold, alpha: 0.7 },
  locked: { width: 1.5, color: PALETTE.dangerRed, alpha: 0.6, animated: true },
  guard: { width: 1, color: PALETTE.dangerRed, alpha: 0.5 },
  none: { width: 0, color: 0x000000, alpha: 0 },
};

// ============================================
// TYPOGRAPHY
// ============================================

export const TYPOGRAPHY = {
  fontPrimary: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  fontMono: 'JetBrains Mono, Fira Code, monospace',

  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 20,
    '2xl': 28,
  },

  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeights: {
    tight: 1.2,
    snug: 1.3,
    normal: 1.4,
    relaxed: 1.5,
  },
} as const;

// ============================================
// SPACING
// ============================================

export const SPACING = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// ============================================
// BORDER RADIUS
// ============================================

export const RADII = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// ============================================
// ANIMATION TIMING
// ============================================

export const TIMING = {
  fast: 100,
  normal: 200,
  slow: 400,
  slower: 600,
} as const;

// ============================================
// ISOMETRIC CONSTANTS
// ============================================

export const ISO = {
  tileWidth: 64,
  tileHeight: 32,
  tileDepth: 16,

  // Light direction factors (top-left light)
  lightTop: 1.0,      // Top face receives full light
  lightRight: 0.85,   // Right face slightly shadowed
  lightLeft: 0.70,    // Left face more shadowed
  lightAO: 0.60,      // Ambient occlusion at edges

  // Character hitbox
  dogRadius: 0.35,
  pandaRadius: 0.45,
} as const;

// ============================================
// Z-INDEX LAYERS
// ============================================

export const Z_LAYERS = {
  ground: 0,
  groundDecor: 50,
  props: 100,
  shadows: 150,
  characters: 200,
  effects: 300,
  projectiles: 350,
  uiWorld: 400,
  hud: 500,
  overlay: 600,
  modal: 700,
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Apply brightness adjustment to a color
 * @param color - Base color (hex number)
 * @param factor - Multiplier (1.0 = no change, 0.5 = 50% darker, 1.5 = 50% lighter)
 */
export function adjustBrightness(color: number, factor: number): number {
  const r = Math.min(255, Math.max(0, Math.floor(((color >> 16) & 0xff) * factor)));
  const g = Math.min(255, Math.max(0, Math.floor(((color >> 8) & 0xff) * factor)));
  const b = Math.min(255, Math.max(0, Math.floor((color & 0xff) * factor)));
  return (r << 16) | (g << 8) | b;
}

/**
 * Mix two colors together
 * @param color1 - First color (hex number)
 * @param color2 - Second color (hex number)
 * @param ratio - Mix ratio (0.0 = color1, 1.0 = color2)
 */
export function mixColors(color1: number, color2: number, ratio: number): number {
  const r1 = (color1 >> 16) & 0xff;
  const g1 = (color1 >> 8) & 0xff;
  const b1 = color1 & 0xff;

  const r2 = (color2 >> 16) & 0xff;
  const g2 = (color2 >> 8) & 0xff;
  const b2 = color2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);

  return (r << 16) | (g << 8) | b;
}

/**
 * Add alpha to a color for CSS rgba
 */
export function withAlpha(color: number, alpha: number): string {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Convert hex number to CSS hex string
 */
export function toHexString(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

/**
 * Get shadow configuration by importance level
 */
export function getShadow(importance: 'character' | 'prop' | 'interactable' | 'subtle' | 'none'): ShadowConfig {
  return SHADOWS[importance] ?? SHADOWS.none;
}

/**
 * Get outline configuration by type
 */
export function getOutline(type: 'playerAlways' | 'selected' | 'hazard' | 'interactable' | 'locked' | 'guard' | 'none'): OutlineConfig {
  return OUTLINES[type] ?? OUTLINES.none;
}

/**
 * Get accent color for interactable type
 */
export function getAccent(type: string): number {
  const accents: Record<string, number> = {
    door: PALETTE.doorClosed,
    lever: PALETTE.leverOn,
    button: PALETTE.buttonIdle,
    pressure_plate: PALETTE.plateActive,
    crate: PALETTE.crateMain,
    platform: PALETTE.platformMain,
    hazard: PALETTE.hazardActive,
    checkpoint: PALETTE.checkpointActive,
    guard: PALETTE.dangerRed,
    dog: PALETTE.dogPrimary,
    panda: PALETTE.pandaPrimary,
  };
  return accents[type] ?? PALETTE.amberGold;
}

/**
 * Get tile shading colors for isometric rendering
 */
export function getTileShading(baseColor: number): { top: number; right: number; left: number; ao: number } {
  return {
    top: baseColor,
    right: adjustBrightness(baseColor, ISO.lightRight),
    left: adjustBrightness(baseColor, ISO.lightLeft),
    ao: adjustBrightness(baseColor, ISO.lightAO),
  };
}

/**
 * Pulse animation helper - returns value between 0 and 1
 */
export function pulse(time: number, speed = 0.003): number {
  return (Math.sin(time * speed) + 1) / 2;
}

/**
 * Direction to angle conversion for character facing
 */
export function directionToAngle(dir: string): number {
  const angles: Record<string, number> = {
    'N': 0,
    'NE': 45,
    'E': 90,
    'SE': 135,
    'S': 180,
    'SW': 225,
    'W': 270,
    'NW': 315,
  };
  return angles[dir] ?? 180;
}

/**
 * Angle to direction conversion
 */
export function angleToDirection(angle: number): string {
  const normalized = ((angle % 360) + 360) % 360;
  if (normalized < 22.5 || normalized >= 337.5) return 'N';
  if (normalized < 67.5) return 'NE';
  if (normalized < 112.5) return 'E';
  if (normalized < 157.5) return 'SE';
  if (normalized < 202.5) return 'S';
  if (normalized < 247.5) return 'SW';
  if (normalized < 292.5) return 'W';
  return 'NW';
}

// ============================================
// STATE COLORS FOR COMPONENTS
// ============================================

export const STATE_COLORS = {
  door: {
    closed: { fill: PALETTE.doorClosed, outline: PALETTE.doorFrame },
    open: { fill: PALETTE.doorOpen, outline: PALETTE.doorFrame },
    locked: { fill: PALETTE.doorClosed, outline: PALETTE.dangerRed },
    hover: { fill: adjustBrightness(PALETTE.doorClosed, 1.15), outline: PALETTE.amberGold },
  },

  button: {
    idle: { fill: PALETTE.buttonIdle, outline: 0x000000 },
    hover: { fill: PALETTE.buttonHover, outline: PALETTE.amberGold },
    pressed: { fill: PALETTE.buttonPressed, outline: 0x000000 },
    disabled: { fill: PALETTE.wallLight, outline: 0x000000 },
  },

  plate: {
    inactive: { fill: PALETTE.plateInactive, glow: 0x000000 },
    active: { fill: PALETTE.plateActive, glow: PALETTE.forestGreen },
    heavy: { fill: PALETTE.plateInactive, glow: PALETTE.sunsetOrange },
  },

  crate: {
    idle: { fill: PALETTE.crateMain, outline: 0x000000 },
    hover: { fill: PALETTE.crateLight, outline: PALETTE.amberGold },
    pushing: { fill: PALETTE.crateMain, outline: 0x000000 },
  },

  hazard: {
    active: { fill: PALETTE.hazardActive, glow: PALETTE.hazardGlow },
    inactive: { fill: PALETTE.hazardInactive, glow: 0x000000 },
    warning: { fill: PALETTE.warningYellow, glow: PALETTE.amberGold },
  },

  lever: {
    off: { fill: PALETTE.leverOff, handle: PALETTE.dangerRed },
    on: { fill: PALETTE.leverOn, handle: PALETTE.forestGreen },
    hover: { fill: adjustBrightness(PALETTE.leverOff, 1.15), handle: PALETTE.amberGold },
  },

  guard: {
    idle: { vision: PALETTE.forestGreen, body: PALETTE.guardBody },
    suspicious: { vision: PALETTE.warningYellow, body: PALETTE.guardBody },
    alert: { vision: PALETTE.dangerRed, body: adjustBrightness(PALETTE.guardBody, 1.1) },
    returning: { vision: PALETTE.oceanBlue, body: PALETTE.guardBody },
  },
} as const;

// ============================================
// CAMERA & POST-PROCESSING
// ============================================

export const CAMERA = {
  // Vignette settings
  vignetteStrength: 0.15,
  vignetteRadius: 0.75,

  // Screen shake parameters
  shakeIntensity: {
    light: 3,
    medium: 6,
    heavy: 12,
  },
  shakeDuration: {
    light: 150,
    medium: 250,
    heavy: 400,
  },
  shakeDecay: 0.9,
} as const;

// ============================================
// DEBUG VISUALIZATION
// ============================================

export const DEBUG = {
  hitboxColor: 0xff00ff,
  hitboxAlpha: 0.5,
  hitboxStyle: 'dashed',

  interactionRangeColor: 0x00ffff,
  interactionRangeAlpha: 0.3,

  gridColor: 0xffffff,
  gridAlpha: 0.1,

  pathColor: 0x00ff00,
  pathAlpha: 0.4,
} as const;
