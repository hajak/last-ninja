/**
 * Panda & Dog - Minimap
 * Shows a top-down view of the level with player positions using design tokens
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { LevelData, WorldPos, TileType, EntityState, GuardStateClient } from '../../../shared/types';
import {
  PALETTE,
  TYPOGRAPHY,
  SPACING,
  RADII,
  adjustBrightness,
  pulse,
} from '../../../shared/designTokens';

const TILE_COLORS: Record<TileType, number> = {
  ground: PALETTE.tileGround,
  grass: PALETTE.tileGrass,
  stone: PALETTE.tileStone,
  water: PALETTE.tileWater,
  wall: PALETTE.tileWall,
  bridge: PALETTE.tileBridge,
  void: PALETTE.tileVoid,
};

interface MinimapConfig {
  width: number;
  height: number;
  padding: number;
  scale: number;
  showGuards: boolean;
  showInteractables: boolean;
}

const DEFAULT_CONFIG: MinimapConfig = {
  width: 160,
  height: 120,
  padding: 8,
  scale: 4,
  showGuards: true,
  showInteractables: true,
};

export class Minimap {
  public container: Container;

  private config: MinimapConfig;
  private background: Graphics;
  private mapGraphics: Graphics;
  private entitiesGraphics: Graphics;
  private borderGraphics: Graphics;
  private titleText: Text;

  private levelData: LevelData | null = null;
  private levelWidth = 0;
  private levelHeight = 0;

  private dogPosition: WorldPos | null = null;
  private pandaPosition: WorldPos | null = null;
  private guardPositions: WorldPos[] = [];

  private time = 0;

  constructor(x: number, y: number, config: Partial<MinimapConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.container = new Container();
    this.container.position.set(x, y);

    this.background = new Graphics();
    this.container.addChild(this.background);

    this.mapGraphics = new Graphics();
    this.container.addChild(this.mapGraphics);

    this.entitiesGraphics = new Graphics();
    this.container.addChild(this.entitiesGraphics);

    this.borderGraphics = new Graphics();
    this.container.addChild(this.borderGraphics);

    const titleStyle = new TextStyle({
      fontFamily: TYPOGRAPHY.fontPrimary,
      fontSize: TYPOGRAPHY.sizes.xs,
      fontWeight: String(TYPOGRAPHY.weights.semibold),
      fill: PALETTE.uiTextSecondary,
    });
    this.titleText = new Text('MAP', titleStyle);
    this.titleText.anchor.set(0.5, 0);
    this.titleText.position.set(this.config.width / 2, SPACING[1]);
    this.container.addChild(this.titleText);

    this.drawBackground();
    this.drawBorder();
  }

  private drawBackground(): void {
    this.background.clear();
    this.background.beginFill(PALETTE.uiBackground, 0.92);
    this.background.drawRoundedRect(0, 0, this.config.width, this.config.height, RADII.lg);
    this.background.endFill();
  }

  private drawBorder(): void {
    this.borderGraphics.clear();
    this.borderGraphics.lineStyle(1, PALETTE.uiBorder, 0.6);
    this.borderGraphics.drawRoundedRect(0, 0, this.config.width, this.config.height, RADII.lg);
  }

  setLevel(levelData: LevelData): void {
    this.levelData = levelData;
    this.levelWidth = levelData.width;
    this.levelHeight = levelData.height;

    const mapAreaWidth = this.config.width - this.config.padding * 2;
    const mapAreaHeight = this.config.height - this.config.padding * 2 - 16;

    const scaleX = mapAreaWidth / this.levelWidth;
    const scaleY = mapAreaHeight / this.levelHeight;
    this.config.scale = Math.min(scaleX, scaleY);

    this.drawMap();
  }

  private drawMap(): void {
    if (!this.levelData) return;

    this.mapGraphics.clear();

    const offsetX = this.config.padding;
    const offsetY = this.config.padding + 14;
    const scale = this.config.scale;

    for (let y = 0; y < this.levelData.height; y++) {
      for (let x = 0; x < this.levelData.width; x++) {
        const tile = this.levelData.tiles[y][x];
        let color = TILE_COLORS[tile.type] ?? PALETTE.stoneGray;

        if (tile.elevation > 0) {
          color = adjustBrightness(color, 1 + tile.elevation * 0.1);
        }

        this.mapGraphics.beginFill(color);
        this.mapGraphics.drawRect(offsetX + x * scale, offsetY + y * scale, scale, scale);
        this.mapGraphics.endFill();
      }
    }

    if (this.config.showInteractables && this.levelData.interactables) {
      for (const interactable of this.levelData.interactables) {
        let color = PALETTE.amberGold;
        let size = scale * 0.8;

        switch (interactable.type) {
          case 'door':
            color = PALETTE.doorClosed;
            break;
          case 'lever':
          case 'button':
            color = PALETTE.buttonIdle;
            size = scale * 0.6;
            break;
          case 'pressure_plate':
            color = PALETTE.oceanBlue;
            break;
          case 'hazard':
          case 'spike_trap':
            color = PALETTE.hazardActive;
            break;
          case 'checkpoint':
            color = PALETTE.checkpointActive;
            break;
          default:
            continue;
        }

        const ix = offsetX + interactable.position.x * scale;
        const iy = offsetY + interactable.position.y * scale;

        this.mapGraphics.beginFill(color, 0.8);
        this.mapGraphics.drawRect(ix - size / 2, iy - size / 2, size, size);
        this.mapGraphics.endFill();
      }
    }
  }

  updateEntities(entities: EntityState[], guards?: GuardStateClient[]): void {
    for (const entity of entities) {
      if (entity.type === 'dog') {
        this.dogPosition = entity.position;
      } else if (entity.type === 'panda') {
        this.pandaPosition = entity.position;
      }
    }

    if (guards && this.config.showGuards) {
      this.guardPositions = guards.map((g) => g.position);
    }
  }

  update(deltaTime: number): void {
    this.time += deltaTime;

    this.entitiesGraphics.clear();

    const offsetX = this.config.padding;
    const offsetY = this.config.padding + 14;
    const scale = this.config.scale;

    if (this.config.showGuards) {
      for (const guardPos of this.guardPositions) {
        const gx = offsetX + guardPos.x * scale;
        const gy = offsetY + guardPos.y * scale;

        this.entitiesGraphics.beginFill(PALETTE.dangerRed, 0.8);
        this.entitiesGraphics.drawRect(gx - scale * 0.5, gy - scale * 0.5, scale, scale);
        this.entitiesGraphics.endFill();
      }
    }

    const blinkAlpha = 0.7 + pulse(this.time, 0.004) * 0.3;

    if (this.dogPosition) {
      const dx = offsetX + this.dogPosition.x * scale;
      const dy = offsetY + this.dogPosition.y * scale;

      this.entitiesGraphics.beginFill(PALETTE.dogPrimary, blinkAlpha);
      this.entitiesGraphics.drawCircle(dx, dy, scale * 0.7);
      this.entitiesGraphics.endFill();

      this.entitiesGraphics.lineStyle(1, PALETTE.glowWhite, 0.6);
      this.entitiesGraphics.drawCircle(dx, dy, scale * 0.7);
    }

    if (this.pandaPosition) {
      const px = offsetX + this.pandaPosition.x * scale;
      const py = offsetY + this.pandaPosition.y * scale;

      this.entitiesGraphics.beginFill(PALETTE.pandaPrimary, blinkAlpha);
      this.entitiesGraphics.drawCircle(px, py, scale * 0.8);
      this.entitiesGraphics.endFill();

      this.entitiesGraphics.lineStyle(1, PALETTE.pandaLight, 0.6);
      this.entitiesGraphics.drawCircle(px, py, scale * 0.8);
    }
  }

  setPosition(x: number, y: number): void {
    this.container.position.set(x, y);
  }

  setVisible(visible: boolean): void {
    this.container.visible = visible;
  }

  isVisible(): boolean {
    return this.container.visible;
  }

  toggle(): void {
    this.container.visible = !this.container.visible;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
