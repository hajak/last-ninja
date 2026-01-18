/**
 * Panda & Dog - Interactable Renderer
 * Renders interactive objects with consistent visual styling
 *
 * Uses design tokens for premium, cohesive visuals.
 */

import { Container, Graphics } from 'pixi.js';
import type { InteractableState, WorldPos } from '../../../shared/types';
import {
  PALETTE,
  SHADOWS,
  ISO,
  STATE_COLORS,
  adjustBrightness,
  pulse,
} from '../../../shared/designTokens';
import { worldToScreen } from '../engine/isometric';
import {
  drawContactShadow,
  drawInteractableHighlight,
  drawLaserBeam,
  drawHazardWarning,
} from '../engine/RenderStyle';

export class InteractableRenderer {
  private container: Container;
  private shadowGraphics: Graphics;
  private mainGraphics: Graphics;
  private highlightGraphics: Graphics;
  private interactable: InteractableState;
  private animationProgress = 0;
  private targetAnimationProgress = 0;
  private time = 0;
  private isHovered = false;

  constructor(interactable: InteractableState) {
    this.interactable = interactable;
    this.container = new Container();
    this.container.sortableChildren = true;

    // Shadow layer (z=0)
    this.shadowGraphics = new Graphics();
    this.shadowGraphics.zIndex = 0;
    this.container.addChild(this.shadowGraphics);

    // Main graphics (z=1)
    this.mainGraphics = new Graphics();
    this.mainGraphics.zIndex = 1;
    this.container.addChild(this.mainGraphics);

    // Highlight layer (z=2)
    this.highlightGraphics = new Graphics();
    this.highlightGraphics.zIndex = 2;
    this.highlightGraphics.visible = false;
    this.container.addChild(this.highlightGraphics);

    this.updatePosition();
    this.render();
  }

  getContainer(): Container {
    return this.container;
  }

  getState(): InteractableState {
    return this.interactable;
  }

  get position(): WorldPos {
    return this.interactable.position;
  }

  setHovered(hovered: boolean): void {
    this.isHovered = hovered;
    this.highlightGraphics.visible = hovered;
  }

  updateState(state: InteractableState): void {
    this.interactable = state;
    this.updatePosition();
  }

  private updatePosition(): void {
    const screenPos = worldToScreen(this.interactable.position.x, this.interactable.position.y);
    const zOffset = this.interactable.position.z * ISO.tileDepth;
    this.container.position.set(screenPos.x, screenPos.y - zOffset);
    this.container.zIndex = this.interactable.position.y * 100 + this.interactable.position.z * 10;
  }

  update(deltaTime: number): void {
    this.time += deltaTime;

    // Smooth animation
    const animSpeed = 0.008 * deltaTime;
    if (this.animationProgress < this.targetAnimationProgress) {
      this.animationProgress = Math.min(this.animationProgress + animSpeed, this.targetAnimationProgress);
    } else if (this.animationProgress > this.targetAnimationProgress) {
      this.animationProgress = Math.max(this.animationProgress - animSpeed, this.targetAnimationProgress);
    }

    this.render();
  }

  private render(): void {
    this.shadowGraphics.clear();
    this.mainGraphics.clear();
    this.highlightGraphics.clear();

    switch (this.interactable.type) {
      case 'door':
        this.renderDoor();
        break;
      case 'lever':
        this.renderLever();
        break;
      case 'pressure_plate':
        this.renderPressurePlate();
        break;
      case 'crate':
        this.renderCrate();
        break;
      case 'button':
        this.renderButton();
        break;
      case 'hazard':
        this.renderHazard();
        break;
      case 'platform':
        this.renderPlatform();
        break;
      case 'checkpoint':
        this.renderCheckpoint();
        break;
      case 'winch':
        this.renderWinch();
        break;
      case 'camera_node':
        this.renderCameraNode();
        break;
      case 'conveyor':
        this.renderConveyor();
        break;
      case 'spike_trap':
        this.renderSpikeTrap();
        break;
    }

    // Draw hover highlight
    if (this.isHovered) {
      this.renderHoverHighlight();
    }
  }

