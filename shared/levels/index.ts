/**
 * Panda & Dog - Level Registry
 * Central registry for all game levels
 */

import type { LevelData } from '../types.js';
import { createVerticalSliceLevel } from './VerticalSlice.js';
import { createWarehouseLevel } from './Warehouse.js';
import { createGardensLevel } from './Gardens.js';
import { createFortressLevel } from './Fortress.js';
import { createTempleLevel } from './Temple.js';

// Level registry with ordered progression
const levels: Map<string, () => LevelData> = new Map([
  ['vertical_slice', createVerticalSliceLevel],
  ['warehouse', createWarehouseLevel],
  ['gardens', createGardensLevel],
  ['fortress', createFortressLevel],
  ['temple', createTempleLevel],
]);

// Level order for progression
const levelOrder: string[] = [
  'vertical_slice',
  'warehouse',
  'gardens',
  'fortress',
  'temple',
];

/**
 * Get a level by ID.
 * Returns a fresh copy of the level data each time to avoid mutation issues.
 */
export function getLevel(levelId: string): LevelData | null {
  const factory = levels.get(levelId);
  if (!factory) {
    console.error(`Level not found: ${levelId}`);
    return null;
  }
  return factory();
}

/**
 * Get all available level IDs in progression order
 */
export function getAvailableLevels(): string[] {
  return [...levelOrder];
}

/**
 * Get the next level after the current one
 */
export function getNextLevel(currentLevelId: string): string | null {
  const currentIndex = levelOrder.indexOf(currentLevelId);
  if (currentIndex === -1 || currentIndex >= levelOrder.length - 1) {
    return null;
  }
  return levelOrder[currentIndex + 1];
}

/**
 * Get level info for display
 */
export function getLevelInfo(levelId: string): { name: string; description: string } | null {
  const levelInfo: Record<string, { name: string; description: string }> = {
    vertical_slice: {
      name: 'The Beginning',
      description: 'Learn the basics of cooperation. Dog is fast and nimble, Panda is strong.',
    },
    warehouse: {
      name: 'The Warehouse',
      description: 'Timed buttons and conveyor belts test your coordination.',
    },
    gardens: {
      name: 'The Gardens',
      description: 'Navigate spike traps and solve mirror puzzles.',
    },
    fortress: {
      name: 'The Fortress',
      description: 'Stealth through guard patrols and security systems.',
    },
    temple: {
      name: 'The Temple',
      description: 'The ultimate challenge. All mechanics combined.',
    },
  };
  return levelInfo[levelId] ?? null;
}

/**
 * Register a new level
 */
export function registerLevel(levelId: string, factory: () => LevelData): void {
  levels.set(levelId, factory);
  if (!levelOrder.includes(levelId)) {
    levelOrder.push(levelId);
  }
}

// Re-export level creators for direct access
export { createVerticalSliceLevel, createWarehouseLevel, createGardensLevel, createFortressLevel, createTempleLevel };
