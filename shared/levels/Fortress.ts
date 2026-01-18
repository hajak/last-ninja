/**
 * Panda & Dog - Level 4: The Fortress
 * Introduces guards with vision cones and stealth mechanics
 *
 * Layout (45x35):
 * ┌─────────────────────────────────────────────────────────────────────────────────┐
 * │  GATEHOUSE         │  OUTER COURTYARD           │  GUARD BARRACKS              │
 * │  Entry puzzle      │  Patrolling guards         │  Timing challenge            │
 * │  (Dog distracts)   │  (multiple routes)         │  (Dog sneaks, Panda waits)   │
 * ├────────────────────┼────────────────────────────┼──────────────────────────────┤
 * │  ARMORY            │  INNER COURTYARD           │  WATCHTOWER                  │
 * │  Heavy door        │  Central hub               │  Camera puzzle               │
 * │  (Panda strength)  │  (checkpoint)              │  (disable security)          │
 * ├────────────────────┼────────────────────────────┼──────────────────────────────┤
 * │  DUNGEONS          │  TREASURY ENTRANCE         │  ESCAPE ROUTE                │
 * │  Lever maze        │  Final guard gauntlet      │  Both players needed         │
 * └─────────────────────────────────────────────────────────────────────────────────┘
 */

import type { LevelData, TileData, TileType, InteractableConfig, PuzzleConfig, GuardConfig } from '../types';

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

