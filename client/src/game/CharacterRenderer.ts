/**
 * Panda & Dog - Character Renderer
 * Renders animated characters with proper rotation, outlines, and shadows
 *
 * Uses design tokens for consistent visual style.
 */

import { Container, Graphics } from 'pixi.js';
import type { WorldPos, Role, Direction8 } from '../../../shared/types';
import {
  PALETTE,
  SHADOWS,
  OUTLINES,
  ISO,
  adjustBrightness,
  directionToAngle,
  pulse,
} from '../../../shared/designTokens';
import { worldToScreen } from '../engine/isometric';
import { drawContactShadow, drawDebugHitbox } from '../engine/RenderStyle';

// Animation frame timing
const ANIMATION_FRAME_DURATION = 150;
const IDLE_BOB_SPEED = 0.002;
const IDLE_BOB_AMOUNT = 2;

// Character dimensions
const DOG_WIDTH = 24;
const DOG_HEIGHT = 20;
const PANDA_WIDTH = 32;
const PANDA_HEIGHT = 28;

type AnimationState = 'idle' | 'walk' | 'run' | 'interact' | 'hurt' | 'respawn';

interface AnimationFrame {
  offsetY: number;
  scaleX: number;
  scaleY: number;
}

const ANIMATIONS: Record<AnimationState, AnimationFrame[]> = {
  idle: [
    { offsetY: 0, scaleX: 1, scaleY: 1 },
    { offsetY: -1, scaleX: 1, scaleY: 1.02 },
    { offsetY: -2, scaleX: 1, scaleY: 1.04 },
    { offsetY: -1, scaleX: 1, scaleY: 1.02 },
  ],
  walk: [
    { offsetY: 0, scaleX: 1, scaleY: 1 },
    { offsetY: -3, scaleX: 1.05, scaleY: 0.95 },
    { offsetY: 0, scaleX: 1, scaleY: 1 },
    { offsetY: -3, scaleX: 0.95, scaleY: 0.95 },
  ],
  run: [
    { offsetY: -2, scaleX: 1.1, scaleY: 0.9 },
    { offsetY: -6, scaleX: 1.05, scaleY: 0.95 },
    { offsetY: -2, scaleX: 1.1, scaleY: 0.9 },
    { offsetY: -6, scaleX: 0.95, scaleY: 0.95 },
  ],
  interact: [
    { offsetY: 0, scaleX: 1, scaleY: 1 },
    { offsetY: -4, scaleX: 1.15, scaleY: 0.85 },
    { offsetY: -2, scaleX: 1.08, scaleY: 0.92 },
    { offsetY: 0, scaleX: 1, scaleY: 1 },
  ],
  hurt: [
    { offsetY: 0, scaleX: 1, scaleY: 1 },
    { offsetY: 0, scaleX: 0.9, scaleY: 1.1 },
    { offsetY: 0, scaleX: 1.1, scaleY: 0.9 },
    { offsetY: 0, scaleX: 1, scaleY: 1 },
  ],
  respawn: [
    { offsetY: -20, scaleX: 0.5, scaleY: 0.5 },
    { offsetY: -10, scaleX: 0.7, scaleY: 0.7 },
    { offsetY: -4, scaleX: 0.9, scaleY: 0.9 },
    { offsetY: 0, scaleX: 1, scaleY: 1 },
  ],
};

export class CharacterRenderer {
  public container: Container;
  public position: WorldPos;

  private role: Role;
  private isLocalPlayer: boolean;
  private bodyContainer: Container;
  private bodyGraphics: Graphics;
  private outlineGraphics: Graphics;
  private shadowGraphics: Graphics;
  private highlightGraphics: Graphics;

  private animationState: AnimationState = 'idle';
  private animationFrame = 0;
  private animationTimer = 0;

  private facing: Direction8 = 'S';
  private facingAngle = 180;
  private targetFacingAngle = 180;
  private isMoving = false;
  private isRunning = false;
  private velocity = { x: 0, y: 0 };

  private idleTime = 0;
  private hurtTimer = 0;
  private respawnTimer = 0;
  private isHighlighted = false;

