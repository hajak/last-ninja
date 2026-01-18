/**
 * Panda & Dog - Isometric Utilities
 * Functions for converting between world and screen coordinates
 */

import { TILE_WIDTH, TILE_HEIGHT } from '../../../shared/constants';

/**
 * Convert world coordinates to screen coordinates (isometric projection).
 * Uses standard 2:1 isometric ratio.
 */
export function worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
  return {
    x: (worldX - worldY) * (TILE_WIDTH / 2),
    y: (worldX + worldY) * (TILE_HEIGHT / 2),
  };
}

/**
 * Convert screen coordinates to world coordinates (inverse isometric projection).
 */
export function screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
  return {
    x: (screenX / (TILE_WIDTH / 2) + screenY / (TILE_HEIGHT / 2)) / 2,
    y: (screenY / (TILE_HEIGHT / 2) - screenX / (TILE_WIDTH / 2)) / 2,
  };
}

/**
 * Get the tile coordinates from screen position.
 */
export function screenToTile(screenX: number, screenY: number): { tileX: number; tileY: number } {
  const world = screenToWorld(screenX, screenY);
  return {
    tileX: Math.floor(world.x),
    tileY: Math.floor(world.y),
  };
}

/**
 * Get the center screen position for a tile.
 */
export function tileToScreen(tileX: number, tileY: number): { x: number; y: number } {
  return worldToScreen(tileX + 0.5, tileY + 0.5);
}

/**
 * Calculate the distance between two world positions in tiles.
 */
export function worldDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get z-index for proper isometric depth sorting.
 * Objects with higher Y values should appear in front.
 */
export function getZIndex(worldX: number, worldY: number, worldZ: number = 0): number {
  return Math.floor(worldY * 100 + worldZ * 10 + worldX);
}