export function createFortressLevel(): LevelData {
  const width = 45;
  const height = 35;
  const tiles: TileData[][] = [];

  // Initialize with stone floor
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

  // === OUTER WALLS (thick fortress walls) ===
  fillRect(0, 0, width - 1, 1, 'wall');
  fillRect(0, height - 2, width - 1, height - 1, 'wall');
  fillRect(0, 0, 1, height - 1, 'wall');
  fillRect(width - 2, 0, width - 1, height - 1, 'wall');

  // === GATEHOUSE (top-left, 2-13 x 2-11) ===
  fillRect(2, 2, 13, 11, 'stone');
  // Small alcoves for hiding
  fillRect(3, 3, 4, 4, 'ground', 0.5);
  fillRect(10, 8, 11, 9, 'ground', 0.5);
  // Entry gate area
  fillRect(6, 2, 9, 3, 'ground');
  // Wall with gate to courtyard
  fillRect(14, 2, 14, 8, 'wall');
  setTile(14, 9, 'stone'); // Gate opening
  setTile(14, 10, 'stone');

  // === OUTER COURTYARD (top-center, 15-30 x 2-11) ===
  fillRect(15, 2, 30, 11, 'stone');
  // Patrol walkways (slightly raised)
  fillRect(16, 3, 29, 3, 'ground', 0.3);
  fillRect(16, 10, 29, 10, 'ground', 0.3);
  fillRect(16, 3, 16, 10, 'ground', 0.3);
  fillRect(29, 3, 29, 10, 'ground', 0.3);
  // Central cover (pillars)
  setTile(20, 6, 'wall');
  setTile(25, 6, 'wall');
  setTile(22, 4, 'wall');
  setTile(22, 8, 'wall');
  // Wall to barracks
  fillRect(31, 2, 31, 8, 'wall');
  setTile(31, 9, 'stone');
  setTile(31, 10, 'stone');

  // === GUARD BARRACKS (top-right, 32-43 x 2-11) ===
  fillRect(32, 2, 43, 11, 'stone');
  // Bunk areas (elevated platforms)
  fillRect(33, 3, 35, 5, 'ground', 0.5);
  fillRect(38, 3, 40, 5, 'ground', 0.5);
  fillRect(33, 8, 35, 10, 'ground', 0.5);
  // Narrow passage for Dog
  setTile(36, 7, 'stone');
  setTile(37, 7, 'stone');
  // Storage area
  fillRect(41, 7, 42, 10, 'ground', 0.5);

  // === HORIZONTAL DIVIDER (row 12) ===
  fillRect(2, 12, 43, 12, 'wall');
  // Openings
  setTile(8, 12, 'stone');  // Gatehouse to Armory
  setTile(22, 12, 'stone'); // Courtyard to Inner
  setTile(23, 12, 'stone');
  setTile(38, 12, 'stone'); // Barracks to Watchtower

  // === ARMORY (middle-left, 2-13 x 13-22) ===
  fillRect(2, 13, 13, 22, 'stone');
  // Weapon racks (elevated)
  fillRect(3, 14, 5, 16, 'ground', 0.8);
  fillRect(9, 14, 11, 16, 'ground', 0.8);
  // Heavy door area
  fillRect(6, 19, 9, 21, 'ground');
  // Wall to dungeons
  fillRect(2, 23, 13, 23, 'wall');
  setTile(7, 23, 'stone');
  setTile(8, 23, 'stone');
  // Wall to inner courtyard
  fillRect(14, 13, 14, 22, 'wall');
  setTile(14, 17, 'stone');
  setTile(14, 18, 'stone');

  // === INNER COURTYARD (middle-center, 15-30 x 13-22) ===
  fillRect(15, 13, 30, 22, 'stone');
  // Central fountain/statue (decorative)
  fillRect(21, 16, 24, 19, 'water');
  setTile(22, 17, 'stone', 0.5);
  setTile(23, 17, 'stone', 0.5);
  setTile(22, 18, 'stone', 0.5);
  setTile(23, 18, 'stone', 0.5);
  // Checkpoint area
  fillRect(17, 20, 19, 21, 'grass');
  // Wall to watchtower
  fillRect(31, 13, 31, 22, 'wall');
  setTile(31, 16, 'stone');
  setTile(31, 17, 'stone');

  // === WATCHTOWER (middle-right, 32-43 x 13-22) ===
  fillRect(32, 13, 43, 22, 'stone');
  // Tower base (elevated)
  fillRect(36, 15, 40, 19, 'ground', 1);
  fillRect(37, 16, 39, 18, 'ground', 2);
  // Stairs
  setTile(36, 17, 'ground', 0.5);
  setTile(35, 17, 'ground', 0.25);
  // Camera control room
  fillRect(33, 14, 35, 16, 'ground', 0.5);
  // Security panels
  setTile(34, 15, 'stone', 0.7);

  // === SECOND HORIZONTAL DIVIDER (row 23) ===
  fillRect(14, 23, 43, 23, 'wall');
  // Openings
  setTile(22, 23, 'stone'); // Inner to Treasury
  setTile(23, 23, 'stone');
  setTile(38, 23, 'stone'); // Watchtower to Escape

  // === DUNGEONS (bottom-left, 2-13 x 24-33) ===
  fillRect(2, 24, 13, 33, 'stone');
  // Maze-like cell corridors
  fillRect(4, 25, 4, 31, 'wall');
  fillRect(8, 26, 8, 32, 'wall');
  fillRect(11, 25, 11, 30, 'wall');
  // Cell openings
  setTile(4, 27, 'stone');
  setTile(8, 29, 'stone');
  setTile(11, 27, 'stone');
  // Lever alcoves
  fillRect(3, 30, 3, 31, 'ground', 0.3);
  fillRect(6, 25, 7, 26, 'ground', 0.3);
  fillRect(10, 31, 10, 32, 'ground', 0.3);
  // Wall to treasury
  fillRect(14, 24, 14, 33, 'wall');
  setTile(14, 28, 'stone');
  setTile(14, 29, 'stone');

  // === TREASURY ENTRANCE (bottom-center, 15-30 x 24-33) ===
  fillRect(15, 24, 30, 33, 'stone');
  // Guard patrol path
  fillRect(16, 25, 29, 25, 'ground', 0.3);
  fillRect(16, 32, 29, 32, 'ground', 0.3);
  fillRect(16, 25, 16, 32, 'ground', 0.3);
  fillRect(29, 25, 29, 32, 'ground', 0.3);
  // Cover positions
  setTile(19, 28, 'wall');
  setTile(26, 28, 'wall');
  setTile(22, 30, 'wall');
  // Treasury door area
  fillRect(21, 26, 24, 27, 'ground', 0.5);
  // Pit trap area
  fillRect(20, 29, 25, 31, 'void');
  // Bridge over pit
  fillRect(22, 29, 23, 31, 'bridge');
  // Wall to escape
  fillRect(31, 24, 31, 33, 'wall');
  setTile(31, 28, 'stone');
  setTile(31, 29, 'stone');

  // === ESCAPE ROUTE (bottom-right, 32-43 x 24-33) ===
  fillRect(32, 24, 43, 33, 'stone');
  // Final corridor
  fillRect(33, 25, 35, 31, 'stone');
  fillRect(36, 25, 36, 31, 'wall');
  setTile(36, 28, 'stone');
  // Dual pressure plate room
  fillRect(37, 25, 42, 31, 'stone');
  // Exit area
  fillRect(40, 30, 42, 32, 'grass');

  // === INTERACTABLES ===
  const interactables: InteractableConfig[] = [
    // === PUZZLE 1: Gatehouse Entry ===
    // Distraction bell (Dog rings to lure guard)
    {
      id: 'distraction_bell',
      type: 'button',
      position: { x: 4, y: 4, z: 0.5 },
      initialState: {
        pressed: false,
        momentary: true,
        cooldown: 0,
      },
      linkedIds: ['guard_distraction_1'],
    },
    // Gate to courtyard
    {
      id: 'gatehouse_gate',
      type: 'door',
      position: { x: 14, y: 9.5, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },
    // Lever to open gate (hidden)
    {
      id: 'gatehouse_lever',
      type: 'lever',
      position: { x: 11, y: 9, z: 0.5 },
      initialState: {
        position: 'off',
        requiresStrength: false,
      },
      linkedIds: ['gatehouse_gate'],
    },

    // === PUZZLE 2: Courtyard Navigation ===
    // Multiple checkpoints for respawn
    {
      id: 'checkpoint_courtyard',
      type: 'checkpoint',
      position: { x: 22, y: 6, z: 0 },
      initialState: { activated: false },
    },
    // Gate to barracks
    {
      id: 'courtyard_gate',
      type: 'door',
      position: { x: 31, y: 9.5, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },
    // Pressure plate to open
    {
      id: 'courtyard_plate',
      type: 'pressure_plate',
      position: { x: 28, y: 6, z: 0 },
      initialState: {
        activated: false,
        weightThreshold: 'light',
        currentWeight: 0,
      },
      linkedIds: ['courtyard_gate'],
    },

    // === PUZZLE 3: Barracks Sneak ===
    // Timed button sequence
    {
      id: 'barracks_btn_1',
      type: 'button',
      position: { x: 34, y: 4, z: 0.5 },
      initialState: {
        pressed: false,
        momentary: true,
        timer: undefined,
        timerDuration: 8000,
      },
      linkedIds: ['barracks_door'],
    },
    {
      id: 'barracks_btn_2',
      type: 'button',
      position: { x: 42, y: 9, z: 0.5 },
      initialState: {
        pressed: false,
        momentary: true,
        timer: undefined,
        timerDuration: 8000,
      },
      linkedIds: ['barracks_door'],
    },
    {
      id: 'barracks_door',
      type: 'door',
      position: { x: 38, y: 12, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },

    // === PUZZLE 4: Armory Heavy Door ===
    {
      id: 'armory_door',
      type: 'door',
      position: { x: 14, y: 17.5, z: 0 },
      initialState: {
        open: false,
        locked: false,
        requiresHeavy: true,
      },
    },
    // Crate for Dog to use
    {
      id: 'armory_crate',
      type: 'crate',
      position: { x: 5, y: 18, z: 0 },
      initialState: {
        gridX: 5,
        gridY: 18,
        beingPushed: false,
      },
    },
    // Lever behind armory
    {
      id: 'armory_lever',
      type: 'lever',
      position: { x: 10, y: 20, z: 0.8 },
      initialState: {
        position: 'off',
        requiresStrength: true,
      },
      linkedIds: ['dungeon_gate'],
    },

    // === PUZZLE 5: Inner Courtyard Hub ===
    {
      id: 'checkpoint_inner',
      type: 'checkpoint',
      position: { x: 18, y: 21, z: 0 },
      initialState: { activated: false },
    },
    // Gate to watchtower
    {
      id: 'inner_gate_east',
      type: 'door',
      position: { x: 31, y: 16.5, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },
    // Gate to treasury
    {
      id: 'inner_gate_south',
      type: 'door',
      position: { x: 22.5, y: 23, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },

    // === PUZZLE 6: Watchtower Security ===
    // Camera nodes
    {
      id: 'camera_1',
      type: 'camera_node',
      position: { x: 38, y: 17, z: 2 },
      initialState: {
        active: true,
        rotation: 180,
        minRotation: 90,
        maxRotation: 270,
        viewingPlayerId: undefined,
      },
    },
    // Security lever (disables cameras)
    {
      id: 'security_lever',
      type: 'lever',
      position: { x: 34, y: 15, z: 0.7 },
      initialState: {
        position: 'off',
        requiresStrength: false,
      },
      linkedIds: ['camera_1', 'inner_gate_east', 'inner_gate_south'],
    },
    // Watchtower exit
    {
      id: 'watchtower_door',
      type: 'door',
      position: { x: 38, y: 23, z: 0 },
      initialState: {
        open: false,
        locked: false,
        requiresHeavy: false,
      },
    },

    // === PUZZLE 7: Dungeon Maze ===
    // Multiple levers for maze
    {
      id: 'dungeon_lever_1',
      type: 'lever',
      position: { x: 3, y: 31, z: 0.3 },
      initialState: {
        position: 'off',
        requiresStrength: false,
      },
      linkedIds: ['dungeon_door_1'],
    },
    {
      id: 'dungeon_lever_2',
      type: 'lever',
      position: { x: 7, y: 26, z: 0.3 },
      initialState: {
        position: 'off',
        requiresStrength: false,
      },
      linkedIds: ['dungeon_door_2'],
    },
    {
      id: 'dungeon_lever_3',
      type: 'lever',
      position: { x: 10, y: 32, z: 0.3 },
      initialState: {
        position: 'off',
        requiresStrength: false,
      },
      linkedIds: ['dungeon_door_3'],
    },
    {
      id: 'dungeon_door_1',
      type: 'door',
      position: { x: 4, y: 27, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },
    {
      id: 'dungeon_door_2',
      type: 'door',
      position: { x: 8, y: 29, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },
    {
      id: 'dungeon_door_3',
      type: 'door',
      position: { x: 11, y: 27, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },
    {
      id: 'dungeon_gate',
      type: 'door',
      position: { x: 14, y: 28.5, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },

    // === PUZZLE 8: Treasury Gauntlet ===
    // Hazard in pit
    {
      id: 'treasury_spikes',
      type: 'hazard',
      position: { x: 22.5, y: 30, z: -1 },
      initialState: {
        active: true,
        hazardType: 'spikes',
      },
    },
    // Bridge control
    {
      id: 'treasury_winch',
      type: 'winch',
      position: { x: 17, y: 28, z: 0 },
      initialState: {
        extended: 0,
        operating: false,
        requiresPower: false,
      },
      linkedIds: ['treasury_bridge'],
    },
    // Moving platform over pit
    {
      id: 'treasury_bridge',
      type: 'platform',
      position: { x: 22.5, y: 29, z: 0 },
      initialState: {
        currentPosition: 0,
        moving: false,
        direction: 1,
        speed: 1,
        waypoints: [
          { x: 22.5, y: 29, z: 0 },
          { x: 22.5, y: 31, z: 0 },
        ],
      },
    },
    // Gate to escape
    {
      id: 'treasury_gate',
      type: 'door',
      position: { x: 31, y: 28.5, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },
    // Treasure pressure plate
    {
      id: 'treasury_plate',
      type: 'pressure_plate',
      position: { x: 22.5, y: 27, z: 0.5 },
      initialState: {
        activated: false,
        weightThreshold: 'heavy',
        currentWeight: 0,
      },
      linkedIds: ['treasury_gate'],
    },

    // === PUZZLE 9: Final Escape ===
    // Dual pressure plates
    {
      id: 'escape_plate_dog',
      type: 'pressure_plate',
      position: { x: 39, y: 26, z: 0 },
      initialState: {
        activated: false,
        weightThreshold: 'light',
        currentWeight: 0,
      },
      linkedIds: ['escape_gate'],
    },
    {
      id: 'escape_plate_panda',
      type: 'pressure_plate',
      position: { x: 39, y: 30, z: 0 },
      initialState: {
        activated: false,
        weightThreshold: 'heavy',
        currentWeight: 0,
      },
      linkedIds: ['escape_gate'],
    },
    {
      id: 'escape_gate',
      type: 'door',
      position: { x: 41, y: 28, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },
    // Final checkpoint
    {
      id: 'checkpoint_escape',
      type: 'checkpoint',
      position: { x: 41, y: 31, z: 0 },
      initialState: { activated: false },
    },
  ];

  // === GUARDS ===
  const guards: GuardConfig[] = [
    // Gatehouse guard (patrols entrance)
    {
      id: 'guard_gatehouse',
      position: { x: 7, y: 6, z: 0 },
      patrolRoute: [
        { x: 7, y: 6, z: 0 },
        { x: 7, y: 9, z: 0 },
        { x: 10, y: 9, z: 0 },
        { x: 10, y: 6, z: 0 },
      ],
      visionAngle: 90,
      visionRange: 5,
      moveSpeed: 1.5,
    },
    // Courtyard guards (two patrolling)
    {
      id: 'guard_courtyard_1',
      position: { x: 18, y: 3, z: 0 },
      patrolRoute: [
        { x: 18, y: 3, z: 0 },
        { x: 27, y: 3, z: 0 },
        { x: 27, y: 10, z: 0 },
        { x: 18, y: 10, z: 0 },
      ],
      visionAngle: 75,
      visionRange: 6,
      moveSpeed: 2,
    },
    {
      id: 'guard_courtyard_2',
      position: { x: 27, y: 10, z: 0 },
      patrolRoute: [
        { x: 27, y: 10, z: 0 },
        { x: 18, y: 10, z: 0 },
        { x: 18, y: 3, z: 0 },
        { x: 27, y: 3, z: 0 },
      ],
      visionAngle: 75,
      visionRange: 6,
      moveSpeed: 2,
    },
    // Barracks guard (stationary, watching)
    {
      id: 'guard_barracks',
      position: { x: 37, y: 6, z: 0 },
      patrolRoute: [
        { x: 37, y: 6, z: 0 },
        { x: 37, y: 9, z: 0 },
      ],
      visionAngle: 120,
      visionRange: 4,
      moveSpeed: 1,
    },
    // Treasury guards (final gauntlet)
    {
      id: 'guard_treasury_1',
      position: { x: 17, y: 25, z: 0 },
      patrolRoute: [
        { x: 17, y: 25, z: 0 },
        { x: 28, y: 25, z: 0 },
        { x: 28, y: 32, z: 0 },
        { x: 17, y: 32, z: 0 },
      ],
      visionAngle: 60,
      visionRange: 7,
      moveSpeed: 2.5,
    },
    {
      id: 'guard_treasury_2',
      position: { x: 28, y: 32, z: 0 },
      patrolRoute: [
        { x: 28, y: 32, z: 0 },
        { x: 17, y: 32, z: 0 },
        { x: 17, y: 25, z: 0 },
        { x: 28, y: 25, z: 0 },
      ],
      visionAngle: 60,
      visionRange: 7,
      moveSpeed: 2.5,
    },
  ];

  // === PUZZLES ===
  const puzzles: PuzzleConfig[] = [
    {
      id: 'puzzle_gatehouse',
      name: 'Gatehouse Entry',
      description: 'Sneak past the guard and find the lever to open the gate.',
      objectives: [
        {
          id: 'obj_gate_lever',
          description: 'Find and activate the hidden lever',
          condition: { type: 'interactable_state', targetId: 'gatehouse_lever', state: { position: 'on' } },
        },
      ],
      completionReward: 'gatehouse_gate',
    },
    {
      id: 'puzzle_courtyard',
      name: 'Courtyard Crossing',
      description: 'Navigate through the patrolled courtyard using cover.',
      objectives: [
        {
          id: 'obj_courtyard_cross',
          description: 'Reach the courtyard checkpoint',
          condition: { type: 'interactable_state', targetId: 'checkpoint_courtyard', state: { activated: true } },
        },
        {
          id: 'obj_courtyard_plate',
          description: 'Activate the pressure plate',
          condition: { type: 'interactable_state', targetId: 'courtyard_plate', state: { activated: true } },
        },
      ],
      completionReward: 'courtyard_gate',
    },
    {
      id: 'puzzle_barracks',
      name: 'Barracks Infiltration',
      description: 'Press both buttons within the time limit while avoiding the guard.',
      objectives: [
        {
          id: 'obj_barracks_btns',
          description: 'Press both timed buttons',
          condition: { type: 'interactable_state', targetId: 'barracks_door', state: { open: true } },
        },
      ],
      completionReward: 'barracks_door',
    },
    {
      id: 'puzzle_armory',
      name: 'Armory Access',
      description: 'Panda opens the heavy door. Use the lever to unlock the dungeons.',
      objectives: [
        {
          id: 'obj_armory_door',
          description: 'Panda: Open the heavy armory door',
          condition: { type: 'interactable_state', targetId: 'armory_door', state: { open: true } },
        },
        {
          id: 'obj_armory_lever',
          description: 'Activate the strength lever',
          condition: { type: 'interactable_state', targetId: 'armory_lever', state: { position: 'on' } },
        },
      ],
    },
    {
      id: 'puzzle_watchtower',
      name: 'Security Override',
      description: 'Disable the security system to unlock the inner gates.',
      objectives: [
        {
          id: 'obj_security',
          description: 'Pull the security lever',
          condition: { type: 'interactable_state', targetId: 'security_lever', state: { position: 'on' } },
        },
      ],
      completionReward: 'inner_gate_south',
    },
    {
      id: 'puzzle_dungeon',
      name: 'Dungeon Maze',
      description: 'Navigate the dungeon by activating levers in the correct order.',
      objectives: [
        {
          id: 'obj_dungeon_1',
          description: 'Activate first lever',
          condition: { type: 'interactable_state', targetId: 'dungeon_lever_1', state: { position: 'on' } },
        },
        {
          id: 'obj_dungeon_2',
          description: 'Activate second lever',
          condition: { type: 'interactable_state', targetId: 'dungeon_lever_2', state: { position: 'on' } },
        },
        {
          id: 'obj_dungeon_3',
          description: 'Activate third lever',
          condition: { type: 'interactable_state', targetId: 'dungeon_lever_3', state: { position: 'on' } },
        },
      ],
    },
    {
      id: 'puzzle_treasury',
      name: 'Treasury Gauntlet',
      description: 'Cross the dangerous pit and reach the treasure while avoiding guards.',
      objectives: [
        {
          id: 'obj_treasury_cross',
          description: 'Cross the spike pit',
          condition: { type: 'interactable_state', targetId: 'treasury_plate', state: { activated: true } },
        },
      ],
      completionReward: 'treasury_gate',
    },
    {
      id: 'puzzle_escape',
      name: 'Final Escape',
      description: 'Both players must stand on their plates simultaneously to escape.',
      objectives: [
        {
          id: 'obj_escape_dog',
          description: 'Dog: Stand on the light plate',
          condition: { type: 'interactable_state', targetId: 'escape_plate_dog', state: { activated: true } },
        },
        {
          id: 'obj_escape_panda',
          description: 'Panda: Stand on the heavy plate',
          condition: { type: 'interactable_state', targetId: 'escape_plate_panda', state: { activated: true } },
        },
      ],
      completionReward: 'escape_gate',
    },
  ];

  return {
    id: 'fortress',
    name: 'The Fortress',
    width,
    height,
    tiles,
    spawns: {
      dog: { x: 5, y: 8, z: 0 },
      panda: { x: 8, y: 8, z: 0 },
    },
    interactables,
    puzzles,
    guards,
    checkpoints: [
      { x: 22, y: 6, z: 0 },
      { x: 18, y: 21, z: 0 },
      { x: 41, y: 31, z: 0 },
    ],
  };
}