  constructor(role: Role, position: WorldPos, isLocalPlayer: boolean) {
    this.role = role;
    this.isLocalPlayer = isLocalPlayer;
    this.position = { ...position };

    this.container = new Container();
    this.container.sortableChildren = true;

    // Create shadow (z=0)
    this.shadowGraphics = new Graphics();
    this.shadowGraphics.zIndex = 0;
    this.container.addChild(this.shadowGraphics);

    // Create highlight ring (z=1)
    this.highlightGraphics = new Graphics();
    this.highlightGraphics.zIndex = 1;
    this.highlightGraphics.visible = false;
    this.container.addChild(this.highlightGraphics);

    // Body container for rotation (z=2)
    this.bodyContainer = new Container();
    this.bodyContainer.zIndex = 2;
    this.container.addChild(this.bodyContainer);

    // Create outline graphics (inside body container)
    this.outlineGraphics = new Graphics();
    this.outlineGraphics.zIndex = 0;
    this.bodyContainer.addChild(this.outlineGraphics);

    // Create body graphics (inside body container)
    this.bodyGraphics = new Graphics();
    this.bodyGraphics.zIndex = 1;
    this.bodyContainer.addChild(this.bodyGraphics);

    this.drawAll();
    this.updateScreenPosition();
  }

  private getWidth(): number {
    return this.role === 'dog' ? DOG_WIDTH : PANDA_WIDTH;
  }

  private getHeight(): number {
    return this.role === 'dog' ? DOG_HEIGHT : PANDA_HEIGHT;
  }

  private getBodyColor(): number {
    return this.role === 'dog' ? PALETTE.dogPrimary : PALETTE.pandaPrimary;
  }

  private getSecondaryColor(): number {
    return this.role === 'dog' ? PALETTE.dogSecondary : PALETTE.pandaSecondary;
  }

  private getLightColor(): number {
    return this.role === 'dog' ? adjustBrightness(PALETTE.dogPrimary, 1.2) : PALETTE.pandaLight;
  }

  private drawAll(): void {
    this.drawShadow();
    this.drawOutline();
    this.drawBody();
    this.drawHighlight();
  }

  private drawShadow(): void {
    this.shadowGraphics.clear();

    const config = this.role === 'dog' ? SHADOWS.characterSmall : SHADOWS.character;
    const shadowWidth = this.getWidth() * 0.85;
    const shadowHeight = shadowWidth * 0.4;

    // Main shadow
    this.shadowGraphics.beginFill(config.color, config.alpha);
    this.shadowGraphics.drawEllipse(config.offsetX, config.offsetY + 4, shadowWidth / 2, shadowHeight / 2);
    this.shadowGraphics.endFill();

    // Inner darker core
    this.shadowGraphics.beginFill(config.color, config.alpha * 0.5);
    this.shadowGraphics.drawEllipse(config.offsetX, config.offsetY + 4, shadowWidth / 4, shadowHeight / 4);
    this.shadowGraphics.endFill();
  }

  private drawOutline(): void {
    this.outlineGraphics.clear();

    const config = OUTLINES.playerAlways;
    const alpha = this.isLocalPlayer ? config.alpha : config.alpha * 0.4;
    const width = this.getWidth();
    const height = this.getHeight();

    // Draw outline slightly larger than body
    this.outlineGraphics.lineStyle(config.width + 0.5, config.color, alpha);

    if (this.role === 'dog') {
      // Dog outline - body ellipse
      this.outlineGraphics.drawEllipse(0, 0, width / 2 + 2, height / 3 + 2);
    } else {
      // Panda outline - rounder body
      this.outlineGraphics.drawEllipse(0, 0, width / 2.2 + 2, height / 2.5 + 2);
    }

    this.outlineGraphics.lineStyle(0);
  }

  private drawBody(): void {
    this.bodyGraphics.clear();

    const width = this.getWidth();
    const height = this.getHeight();
    const primaryColor = this.getBodyColor();
    const secondaryColor = this.getSecondaryColor();
    const lightColor = this.getLightColor();

    // Hurt flash effect
    const isHurt = this.hurtTimer > 0;
    const tint = isHurt ? (Math.floor(this.hurtTimer / 100) % 2 === 0 ? PALETTE.dangerRed : primaryColor) : primaryColor;

    // Respawn transparency
    const alpha = this.respawnTimer > 0 ? 0.5 + Math.sin(this.respawnTimer / 50) * 0.3 : 1;

    if (this.role === 'dog') {
      this.drawDog(width, height, tint, secondaryColor, lightColor, alpha);
    } else {
      this.drawPanda(width, height, tint, secondaryColor, lightColor, alpha);
    }
  }

