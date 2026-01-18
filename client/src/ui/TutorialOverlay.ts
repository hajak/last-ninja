/**
 * Panda & Dog - Tutorial Overlay
 * Displays tutorial hints and help information
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { Role } from '../../../shared/types';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  position?: 'center' | 'top' | 'bottom';
  highlight?: { x: number; y: number; width: number; height: number };
  duration?: number;
  condition?: () => boolean;
}

const TUTORIAL_STEPS: Record<string, TutorialStep[]> = {
  vertical_slice: [
    {
      id: 'welcome',
      title: 'Welcome to Panda & Dog!',
      description: 'Work together with your partner to solve puzzles and escape!',
      position: 'center',
      duration: 4000,
    },
    {
      id: 'movement',
      title: 'Movement',
      description: 'Use WASD or Arrow Keys to move.\nHold SHIFT to run!',
      position: 'bottom',
      duration: 5000,
    },
    {
      id: 'roles',
      title: 'Different Abilities',
      description: 'Dog is fast and can fit through small gaps.\nPanda is strong and can push heavy objects.',
      position: 'center',
      duration: 5000,
    },
    {
      id: 'interact',
      title: 'Interaction',
      description: 'Press E near objects to interact.\nLook for the interaction prompt!',
      position: 'bottom',
      duration: 4000,
    },
    {
      id: 'cooperation',
      title: 'Cooperation',
      description: 'Some puzzles require both players.\nCommunicate and work together!',
      position: 'center',
      duration: 4000,
    },
  ],
  warehouse: [
    {
      id: 'timed_buttons',
      title: 'Timed Buttons',
      description: 'Some buttons have timers.\nBoth players must press them within the time limit!',
      position: 'center',
      duration: 5000,
    },
    {
      id: 'conveyors',
      title: 'Conveyor Belts',
      description: 'Conveyor belts move objects automatically.\nUse levers to control their direction!',
      position: 'center',
      duration: 5000,
    },
  ],
  gardens: [
    {
      id: 'spike_traps',
      title: 'Spike Traps',
      description: 'Watch out for rotating spike traps!\nTime your movement carefully.',
      position: 'center',
      duration: 5000,
    },
    {
      id: 'mirrors',
      title: 'Mirror Puzzles',
      description: 'Use mirrors to redirect laser beams.\nRotate them to solve puzzles!',
      position: 'center',
      duration: 5000,
    },
  ],
  fortress: [
    {
      id: 'guards',
      title: 'Guards',
      description: 'Avoid the guards\' vision cones!\nIf spotted, you\'ll be sent back to the checkpoint.',
      position: 'center',
      duration: 6000,
    },
    {
      id: 'distraction',
      title: 'Distraction',
      description: 'Use buttons and objects to distract guards.\nOne player can draw attention while the other sneaks by.',
      position: 'center',
      duration: 5000,
    },
  ],
  temple: [
    {
      id: 'final_level',
      title: 'The Temple',
      description: 'This is the final challenge!\nEverything you\'ve learned will be tested.',
      position: 'center',
      duration: 5000,
    },
  ],
};

export class TutorialOverlay {
  public container: Container;

  private background: Graphics;
  private panel: Graphics;
  private titleText: Text;
  private descriptionText: Text;
  private skipHint: Text;

  private currentSteps: TutorialStep[] = [];
  private currentStepIndex = 0;
  private stepTimer = 0;
  private isVisible = false;
  private isDismissed = false;
  private role: Role;

  constructor(screenWidth: number, screenHeight: number, role: Role) {
    this.role = role;
    this.container = new Container();
    this.container.visible = false;

    // Semi-transparent background
    this.background = new Graphics();
    this.background.beginFill(0x000000, 0.5);
    this.background.drawRect(0, 0, screenWidth, screenHeight);
    this.background.endFill();
    this.container.addChild(this.background);

    // Tutorial panel
    this.panel = new Graphics();
    this.container.addChild(this.panel);

    // Title text
    const titleStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 28,
      fontWeight: 'bold',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.titleText = new Text('', titleStyle);
    this.titleText.anchor.set(0.5, 0);
    this.container.addChild(this.titleText);

    // Description text
    const descStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 18,
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 400,
    });
    this.descriptionText = new Text('', descStyle);
    this.descriptionText.anchor.set(0.5, 0);
    this.container.addChild(this.descriptionText);

    // Skip hint
    const skipStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 14,
      fill: '#aaaaaa',
    });
    this.skipHint = new Text('Press SPACE to skip', skipStyle);
    this.skipHint.anchor.set(0.5, 0);
    this.container.addChild(this.skipHint);

    this.resize(screenWidth, screenHeight);
  }

  startTutorial(levelId: string): void {
    const steps = TUTORIAL_STEPS[levelId];
    if (!steps || steps.length === 0) {
      this.isDismissed = true;
      return;
    }

    this.currentSteps = steps;
    this.currentStepIndex = 0;
    this.stepTimer = 0;
    this.isDismissed = false;
    this.showCurrentStep();
  }

  private showCurrentStep(): void {
    if (this.currentStepIndex >= this.currentSteps.length) {
      this.hide();
      this.isDismissed = true;
      return;
    }

    const step = this.currentSteps[this.currentStepIndex];
    this.titleText.text = step.title;
    this.descriptionText.text = step.description;
    this.stepTimer = step.duration ?? 5000;

    this.isVisible = true;
    this.container.visible = true;
    this.updatePanelPosition(step.position ?? 'center');
  }

  private updatePanelPosition(position: 'center' | 'top' | 'bottom'): void {
    const bounds = this.background.getBounds();
    const panelWidth = 450;
    const panelHeight = 180;
    const padding = 20;

    let panelY: number;
    switch (position) {
      case 'top':
        panelY = padding + 50;
        break;
      case 'bottom':
        panelY = bounds.height - panelHeight - padding - 50;
        break;
      default:
        panelY = (bounds.height - panelHeight) / 2;
    }

    const panelX = (bounds.width - panelWidth) / 2;

    // Draw panel background
    this.panel.clear();
    this.panel.beginFill(0x222244, 0.9);
    this.panel.lineStyle(3, 0x4488ff);
    this.panel.drawRoundedRect(panelX, panelY, panelWidth, panelHeight, 15);
    this.panel.endFill();

    // Position text
    this.titleText.position.set(bounds.width / 2, panelY + 15);
    this.descriptionText.position.set(bounds.width / 2, panelY + 55);
    this.skipHint.position.set(bounds.width / 2, panelY + panelHeight - 30);
  }

  nextStep(): void {
    this.currentStepIndex++;
    this.showCurrentStep();
  }

  skip(): void {
    this.hide();
    this.isDismissed = true;
  }

  hide(): void {
    this.isVisible = false;
    this.container.visible = false;
  }

  update(deltaTime: number): void {
    if (!this.isVisible || this.isDismissed) return;

    this.stepTimer -= deltaTime;
    if (this.stepTimer <= 0) {
      this.nextStep();
    }
  }

  handleKeyPress(key: string): boolean {
    if (!this.isVisible) return false;

    if (key === ' ' || key === 'Space') {
      this.skip();
      return true;
    }

    if (key === 'Enter') {
      this.nextStep();
      return true;
    }

    return false;
  }

  isActive(): boolean {
    return this.isVisible && !this.isDismissed;
  }

  wasDismissed(): boolean {
    return this.isDismissed;
  }

  resize(screenWidth: number, screenHeight: number): void {
    this.background.clear();
    this.background.beginFill(0x000000, 0.5);
    this.background.drawRect(0, 0, screenWidth, screenHeight);
    this.background.endFill();

    if (this.isVisible && this.currentSteps.length > 0) {
      const step = this.currentSteps[this.currentStepIndex];
      this.updatePanelPosition(step?.position ?? 'center');
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