  private renderHoverHighlight(): void {
    const g = this.highlightGraphics;
    const pulseVal = pulse(this.time, 0.004);

    g.lineStyle(2, PALETTE.amberGold, 0.5 + pulseVal * 0.4);
    g.drawRoundedRect(-20, -40, 40, 44, 4);
    g.lineStyle(0);

    // Glow effect
    g.beginFill(PALETTE.amberGold, 0.1 + pulseVal * 0.1);
    g.drawRoundedRect(-22, -42, 44, 48, 6);
    g.endFill();
  }

  private renderDoor(): void {
    const state = this.interactable.state as { open: boolean; locked: boolean; requiresHeavy?: boolean };
    const g = this.mainGraphics;
    const sg = this.shadowGraphics;

    this.targetAnimationProgress = state.open ? 1 : 0;

    const doorWidth = ISO.tileWidth * 0.55;
    const doorHeight = ISO.tileHeight * 2.2;
    const frameThickness = 4;
    const openOffset = this.animationProgress * doorWidth * 0.7;

    // Shadow
    if (!state.open) {
      const shadowConfig = SHADOWS.prop;
      sg.beginFill(shadowConfig.color, shadowConfig.alpha);
      sg.drawEllipse(shadowConfig.offsetX, ISO.tileHeight * 0.15, doorWidth * 0.35, ISO.tileHeight * 0.12);
      sg.endFill();
    }

    // Frame colors using design tokens
    const frameBack = adjustBrightness(PALETTE.doorFrame, 0.7);
    const frameLeft = PALETTE.doorClosed;
    const frameRight = adjustBrightness(PALETTE.doorClosed, 0.8);
    const frameTop = adjustBrightness(PALETTE.doorClosed, 1.1);

    // Frame back (3D depth)
    g.beginFill(frameBack);
    g.moveTo(-doorWidth / 2 - frameThickness, -doorHeight);
    g.lineTo(doorWidth / 2 + frameThickness, -doorHeight);
    g.lineTo(doorWidth / 2 + frameThickness + 3, -doorHeight + 3);
    g.lineTo(doorWidth / 2 + frameThickness + 3, 3);
    g.lineTo(-doorWidth / 2 - frameThickness + 3, 3);
    g.lineTo(-doorWidth / 2 - frameThickness, 0);
    g.closePath();
    g.endFill();

    // Frame sides
    g.beginFill(frameLeft);
    g.drawRect(-doorWidth / 2 - frameThickness, -doorHeight, frameThickness, doorHeight);
    g.endFill();

    g.beginFill(frameRight);
    g.drawRect(doorWidth / 2, -doorHeight, frameThickness, doorHeight);
    g.endFill();

    // Frame top
    g.beginFill(frameTop);
    g.drawRect(-doorWidth / 2 - frameThickness, -doorHeight - frameThickness, doorWidth + frameThickness * 2, frameThickness);
    g.endFill();

    // Door panel
    if (!state.open || this.animationProgress < 1) {
      const doorX = -doorWidth / 2 + openOffset;
      const visibleWidth = doorWidth - openOffset;

      if (visibleWidth > 0) {
        // Choose door color based on state
        const colors = state.locked ? {
          main: adjustBrightness(PALETTE.dangerRed, 0.5),
          edge: adjustBrightness(PALETTE.dangerRed, 0.35),
          panel: adjustBrightness(PALETTE.dangerRed, 0.4),
        } : {
          main: PALETTE.doorClosed,
          edge: PALETTE.doorOpen,
          panel: adjustBrightness(PALETTE.doorClosed, 0.85),
        };

        // Main panel
        g.beginFill(colors.main);
        g.drawRect(doorX, -doorHeight + frameThickness, visibleWidth, doorHeight - frameThickness);
        g.endFill();

        // Edge highlight (top-left light)
        g.beginFill(adjustBrightness(colors.main, 1.15), 0.6);
        g.drawRect(doorX, -doorHeight + frameThickness, 2, doorHeight - frameThickness);
        g.endFill();

        // Edge shadow (right)
        g.beginFill(colors.edge);
        g.drawRect(doorX + visibleWidth - 3, -doorHeight + frameThickness, 3, doorHeight - frameThickness);
        g.endFill();

        // Handle
        if (visibleWidth > 15) {
          const handleX = doorX + visibleWidth * 0.7;
          const handleY = -doorHeight / 2;

          g.beginFill(PALETTE.amberGold);
          g.drawCircle(handleX, handleY, 4);
          g.endFill();
          g.beginFill(adjustBrightness(PALETTE.amberGold, 0.7));
          g.drawCircle(handleX, handleY, 2);
          g.endFill();
        }

        // Decorative panels
        if (visibleWidth > 25) {
          g.beginFill(colors.panel);
          g.drawRoundedRect(doorX + 6, -doorHeight + frameThickness + 8, Math.min(visibleWidth - 12, 18), 20, 2);
          g.drawRoundedRect(doorX + 6, -doorHeight / 2 + 8, Math.min(visibleWidth - 12, 18), 20, 2);
          g.endFill();
        }

        // Lock indicator
        if (state.locked && visibleWidth > 20) {
          const lockX = doorX + visibleWidth * 0.7;
          const lockY = -doorHeight / 2 + 14;
          const lockPulse = pulse(this.time, 0.005);

          g.beginFill(PALETTE.dangerRed, 0.8 + lockPulse * 0.2);
          g.drawRoundedRect(lockX - 4, lockY - 2, 8, 7, 1);
          g.drawCircle(lockX, lockY - 4, 3);
          g.endFill();
        }

        // Heavy door indicator
        if (state.requiresHeavy && visibleWidth > 20) {
          g.lineStyle(2, PALETTE.oceanBlue, 0.6);
          g.drawCircle(doorX + visibleWidth / 2, -doorHeight / 2, 8);
          g.lineStyle(0);
        }
      }
    }
  }

