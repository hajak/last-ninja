/**
 * Panda & Dog - Render Style Module
 * Centralized rendering utilities using design tokens
 *
 * All rendering should use these helpers for consistency.
 */

import { Graphics, Container, BlurFilter } from 'pixi.js';
import {
  PALETTE,
  SHADOWS,
  OUTLINES,
  ISO,
  adjustBrightness,
  getTileShading,
  pulse,
  type ShadowConfig,
  type OutlineConfig,
} from '../../../shared/designTokens';

// ============================================
// SHADOW RENDERING
// ============================================

/**
 * Draw a contact shadow ellipse
 */
export function drawContactShadow(
  graphics: Graphics,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  config: ShadowConfig = SHADOWS.character
): void {
  graphics.beginFill(config.color, config.alpha);
  graphics.drawEllipse(x + config.offsetX, y + config.offsetY, radiusX, radiusY * 0.5);
  graphics.endFill();
}

/**
 * Draw a drop shadow for props/characters
 */
export function drawDropShadow(
  graphics: Graphics,
  width: number,
  height: number,
  config: ShadowConfig = SHADOWS.prop
): void {
  const shadowWidth = width * 0.8;
  const shadowHeight = height * 0.3;

  graphics.beginFill(config.color, config.alpha);
  graphics.drawEllipse(config.offsetX, config.offsetY + height / 2, shadowWidth / 2, shadowHeight / 2);
  graphics.endFill();
}

/**
 * Draw ambient occlusion along an edge
 */
export function drawAmbientOcclusion(
  graphics: Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number = 3,
  alpha: number = 0.25
): void {
  graphics.lineStyle(width, PALETTE.shadowColor, alpha);
  graphics.moveTo(x1, y1);
  graphics.lineTo(x2, y2);
  graphics.lineStyle(0);
}

// ============================================
// OUTLINE RENDERING
// ============================================

/**
 * Draw an outline around a shape (for hover/selection)
 */
export function drawOutline(
  graphics: Graphics,
  drawShape: (g: Graphics) => void,
  config: OutlineConfig,
  time: number = 0
): void {
  if (config.width <= 0) return;

  let alpha = config.alpha;
  if (config.animated) {
    alpha *= 0.5 + pulse(time, 0.005) * 0.5;
  }

  graphics.lineStyle(config.width, config.color, alpha);
  drawShape(graphics);
  graphics.lineStyle(0);
}

/**
 * Draw a glow effect (soft outline)
 */
export function drawGlow(
  graphics: Graphics,
  x: number,
  y: number,
  radius: number,
  color: number,
  alpha: number = 0.3,
  time: number = 0
): void {
  const pulseAlpha = alpha * (0.6 + pulse(time, 0.004) * 0.4);

  // Outer glow
  graphics.beginFill(color, pulseAlpha * 0.3);
  graphics.drawCircle(x, y, radius * 1.5);
  graphics.endFill();

  // Inner glow
  graphics.beginFill(color, pulseAlpha * 0.6);
  graphics.drawCircle(x, y, radius);
  graphics.endFill();
}

// ============================================
// ISOMETRIC TILE RENDERING
// ============================================

/**
 * Draw an isometric tile top face
 */
export function drawTileTop(
  graphics: Graphics,
  x: number,
  y: number,
  color: number,
  tileWidth: number = ISO.tileWidth,
  tileHeight: number = ISO.tileHeight
): void {
  const halfW = tileWidth / 2;
  const halfH = tileHeight / 2;

  graphics.beginFill(color);
  graphics.moveTo(x, y - halfH);         // Top
  graphics.lineTo(x + halfW, y);         // Right
  graphics.lineTo(x, y + halfH);         // Bottom
  graphics.lineTo(x - halfW, y);         // Left
  graphics.closePath();
  graphics.endFill();
}

/**
 * Draw an isometric tile left face (shadowed)
 */
export function drawTileLeft(
  graphics: Graphics,
  x: number,
  y: number,
  depth: number,
  color: number,
  tileWidth: number = ISO.tileWidth
): void {
  const halfW = tileWidth / 2;
  const shadedColor = adjustBrightness(color, ISO.lightLeft);

  graphics.beginFill(shadedColor);
  graphics.moveTo(x - halfW, y);
  graphics.lineTo(x, y + ISO.tileHeight / 2);
  graphics.lineTo(x, y + ISO.tileHeight / 2 + depth);
  graphics.lineTo(x - halfW, y + depth);
  graphics.closePath();
  graphics.endFill();
}

/**
 * Draw an isometric tile right face (slightly shadowed)
 */
