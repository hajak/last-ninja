/**
 * Panda & Dog - Compact HUD
 * Displays character status, role indicator, and level info using design tokens
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { Role } from '../../../shared/types';
import {
  PALETTE,
  TYPOGRAPHY,
  SPACING,
  RADII,
  adjustBrightness,
  pulse,
} from '../../../shared/designTokens';

interface CharacterStatus {
  role: Role;
  alive: boolean;
  canInteract: boolean;
}

interface HUDConfig {
  showRoleIndicator: boolean;
  showLevelInfo: boolean;
  showControls: boolean;
}

const DEFAULT_CONFIG: HUDConfig = {
  showRoleIndicator: true,
  showLevelInfo: true,
  showControls: true,
};

export class HUD {
  public container: Container;

  private config: HUDConfig;
  private role: Role;
  private levelName = 'Level 1';
  private partnerConnected = false;

  private statusPanel: Container;
  private statusBackground: Graphics;
  private roleIcon: Graphics;
  private roleLabel: Text;
  private statusIndicator: Graphics;

  private levelPanel: Container;
  private levelBackground: Graphics;
  private levelText: Text;
  private partnerStatus: Graphics;
  private partnerText: Text;

  private controlsPanel: Container;
  private controlsBackground: Graphics;
  private controlsText: Text;

  private time = 0;

  constructor(role: Role, screenWidth: number, screenHeight: number, config: Partial<HUDConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.role = role;

    this.container = new Container();
    this.container.sortableChildren = true;

    this.statusPanel = new Container();
    this.statusBackground = new Graphics();
    this.roleIcon = new Graphics();
    this.statusIndicator = new Graphics();
    this.statusPanel.addChild(this.statusBackground);
    this.statusPanel.addChild(this.roleIcon);
    this.statusPanel.addChild(this.statusIndicator);

    const roleStyle = new TextStyle({
      fontFamily: TYPOGRAPHY.fontPrimary,
      fontSize: TYPOGRAPHY.sizes.base,
      fontWeight: String(TYPOGRAPHY.weights.semibold),
      fill: PALETTE.uiText,
    });
    this.roleLabel = new Text('', roleStyle);
    this.statusPanel.addChild(this.roleLabel);

    this.levelPanel = new Container();
    this.levelBackground = new Graphics();
    this.partnerStatus = new Graphics();
    this.levelPanel.addChild(this.levelBackground);
    this.levelPanel.addChild(this.partnerStatus);

    const levelStyle = new TextStyle({
      fontFamily: TYPOGRAPHY.fontPrimary,
      fontSize: TYPOGRAPHY.sizes.sm,
      fontWeight: String(TYPOGRAPHY.weights.medium),
      fill: PALETTE.uiTextSecondary,
    });
    this.levelText = new Text('', levelStyle);
    this.levelPanel.addChild(this.levelText);

    const partnerStyle = new TextStyle({
      fontFamily: TYPOGRAPHY.fontPrimary,
      fontSize: TYPOGRAPHY.sizes.xs,
      fill: PALETTE.uiTextMuted,
    });
    this.partnerText = new Text('', partnerStyle);
    this.levelPanel.addChild(this.partnerText);

    this.controlsPanel = new Container();
    this.controlsBackground = new Graphics();
    this.controlsPanel.addChild(this.controlsBackground);

    const controlsStyle = new TextStyle({
      fontFamily: TYPOGRAPHY.fontMono,
      fontSize: TYPOGRAPHY.sizes.xs,
      fill: PALETTE.uiTextMuted,
      align: 'center',
    });
    this.controlsText = new Text('', controlsStyle);
    this.controlsPanel.addChild(this.controlsText);

    if (this.config.showRoleIndicator) {
      this.container.addChild(this.statusPanel);
    }
    if (this.config.showLevelInfo) {
      this.container.addChild(this.levelPanel);
    }
    if (this.config.showControls) {
      this.container.addChild(this.controlsPanel);
    }

    this.layoutPanels(screenWidth, screenHeight);
    this.render();
  }

  private layoutPanels(screenWidth: number, screenHeight: number): void {
    const margin = SPACING[4];

    this.statusPanel.position.set(margin, margin);

    this.levelPanel.position.set(screenWidth - margin - 140, margin);

    this.controlsPanel.position.set(
      screenWidth / 2,
      screenHeight - margin - 24
    );
  }

  private render(): void {
    this.renderStatusPanel();
    this.renderLevelPanel();
    this.renderControlsPanel();
  }

  private renderStatusPanel(): void {
    const width = 140;
    const height = 40;

    this.statusBackground.clear();
    this.statusBackground.beginFill(PALETTE.uiBackground, 0.9);
    this.statusBackground.drawRoundedRect(0, 0, width, height, RADII.md);
    this.statusBackground.endFill();
    this.statusBackground.lineStyle(1, PALETTE.uiBorder, 0.6);
    this.statusBackground.drawRoundedRect(0, 0, width, height, RADII.md);

    const iconSize = 24;
    const iconX = SPACING[2];
    const iconY = (height - iconSize) / 2;

    this.roleIcon.clear();
    const roleColor = this.role === 'dog' ? PALETTE.dogPrimary : PALETTE.pandaPrimary;
    const roleColorLight = this.role === 'dog' ? PALETTE.dogSecondary : PALETTE.pandaLight;

    this.roleIcon.beginFill(roleColor);
    this.roleIcon.drawRoundedRect(iconX, iconY, iconSize, iconSize, RADII.sm);
    this.roleIcon.endFill();

    if (this.role === 'dog') {
      this.roleIcon.beginFill(roleColorLight);
      this.roleIcon.drawCircle(iconX + 8, iconY + 10, 4);
      this.roleIcon.drawCircle(iconX + 16, iconY + 10, 4);
      this.roleIcon.drawEllipse(iconX + 12, iconY + 17, 5, 3);
      this.roleIcon.endFill();
    } else {
      this.roleIcon.beginFill(roleColorLight);
      this.roleIcon.drawCircle(iconX + 8, iconY + 10, 5);
      this.roleIcon.drawCircle(iconX + 16, iconY + 10, 5);
      this.roleIcon.endFill();
      this.roleIcon.beginFill(PALETTE.pandaPrimary);
      this.roleIcon.drawCircle(iconX + 8, iconY + 10, 2);
      this.roleIcon.drawCircle(iconX + 16, iconY + 10, 2);
      this.roleIcon.endFill();
    }

    this.roleLabel.text = this.role === 'dog' ? 'Dog' : 'Panda';
    this.roleLabel.position.set(iconX + iconSize + SPACING[2], (height - this.roleLabel.height) / 2);

    const statusSize = 8;
    const statusX = width - SPACING[3] - statusSize;
    const statusY = (height - statusSize) / 2;

    this.statusIndicator.clear();
    this.statusIndicator.beginFill(PALETTE.forestGreen);
    this.statusIndicator.drawCircle(statusX, statusY + statusSize / 2, statusSize / 2);
    this.statusIndicator.endFill();
  }

  private renderLevelPanel(): void {
    const width = 140;
    const height = 40;

    this.levelBackground.clear();
    this.levelBackground.beginFill(PALETTE.uiBackground, 0.9);
    this.levelBackground.drawRoundedRect(0, 0, width, height, RADII.md);
    this.levelBackground.endFill();
    this.levelBackground.lineStyle(1, PALETTE.uiBorder, 0.6);
    this.levelBackground.drawRoundedRect(0, 0, width, height, RADII.md);

    this.levelText.text = this.levelName;
    this.levelText.position.set(SPACING[2], SPACING[1]);

    const partnerColor = this.partnerConnected ? PALETTE.forestGreen : PALETTE.warningYellow;
    const partnerLabel = this.partnerConnected ? 'Partner connected' : 'Waiting...';

    this.partnerStatus.clear();
    this.partnerStatus.beginFill(partnerColor);
    this.partnerStatus.drawCircle(SPACING[2] + 4, height - SPACING[2] - 4, 4);
    this.partnerStatus.endFill();

    this.partnerText.text = partnerLabel;
    this.partnerText.position.set(SPACING[2] + 12, height - SPACING[2] - 8);
  }

  private renderControlsPanel(): void {
    const text = 'WASD Move  |  E Interact  |  M Map';
    this.controlsText.text = text;

    const padding = SPACING[2];
    const width = this.controlsText.width + padding * 2;
    const height = this.controlsText.height + padding;

    this.controlsBackground.clear();
    this.controlsBackground.beginFill(PALETTE.uiBackground, 0.7);
    this.controlsBackground.drawRoundedRect(-width / 2, 0, width, height, RADII.sm);
    this.controlsBackground.endFill();

    this.controlsText.anchor.set(0.5, 0);
    this.controlsText.position.set(0, padding / 2);
  }

  setLevelName(name: string): void {
    this.levelName = name;
    this.renderLevelPanel();
  }

  setPartnerConnected(connected: boolean): void {
    this.partnerConnected = connected;
    this.renderLevelPanel();
  }

  updateStatus(status: CharacterStatus): void {
    const statusColor = status.alive ? PALETTE.forestGreen : PALETTE.dangerRed;

    this.statusIndicator.clear();
    this.statusIndicator.beginFill(statusColor);
    this.statusIndicator.drawCircle(
      140 - SPACING[3] - 4,
      20,
      4
    );
    this.statusIndicator.endFill();

    if (status.canInteract) {
      const glowAlpha = pulse(this.time, 0.004) * 0.3;
      this.statusIndicator.beginFill(PALETTE.amberGold, glowAlpha);
      this.statusIndicator.drawCircle(140 - SPACING[3] - 4, 20, 8);
      this.statusIndicator.endFill();
    }
  }

  update(deltaTime: number): void {
    this.time += deltaTime;
  }

  resize(screenWidth: number, screenHeight: number): void {
    this.layoutPanels(screenWidth, screenHeight);
  }

  setVisible(visible: boolean): void {
    this.container.visible = visible;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