  private renderLever(): void {
    const state = this.interactable.state as { position: 'off' | 'on'; requiresStrength?: boolean };
    const g = this.mainGraphics;
    const sg = this.shadowGraphics;

    this.targetAnimationProgress = state.position === 'on' ? 1 : 0;

    // Shadow
    sg.beginFill(SHADOWS.interactable.color, SHADOWS.interactable.alpha);
    sg.drawEllipse(2, 3, 10, 5);
    sg.endFill();

    // Base
    g.beginFill(PALETTE.leverBase);
    g.drawEllipse(0, 0, 14, 7);
    g.endFill();

    // Base highlight
    g.beginFill(adjustBrightness(PALETTE.leverBase, 1.2), 0.5);
    g.drawEllipse(-3, -2, 6, 3);
    g.endFill();

    // Lever handle
    const leverAngle = -Math.PI / 4 + this.animationProgress * Math.PI / 2;
    const leverLength = 22;
    const leverX = Math.cos(leverAngle) * leverLength;
    const leverY = Math.sin(leverAngle) * leverLength - 10;

    const colors = state.position === 'on' ? STATE_COLORS.lever.on : STATE_COLORS.lever.off;

    // Lever rod
    g.lineStyle(5, adjustBrightness(colors.handle, 0.6));
    g.moveTo(0, -10);
    g.lineTo(leverX, leverY);
    g.lineStyle(3, colors.handle);
    g.moveTo(0, -10);
    g.lineTo(leverX, leverY);
    g.lineStyle(0);

    // Handle ball with highlight
    g.beginFill(colors.handle);
    g.drawCircle(leverX, leverY, 6);
    g.endFill();

    g.beginFill(adjustBrightness(colors.handle, 1.3), 0.6);
    g.drawCircle(leverX - 1.5, leverY - 1.5, 2);
    g.endFill();

    // Strength requirement indicator
    if (state.requiresStrength) {
      g.lineStyle(1.5, PALETTE.oceanBlue, 0.7);
      g.drawCircle(0, -10, 5);
      g.lineStyle(0);
    }
  }