export function drawTileRight(
  graphics: Graphics,
  x: number,
  y: number,
  depth: number,
  color: number,
  tileWidth: number = ISO.tileWidth
): void {
  const halfW = tileWidth / 2;
  const shadedColor = adjustBrightness(color, ISO.lightRight);

  graphics.beginFill(shadedColor);
  graphics.moveTo(x + halfW, y);
  graphics.lineTo(x, y + ISO.tileHeight / 2);
  graphics.lineTo(x, y + ISO.tileHeight / 2 + depth);
  graphics.lineTo(x + halfW, y + depth);
  graphics.closePath();
  graphics.endFill();
}

/**
 * Draw a complete isometric tile with all faces and AO
 */
export function drawIsometricTile(
  graphics: Graphics,
  x: number,
  y: number,
  baseColor: number,
  elevation: number = 0,
  drawAO: boolean = true
): void {
  const depth = elevation * ISO.tileDepth;
  const adjustedY = y - depth;
  const shading = getTileShading(baseColor);

  // Draw faces in order (back to front)
  if (depth > 0) {
    drawTileLeft(graphics, x, adjustedY, depth, baseColor);
    drawTileRight(graphics, x, adjustedY, depth, baseColor);
  }

  drawTileTop(graphics, x, adjustedY, shading.top);

  // Ambient occlusion at edges
  if (drawAO && depth > 0) {
    drawAmbientOcclusion(
      graphics,
      x - ISO.tileWidth / 2, adjustedY + depth,
      x, adjustedY + ISO.tileHeight / 2 + depth,
      2, 0.2
    );
  }
}

/**
 * Draw an isometric wall block
 */
export function drawWall(
  graphics: Graphics,
  x: number,
  y: number,
  height: number = 1,
  baseColor: number = PALETTE.tileWall
): void {
  const wallHeight = height * ISO.tileDepth * 2;
  const shading = getTileShading(baseColor);

  // Left face (darkest)
  graphics.beginFill(shading.left);
  graphics.moveTo(x - ISO.tileWidth / 2, y);
  graphics.lineTo(x, y + ISO.tileHeight / 2);
  graphics.lineTo(x, y + ISO.tileHeight / 2 - wallHeight);
  graphics.lineTo(x - ISO.tileWidth / 2, y - wallHeight);
  graphics.closePath();
  graphics.endFill();

  // Right face (medium)
  graphics.beginFill(shading.right);
  graphics.moveTo(x + ISO.tileWidth / 2, y);
  graphics.lineTo(x, y + ISO.tileHeight / 2);
  graphics.lineTo(x, y + ISO.tileHeight / 2 - wallHeight);
  graphics.lineTo(x + ISO.tileWidth / 2, y - wallHeight);
  graphics.closePath();
  graphics.endFill();

  // Top face (lightest)
  graphics.beginFill(shading.top);
  graphics.moveTo(x, y - wallHeight - ISO.tileHeight / 2);
  graphics.lineTo(x + ISO.tileWidth / 2, y - wallHeight);
  graphics.lineTo(x, y + ISO.tileHeight / 2 - wallHeight);
  graphics.lineTo(x - ISO.tileWidth / 2, y - wallHeight);
  graphics.closePath();
  graphics.endFill();

  // AO at base
  drawAmbientOcclusion(graphics, x - ISO.tileWidth / 2, y, x, y + ISO.tileHeight / 2, 3, 0.25);
  drawAmbientOcclusion(graphics, x + ISO.tileWidth / 2, y, x, y + ISO.tileHeight / 2, 3, 0.2);
}

// ============================================
// CHARACTER RENDERING HELPERS
// ============================================

/**
 * Draw character outline for visibility
 */
export function drawCharacterOutline(
  graphics: Graphics,
  drawBody: (g: Graphics) => void,
  isLocalPlayer: boolean,
  time: number
): void {
  const config = OUTLINES.playerAlways;
  const alpha = isLocalPlayer ? config.alpha : config.alpha * 0.5;

  // Draw slightly larger behind for outline effect
  graphics.lineStyle(config.width + 1, config.color, alpha * 0.5);
  drawBody(graphics);
  graphics.lineStyle(0);
}

/**
 * Draw facing direction indicator
 */
export function drawFacingIndicator(
  graphics: Graphics,
  x: number,
  y: number,
  angle: number,
  color: number,
  length: number = 12
): void {
  const rad = (angle - 90) * (Math.PI / 180);
  const endX = x + Math.cos(rad) * length;
  const endY = y + Math.sin(rad) * length;

  graphics.lineStyle(2, color, 0.6);
  graphics.moveTo(x, y);
  graphics.lineTo(endX, endY);

  // Arrow head
  const headSize = 4;
  const headAngle1 = rad + Math.PI * 0.75;
  const headAngle2 = rad - Math.PI * 0.75;

  graphics.lineTo(endX + Math.cos(headAngle1) * headSize, endY + Math.sin(headAngle1) * headSize);
  graphics.moveTo(endX, endY);
  graphics.lineTo(endX + Math.cos(headAngle2) * headSize, endY + Math.sin(headAngle2) * headSize);
  graphics.lineStyle(0);
}

