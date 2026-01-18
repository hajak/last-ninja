/**
 * Panda & Dog - Level 3: The Gardens
 * Introduces rotating hazards and environmental timing puzzles
 *
 * Layout (40x30):
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │  ENTRANCE GARDEN    │  SPIKE MAZE         │  FOUNTAIN COURT             │
 * │  Tutorial area      │  Rotating traps     │  Water puzzle               │
 * ├─────────────────────┼─────────────────────┼─────────────────────────────┤
 * │  HEDGE MAZE         │  CENTRAL PAVILION   │  GREENHOUSE                 │
 * │  Path finding       │  Rest point         │  Mirror laser puzzle        │
 * ├─────────────────────┼─────────────────────┼─────────────────────────────┤
 * │  STATUE GARDEN      │  REFLECTING POOL    │  EXIT GATE                  │
 * │  Weight puzzles     │  Bridge crossing    │  Final challenge            │
 * └───────────────────────────────────────────────────────────────────────────┘
 */

import type { LevelData, TileData, TileType, InteractableConfig, PuzzleConfig } from '../types';

function createTile(type: TileType, elevation = 0, walkable?: boolean): TileData {
  const defaultWalkable: Record<TileType, boolean> = {
    ground: true,
    grass: true,
    stone: true,
    water: false,
    wall: false,
    bridge: true,
    void: false,
  };

  return {
    type,
    elevation,
    walkable: walkable ?? defaultWalkable[type] ?? false,
  };
}

