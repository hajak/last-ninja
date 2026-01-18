/**
 * Panda & Dog - Level 2: The Warehouse
 * Introduces timed buttons and conveyor belts
 *
 * Layout (35x25):
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  LOADING DOCK        │  CONVEYOR ROOM       │  STORAGE            │
 * │  Timed switches      │  Belt puzzles        │  Crate stacking     │
 * │  (Dog + Panda sync)  │  (timing challenge)  │  (heavy lifting)    │
 * ├──────────────────────┼──────────────────────┼─────────────────────┤
 * │  OFFICE              │  MAIN FLOOR          │  EXIT CORRIDOR      │
 * │  Key lever           │  Central hub         │  Final gate         │
 * └─────────────────────────────────────────────────────────────────────┘
 */

import type { LevelData, TileData, TileType, InteractableConfig, PuzzleConfig } from '../types.js';

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

export function createWarehouseLevel(): LevelData {
  const width = 35;
  const height = 25;
  const tiles: TileData[][] = [];

  // Initialize with concrete floor
  for (let row = 0; row < height; row++) {
    tiles[row] = [];
    for (let col = 0; col < width; col++) {
      tiles[row][col] = createTile('stone', 0);
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

  // === OUTER WALLS ===
  fillRect(0, 0, width - 1, 0, 'wall');
  fillRect(0, height - 1, width - 1, height - 1, 'wall');
  fillRect(0, 0, 0, height - 1, 'wall');
  fillRect(width - 1, 0, width - 1, height - 1, 'wall');

  // === LOADING DOCK (top-left) ===
  fillRect(1, 1, 11, 11, 'stone');
  // Raised platform
  fillRect(2, 2, 5, 5, 'ground', 1);
  // Wall separating loading dock
  fillRect(12, 1, 12, 8, 'wall');
  setTile(12, 9, 'stone'); // Door opening
  setTile(12, 10, 'stone');

  // === CONVEYOR ROOM (top-center) ===
  fillRect(13, 1, 23, 11, 'stone');
  // Conveyor track areas (visual only, mechanics in interactables)
  fillRect(15, 3, 21, 4, 'ground');
  fillRect(15, 7, 21, 8, 'ground');
  // Wall separating
  fillRect(24, 1, 24, 8, 'wall');
  setTile(24, 9, 'stone'); // Door opening
  setTile(24, 10, 'stone');

  // === STORAGE AREA (top-right) ===
  fillRect(25, 1, 33, 11, 'stone');
  // Shelving areas (elevated)
  fillRect(27, 2, 28, 4, 'ground', 1);
  fillRect(31, 2, 32, 4, 'ground', 1);
  fillRect(27, 7, 28, 9, 'ground', 1);
  fillRect(31, 7, 32, 9, 'ground', 1);

  // === MIDDLE DIVIDER ===
  fillRect(1, 12, 33, 12, 'wall');
  // Openings
  setTile(6, 12, 'stone');
  setTile(18, 12, 'stone');
  setTile(30, 12, 'stone');

  // === OFFICE (bottom-left) ===
  fillRect(1, 13, 10, 23, 'stone');
  // Office walls
  fillRect(8, 13, 8, 20, 'wall');
  setTile(8, 18, 'stone'); // Office door
  // Desk area
  fillRect(2, 15, 4, 17, 'ground', 0.5);

  // === MAIN FLOOR (bottom-center) ===
  fillRect(11, 13, 24, 23, 'stone');
  // Central pit (hazard area)
  fillRect(16, 17, 19, 20, 'void');

  // === EXIT CORRIDOR (bottom-right) ===
  fillRect(25, 13, 33, 23, 'stone');
  // Wall with gate
  fillRect(25, 13, 25, 16, 'wall');
  fillRect(25, 19, 25, 23, 'wall');
  // Exit marker
  fillRect(31, 20, 32, 22, 'grass');

  // === INTERACTABLES ===
  const interactables: InteractableConfig[] = [
    // === PUZZLE 1: Synchronized Timed Buttons (Loading Dock) ===
    // Two timed buttons that must be pressed simultaneously
    {
      id: 'timed_btn_1a',
      type: 'button',
      position: { x: 3, y: 3, z: 1 },
      initialState: {
        pressed: false,
        momentary: true,
        timer: undefined,
        timerDuration: 5000, // 5 seconds
      },
      linkedIds: ['dock_gate'],
    },
    {
      id: 'timed_btn_1b',
      type: 'button',
      position: { x: 9, y: 8, z: 0 },
      initialState: {
        pressed: false,
        momentary: true,
        timer: undefined,
        timerDuration: 5000,
      },
      linkedIds: ['dock_gate'],
    },
    // Gate that requires both buttons
    {
      id: 'dock_gate',
      type: 'door',
      position: { x: 12, y: 9.5, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },

    // === PUZZLE 2: Conveyor Timing (Conveyor Room) ===
    // Conveyor belt 1 (upper)
    {
      id: 'conveyor_1',
      type: 'conveyor',
      position: { x: 18, y: 3.5, z: 0 },
      initialState: {
        active: true,
        direction: { x: 1, y: 0 },
        speed: 2,
        width: 2,
        length: 7,
      },
    },
    // Conveyor belt 2 (lower, opposite direction)
    {
      id: 'conveyor_2',
      type: 'conveyor',
      position: { x: 18, y: 7.5, z: 0 },
      initialState: {
        active: true,
        direction: { x: -1, y: 0 },
        speed: 2,
        width: 2,
        length: 7,
      },
    },
    // Lever to reverse conveyors
    {
      id: 'conveyor_switch',
      type: 'lever',
      position: { x: 14, y: 5, z: 0 },
      initialState: {
        position: 'off',
        requiresStrength: false,
      },
      linkedIds: ['conveyor_1', 'conveyor_2'],
    },
    // Crate that needs to be conveyed
    {
      id: 'crate_conveyor',
      type: 'crate',
      position: { x: 15, y: 3.5, z: 0 },
      initialState: {
        gridX: 15,
        gridY: 3,
        beingPushed: false,
      },
    },
    // Pressure plate at end of conveyor
    {
      id: 'conveyor_plate',
      type: 'pressure_plate',
      position: { x: 22, y: 3.5, z: 0 },
      initialState: {
        activated: false,
        weightThreshold: 'heavy',
        currentWeight: 0,
      },
      linkedIds: ['conveyor_gate'],
    },
    // Gate to storage
    {
      id: 'conveyor_gate',
      type: 'door',
      position: { x: 24, y: 9.5, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },

    // === PUZZLE 3: Crate Stacking (Storage) ===
    // Multiple crates
    {
      id: 'crate_s1',
      type: 'crate',
      position: { x: 26, y: 5, z: 0 },
      initialState: { gridX: 26, gridY: 5, beingPushed: false },
    },
    {
      id: 'crate_s2',
      type: 'crate',
      position: { x: 29, y: 6, z: 0 },
      initialState: { gridX: 29, gridY: 6, beingPushed: false },
    },
    // Heavy pressure plate requiring 2 crates
    {
      id: 'storage_plate',
      type: 'pressure_plate',
      position: { x: 30, y: 10, z: 0 },
      initialState: {
        activated: false,
        weightThreshold: 'heavy',
        currentWeight: 0,
      },
      linkedIds: ['storage_door'],
    },
    // Door to main floor
    {
      id: 'storage_door',
      type: 'door',
      position: { x: 30, y: 12, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },

    // === PUZZLE 4: Office Key (Office) ===
    // Lever in office (Dog can reach through small gap)
    {
      id: 'office_lever',
      type: 'lever',
      position: { x: 3, y: 16, z: 0.5 },
      initialState: {
        position: 'off',
        requiresStrength: false,
      },
      linkedIds: ['main_bridge'],
    },
    // Office door (needs Panda to open)
    {
      id: 'office_door',
      type: 'door',
      position: { x: 8, y: 18, z: 0 },
      initialState: {
        open: false,
        locked: false,
        requiresHeavy: true,
      },
    },

    // === PUZZLE 5: Central Pit Crossing (Main Floor) ===
    // Bridge platform over pit
    {
      id: 'main_bridge',
      type: 'platform',
      position: { x: 17.5, y: 18.5, z: -1 },
      initialState: {
        currentPosition: 0,
        moving: false,
        direction: 1,
        speed: 0.5,
        waypoints: [
          { x: 17.5, y: 18.5, z: -1 },
          { x: 17.5, y: 18.5, z: 0 },
        ],
      },
    },
    // Hazard in pit
    {
      id: 'pit_hazard',
      type: 'hazard',
      position: { x: 17.5, y: 18.5, z: -1 },
      initialState: {
        active: true,
        hazardType: 'spikes',
      },
    },

    // === PUZZLE 6: Exit Gate (Exit Corridor) ===
    // Two synchronized plates
    {
      id: 'exit_plate_dog',
      type: 'pressure_plate',
      position: { x: 27, y: 15, z: 0 },
      initialState: {
        activated: false,
        weightThreshold: 'light',
        currentWeight: 0,
      },
      linkedIds: ['exit_gate'],
    },
    {
      id: 'exit_plate_panda',
      type: 'pressure_plate',
      position: { x: 27, y: 21, z: 0 },
      initialState: {
        activated: false,
        weightThreshold: 'heavy',
        currentWeight: 0,
      },
      linkedIds: ['exit_gate'],
    },
    // Final exit gate
    {
      id: 'exit_gate',
      type: 'door',
      position: { x: 25, y: 17.5, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },

    // === CHECKPOINT ===
    {
      id: 'checkpoint_1',
      type: 'checkpoint',
      position: { x: 18, y: 15, z: 0 },
      initialState: {
        activated: false,
      },
    },
  ];

  // === PUZZLES ===
  const puzzles: PuzzleConfig[] = [
    {
      id: 'puzzle_sync_buttons',
      name: 'Synchronized Entry',
      description: 'Both players must press their buttons within 5 seconds of each other.',
      objectives: [
        {
          id: 'obj_sync_1',
          description: 'Dog: Press the elevated button',
          condition: { type: 'interactable_state', targetId: 'timed_btn_1a', state: { pressed: true } },
        },
        {
          id: 'obj_sync_2',
          description: 'Panda: Press the floor button',
          condition: { type: 'interactable_state', targetId: 'timed_btn_1b', state: { pressed: true } },
        },
      ],
      completionReward: 'dock_gate',
    },
    {
      id: 'puzzle_conveyor',
      name: 'Conveyor Coordination',
      description: 'Use the conveyor system to move the crate onto the pressure plate.',
      objectives: [
        {
          id: 'obj_conveyor',
          description: 'Place crate on conveyor endpoint',
          condition: { type: 'interactable_state', targetId: 'conveyor_plate', state: { activated: true } },
        },
      ],
      completionReward: 'conveyor_gate',
    },
    {
      id: 'puzzle_storage',
      name: 'Heavy Lifting',
      description: 'Panda must stack crates on the pressure plate.',
      objectives: [
        {
          id: 'obj_storage',
          description: 'Activate the heavy plate with crates',
          condition: { type: 'interactable_state', targetId: 'storage_plate', state: { activated: true } },
        },
      ],
      completionReward: 'storage_door',
    },
    {
      id: 'puzzle_office',
      name: 'Office Access',
      description: 'Dog reaches the lever, Panda opens the heavy door.',
      objectives: [
        {
          id: 'obj_office_door',
          description: 'Panda: Open the heavy office door',
          condition: { type: 'interactable_state', targetId: 'office_door', state: { open: true } },
        },
        {
          id: 'obj_office_lever',
          description: 'Activate the bridge lever',
          condition: { type: 'interactable_state', targetId: 'office_lever', state: { position: 'on' } },
        },
      ],
    },
    {
      id: 'puzzle_pit',
      name: 'Bridge the Gap',
      description: 'Cross the central pit using the raised bridge.',
      objectives: [
        {
          id: 'obj_bridge',
          description: 'Raise the bridge platform',
          condition: { type: 'interactable_state', targetId: 'main_bridge', state: { currentPosition: 1 } },
        },
      ],
    },
    {
      id: 'puzzle_exit',
      name: 'Final Escape',
      description: 'Both players stand on their plates simultaneously.',
      objectives: [
        {
          id: 'obj_exit_dog',
          description: 'Dog: Stand on the light plate',
          condition: { type: 'interactable_state', targetId: 'exit_plate_dog', state: { activated: true } },
        },
        {
          id: 'obj_exit_panda',
          description: 'Panda: Stand on the heavy plate',
          condition: { type: 'interactable_state', targetId: 'exit_plate_panda', state: { activated: true } },
        },
      ],
      completionReward: 'exit_gate',
    },
  ];

  return {
    id: 'warehouse',
    name: 'The Warehouse',
    width,
    height,
    tiles,
    spawns: {
      dog: { x: 4, y: 8, z: 0 },
      panda: { x: 7, y: 8, z: 0 },
    },
    interactables,
    puzzles,
    checkpoints: [{ x: 18, y: 15, z: 0 }],
  };
}