  private drawDog(
    width: number,
    height: number,
    primaryColor: number,
    secondaryColor: number,
    lightColor: number,
    alpha: number
  ): void {
    const g = this.bodyGraphics;

    // Body (elongated oval with shading)
    g.beginFill(primaryColor, alpha);
    g.drawEllipse(0, 0, width / 2, height / 3);
    g.endFill();

    // Body highlight (top-left light source)
    g.beginFill(lightColor, alpha * 0.3);
    g.drawEllipse(-width / 6, -height / 8, width / 4, height / 6);
    g.endFill();

    // Head (follows facing direction slightly via body rotation)
    g.beginFill(primaryColor, alpha);
    g.drawEllipse(0, -height / 3, width / 4, height / 4);
    g.endFill();

    // Head highlight
    g.beginFill(lightColor, alpha * 0.25);
    g.drawEllipse(-width / 12, -height / 2.5, width / 8, height / 8);
    g.endFill();

    // Ears
    g.beginFill(secondaryColor, alpha);
    g.drawEllipse(-8, -height / 2.2, 4, 6);
    g.drawEllipse(8, -height / 2.2, 4, 6);
    g.endFill();

    // Snout
    g.beginFill(adjustBrightness(primaryColor, 0.9), alpha);
    g.drawEllipse(0, -height / 5, width / 6, height / 8);
    g.endFill();

    // Eyes
    g.beginFill(PALETTE.glowWhite, alpha);
    g.drawCircle(-4, -height / 3, 2.5);
    g.drawCircle(4, -height / 3, 2.5);
    g.endFill();

    // Pupils
    g.beginFill(PALETTE.deepVoid, alpha);
    g.drawCircle(-4, -height / 3 + 0.5, 1.5);
    g.drawCircle(4, -height / 3 + 0.5, 1.5);
    g.endFill();

    // Nose
    g.beginFill(PALETTE.pandaPrimary, alpha);
    g.drawCircle(0, -height / 5.5, 2);
    g.endFill();

    // Tail (wagging animation)
    const tailWag = Math.sin(this.animationTimer / 100) * 8;
    g.beginFill(primaryColor, alpha);
    g.drawEllipse(-width / 2 + 2 + tailWag * 0.3, 2, 6, 3);
    g.endFill();

    // Legs
    this.drawDogLegs(width, height, primaryColor, alpha);
  }

  private drawDogLegs(width: number, height: number, color: number, alpha: number): void {
    const g = this.bodyGraphics;
    const legOffset = this.animationState === 'walk' || this.animationState === 'run'
      ? Math.sin(this.animationTimer / 80) * 4
      : 0;

    const darkColor = adjustBrightness(color, 0.8);

    g.beginFill(darkColor, alpha);
    // Front legs
    g.drawRoundedRect(width / 4 - 3, height / 4 - legOffset, 6, 8 + legOffset, 2);
    g.drawRoundedRect(-width / 4 - 3, height / 4 + legOffset, 6, 8 - legOffset, 2);
    // Back legs
    g.drawRoundedRect(width / 6 - 3, height / 4 + legOffset, 6, 8 - legOffset, 2);
    g.drawRoundedRect(-width / 6 - 3, height / 4 - legOffset, 6, 8 + legOffset, 2);
    g.endFill();
  }