export function createGardensLevel(): LevelData {
  const width = 40;
  const height = 30;
  const tiles: TileData[][] = [];

  // Initialize with grass
  for (let row = 0; row < height; row++) {
    tiles[row] = [];
    for (let col = 0; col < width; col++) {
      tiles[row][col] = createTile('grass', 0);
    }
  }

  const setTile = (x: number, y: number, type: TileType, elevation = 0, walkable?: boolean): void => {
    if (y >= 0 && y < height && x >= 0 && x < width) {
      tiles[y][x] = createTile(type, elevation, walkable);
    }
  };

  const fillRect = (x1: number, y1: number, x2: number, y2: number, type: TileType, elevation = 0): void => {
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        setTile(x, y, type, elevation);
      }
    }
  };

  // === OUTER WALLS (Hedge walls) ===
  fillRect(0, 0, width - 1, 0, 'wall');
  fillRect(0, height - 1, width - 1, height - 1, 'wall');
  fillRect(0, 0, 0, height - 1, 'wall');
  fillRect(width - 1, 0, width - 1, height - 1, 'wall');

  // === ENTRANCE GARDEN (top-left) ===
  fillRect(1, 1, 12, 9, 'grass');
  // Stone paths
  fillRect(3, 1, 3, 9, 'stone');
  fillRect(1, 5, 12, 5, 'stone');
  // Decorative flowers (elevated grass)
  fillRect(5, 2, 7, 4, 'grass', 0.5);
  fillRect(9, 6, 11, 8, 'grass', 0.5);

  // Wall to spike maze
  fillRect(13, 1, 13, 7, 'wall');
  setTile(13, 8, 'stone');
  setTile(13, 9, 'stone');

  // === SPIKE MAZE (top-center) ===
  fillRect(14, 1, 26, 9, 'stone');
  // Maze walls
  fillRect(16, 1, 16, 5, 'wall');
  fillRect(18, 4, 18, 9, 'wall');
  fillRect(20, 1, 20, 6, 'wall');
  fillRect(22, 3, 22, 9, 'wall');
  fillRect(24, 1, 24, 7, 'wall');
  // Openings
  setTile(16, 6, 'stone');
  setTile(18, 3, 'stone');
  setTile(20, 7, 'stone');
  setTile(22, 2, 'stone');
  setTile(24, 8, 'stone');

  // Wall to fountain
  fillRect(27, 1, 27, 7, 'wall');
  setTile(27, 8, 'stone');
  setTile(27, 9, 'stone');

  // === FOUNTAIN COURT (top-right) ===
  fillRect(28, 1, 38, 9, 'stone');
  // Central fountain (water)
  fillRect(32, 3, 35, 6, 'water');
  // Walkway around fountain
  fillRect(30, 2, 37, 2, 'stone');
  fillRect(30, 7, 37, 7, 'stone');

  // === MIDDLE SECTION DIVIDER ===
  fillRect(1, 10, 38, 10, 'wall');
  // Openings
  setTile(6, 10, 'stone');
  setTile(20, 10, 'stone');
  setTile(34, 10, 'stone');

  // === HEDGE MAZE (middle-left) ===
  fillRect(1, 11, 12, 19, 'grass');
  // Complex hedge maze
  fillRect(2, 12, 2, 17, 'wall');
  fillRect(4, 11, 4, 15, 'wall');
  fillRect(6, 14, 6, 19, 'wall');
  fillRect(8, 11, 8, 16, 'wall');
  fillRect(10, 13, 10, 19, 'wall');
  // Path through
  setTile(2, 18, 'grass');
  setTile(4, 16, 'grass');
  setTile(6, 13, 'grass');
  setTile(8, 17, 'grass');
  setTile(10, 12, 'grass');

  // Wall to pavilion
  fillRect(13, 11, 13, 17, 'wall');
  setTile(13, 18, 'grass');
  setTile(13, 19, 'grass');

  // === CENTRAL PAVILION (middle-center) ===
  fillRect(14, 11, 26, 19, 'stone');
  // Pavilion structure (elevated)
  fillRect(17, 13, 23, 17, 'stone', 1);
  // Pillars
  setTile(17, 13, 'wall', 1);
  setTile(23, 13, 'wall', 1);
  setTile(17, 17, 'wall', 1);
  setTile(23, 17, 'wall', 1);

  // Wall to greenhouse
  fillRect(27, 11, 27, 17, 'wall');
  setTile(27, 18, 'stone');
  setTile(27, 19, 'stone');

  // === GREENHOUSE (middle-right) ===
  fillRect(28, 11, 38, 19, 'grass');
  // Glass walls (visual - still walls)
  fillRect(29, 12, 29, 18, 'wall');
  fillRect(37, 12, 37, 18, 'wall');
  fillRect(30, 12, 36, 12, 'wall');
  fillRect(30, 18, 36, 18, 'wall');
  // Opening
  setTile(33, 18, 'grass');
  // Interior
  fillRect(30, 13, 36, 17, 'grass');
  // Planting beds
  fillRect(31, 14, 32, 16, 'grass', 0.5);
  fillRect(34, 14, 35, 16, 'grass', 0.5);

  // === BOTTOM SECTION DIVIDER ===
  fillRect(1, 20, 38, 20, 'wall');
  // Openings
  setTile(6, 20, 'stone');
  setTile(20, 20, 'stone');
  setTile(34, 20, 'stone');

  // === STATUE GARDEN (bottom-left) ===
  fillRect(1, 21, 12, 28, 'stone');
  // Statue pedestals (elevated)
  setTile(3, 23, 'stone', 1);
  setTile(7, 23, 'stone', 1);
  setTile(3, 26, 'stone', 1);
  setTile(7, 26, 'stone', 1);
  setTile(10, 24, 'stone', 1);

  // Wall to pool
  fillRect(13, 21, 13, 26, 'wall');
  setTile(13, 27, 'stone');
  setTile(13, 28, 'stone');

  // === REFLECTING POOL (bottom-center) ===
  fillRect(14, 21, 26, 28, 'stone');
  // Water pool
  fillRect(16, 23, 24, 26, 'water');
  // Bridge supports
  setTile(20, 23, 'stone');
  setTile(20, 24, 'stone');
  setTile(20, 25, 'stone');
  setTile(20, 26, 'stone');

  // Wall to exit
  fillRect(27, 21, 27, 26, 'wall');
  setTile(27, 27, 'stone');
  setTile(27, 28, 'stone');

  // === EXIT GATE (bottom-right) ===
  fillRect(28, 21, 38, 28, 'stone');
  // Final pathway
  fillRect(30, 24, 36, 25, 'grass');
  // Exit marker
  fillRect(35, 26, 37, 27, 'grass', 0.5);

  // === INTERACTABLES ===
  const interactables: InteractableConfig[] = [
    // === ENTRANCE: Tutorial buttons ===
    {
      id: 'entrance_btn',
      type: 'button',
      position: { x: 6, y: 3, z: 0.5 },
      initialState: { pressed: false, momentary: true },
      linkedIds: ['entrance_gate'],
    },
    {
      id: 'entrance_gate',
      type: 'door',
      position: { x: 13, y: 8.5, z: 0 },
      initialState: { open: false, locked: false, requiresHeavy: false },
    },

    // === SPIKE MAZE: Rotating spike traps ===
    {
      id: 'spike_trap_1',
      type: 'spike_trap',
      position: { x: 15, y: 3, z: 0 },
      initialState: {
        active: true,
        rotationSpeed: 90, // degrees per second
        currentRotation: 0,
        spikeLength: 2,
      },
    },
    {
      id: 'spike_trap_2',
      type: 'spike_trap',
      position: { x: 19, y: 6, z: 0 },
      initialState: {
        active: true,
        rotationSpeed: -120,
        currentRotation: 45,
        spikeLength: 2,
      },
    },
    {
      id: 'spike_trap_3',
      type: 'spike_trap',
      position: { x: 23, y: 4, z: 0 },
      initialState: {
        active: true,
        rotationSpeed: 60,
        currentRotation: 90,
        spikeLength: 2.5,
      },
    },
    // Button to disable spikes temporarily
    {
      id: 'spike_disable_btn',
      type: 'button',
      position: { x: 25, y: 8, z: 0 },
      initialState: {
        pressed: false,
        momentary: true,
        timer: undefined,
        timerDuration: 8000,
      },
      linkedIds: ['spike_trap_1', 'spike_trap_2', 'spike_trap_3'],
    },
    {
      id: 'maze_gate',
      type: 'door',
      position: { x: 27, y: 8.5, z: 0 },
      initialState: { open: false, locked: true, requiresHeavy: false },
    },

    // === FOUNTAIN: Water level puzzle ===
    {
      id: 'fountain_lever',
      type: 'lever',
      position: { x: 30, y: 4, z: 0 },
      initialState: { position: 'off', requiresStrength: true },
      linkedIds: ['fountain_drain'],
    },
    {
      id: 'fountain_drain',
      type: 'platform',
      position: { x: 33.5, y: 4.5, z: -0.5 },
      initialState: {
        currentPosition: 0,
        moving: false,
        direction: 1,
        speed: 0.3,
        waypoints: [
          { x: 33.5, y: 4.5, z: -0.5 },
          { x: 33.5, y: 4.5, z: 0 },
        ],
      },
    },
    {
      id: 'fountain_plate',
      type: 'pressure_plate',
      position: { x: 33.5, y: 4.5, z: 0 },
      initialState: { activated: false, weightThreshold: 'heavy', currentWeight: 0 },
      linkedIds: ['hedge_gate'],
    },

    // === HEDGE MAZE: Path puzzle ===
    {
      id: 'hedge_btn_1',
      type: 'button',
      position: { x: 3, y: 14, z: 0 },
      initialState: { pressed: false, momentary: false },
      linkedIds: ['hedge_wall_1'],
    },
    {
      id: 'hedge_wall_1',
      type: 'door',
      position: { x: 4, y: 16, z: 0 },
      initialState: { open: false, locked: true, requiresHeavy: false },
    },
    {
      id: 'hedge_gate',
      type: 'door',
      position: { x: 13, y: 18.5, z: 0 },
      initialState: { open: false, locked: true, requiresHeavy: false },
    },

    // === PAVILION: Rest checkpoint ===
    {
      id: 'pavilion_checkpoint',
      type: 'checkpoint',
      position: { x: 20, y: 15, z: 1 },
      initialState: { activated: false },
    },

    // === GREENHOUSE: Mirror laser ===
    {
      id: 'laser_source',
      type: 'hazard',
      position: { x: 31, y: 15, z: 0 },
      initialState: {
        active: true,
        hazardType: 'laser',
        direction: { x: 1, y: 0 },
      },
    },
    {
      id: 'mirror_1',
      type: 'mirror',
      position: { x: 33, y: 15, z: 0 },
      initialState: {
        angle: 45,
        rotatable: true,
      },
    },
    {
      id: 'laser_target',
      type: 'button',
      position: { x: 33, y: 17, z: 0 },
      initialState: { pressed: false, momentary: false },
      linkedIds: ['greenhouse_gate'],
    },
    {
      id: 'greenhouse_gate',
      type: 'door',
      position: { x: 34, y: 20, z: 0 },
      initialState: { open: false, locked: true, requiresHeavy: false },
    },

    // === STATUE GARDEN: Weight puzzle ===
    {
      id: 'statue_crate_1',
      type: 'crate',
      position: { x: 5, y: 24, z: 0 },
      initialState: { gridX: 5, gridY: 24, beingPushed: false },
    },
    {
      id: 'statue_crate_2',
      type: 'crate',
      position: { x: 9, y: 25, z: 0 },
      initialState: { gridX: 9, gridY: 25, beingPushed: false },
    },
    {
      id: 'statue_plate',
      type: 'pressure_plate',
      position: { x: 10, y: 24, z: 1 },
      initialState: { activated: false, weightThreshold: 'heavy', currentWeight: 0 },
      linkedIds: ['pool_gate'],
    },

    // === REFLECTING POOL: Bridge crossing ===
    {
      id: 'pool_gate',
      type: 'door',
      position: { x: 13, y: 27.5, z: 0 },
      initialState: { open: false, locked: true, requiresHeavy: false },
    },
    {
      id: 'pool_lever',
      type: 'lever',
      position: { x: 15, y: 24, z: 0 },
      initialState: { position: 'off', requiresStrength: false },
      linkedIds: ['pool_bridge'],
    },
    {
      id: 'pool_bridge',
      type: 'platform',
      position: { x: 20, y: 24.5, z: -0.5 },
      initialState: {
        currentPosition: 0,
        moving: false,
        direction: 1,
        speed: 0.4,
        waypoints: [
          { x: 20, y: 24.5, z: -0.5 },
          { x: 20, y: 24.5, z: 0 },
        ],
      },
    },

    // === EXIT: Final dual plates ===
    {
      id: 'exit_plate_1',
      type: 'pressure_plate',
      position: { x: 30, y: 24, z: 0 },
      initialState: { activated: false, weightThreshold: 'light', currentWeight: 0 },
      linkedIds: ['final_gate'],
    },
    {
      id: 'exit_plate_2',
      type: 'pressure_plate',
      position: { x: 36, y: 25, z: 0 },
      initialState: { activated: false, weightThreshold: 'heavy', currentWeight: 0 },
      linkedIds: ['final_gate'],
    },
    {
      id: 'final_gate',
      type: 'door',
      position: { x: 27, y: 27.5, z: 0 },
      initialState: { open: false, locked: true, requiresHeavy: false },
    },
  ];

  // === PUZZLES ===
  const puzzles: PuzzleConfig[] = [
    {
      id: 'puzzle_entrance',
      name: 'Garden Entry',
      description: 'Press the button to open the garden gate.',
      objectives: [
        {
          id: 'obj_entrance',
          description: 'Activate the entrance button',
          condition: { type: 'interactable_state', targetId: 'entrance_gate', state: { open: true } },
        },
      ],
    },
    {
      id: 'puzzle_spikes',
      name: 'Spike Gauntlet',
      description: 'Navigate through the rotating spike traps. Time your movement carefully!',
      objectives: [
        {
          id: 'obj_spikes',
          description: 'Reach the maze exit',
          condition: { type: 'interactable_state', targetId: 'maze_gate', state: { open: true } },
        },
      ],
      completionReward: 'maze_gate',
    },
    {
      id: 'puzzle_fountain',
      name: 'Drain the Fountain',
      description: 'Panda pulls the heavy lever to reveal a hidden plate.',
      objectives: [
        {
          id: 'obj_fountain',
          description: 'Activate the underwater plate',
          condition: { type: 'interactable_state', targetId: 'fountain_plate', state: { activated: true } },
        },
      ],
      completionReward: 'hedge_gate',
    },
    {
      id: 'puzzle_greenhouse',
      name: 'Light Reflection',
      description: 'Rotate the mirror to direct the laser beam to the target.',
      objectives: [
        {
          id: 'obj_mirror',
          description: 'Hit the laser target',
          condition: { type: 'interactable_state', targetId: 'laser_target', state: { pressed: true } },
        },
      ],
      completionReward: 'greenhouse_gate',
    },
    {
      id: 'puzzle_statues',
      name: 'Statue Weight',
      description: 'Push crates onto the elevated pedestal plate.',
      objectives: [
        {
          id: 'obj_statue',
          description: 'Weigh down the statue plate',
          condition: { type: 'interactable_state', targetId: 'statue_plate', state: { activated: true } },
        },
      ],
      completionReward: 'pool_gate',
    },
    {
      id: 'puzzle_pool',
      name: 'Cross the Pool',
      description: 'Raise the bridge to cross the reflecting pool.',
      objectives: [
        {
          id: 'obj_pool',
          description: 'Extend the pool bridge',
          condition: { type: 'interactable_state', targetId: 'pool_bridge', state: { currentPosition: 1 } },
        },
      ],
    },
    {
      id: 'puzzle_exit',
      name: 'Garden Escape',
      description: 'Both players on their plates to open the final gate.',
      objectives: [
        {
          id: 'obj_exit_1',
          description: 'Dog: Light plate',
          condition: { type: 'interactable_state', targetId: 'exit_plate_1', state: { activated: true } },
        },
        {
          id: 'obj_exit_2',
          description: 'Panda: Heavy plate',
          condition: { type: 'interactable_state', targetId: 'exit_plate_2', state: { activated: true } },
        },
      ],
      completionReward: 'final_gate',
    },
  ];

  return {
    id: 'gardens',
    name: 'The Gardens',
    width,
    height,
    tiles,
    spawns: {
      dog: { x: 2, y: 7, z: 0 },
      panda: { x: 4, y: 7, z: 0 },
    },
    interactables,
    puzzles,
    checkpoints: [{ x: 20, y: 15, z: 1 }],
  };
}