  private renderPressurePlate(): void {
    const state = this.interactable.state as { activated: boolean; weightThreshold: 'light' | 'heavy' };
    const g = this.mainGraphics;
    const sg = this.shadowGraphics;

    this.targetAnimationProgress = state.activated ? 1 : 0;
    const pressDepth = this.animationProgress * 4;

    const colors = state.activated ? STATE_COLORS.plate.active : STATE_COLORS.plate.inactive;
    const isHeavy = state.weightThreshold === 'heavy';

    // Plate recess (always visible)
    sg.beginFill(PALETTE.deepVoid, 0.4);
    sg.drawRoundedRect(-16, -9, 32, 18, 3);
    sg.endFill();

    // Plate body
    g.beginFill(colors.fill);
    g.drawRoundedRect(-15, -8 + pressDepth, 30, 16 - pressDepth, 2);
    g.endFill();

    // Top highlight
    g.beginFill(adjustBrightness(colors.fill, 1.25), 0.6);
    g.drawRoundedRect(-13, -6 + pressDepth, 26, 3, 1);
    g.endFill();

    // Active glow
    if (state.activated && colors.glow) {
      const glowPulse = pulse(this.time, 0.004);
      g.beginFill(colors.glow, 0.2 + glowPulse * 0.2);
      g.drawRoundedRect(-17, -10, 34, 20, 4);
      g.endFill();
    }

    // Heavy indicator
    if (isHeavy && !state.activated) {
      g.beginFill(PALETTE.sunsetOrange, 0.5);
      g.drawCircle(0, 0 + pressDepth, 4);
      g.endFill();
    }
  }

  private renderButton(): void {
    const state = this.interactable.state as { pressed: boolean; momentary?: boolean };
    const g = this.mainGraphics;
    const sg = this.shadowGraphics;

    this.targetAnimationProgress = state.pressed ? 1 : 0;
    const pressDepth = this.animationProgress * 5;

    const colors = state.pressed ? STATE_COLORS.button.pressed : (this.isHovered ? STATE_COLORS.button.hover : STATE_COLORS.button.idle);

    // Shadow
    sg.beginFill(SHADOWS.interactable.color, SHADOWS.interactable.alpha);
    sg.drawCircle(2, 2, 11);
    sg.endFill();

    // Button base
    g.beginFill(adjustBrightness(colors.fill, 0.6));
    g.drawCircle(0, 5, 13);
    g.endFill();

    // Button face
    g.beginFill(colors.fill);
    g.drawCircle(0, -pressDepth, 12);
    g.endFill();

    // Highlight
    g.beginFill(adjustBrightness(colors.fill, 1.3), 0.5);
    g.drawEllipse(-3, -3 - pressDepth, 5, 4);
    g.endFill();

    // Timed button indicator (ring)
    if (state.momentary) {
      const ringPulse = pulse(this.time, 0.006);
      g.lineStyle(2, PALETTE.warningYellow, 0.4 + ringPulse * 0.3);
      g.drawCircle(0, -pressDepth, 15);
      g.lineStyle(0);
    }
  }

  private renderCrate(): void {
    const state = this.interactable.state as { beingPushed: boolean };
    const g = this.mainGraphics;
    const sg = this.shadowGraphics;

    const wobble = state.beingPushed ? Math.sin(this.time * 0.015) * 2 : 0;
    const crateSize = 26;

    // Shadow
    sg.beginFill(SHADOWS.prop.color, SHADOWS.prop.alpha);
    sg.drawEllipse(SHADOWS.prop.offsetX + wobble * 0.3, SHADOWS.prop.offsetY + ISO.tileHeight * 0.25, 16, 8);
    sg.endFill();

    // Back face (darker)
    g.beginFill(PALETTE.crateDark);
    g.drawRect(-crateSize / 2 + wobble + 4, -crateSize - 4, crateSize, crateSize);
    g.endFill();

    // Front face
    g.beginFill(PALETTE.crateMain);
    g.drawRect(-crateSize / 2 + wobble, -crateSize, crateSize, crateSize);
    g.endFill();

    // Top face (lightest)
    g.beginFill(PALETTE.crateLight);
    g.moveTo(-crateSize / 2 + wobble, -crateSize);
    g.lineTo(crateSize / 2 + wobble, -crateSize);
    g.lineTo(crateSize / 2 + wobble + 4, -crateSize - 4);
    g.lineTo(-crateSize / 2 + wobble + 4, -crateSize - 4);
    g.closePath();
    g.endFill();

    // Wood grain / cross pattern
    g.lineStyle(2, adjustBrightness(PALETTE.crateMain, 0.7));
    g.moveTo(-crateSize / 2 + wobble + 3, -crateSize + 3);
    g.lineTo(crateSize / 2 + wobble - 3, -3);
    g.moveTo(crateSize / 2 + wobble - 3, -crateSize + 3);
    g.lineTo(-crateSize / 2 + wobble + 3, -3);
    g.lineStyle(0);

    // Highlight edge
    g.beginFill(adjustBrightness(PALETTE.crateLight, 1.2), 0.4);
    g.drawRect(-crateSize / 2 + wobble, -crateSize, 2, crateSize);
    g.endFill();
  }