// ============================================
// INTERACTABLE RENDERING HELPERS
// ============================================

/**
 * Draw hover highlight for interactables
 */
export function drawInteractableHighlight(
  graphics: Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  time: number
): void {
  const config = OUTLINES.selected;
  const pulseVal = pulse(time, 0.005);

  // Glow effect
  graphics.beginFill(config.color, 0.1 + pulseVal * 0.1);
  graphics.drawRoundedRect(x - width / 2 - 4, y - height - 4, width + 8, height + 8, 4);
  graphics.endFill();

  // Border
  graphics.lineStyle(config.width, config.color, config.alpha * (0.7 + pulseVal * 0.3));
  graphics.drawRoundedRect(x - width / 2 - 2, y - height - 2, width + 4, height + 4, 3);
  graphics.lineStyle(0);
}

/**
 * Draw interaction prompt indicator
 */
export function drawInteractionPrompt(
  graphics: Graphics,
  x: number,
  y: number,
  key: string = 'E',
  time: number
): void {
  const bob = Math.sin(time * 0.003) * 3;
  const promptY = y - 40 + bob;

  // Background bubble
  graphics.beginFill(PALETTE.uiSurface, 0.9);
  graphics.lineStyle(2, PALETTE.amberGold, 0.8);
  graphics.drawRoundedRect(x - 14, promptY - 12, 28, 24, 6);
  graphics.lineStyle(0);
  graphics.endFill();

  // Key background
  graphics.beginFill(PALETTE.amberGold);
  graphics.drawRoundedRect(x - 10, promptY - 8, 20, 16, 4);
  graphics.endFill();
}

// ============================================
// HAZARD RENDERING
// ============================================

/**
 * Draw hazard warning indicator
 */
export function drawHazardWarning(
  graphics: Graphics,
  x: number,
  y: number,
  radius: number,
  time: number
): void {
  const pulseVal = pulse(time, 0.008);

  // Pulsing danger ring
  graphics.lineStyle(2, PALETTE.dangerRed, 0.3 + pulseVal * 0.4);
  graphics.drawCircle(x, y, radius * (1 + pulseVal * 0.2));

  // Inner glow
  graphics.beginFill(PALETTE.dangerRed, 0.1 + pulseVal * 0.15);
  graphics.drawCircle(x, y, radius * 0.7);
  graphics.endFill();
  graphics.lineStyle(0);
}

/**
 * Draw laser beam
 */
export function drawLaserBeam(
  graphics: Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  time: number,
  active: boolean = true
): void {
  if (!active) {
    graphics.lineStyle(2, PALETTE.hazardInactive, 0.3);
    graphics.moveTo(x1, y1);
    graphics.lineTo(x2, y2);
    graphics.lineStyle(0);
    return;
  }

  const pulseVal = pulse(time, 0.006);

  // Outer glow
  graphics.lineStyle(8, PALETTE.dangerRed, 0.2 + pulseVal * 0.2);
  graphics.moveTo(x1, y1);
  graphics.lineTo(x2, y2);

  // Core beam
  graphics.lineStyle(3, PALETTE.hazardGlow, 0.8 + pulseVal * 0.2);
  graphics.moveTo(x1, y1);
  graphics.lineTo(x2, y2);

  // Bright center
  graphics.lineStyle(1, PALETTE.glowWhite, 0.9);
  graphics.moveTo(x1, y1);
  graphics.lineTo(x2, y2);

  graphics.lineStyle(0);
}

// ============================================
// GUARD VISION CONE
// ============================================

/**
 * Draw guard vision cone
 */
