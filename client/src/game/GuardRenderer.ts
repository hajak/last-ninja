/**
 * Panda & Dog - Guard Renderer
 * Renders guards with vision cones and alert state indicators using design tokens
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { WorldPos, GuardStateClient, GuardAlertState } from '../../../shared/types';
import { worldToScreen } from '../engine/isometric';
import {
  PALETTE,
  SHADOWS,
  STATE_COLORS,
  TYPOGRAPHY,
  adjustBrightness,
  pulse,
} from '../../../shared/designTokens';

const GUARD_WIDTH = 28;
const GUARD_HEIGHT = 32;

const VISION_ALPHA: Record<GuardAlertState, number> = {
  idle: 0.12,
  suspicious: 0.20,
  alert: 0.30,
  returning: 0.15,
};

export class GuardRenderer {
  public container: Container;
  public position: WorldPos;

  private bodyContainer: Container;
  private bodyGraphics: Graphics;
  private visionCone: Graphics;
  private shadowGraphics: Graphics;
  private alertIndicator: Graphics;
  private alertText: Text;

  private guardId: string;
  private facing: number = 0;
  private alertState: GuardAlertState = 'idle';
  private visionAngle: number = 90;
  private visionRange: number = 6;

  private time = 0;
  private isMoving = false;

  constructor(
    guardId: string,
    position: WorldPos,
    facing: number,
    visionAngle: number,
    visionRange: number
  ) {
    this.guardId = guardId;
    this.position = { ...position };
    this.facing = facing;
    this.visionAngle = visionAngle;
    this.visionRange = visionRange;

    this.container = new Container();
    this.container.sortableChildren = true;

    this.visionCone = new Graphics();
    this.visionCone.zIndex = 0;
    this.container.addChild(this.visionCone);

    this.shadowGraphics = new Graphics();
    this.shadowGraphics.zIndex = 1;
    this.container.addChild(this.shadowGraphics);

    this.bodyContainer = new Container();
    this.bodyContainer.zIndex = 2;
    this.container.addChild(this.bodyContainer);

    this.bodyGraphics = new Graphics();
    this.bodyContainer.addChild(this.bodyGraphics);

    this.alertIndicator = new Graphics();
    this.alertIndicator.zIndex = 3;
    this.container.addChild(this.alertIndicator);

    const alertStyle = new TextStyle({
      fontFamily: TYPOGRAPHY.fontPrimary,
      fontSize: TYPOGRAPHY.sizes.xl,
      fontWeight: String(TYPOGRAPHY.weights.extrabold),
      fill: PALETTE.uiText,
      stroke: PALETTE.deepVoid,
      strokeThickness: 3,
    });
    this.alertText = new Text('', alertStyle);
    this.alertText.anchor.set(0.5);
    this.alertText.position.y = -GUARD_HEIGHT - 20;
    this.alertText.visible = false;
    this.alertText.zIndex = 4;
    this.container.addChild(this.alertText);

    this.render();
    this.updateScreenPosition();
  }

  private render(): void {
    this.drawShadow();
    this.drawBody();
    this.drawVisionCone();
    this.drawAlertIndicator();
  }

  private drawShadow(): void {
    const shadow = SHADOWS.character;
    this.shadowGraphics.clear();
    this.shadowGraphics.beginFill(shadow.color, shadow.alpha);
    this.shadowGraphics.drawEllipse(
      shadow.offsetX,
      shadow.offsetY + 2,
      GUARD_WIDTH * 0.45,
      GUARD_WIDTH * 0.22
    );
    this.shadowGraphics.endFill();
  }

  private drawBody(): void {
    this.bodyGraphics.clear();

    const width = GUARD_WIDTH;
    const height = GUARD_HEIGHT;

    const bobAmount = this.isMoving ? 2 : 1;
    const bob = Math.sin(this.time * 0.004) * bobAmount;
    const armSwing = this.isMoving ? Math.sin(this.time * 0.008) * 4 : 0;

    const stateColors = STATE_COLORS.guard[this.alertState];
    const bodyColor = stateColors.body;
    const visionColor = stateColors.vision;

    const bodyDark = adjustBrightness(bodyColor, 0.7);
    const bodyMid = bodyColor;
    const bodyLight = adjustBrightness(bodyColor, 1.15);

    this.bodyGraphics.beginFill(bodyDark);
    this.bodyGraphics.drawRect(-width / 2 + 4, -height / 2 + bob, width - 8, height / 2);
    this.bodyGraphics.endFill();

    this.bodyGraphics.beginFill(PALETTE.guardArmor);
    this.bodyGraphics.drawRect(-width / 2 + 2, -height / 2 + bob, width - 4, height / 4);
    this.bodyGraphics.endFill();

    this.bodyGraphics.beginFill(bodyLight);
    this.bodyGraphics.drawCircle(0, -height / 2 - 6 + bob, 8);
    this.bodyGraphics.endFill();

    this.bodyGraphics.beginFill(bodyMid);
    this.bodyGraphics.drawRect(-8, -height / 2 - 14 + bob, 16, 8);
    this.bodyGraphics.endFill();

    const eyeGlow = pulse(this.time, 0.005);
    const eyeAlpha = this.alertState === 'alert' ? 0.8 + eyeGlow * 0.2 : 0.9;
    this.bodyGraphics.beginFill(visionColor, eyeAlpha);
    this.bodyGraphics.drawRect(-5, -height / 2 - 8 + bob, 10, 3);
    this.bodyGraphics.endFill();

    this.bodyGraphics.beginFill(bodyDark);
    this.bodyGraphics.drawRect(-width / 2 - 2, -height / 4 + armSwing + bob, 6, 12);
    this.bodyGraphics.drawRect(width / 2 - 4, -height / 4 - armSwing + bob, 6, 12);
    this.bodyGraphics.endFill();

    const legOffset = this.isMoving ? armSwing * 0.5 : 0;
    this.bodyGraphics.beginFill(adjustBrightness(bodyDark, 0.8));
    this.bodyGraphics.drawRect(-width / 4 - 2, 0 + legOffset + bob, 6, 10);
    this.bodyGraphics.drawRect(width / 4 - 4, 0 - legOffset + bob, 6, 10);
    this.bodyGraphics.endFill();

    this.bodyGraphics.beginFill(PALETTE.doorClosed);
    this.bodyGraphics.drawRect(width / 2 + 2, -height + bob, 3, height + 10);
    this.bodyGraphics.endFill();

    this.bodyGraphics.beginFill(PALETTE.wallLight);
    const tipX = width / 2 + 3.5;
    const tipY = -height - 5 + bob;
    this.bodyGraphics.moveTo(tipX, tipY);
    this.bodyGraphics.lineTo(tipX - 4, tipY + 8);
    this.bodyGraphics.lineTo(tipX + 4, tipY + 8);
    this.bodyGraphics.closePath();
    this.bodyGraphics.endFill();

    const capeWave = Math.sin(this.time * 0.003) * 3;
    this.bodyGraphics.beginFill(PALETTE.guardCape, 0.85);
    this.bodyGraphics.drawRect(-width / 3, -height / 3 + bob, width / 1.5, height / 2 + capeWave);
    this.bodyGraphics.endFill();

    const normalizedFacing = ((this.facing % 360) + 360) % 360;
    this.bodyContainer.scale.x = normalizedFacing > 90 && normalizedFacing < 270 ? -1 : 1;
  }

  private drawVisionCone(): void {
    this.visionCone.clear();

    const stateColors = STATE_COLORS.guard[this.alertState];
    const visionColor = stateColors.vision;
    const alpha = VISION_ALPHA[this.alertState];

    this.visionCone.beginFill(visionColor, alpha);

    const rangePixels = this.visionRange * 32;
    const halfAngle = (this.visionAngle / 2) * (Math.PI / 180);
    const facingRad = this.facing * (Math.PI / 180);

    this.visionCone.moveTo(0, 0);
    const segments = 24;
    for (let i = 0; i <= segments; i++) {
      const angle = facingRad - halfAngle + (halfAngle * 2 * i) / segments;
      const x = Math.cos(angle) * rangePixels;
      const y = Math.sin(angle) * rangePixels * 0.5;
      this.visionCone.lineTo(x, y);
    }
    this.visionCone.lineTo(0, 0);
    this.visionCone.endFill();

    if (this.alertState !== 'idle') {
      const edgeAlpha = this.alertState === 'alert' ? 0.6 : 0.4;
      this.visionCone.lineStyle(2, visionColor, edgeAlpha);
      this.visionCone.moveTo(0, 0);
      for (let i = 0; i <= segments; i++) {
        const angle = facingRad - halfAngle + (halfAngle * 2 * i) / segments;
        const x = Math.cos(angle) * rangePixels;
        const y = Math.sin(angle) * rangePixels * 0.5;
        this.visionCone.lineTo(x, y);
      }
    }
  }

  private drawAlertIndicator(): void {
    this.alertIndicator.clear();

    if (this.alertState === 'idle' || this.alertState === 'returning') {
      this.alertText.visible = false;
      return;
    }

    const pulseAmount = pulse(this.time, 0.008);
    const scale = 1 + pulseAmount * 0.25;

    const stateColors = STATE_COLORS.guard[this.alertState];
    const color = stateColors.vision;

    this.alertIndicator.beginFill(color);
    this.alertIndicator.drawCircle(0, -GUARD_HEIGHT - 25, 12 * scale);
    this.alertIndicator.endFill();

    this.alertIndicator.lineStyle(2, PALETTE.glowWhite, 0.8);
    this.alertIndicator.drawCircle(0, -GUARD_HEIGHT - 25, 12 * scale);

    this.alertText.visible = true;
    this.alertText.position.y = -GUARD_HEIGHT - 25;
    this.alertText.text = this.alertState === 'suspicious' ? '?' : '!';
    this.alertText.scale.set(scale);
  }

  private updateScreenPosition(): void {
    const screen = worldToScreen(this.position.x, this.position.y);
    this.container.position.set(screen.x, screen.y - this.position.z * 16);
  }

  updateState(state: GuardStateClient): void {
    const wasMoving =
      this.position.x !== state.position.x || this.position.y !== state.position.y;
    this.isMoving = wasMoving;

    this.position.x = state.position.x;
    this.position.y = state.position.y;
    this.position.z = state.position.z;
    this.facing = state.facing;
    this.alertState = state.alertState;
    this.visionAngle = state.visionAngle;
    this.visionRange = state.visionRange;

    this.updateScreenPosition();
    this.drawVisionCone();
  }

  update(deltaTime: number): void {
    this.time += deltaTime;
    this.drawBody();
    this.drawAlertIndicator();
  }

  getId(): string {
    return this.guardId;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
