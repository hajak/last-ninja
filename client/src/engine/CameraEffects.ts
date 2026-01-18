/**
 * Panda & Dog - Camera Effects
 * Vignette overlay, screen shake, and other post-processing effects
 */

import { Container, Graphics, Application } from 'pixi.js';
import { PALETTE, CAMERA } from '../../../shared/designTokens';

type ShakeIntensity = 'light' | 'medium' | 'heavy';

interface ShakeState {
  active: boolean;
  intensity: number;
  duration: number;
  elapsed: number;
  offsetX: number;
  offsetY: number;
}

export class CameraEffects {
  private app: Application;
  private gameContainer: Container;
  private vignetteOverlay: Graphics;
  private vignetteEnabled = true;

  private shake: ShakeState = {
    active: false,
    intensity: 0,
    duration: 0,
    elapsed: 0,
    offsetX: 0,
    offsetY: 0,
  };

  private originalPosition = { x: 0, y: 0 };

  constructor(app: Application, gameContainer: Container) {
    this.app = app;
    this.gameContainer = gameContainer;

    this.vignetteOverlay = new Graphics();
    this.vignetteOverlay.zIndex = 1000;

    this.originalPosition.x = gameContainer.x;
    this.originalPosition.y = gameContainer.y;

    this.createVignette();
  }

  private createVignette(): void {
    this.vignetteOverlay.clear();

    if (!this.vignetteEnabled) {
      return;
    }

    const width = this.app.screen.width;
    const height = this.app.screen.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
    const innerRadius = maxRadius * CAMERA.vignetteRadius;

    const steps = 20;
    for (let i = steps; i >= 0; i--) {
      const ratio = i / steps;
      const radius = innerRadius + (maxRadius - innerRadius) * ratio;
      const alpha = CAMERA.vignetteStrength * ratio * ratio;

      this.vignetteOverlay.beginFill(PALETTE.deepVoid, alpha);
      this.vignetteOverlay.drawCircle(centerX, centerY, radius);
      this.vignetteOverlay.endFill();
    }

    const cornerAlpha = CAMERA.vignetteStrength * 0.5;
    this.vignetteOverlay.beginFill(PALETTE.deepVoid, cornerAlpha);
    this.vignetteOverlay.moveTo(0, 0);
    this.vignetteOverlay.lineTo(width * 0.15, 0);
    this.vignetteOverlay.quadraticCurveTo(0, 0, 0, height * 0.15);
    this.vignetteOverlay.closePath();
    this.vignetteOverlay.endFill();

    this.vignetteOverlay.beginFill(PALETTE.deepVoid, cornerAlpha);
    this.vignetteOverlay.moveTo(width, 0);
    this.vignetteOverlay.lineTo(width - width * 0.15, 0);
    this.vignetteOverlay.quadraticCurveTo(width, 0, width, height * 0.15);
    this.vignetteOverlay.closePath();
    this.vignetteOverlay.endFill();

    this.vignetteOverlay.beginFill(PALETTE.deepVoid, cornerAlpha);
    this.vignetteOverlay.moveTo(0, height);
    this.vignetteOverlay.lineTo(0, height - height * 0.15);
    this.vignetteOverlay.quadraticCurveTo(0, height, width * 0.15, height);
    this.vignetteOverlay.closePath();
    this.vignetteOverlay.endFill();

    this.vignetteOverlay.beginFill(PALETTE.deepVoid, cornerAlpha);
    this.vignetteOverlay.moveTo(width, height);
    this.vignetteOverlay.lineTo(width, height - height * 0.15);
    this.vignetteOverlay.quadraticCurveTo(width, height, width - width * 0.15, height);
    this.vignetteOverlay.closePath();
    this.vignetteOverlay.endFill();
  }

  getVignetteOverlay(): Graphics {
    return this.vignetteOverlay;
  }

  setVignetteEnabled(enabled: boolean): void {
    this.vignetteEnabled = enabled;
    this.createVignette();
    this.vignetteOverlay.visible = enabled;
  }

  triggerShake(intensity: ShakeIntensity = 'light'): void {
    this.shake.active = true;
    this.shake.intensity = CAMERA.shakeIntensity[intensity];
    this.shake.duration = CAMERA.shakeDuration[intensity];
    this.shake.elapsed = 0;
  }

  update(deltaTime: number): void {
    if (!this.shake.active) {
      return;
    }

    this.shake.elapsed += deltaTime;

    if (this.shake.elapsed >= this.shake.duration) {
      this.shake.active = false;
      this.shake.offsetX = 0;
      this.shake.offsetY = 0;
      this.gameContainer.x = this.originalPosition.x;
      this.gameContainer.y = this.originalPosition.y;
      return;
    }

    const progress = this.shake.elapsed / this.shake.duration;
    const decayedIntensity = this.shake.intensity * Math.pow(CAMERA.shakeDecay, progress * 10);

    this.shake.offsetX = (Math.random() - 0.5) * 2 * decayedIntensity;
    this.shake.offsetY = (Math.random() - 0.5) * 2 * decayedIntensity;

    this.gameContainer.x = this.originalPosition.x + this.shake.offsetX;
    this.gameContainer.y = this.originalPosition.y + this.shake.offsetY;
  }

  resize(): void {
    this.createVignette();
  }

  setGameContainerPosition(x: number, y: number): void {
    this.originalPosition.x = x;
    this.originalPosition.y = y;
    if (!this.shake.active) {
      this.gameContainer.x = x;
      this.gameContainer.y = y;
    }
  }

  destroy(): void {
    this.vignetteOverlay.destroy();
  }
}