export function drawVisionCone(
  graphics: Graphics,
  x: number,
  y: number,
  facing: number,
  visionAngle: number,
  visionRange: number,
  alertState: 'idle' | 'suspicious' | 'alert' | 'returning',
  time: number
): void {
  const colors = {
    idle: PALETTE.forestGreen,
    suspicious: PALETTE.warningYellow,
    alert: PALETTE.dangerRed,
    returning: PALETTE.oceanBlue,
  };

  const alphas = {
    idle: 0.12,
    suspicious: 0.18,
    alert: 0.25,
    returning: 0.15,
  };

  const color = colors[alertState];
  let alpha = alphas[alertState];

  // Pulse when alert
  if (alertState === 'alert' || alertState === 'suspicious') {
    alpha += pulse(time, 0.006) * 0.1;
  }

  const rangePixels = visionRange * ISO.tileWidth / 2;
  const halfAngle = (visionAngle / 2) * (Math.PI / 180);
  const facingRad = facing * (Math.PI / 180);

  // Draw cone
  graphics.beginFill(color, alpha);
  graphics.moveTo(x, y);

  const segments = 24;
  for (let i = 0; i <= segments; i++) {
    const angle = facingRad - halfAngle + (halfAngle * 2 * i) / segments;
    const px = x + Math.cos(angle) * rangePixels;
    const py = y + Math.sin(angle) * rangePixels * 0.5; // Flatten for isometric
    graphics.lineTo(px, py);
  }

  graphics.closePath();
  graphics.endFill();

  // Edge highlight
  if (alertState !== 'idle') {
    graphics.lineStyle(1, color, alpha * 2);
    graphics.moveTo(x, y);
    for (let i = 0; i <= segments; i++) {
      const angle = facingRad - halfAngle + (halfAngle * 2 * i) / segments;
      const px = x + Math.cos(angle) * rangePixels;
      const py = y + Math.sin(angle) * rangePixels * 0.5;
      graphics.lineTo(px, py);
    }
    graphics.lineStyle(0);
  }
}

// ============================================
// UI COMPONENTS
// ============================================

/**
 * Draw a compact health bar
 */
export function drawHealthBar(
  graphics: Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  fillPercent: number,
  color: number = PALETTE.dangerRed
): void {
  // Background
  graphics.beginFill(PALETTE.uiSurface, 0.8);
  graphics.drawRoundedRect(x, y, width, height, height / 2);
  graphics.endFill();

  // Fill
  if (fillPercent > 0) {
    const fillWidth = Math.max(height, width * fillPercent);
    graphics.beginFill(color);
    graphics.drawRoundedRect(x + 1, y + 1, fillWidth - 2, height - 2, (height - 2) / 2);
    graphics.endFill();

    // Highlight
    graphics.beginFill(PALETTE.glowWhite, 0.3);
    graphics.drawRoundedRect(x + 2, y + 2, fillWidth - 4, height / 3, height / 4);
    graphics.endFill();
  }

  // Border
  graphics.lineStyle(1, PALETTE.uiBorder, 0.5);
  graphics.drawRoundedRect(x, y, width, height, height / 2);
  graphics.lineStyle(0);
}

/**
 * Draw minimap tile
 */
export function drawMinimapTile(
  graphics: Graphics,
  x: number,
  y: number,
  size: number,
  tileType: string,
  elevation: number = 0
): void {
  const colors: Record<string, number> = {
    ground: PALETTE.slateGround,
    grass: PALETTE.tileGrass,
    stone: PALETTE.stoneGray,
    water: PALETTE.tileWater,
    wall: PALETTE.wallLight,
    bridge: PALETTE.tileBridge,
    void: PALETTE.deepVoid,
  };

  let color = colors[tileType] ?? PALETTE.slateGround;

  // Lighten based on elevation
  if (elevation > 0) {
    color = adjustBrightness(color, 1 + elevation * 0.1);
  }

  graphics.beginFill(color);
  graphics.drawRect(x, y, size, size);
  graphics.endFill();
}

// ============================================
// VIGNETTE EFFECT
// ============================================

/**
 * Create vignette overlay
 */
export function createVignetteOverlay(width: number, height: number, strength: number = 0.15): Graphics {
  const vignette = new Graphics();

  // Create radial gradient effect using concentric ellipses
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.max(width, height) * 0.75;

  const steps = 20;
  for (let i = steps; i >= 0; i--) {
    const ratio = i / steps;
    const radius = maxRadius * (0.5 + ratio * 0.5);
    const alpha = (1 - ratio) * strength;

    vignette.beginFill(PALETTE.shadowColor, alpha);
    vignette.drawEllipse(centerX, centerY, radius * (width / height), radius);
    vignette.endFill();
  }

  return vignette;
}

// ============================================
// DEBUG VISUALIZATION
// ============================================

let debugEnabled = false;

export function setDebugEnabled(enabled: boolean): void {
  debugEnabled = enabled;
}

export function isDebugEnabled(): boolean {
  return debugEnabled;
}

/**
 * Draw debug hitbox
 */
export function drawDebugHitbox(
  graphics: Graphics,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  if (!debugEnabled) return;

  graphics.lineStyle(1, 0xff00ff, 0.5);
  graphics.drawRect(x - width / 2, y - height / 2, width, height);
  graphics.lineStyle(0);
}

/**
 * Draw debug interaction range
 */
export function drawDebugInteractionRange(
  graphics: Graphics,
  x: number,
  y: number,
  range: number
): void {
  if (!debugEnabled) return;

  graphics.lineStyle(1, 0x00ffff, 0.3);
  graphics.drawCircle(x, y, range * ISO.tileWidth / 2);
  graphics.lineStyle(0);
}
