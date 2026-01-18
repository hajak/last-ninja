/**
 * Panda & Dog - Particle Effects
 * Visual effects for respawns, hazards, interactions, etc.
 */

import { Container, Graphics } from 'pixi.js';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
}

type EffectType = 'respawn' | 'hazard_hit' | 'button_press' | 'door_open' | 'checkpoint' | 'guard_alert' | 'sparkle' | 'dust';

const EFFECT_CONFIGS: Record<EffectType, Partial<ParticleConfig>> = {
  respawn: {
    count: 30,
    colors: [0x00ffff, 0x00aaff, 0xffffff],
    minSpeed: 2,
    maxSpeed: 5,
    minLife: 500,
    maxLife: 1000,
    minSize: 3,
    maxSize: 8,
    gravity: -0.1,
    spread: 360,
  },
  hazard_hit: {
    count: 20,
    colors: [0xff0000, 0xff4400, 0xffff00],
    minSpeed: 3,
    maxSpeed: 6,
    minLife: 300,
    maxLife: 600,
    minSize: 2,
    maxSize: 6,
    gravity: 0.15,
    spread: 180,
  },
  button_press: {
    count: 10,
    colors: [0xffff00, 0xffffff],
    minSpeed: 1,
    maxSpeed: 3,
    minLife: 200,
    maxLife: 400,
    minSize: 2,
    maxSize: 4,
    gravity: 0,
    spread: 90,
  },
  door_open: {
    count: 15,
    colors: [0x888888, 0xaaaaaa, 0x666666],
    minSpeed: 1,
    maxSpeed: 2,
    minLife: 400,
    maxLife: 800,
    minSize: 2,
    maxSize: 5,
    gravity: 0.05,
    spread: 120,
  },
  checkpoint: {
    count: 25,
    colors: [0x00ff00, 0x88ff88, 0xffffff],
    minSpeed: 2,
    maxSpeed: 4,
    minLife: 600,
    maxLife: 1200,
    minSize: 3,
    maxSize: 7,
    gravity: -0.05,
    spread: 360,
  },
  guard_alert: {
    count: 8,
    colors: [0xff0000, 0xff4400],
    minSpeed: 0.5,
    maxSpeed: 1.5,
    minLife: 500,
    maxLife: 800,
    minSize: 4,
    maxSize: 8,
    gravity: -0.02,
    spread: 60,
  },
  sparkle: {
    count: 5,
    colors: [0xffffff, 0xffffaa],
    minSpeed: 0.5,
    maxSpeed: 1,
    minLife: 300,
    maxLife: 500,
    minSize: 2,
    maxSize: 4,
    gravity: 0,
    spread: 360,
  },
  dust: {
    count: 8,
    colors: [0x886644, 0xaa8866, 0x664422],
    minSpeed: 0.5,
    maxSpeed: 1.5,
    minLife: 400,
    maxLife: 700,
    minSize: 3,
    maxSize: 6,
    gravity: 0.02,
    spread: 180,
  },
};

interface ParticleConfig {
  count: number;
  colors: number[];
  minSpeed: number;
  maxSpeed: number;
  minLife: number;
  maxLife: number;
  minSize: number;
  maxSize: number;
  gravity: number;
  spread: number;
  direction?: number;
}

export class ParticleEffect {
  public container: Container;
  private particles: Particle[] = [];
  private graphics: Graphics;
  private isComplete = false;

  constructor(x: number, y: number, effectType: EffectType, direction = 0) {
    const config: ParticleConfig = {
      count: 10,
      colors: [0xffffff],
      minSpeed: 1,
      maxSpeed: 3,
      minLife: 300,
      maxLife: 600,
      minSize: 2,
      maxSize: 5,
      gravity: 0.1,
      spread: 180,
      direction,
      ...EFFECT_CONFIGS[effectType],
    };

    this.container = new Container();
    this.container.position.set(x, y);

    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    this.createParticles(config);
  }