  private renderHazard(): void {
    const state = this.interactable.state as { active: boolean; hazardType: 'laser' | 'spikes' | 'electric' };
    const g = this.mainGraphics;

    const colors = state.active ? STATE_COLORS.hazard.active : STATE_COLORS.hazard.inactive;

    if (state.hazardType === 'laser') {
      // Laser emitter base
      g.beginFill(PALETTE.stoneGray);
      g.drawRect(-8, -16, 16, 20);
      g.endFill();

      // Emitter lens
      g.beginFill(state.active ? colors.fill : PALETTE.hazardInactive);
      g.drawCircle(0, -12, 5);
      g.endFill();

      if (state.active) {
        // Laser beam (horizontal for demo)
        drawLaserBeam(g, 6, -12, 60, -12, this.time, true);

        // Warning glow
        const glowPulse = pulse(this.time, 0.008);
        g.beginFill(colors.glow, 0.15 + glowPulse * 0.15);
        g.drawCircle(0, -12, 10);
        g.endFill();
      }
    } else if (state.hazardType === 'spikes') {
      const spikeCount = 5;
      const spikeWidth = 6;
      const spikeHeight = state.active ? 18 : 4;
      const baseY = 0;

      // Base plate
      g.beginFill(PALETTE.stoneGray);
      g.drawRect(-15, baseY - 4, 30, 8);
      g.endFill();

      // Spikes
      for (let i = 0; i < spikeCount; i++) {
        const x = -12 + i * 6;
        const wobble = state.active ? Math.sin(this.time * 0.01 + i * 0.5) * 1 : 0;

        g.beginFill(state.active ? colors.fill : PALETTE.hazardInactive);
        g.moveTo(x, baseY - 4);
        g.lineTo(x + spikeWidth / 2 + wobble, baseY - 4 - spikeHeight);
        g.lineTo(x + spikeWidth, baseY - 4);
        g.closePath();
        g.endFill();

        // Spike highlight
        if (state.active) {
          g.beginFill(PALETTE.glowWhite, 0.3);
          g.moveTo(x + 1, baseY - 5);
          g.lineTo(x + spikeWidth / 2, baseY - 4 - spikeHeight + 3);
          g.lineTo(x + 2, baseY - 5);
          g.closePath();
          g.endFill();
        }
      }

      // Danger warning
      if (state.active) {
        drawHazardWarning(g, 0, -spikeHeight / 2, 20, this.time);
      }
    }
  }

  private renderPlatform(): void {
    const state = this.interactable.state as { currentPosition: number; moving: boolean };
    const g = this.mainGraphics;
    const sg = this.shadowGraphics;

    const bobOffset = state.moving ? Math.sin(this.time * 0.002) * 3 : 0;

    // Shadow
    sg.beginFill(SHADOWS.prop.color, SHADOWS.prop.alpha * 0.7);
    sg.drawEllipse(0, ISO.tileHeight * 0.35 - bobOffset * 0.3, 22, 11);
    sg.endFill();

    // Platform body (3D)
    g.beginFill(adjustBrightness(PALETTE.platformMain, 0.7));
    g.drawRect(-26, -6 + bobOffset + 4, 52, 10);
    g.endFill();

    // Platform surface
    g.beginFill(PALETTE.platformMain);
    g.drawRect(-26, -10 + bobOffset, 52, 14);
    g.endFill();

    // Surface highlight
    g.beginFill(adjustBrightness(PALETTE.platformMain, 1.2), 0.5);
    g.drawRect(-24, -8 + bobOffset, 48, 3);
    g.endFill();

    // Edge trim
    g.beginFill(PALETTE.platformEdge);
    g.drawRect(-26, -10 + bobOffset, 52, 2);
    g.endFill();

    // Position indicator dots
    const dotCount = 3;
    for (let i = 0; i < dotCount; i++) {
      const isActive = state.currentPosition >= i / (dotCount - 1);
      g.beginFill(isActive ? PALETTE.forestGreen : PALETTE.stoneGray, isActive ? 1 : 0.4);
      g.drawCircle(-16 + i * 16, 0 + bobOffset, 3);
      g.endFill();
    }

    // Moving indicator
    if (state.moving) {
      const arrowPulse = pulse(this.time, 0.006);
      g.beginFill(PALETTE.amberGold, 0.4 + arrowPulse * 0.4);
      g.drawRect(-3, -16 + bobOffset, 6, 4);
      g.endFill();
    }
  }

