/**
 * Panda & Dog - Multiplayer Client Entry Point
 * Version 3.1.0 - Visual Design Overhaul
 */

import { Application, Container } from 'pixi.js';
import { PALETTE } from '../../shared/designTokens';

const VERSION = '3.1.0';

interface GameState {
  app: Application;
  gameContainer: Container;
  role: 'dog' | 'panda' | null;
}

const state: GameState = {
  app: null!,
  gameContainer: null!,
  role: null,
};

async function initGame(): Promise<void> {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  state.app = new Application();
  await state.app.init({
    canvas,
    width: 1280,
    height: 720,
    backgroundColor: PALETTE.deepVoid,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  state.gameContainer = new Container();
  state.gameContainer.sortableChildren = true;
  state.app.stage.addChild(state.gameContainer);

  updateVersionDisplay();
  setupResizeHandler();

  console.log(`Panda & Dog v${VERSION} initialized`);
  console.log('Visual design system loaded with design tokens');
}

function updateVersionDisplay(): void {
  const versionEl = document.getElementById('version-display');
  if (versionEl) {
    versionEl.textContent = `v${VERSION}`;
  }
}

function setupResizeHandler(): void {
  const resize = (): void => {
    const container = document.getElementById('app');
    if (!container || !state.app) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const targetWidth = 1280;
    const targetHeight = 720;
    const scale = Math.min(
      containerWidth / targetWidth,
      containerHeight / targetHeight
    );

    const canvas = state.app.canvas;
    canvas.style.width = `${targetWidth * scale}px`;
    canvas.style.height = `${targetHeight * scale}px`;
  };

  window.addEventListener('resize', resize);
  resize();
}

initGame().catch((error) => {
  console.error('Failed to initialize game:', error);
  const overlay = document.getElementById('ui-overlay');
  if (overlay) {
    overlay.innerHTML = `
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #ff6b6b;">
        <h2>Failed to load game</h2>
        <p style="color: #8b949e;">${error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    `;
  }
});