  private drawPanda(
    width: number,
    height: number,
    primaryColor: number,
    secondaryColor: number,
    lightColor: number,
    alpha: number
  ): void {
    const g = this.bodyGraphics;

    // Body (round with shading)
    g.beginFill(primaryColor, alpha);
    g.drawEllipse(0, 0, width / 2.2, height / 2.5);
    g.endFill();

    // Body highlight
    g.beginFill(lightColor, alpha * 0.15);
    g.drawEllipse(-width / 6, -height / 6, width / 4, height / 5);
    g.endFill();

    // Belly patch
    g.beginFill(lightColor, alpha);
    g.drawEllipse(0, 2, width / 3.5, height / 4);
    g.endFill();

    // Head
    g.beginFill(primaryColor, alpha);
    g.drawCircle(0, -height / 2.8, width / 3);
    g.endFill();

    // Head highlight
    g.beginFill(lightColor, alpha * 0.1);
    g.drawEllipse(-3, -height / 2.2, width / 6, height / 10);
    g.endFill();

    // Ears (secondary color)
    g.beginFill(secondaryColor, alpha);
    g.drawCircle(-10, -height / 1.9, 5);
    g.drawCircle(10, -height / 1.9, 5);
    g.endFill();

    // Eye patches
    g.beginFill(secondaryColor, alpha);
    g.drawEllipse(-5, -height / 2.8, 5, 6);
    g.drawEllipse(5, -height / 2.8, 5, 6);
    g.endFill();

    // Eyes (white centers with shine)
    g.beginFill(lightColor, alpha);
    g.drawCircle(-5, -height / 2.8, 2.5);
    g.drawCircle(5, -height / 2.8, 2.5);
    g.endFill();

    // Eye shine
    g.beginFill(PALETTE.glowWhite, alpha * 0.8);
    g.drawCircle(-6, -height / 2.6, 1);
    g.drawCircle(4, -height / 2.6, 1);
    g.endFill();

    // Pupils
    g.beginFill(PALETTE.deepVoid, alpha);
    g.drawCircle(-5, -height / 2.8 + 0.5, 1.2);
    g.drawCircle(5, -height / 2.8 + 0.5, 1.2);
    g.endFill();

    // Nose
    g.beginFill(PALETTE.stoneGray, alpha);
    g.drawEllipse(0, -height / 4, 3, 2);
    g.endFill();

    // Arms and legs
    this.drawPandaLimbs(width, height, secondaryColor, alpha);
  }

  private drawPandaLimbs(width: number, height: number, color: number, alpha: number): void {
    const g = this.bodyGraphics;
    const limbOffset = this.animationState === 'walk' || this.animationState === 'run'
      ? Math.sin(this.animationTimer / 100) * 3
      : 0;

    g.beginFill(color, alpha);
    // Arms
    g.drawEllipse(-width / 2.5, -2 + limbOffset, 5, 8);
    g.drawEllipse(width / 2.5, -2 - limbOffset, 5, 8);
    // Legs
    g.drawEllipse(-width / 4, height / 3 - limbOffset, 6, 8);
    g.drawEllipse(width / 4, height / 3 + limbOffset, 6, 8);
    g.endFill();
  }

  private drawHighlight(): void {
    this.highlightGraphics.clear();

    if (!this.isHighlighted) {
      this.highlightGraphics.visible = false;
      return;
    }

    this.highlightGraphics.visible = true;
    const config = OUTLINES.selected;
    const width = this.getWidth();
    const pulseVal = pulse(this.animationTimer, 0.004);

    // Outer glow ring
    this.highlightGraphics.lineStyle(3, PALETTE.amberGold, 0.3 + pulseVal * 0.3);
    this.highlightGraphics.drawEllipse(0, 4, width * 0.7, width * 0.35);

    // Inner ring
    this.highlightGraphics.lineStyle(2, PALETTE.amberGold, 0.5 + pulseVal * 0.3);
    this.highlightGraphics.drawEllipse(0, 4, width * 0.5, width * 0.25);

    this.highlightGraphics.lineStyle(0);
  }

  getPosition(): WorldPos {
    return { ...this.position };
  }

  setPosition(pos: WorldPos): void {
    // Calculate velocity for animation
    const dx = pos.x - this.position.x;
    const dy = pos.y - this.position.y;
    this.velocity = { x: dx, y: dy };

    // Update facing based on movement
    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
      this.facing = this.velocityToDirection(dx, dy);
      this.targetFacingAngle = directionToAngle(this.facing);
      this.isMoving = true;
    } else {
      this.isMoving = false;
    }

    this.position.x = pos.x;
    this.position.y = pos.y;
    this.position.z = pos.z;