  private renderCheckpoint(): void {
    const state = this.interactable.state as { activated: boolean };
    const g = this.mainGraphics;
    const sg = this.shadowGraphics;

    const colors = state.activated ? {
      base: PALETTE.checkpointActive,
      glow: PALETTE.forestGreen,
    } : {
      base: PALETTE.checkpointInactive,
      glow: 0x000000,
    };

    // Shadow
    sg.beginFill(SHADOWS.interactable.color, SHADOWS.interactable.alpha);
    sg.drawEllipse(2, 2, 12, 6);
    sg.endFill();

    // Base platform
    g.beginFill(PALETTE.stoneGray);
    g.drawEllipse(0, 0, 16, 8);
    g.endFill();

    // Crystal/beacon
    g.beginFill(colors.base);
    g.moveTo(0, -30);
    g.lineTo(8, -10);
    g.lineTo(0, -5);
    g.lineTo(-8, -10);
    g.closePath();
    g.endFill();

    // Crystal highlight
    g.beginFill(adjustBrightness(colors.base, 1.4), 0.6);
    g.moveTo(-2, -28);
    g.lineTo(-6, -12);
    g.lineTo(-2, -8);
    g.closePath();
    g.endFill();

    // Active glow
    if (state.activated) {
      const glowPulse = pulse(this.time, 0.003);
      g.beginFill(colors.glow, 0.15 + glowPulse * 0.2);
      g.drawCircle(0, -15, 18 + glowPulse * 5);
      g.endFill();

      // Sparkle particles
      for (let i = 0; i < 3; i++) {
        const angle = (this.time * 0.002 + i * 2) % (Math.PI * 2);
        const dist = 12 + Math.sin(this.time * 0.005 + i) * 4;
        const px = Math.cos(angle) * dist;
        const py = -15 + Math.sin(angle) * dist * 0.5;

        g.beginFill(PALETTE.glowWhite, 0.6);
        g.drawCircle(px, py, 1.5);
        g.endFill();
      }
    }
  }

  private renderWinch(): void {
    const state = this.interactable.state as { extended: number; operating: boolean };
    const g = this.mainGraphics;
    const sg = this.shadowGraphics;

    // Shadow
    sg.beginFill(SHADOWS.interactable.color, SHADOWS.interactable.alpha);
    sg.drawEllipse(2, 2, 14, 7);
    sg.endFill();

    // Base
    g.beginFill(PALETTE.doorFrame);
    g.drawRect(-18, -6, 36, 14);
    g.endFill();

    // Drum
    const drumRotation = state.operating ? this.time * 0.004 : 0;
    g.beginFill(PALETTE.guardPurple);
    g.drawCircle(0, -18, 14);
    g.endFill();

    // Drum spokes
    g.lineStyle(2, adjustBrightness(PALETTE.guardPurple, 0.7));
    for (let i = 0; i < 4; i++) {
      const angle = drumRotation + (i * Math.PI) / 2;
      g.moveTo(0, -18);
      g.lineTo(Math.cos(angle) * 11, -18 + Math.sin(angle) * 11);
    }
    g.lineStyle(0);

    // Progress bar
    g.beginFill(PALETTE.stoneGray);
    g.drawRect(-14, 4, 28, 6);
    g.endFill();

    const progressWidth = state.extended * 24;
    g.beginFill(PALETTE.forestGreen);
    g.drawRect(-12, 5, progressWidth, 4);
    g.endFill();
  }