  private createParticles(config: ParticleConfig): void {
    const { count, colors, minSpeed, maxSpeed, minLife, maxLife, minSize, maxSize, gravity, spread, direction = 0 } = config;

    for (let i = 0; i < count; i++) {
      // Calculate angle based on spread and direction
      const baseAngle = (direction - 90) * (Math.PI / 180); // -90 to make 0 degrees point up
      const spreadRad = (spread / 2) * (Math.PI / 180);
      const angle = baseAngle + (Math.random() - 0.5) * 2 * spreadRad;

      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);

      const particle: Particle = {
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: minLife + Math.random() * (maxLife - minLife),
        maxLife: minLife + Math.random() * (maxLife - minLife),
        size: minSize + Math.random() * (maxSize - minSize),
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        gravity,
      };

      particle.maxLife = particle.life;
      this.particles.push(particle);
    }
  }

  update(deltaTime: number): void {
    if (this.isComplete) return;

    this.graphics.clear();

    let activeParticles = 0;

    for (const particle of this.particles) {
      if (particle.life <= 0) continue;

      // Update physics
      particle.x += particle.vx * (deltaTime / 16);
      particle.y += particle.vy * (deltaTime / 16);
      particle.vy += particle.gravity;
      particle.rotation += particle.rotationSpeed;
      particle.life -= deltaTime;

      // Calculate alpha based on remaining life
      particle.alpha = Math.max(0, particle.life / particle.maxLife);

      // Draw particle
      if (particle.alpha > 0) {
        activeParticles++;
        this.drawParticle(particle);
      }
    }

    if (activeParticles === 0) {
      this.isComplete = true;
    }
  }

  private drawParticle(particle: Particle): void {
    const { x, y, size, color, alpha, rotation } = particle;

    this.graphics.beginFill(color, alpha);

    // Draw as rotated square/diamond for visual interest
    const halfSize = size / 2;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    const points = [
      { x: -halfSize, y: 0 },
      { x: 0, y: -halfSize },
      { x: halfSize, y: 0 },
      { x: 0, y: halfSize },
    ];

    const rotatedPoints = points.map((p) => ({
      x: x + p.x * cos - p.y * sin,
      y: y + p.x * sin + p.y * cos,
    }));

    this.graphics.moveTo(rotatedPoints[0].x, rotatedPoints[0].y);
    for (let i = 1; i < rotatedPoints.length; i++) {
      this.graphics.lineTo(rotatedPoints[i].x, rotatedPoints[i].y);
    }
    this.graphics.closePath();
    this.graphics.endFill();

    // Add glow effect for bright particles
    if (alpha > 0.5) {
      this.graphics.beginFill(0xffffff, alpha * 0.3);
      this.graphics.drawCircle(x, y, size * 0.5);
      this.graphics.endFill();
    }
  }

  isFinished(): boolean {
    return this.isComplete;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}

/**
 * Manages all particle effects in the game
 */
export class ParticleManager {
  private container: Container;
  private effects: ParticleEffect[] = [];

  constructor(parentContainer: Container) {
    this.container = new Container();
    this.container.sortableChildren = true;
    this.container.zIndex = 1000; // Above most game elements
    parentContainer.addChild(this.container);
  }

  emit(x: number, y: number, effectType: EffectType, direction = 0): ParticleEffect {
    const effect = new ParticleEffect(x, y, effectType, direction);
    this.effects.push(effect);
    this.container.addChild(effect.container);
    return effect;
  }

  emitAtWorld(worldX: number, worldY: number, effectType: EffectType, direction = 0): ParticleEffect {
    // Note: Caller should convert world to screen coords before calling
    return this.emit(worldX, worldY, effectType, direction);
  }

  update(deltaTime: number): void {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i];
      effect.update(deltaTime);

      if (effect.isFinished()) {
        effect.destroy();
        this.effects.splice(i, 1);
      }
    }
  }

  clear(): void {
    for (const effect of this.effects) {
      effect.destroy();
    }
    this.effects = [];
  }

  destroy(): void {
    this.clear();
    this.container.destroy();
  }
}