    this.updateScreenPosition();
  }

  private velocityToDirection(dx: number, dy: number): Direction8 {
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle >= -22.5 && angle < 22.5) return 'E';
    if (angle >= 22.5 && angle < 67.5) return 'SE';
    if (angle >= 67.5 && angle < 112.5) return 'S';
    if (angle >= 112.5 && angle < 157.5) return 'SW';
    if (angle >= 157.5 || angle < -157.5) return 'W';
    if (angle >= -157.5 && angle < -112.5) return 'NW';
    if (angle >= -112.5 && angle < -67.5) return 'N';
    return 'NE';
  }

  private updateScreenPosition(): void {
    const screen = worldToScreen(this.position.x, this.position.y);
    this.container.position.set(screen.x, screen.y - this.position.z * ISO.tileDepth);
  }

  /**
   * Smoothly rotate character body toward facing direction
   */
  private updateRotation(deltaTime: number): void {
    // Calculate shortest rotation path
    let diff = this.targetFacingAngle - this.facingAngle;

    // Normalize to -180 to 180
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;

    // Smooth rotation (lerp)
    const rotationSpeed = 0.15;
    this.facingAngle += diff * rotationSpeed;

    // For isometric view, we apply a subtle horizontal scale flip for left/right facing
    // and a subtle y-offset for depth perception
    const normalizedAngle = ((this.facingAngle % 360) + 360) % 360;

    // Scale X based on facing (flip for west-facing)
    const scaleX = (normalizedAngle > 90 && normalizedAngle < 270) ? -1 : 1;
    this.bodyContainer.scale.x = scaleX;

    // Subtle tilt for depth (characters lean forward/back slightly)
    const tilt = Math.sin((normalizedAngle - 180) * Math.PI / 180) * 0.05;
    this.bodyContainer.skew.x = tilt;
  }

  setRunning(running: boolean): void {
    this.isRunning = running;
  }

  setHighlighted(highlighted: boolean): void {
    this.isHighlighted = highlighted;
  }

  triggerHurt(): void {
    this.hurtTimer = 500;
    this.animationState = 'hurt';
    this.animationFrame = 0;
  }

  triggerRespawn(): void {
    this.respawnTimer = 1000;
    this.animationState = 'respawn';
    this.animationFrame = 0;
  }

  triggerInteract(): void {
    this.animationState = 'interact';
    this.animationFrame = 0;
    this.animationTimer = 0;
  }

  getFacing(): Direction8 {
    return this.facing;
  }

  getFacingAngle(): number {
    return this.facingAngle;
  }

  update(deltaTime: number): void {
    this.animationTimer += deltaTime;
    this.idleTime += deltaTime;

    // Update rotation smoothly
    this.updateRotation(deltaTime);

    // Update hurt timer
    if (this.hurtTimer > 0) {
      this.hurtTimer -= deltaTime;
      if (this.hurtTimer <= 0) {
        this.animationState = 'idle';
      }
    }

    // Update respawn timer
    if (this.respawnTimer > 0) {
      this.respawnTimer -= deltaTime;
      if (this.respawnTimer <= 0) {
        this.animationState = 'idle';
      }
    }

    // Determine animation state (if not overridden)
    if (this.hurtTimer <= 0 && this.respawnTimer <= 0) {
      if (this.isMoving) {
        this.animationState = this.isRunning ? 'run' : 'walk';
        this.idleTime = 0;
      } else if (this.animationState !== 'interact') {
        this.animationState = 'idle';
      }
    }

    // Update animation frame
    if (this.animationTimer >= ANIMATION_FRAME_DURATION) {
      this.animationTimer = 0;
      this.animationFrame = (this.animationFrame + 1) % ANIMATIONS[this.animationState].length;

      // Reset interact state after animation completes
      if (this.animationState === 'interact' && this.animationFrame === 0) {
        this.animationState = 'idle';
      }
    }

    // Apply animation frame transforms
    const frame = ANIMATIONS[this.animationState][this.animationFrame];
    this.bodyGraphics.position.y = frame.offsetY;
    this.bodyGraphics.scale.y = frame.scaleY;
    // Scale X is handled separately for facing direction

    this.outlineGraphics.position.y = frame.offsetY;
    this.outlineGraphics.scale.y = frame.scaleY;

    // Idle bob animation
    if (this.animationState === 'idle') {
      const bob = Math.sin(this.idleTime * IDLE_BOB_SPEED) * IDLE_BOB_AMOUNT;
      this.bodyGraphics.position.y += bob;
      this.outlineGraphics.position.y += bob;
    }

    // Redraw character
    this.drawAll();

    // Scale shadow based on animation
    const shadowScale = this.animationState === 'run' ? 0.9 : 1;
    const jumpScale = this.animationState === 'respawn' ? 0.5 + this.respawnTimer / 2000 : 1;
    this.shadowGraphics.scale.set(shadowScale * jumpScale);
    this.shadowGraphics.alpha = jumpScale;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