  private renderCameraNode(): void {
    const state = this.interactable.state as { active: boolean; rotation: number };
    const g = this.mainGraphics;
    const sg = this.shadowGraphics;

    // Shadow
    sg.beginFill(SHADOWS.interactable.color, SHADOWS.interactable.alpha);
    sg.drawEllipse(2, 2, 8, 4);
    sg.endFill();

    // Pole
    g.beginFill(PALETTE.stoneGray);
    g.drawRect(-3, -35, 6, 38);
    g.endFill();

    // Camera body
    const camX = Math.cos((state.rotation - 90) * Math.PI / 180) * 8;
    const camY = Math.sin((state.rotation - 90) * Math.PI / 180) * 4 - 32;

    g.beginFill(state.active ? PALETTE.forestGreen : PALETTE.hazardInactive);
    g.drawRect(camX - 6, camY - 4, 12, 8);
    g.endFill();

    // Lens
    g.beginFill(state.active ? PALETTE.checkpointActive : PALETTE.stoneGray);
    g.drawCircle(camX, camY, 3);
    g.endFill();

    // Active indicator light
    if (state.active) {
      const blink = Math.floor(this.time / 500) % 2 === 0;
      g.beginFill(blink ? PALETTE.dangerRed : PALETTE.hazardInactive);
      g.drawCircle(camX + 4, camY - 2, 2);
      g.endFill();
    }
  }

  private renderConveyor(): void {
    const state = this.interactable.state as { active: boolean; direction: { x: number; y: number }; speed: number };
    const g = this.mainGraphics;

    const beltWidth = 50;
    const beltHeight = 14;
    const stripeOffset = state.active ? (this.time * state.speed * 0.05) % 10 : 0;

    // Belt base
    g.beginFill(PALETTE.stoneGray);
    g.drawRect(-beltWidth / 2, -beltHeight / 2, beltWidth, beltHeight);
    g.endFill();

    // Belt surface with stripes
    g.beginFill(adjustBrightness(PALETTE.stoneGray, 0.8));
    for (let i = -3; i < 6; i++) {
      const stripeX = -beltWidth / 2 + i * 10 + stripeOffset * state.direction.x;
      if (stripeX > -beltWidth / 2 && stripeX < beltWidth / 2 - 5) {
        g.drawRect(stripeX, -beltHeight / 2 + 2, 5, beltHeight - 4);
      }
    }
    g.endFill();

    // Direction arrows
    if (state.active) {
      const arrowX = state.direction.x * 15;
      g.beginFill(PALETTE.amberGold, 0.7);
      g.moveTo(arrowX, 0);
      g.lineTo(arrowX - state.direction.x * 8, -4);
      g.lineTo(arrowX - state.direction.x * 8, 4);
      g.closePath();
      g.endFill();
    }

    // Side rails
    g.beginFill(PALETTE.wallLight);
    g.drawRect(-beltWidth / 2 - 2, -beltHeight / 2 - 2, beltWidth + 4, 3);
    g.drawRect(-beltWidth / 2 - 2, beltHeight / 2 - 1, beltWidth + 4, 3);
    g.endFill();
  }

  private renderSpikeTrap(): void {
    const state = this.interactable.state as { active: boolean; rotation: number; rotationSpeed: number; armLength: number };
    const g = this.mainGraphics;
    const sg = this.shadowGraphics;

    // Shadow
    sg.beginFill(SHADOWS.interactable.color, SHADOWS.interactable.alpha);
    sg.drawCircle(2, 2, 18);
    sg.endFill();

    // Base
    g.beginFill(PALETTE.stoneGray);
    g.drawCircle(0, 0, 10);
    g.endFill();

    if (state.active) {
      // Rotating arm with spikes
      const currentRotation = (state.rotation + this.time * state.rotationSpeed * 0.001) * Math.PI / 180;
      const armLength = state.armLength * ISO.tileWidth / 2;

      // Arm
      g.lineStyle(4, PALETTE.wallLight);
      g.moveTo(0, 0);
      const armEndX = Math.cos(currentRotation) * armLength;
      const armEndY = Math.sin(currentRotation) * armLength * 0.5; // Flatten for isometric
      g.lineTo(armEndX, armEndY);
      g.lineStyle(0);

      // Spike at end
      g.beginFill(PALETTE.dangerRed);
      g.drawCircle(armEndX, armEndY, 6);
      g.endFill();

      // Danger glow
      const glowPulse = pulse(this.time, 0.008);
      g.beginFill(PALETTE.hazardGlow, 0.2 + glowPulse * 0.2);
      g.drawCircle(armEndX, armEndY, 10);
      g.endFill();
    }

    // Center cap
    g.beginFill(state.active ? PALETTE.dangerRed : PALETTE.hazardInactive);
    g.drawCircle(0, 0, 5);
    g.endFill();
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
