/* ============================================
   SHADOW NINJA - Guard Enemy
   Melee patrol enemy with vision cone
   ============================================ */

import { Enemy, EnemyConfig, PatrolPoint } from './Enemy';
import { Entity } from './Entity';
import { createCharacterShape } from '../engine/ShapeRenderer';
import { COLORS, KNOCKBACK_FORCE } from '../engine/constants';
import type { Vec2 } from '../engine/types';

const GUARD_ATTACK_RANGE = 1.2;
const GUARD_ATTACK_DAMAGE = 15;
const GUARD_ATTACK_COOLDOWN = 1000; // ms

export class Guard extends Enemy {
  private attackCooldown: number = 0;
  private characterSprite: ReturnType<typeof createCharacterShape>;

  constructor(x: number, y: number, patrolPoints?: PatrolPoint[]) {
    const config: EnemyConfig = {
      x,
      y,
      type: 'guard',
      health: 60,
      patrolPoints,
      visionRange: 6,
      visionAngle: Math.PI / 3, // 60 degrees
    };
    super(config);

    // Create visual
    this.characterSprite = createCharacterShape(COLORS.GUARD, 1, 'guard');
    this.container.addChild(this.characterSprite);
  }

  update(deltaTime: number): void {
    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime * 1000;
    }

    super.update(deltaTime);
  }

  attack(target: Entity): void {
    if (this.attackCooldown > 0) return;

    this.attackCooldown = GUARD_ATTACK_COOLDOWN;

    // Calculate knockback direction
    const dx = target.position.x - this.position.x;
    const dy = target.position.y - this.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const knockback: Vec2 = dist > 0.01
      ? { x: (dx / dist) * KNOCKBACK_FORCE, y: (dy / dist) * KNOCKBACK_FORCE }
      : { x: 0, y: 0 };

    // Deal damage
    target.onHit(GUARD_ATTACK_DAMAGE, knockback);

    // Play attack animation
    this.playAnimation('attack', false);
  }

  getAttackRange(): number {
    return GUARD_ATTACK_RANGE;
  }

  updateVisual(): void {
    // Update sprite alpha based on state
    let alpha = 1;

    // Flash when attacking
    if (this.attackCooldown > GUARD_ATTACK_COOLDOWN - 200) {
      alpha = 0.7 + Math.sin(Date.now() * 0.03) * 0.3;
    }

    this.characterSprite.alpha = alpha;

    // Tint based on AI state
    // Note: PixiJS 8 tinting may need different approach
  }
}
