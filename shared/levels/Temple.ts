/**
 * Panda & Dog - Level 5: The Temple
 * Final level combining all mechanics: puzzles, guards, hazards, and timing
 *
 * Layout (50x40):
 * ┌────────────────────────────────────────────────────────────────────────────────────────┐
 * │  ENTRANCE HALL       │  MIRROR CHAMBER          │  GUARD SANCTUM                      │
 * │  Tutorial recap      │  Laser + mirror puzzles  │  Elite guards                       │
 * ├──────────────────────┼──────────────────────────┼─────────────────────────────────────┤
 * │  WATER GARDEN        │  CENTRAL ATRIUM          │  CLOCK TOWER                        │
 * │  Bridge puzzles      │  Multi-level hub         │  Timed sequences                    │
 * ├──────────────────────┼──────────────────────────┼─────────────────────────────────────┤
 * │  CRYPT               │  TREASURE VAULT          │  ASCENSION PATH                     │
 * │  Spike gauntlet      │  Final puzzle room       │  Exit to victory                    │
 * └────────────────────────────────────────────────────────────────────────────────────────┘
 */

import type { LevelData, TileData, TileType, InteractableConfig, PuzzleConfig, GuardConfig, CameraNodeConfig } from '../types.js';

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

export function createTempleLevel(): LevelData {
  const width = 50;
  const height = 40;
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

  // === OUTER WALLS (thick temple walls) ===
  fillRect(0, 0, width - 1, 1, 'wall');
  fillRect(0, height - 2, width - 1, height - 1, 'wall');
  fillRect(0, 0, 1, height - 1, 'wall');
  fillRect(width - 2, 0, width - 1, height - 1, 'wall');

  // === ENTRANCE HALL (top-left, 2-15 x 2-12) ===
  fillRect(2, 2, 15, 12, 'stone');
  // Decorative pillars
  setTile(4, 4, 'wall');
  setTile(8, 4, 'wall');
  setTile(12, 4, 'wall');
  setTile(4, 10, 'wall');
  setTile(8, 10, 'wall');
  setTile(12, 10, 'wall');
  // Central carpet (elevated slightly)
  fillRect(5, 5, 11, 9, 'ground', 0.2);
  // Starting area
  fillRect(3, 6, 4, 8, 'grass');
  // Wall to mirror chamber
  fillRect(16, 2, 16, 9, 'wall');
  setTile(16, 10, 'stone');
  setTile(16, 11, 'stone');

  // === MIRROR CHAMBER (top-center, 17-32 x 2-12) ===
  fillRect(17, 2, 32, 12, 'stone');
  // Mirror platforms (elevated)
  fillRect(19, 3, 20, 4, 'ground', 0.5);
  fillRect(25, 3, 26, 4, 'ground', 0.5);
  fillRect(30, 3, 31, 4, 'ground', 0.5);
  fillRect(19, 10, 20, 11, 'ground', 0.5);
  fillRect(25, 10, 26, 11, 'ground', 0.5);
  fillRect(30, 10, 31, 11, 'ground', 0.5);
  // Central laser path
  fillRect(22, 6, 28, 8, 'ground', 0.3);
  // Wall to guard sanctum
  fillRect(33, 2, 33, 9, 'wall');
  setTile(33, 10, 'stone');
  setTile(33, 11, 'stone');

  // === GUARD SANCTUM (top-right, 34-48 x 2-12) ===
  fillRect(34, 2, 48, 12, 'stone');
  // Guard stations
  fillRect(36, 3, 38, 5, 'ground', 0.5);
  fillRect(44, 3, 46, 5, 'ground', 0.5);
  // Patrol corridors
  fillRect(36, 8, 46, 8, 'ground', 0.3);
  fillRect(40, 4, 40, 11, 'ground', 0.3);
  // Cover positions
  setTile(38, 10, 'wall');
  setTile(42, 10, 'wall');

  // === FIRST HORIZONTAL DIVIDER (row 13) ===
  fillRect(2, 13, 48, 13, 'wall');
  // Openings
  setTile(8, 13, 'stone');
  setTile(9, 13, 'stone');
  setTile(24, 13, 'stone');
  setTile(25, 13, 'stone');
  setTile(40, 13, 'stone');
  setTile(41, 13, 'stone');

  // === WATER GARDEN (middle-left, 2-15 x 14-25) ===
  fillRect(2, 14, 15, 25, 'water');
  // Island platforms
  fillRect(3, 15, 5, 17, 'stone');
  fillRect(8, 18, 10, 20, 'stone');
  fillRect(12, 15, 14, 17, 'stone');
  fillRect(3, 22, 5, 24, 'stone');
  fillRect(12, 22, 14, 24, 'stone');
  // Bridges connecting islands
  fillRect(6, 16, 7, 16, 'bridge');
  fillRect(11, 16, 11, 16, 'bridge');
  fillRect(5, 18, 5, 19, 'bridge');
  fillRect(11, 19, 11, 19, 'bridge');
  fillRect(5, 22, 5, 22, 'bridge');
  fillRect(11, 23, 11, 23, 'bridge');
  fillRect(6, 23, 7, 23, 'bridge');
  // Exit bridge
  fillRect(14, 19, 15, 19, 'bridge');
  // Wall to atrium
  fillRect(16, 14, 16, 22, 'wall');
  setTile(16, 23, 'stone');
  setTile(16, 24, 'stone');

  // === CENTRAL ATRIUM (middle-center, 17-32 x 14-25) ===
  fillRect(17, 14, 32, 25, 'stone');
  // Multi-level central structure
  fillRect(21, 17, 28, 22, 'ground', 0.5);
  fillRect(23, 18, 26, 21, 'ground', 1);
  fillRect(24, 19, 25, 20, 'ground', 1.5);
  // Stairs down from sides
  setTile(21, 19, 'ground', 0.25);
  setTile(21, 20, 'ground', 0.25);
  setTile(28, 19, 'ground', 0.25);
  setTile(28, 20, 'ground', 0.25);
  // Decorative elements
  setTile(19, 15, 'wall');
  setTile(30, 15, 'wall');
  setTile(19, 24, 'wall');
  setTile(30, 24, 'wall');
  // Wall to clock tower
  fillRect(33, 14, 33, 22, 'wall');
  setTile(33, 23, 'stone');
  setTile(33, 24, 'stone');

  // === CLOCK TOWER (middle-right, 34-48 x 14-25) ===
  fillRect(34, 14, 48, 25, 'stone');
  // Tower mechanism (central raised area)
  fillRect(39, 17, 44, 22, 'ground', 1);
  fillRect(40, 18, 43, 21, 'ground', 1.5);
  fillRect(41, 19, 42, 20, 'ground', 2);
  // Gear platforms (rotating hazard areas)
  fillRect(35, 15, 37, 17, 'ground', 0.5);
  fillRect(46, 15, 47, 17, 'ground', 0.5);
  fillRect(35, 23, 37, 24, 'ground', 0.5);
  fillRect(46, 23, 47, 24, 'ground', 0.5);
  // Conveyor tracks
  fillRect(38, 16, 38, 23, 'ground', 0.3);
  fillRect(45, 16, 45, 23, 'ground', 0.3);

  // === SECOND HORIZONTAL DIVIDER (row 26) ===
  fillRect(2, 26, 48, 26, 'wall');
  // Openings
  setTile(8, 26, 'stone');
  setTile(9, 26, 'stone');
  setTile(24, 26, 'stone');
  setTile(25, 26, 'stone');
  setTile(40, 26, 'stone');
  setTile(41, 26, 'stone');

  // === CRYPT (bottom-left, 2-15 x 27-38) ===
  fillRect(2, 27, 15, 38, 'stone');
  // Spike trap corridors
  fillRect(3, 28, 14, 30, 'ground');
  fillRect(3, 33, 14, 35, 'ground');
  // Safe zones between traps
  fillRect(5, 31, 6, 32, 'stone');
  fillRect(9, 31, 10, 32, 'stone');
  fillRect(13, 31, 14, 32, 'stone');
  // Crypt entrance
  fillRect(3, 36, 6, 37, 'stone');
  // Wall to vault
  fillRect(16, 27, 16, 35, 'wall');
  setTile(16, 36, 'stone');
  setTile(16, 37, 'stone');

  // === TREASURE VAULT (bottom-center, 17-32 x 27-38) ===
  fillRect(17, 27, 32, 38, 'stone');
  // Treasure platform (center, elevated)
  fillRect(22, 31, 27, 36, 'ground', 0.8);
  fillRect(23, 32, 26, 35, 'ground', 1.2);
  fillRect(24, 33, 25, 34, 'ground', 1.5);
  // Pressure plate pedestals
  fillRect(18, 29, 19, 30, 'ground', 0.5);
  fillRect(30, 29, 31, 30, 'ground', 0.5);
  fillRect(18, 36, 19, 37, 'ground', 0.5);
  fillRect(30, 36, 31, 37, 'ground', 0.5);
  // Wall to ascension
  fillRect(33, 27, 33, 35, 'wall');
  setTile(33, 36, 'stone');
  setTile(33, 37, 'stone');

  // === ASCENSION PATH (bottom-right, 34-48 x 27-38) ===
  fillRect(34, 27, 48, 38, 'stone');
  // Rising platforms (stairway to victory)
  fillRect(35, 28, 37, 30, 'ground', 0.3);
  fillRect(38, 30, 40, 32, 'ground', 0.6);
  fillRect(41, 32, 43, 34, 'ground', 0.9);
  fillRect(44, 34, 46, 36, 'ground', 1.2);
  // Final exit area
  fillRect(45, 36, 47, 37, 'grass', 1.2);
  // Void gaps
  fillRect(35, 33, 37, 37, 'void');
  fillRect(42, 27, 44, 30, 'void');

  // === INTERACTABLES ===
  const interactables: InteractableConfig[] = [
    // === ENTRANCE HALL ===
    {
      id: 'checkpoint_entrance',
      type: 'checkpoint',
      position: { x: 4, y: 7, z: 0 },
      initialState: { activated: false },
    },
    {
      id: 'entrance_gate',
      type: 'door',
      position: { x: 16, y: 10.5, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },
    {
      id: 'entrance_lever',
      type: 'lever',
      position: { x: 13, y: 7, z: 0 },
      initialState: {
        position: 'off',
        requiresStrength: false,
      },
      linkedIds: ['entrance_gate'],
    },
    {
      id: 'entrance_plate',
      type: 'pressure_plate',
      position: { x: 6, y: 7, z: 0.2 },
      initialState: {
        activated: false,
        weightThreshold: 'heavy',
        currentWeight: 0,
      },
      linkedIds: ['entrance_lever_unlock'],
    },

    // === MIRROR CHAMBER ===
    // Laser source
    {
      id: 'laser_source',
      type: 'hazard',
      position: { x: 18, y: 7, z: 0.5 },
      initialState: {
        active: true,
        hazardType: 'laser',
      },
    },
    // Mirrors (rotatable)
    {
      id: 'mirror_1',
      type: 'mirror',
      position: { x: 20, y: 4, z: 0.5 },
      initialState: {
        rotation: 45,
        reflecting: false,
      },
    },
    {
      id: 'mirror_2',
      type: 'mirror',
      position: { x: 26, y: 4, z: 0.5 },
      initialState: {
        rotation: 135,
        reflecting: false,
      },
    },
    {
      id: 'mirror_3',
      type: 'mirror',
      position: { x: 26, y: 11, z: 0.5 },
      initialState: {
        rotation: 225,
        reflecting: false,
      },
    },
    {
      id: 'mirror_4',
      type: 'mirror',
      position: { x: 31, y: 11, z: 0.5 },
      initialState: {
        rotation: 315,
        reflecting: false,
      },
    },
    // Target receptor
    {
      id: 'laser_target',
      type: 'button',
      position: { x: 31, y: 4, z: 0.5 },
      initialState: {
        pressed: false,
        momentary: false,
        cooldown: 0,
      },
      linkedIds: ['mirror_gate'],
    },
    {
      id: 'mirror_gate',
      type: 'door',
      position: { x: 33, y: 10.5, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },

    // === GUARD SANCTUM ===
    {
      id: 'checkpoint_sanctum',
      type: 'checkpoint',
      position: { x: 40, y: 5, z: 0.5 },
      initialState: { activated: false },
    },
    {
      id: 'sanctum_gate',
      type: 'door',
      position: { x: 40.5, y: 13, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },
    // Security camera
    {
      id: 'sanctum_camera',
      type: 'camera_node',
      position: { x: 45, y: 4, z: 0.8 },
      initialState: {
        active: true,
        rotation: 180,
        minRotation: 90,
        maxRotation: 270,
        viewingPlayerId: undefined,
      },
    },
    // Disable switch
    {
      id: 'sanctum_switch',
      type: 'lever',
      position: { x: 37, y: 4, z: 0.5 },
      initialState: {
        position: 'off',
        requiresStrength: false,
      },
      linkedIds: ['sanctum_camera', 'sanctum_gate'],
    },

    // === WATER GARDEN ===
    // Bridge controls
    {
      id: 'water_lever_1',
      type: 'lever',
      position: { x: 4, y: 16, z: 0 },
      initialState: {
        position: 'off',
        requiresStrength: false,
      },
      linkedIds: ['water_bridge_1'],
    },
    {
      id: 'water_bridge_1',
      type: 'platform',
      position: { x: 9, y: 16, z: -0.5 },
      initialState: {
        currentPosition: 0,
        moving: false,
        direction: 1,
        speed: 0.5,
        waypoints: [
          { x: 9, y: 16, z: -0.5 },
          { x: 9, y: 16, z: 0 },
        ],
      },
    },
    {
      id: 'water_lever_2',
      type: 'lever',
      position: { x: 13, y: 16, z: 0 },
      initialState: {
        position: 'off',
        requiresStrength: false,
      },
      linkedIds: ['water_bridge_2'],
    },
    {
      id: 'water_bridge_2',
      type: 'platform',
      position: { x: 9, y: 21, z: -0.5 },
      initialState: {
        currentPosition: 0,
        moving: false,
        direction: 1,
        speed: 0.5,
        waypoints: [
          { x: 9, y: 21, z: -0.5 },
          { x: 9, y: 21, z: 0 },
        ],
      },
    },
    {
      id: 'water_gate',
      type: 'door',
      position: { x: 16, y: 23.5, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },
    {
      id: 'water_plate',
      type: 'pressure_plate',
      position: { x: 4, y: 23, z: 0 },
      initialState: {
        activated: false,
        weightThreshold: 'light',
        currentWeight: 0,
      },
      linkedIds: ['water_gate'],
    },

    // === CENTRAL ATRIUM ===
    {
      id: 'checkpoint_atrium',
      type: 'checkpoint',
      position: { x: 24.5, y: 19.5, z: 1.5 },
      initialState: { activated: false },
    },
    // Central altar button
    {
      id: 'atrium_altar',
      type: 'button',
      position: { x: 24.5, y: 19.5, z: 1.5 },
      initialState: {
        pressed: false,
        momentary: false,
        cooldown: 0,
      },
      linkedIds: ['atrium_gate_west', 'atrium_gate_east'],
    },
    {
      id: 'atrium_gate_west',
      type: 'door',
      position: { x: 16, y: 23.5, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },
    {
      id: 'atrium_gate_east',
      type: 'door',
      position: { x: 33, y: 23.5, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },
    // Teleporters connecting levels
    {
      id: 'teleporter_up',
      type: 'teleporter',
      position: { x: 21, y: 19.5, z: 0.5 },
      initialState: {
        active: true,
        linkedTeleporterId: 'teleporter_down',
        cooldown: 0,
      },
    },
    {
      id: 'teleporter_down',
      type: 'teleporter',
      position: { x: 28, y: 19.5, z: 0.5 },
      initialState: {
        active: true,
        linkedTeleporterId: 'teleporter_up',
        cooldown: 0,
      },
    },

    // === CLOCK TOWER ===
    // Conveyors
    {
      id: 'clock_conveyor_1',
      type: 'conveyor',
      position: { x: 38, y: 19, z: 0.3 },
      initialState: {
        active: true,
        direction: { x: 0, y: 1 },
        speed: 2,
        width: 1,
        length: 6,
      },
    },
    {
      id: 'clock_conveyor_2',
      type: 'conveyor',
      position: { x: 45, y: 19, z: 0.3 },
      initialState: {
        active: true,
        direction: { x: 0, y: -1 },
        speed: 2,
        width: 1,
        length: 6,
      },
    },
    // Timed buttons
    {
      id: 'clock_btn_1',
      type: 'button',
      position: { x: 36, y: 16, z: 0.5 },
      initialState: {
        pressed: false,
        momentary: true,
        timer: undefined,
        timerDuration: 10000,
      },
      linkedIds: ['clock_gate'],
    },
    {
      id: 'clock_btn_2',
      type: 'button',
      position: { x: 47, y: 16, z: 0.5 },
      initialState: {
        pressed: false,
        momentary: true,
        timer: undefined,
        timerDuration: 10000,
      },
      linkedIds: ['clock_gate'],
    },
    {
      id: 'clock_btn_3',
      type: 'button',
      position: { x: 36, y: 24, z: 0.5 },
      initialState: {
        pressed: false,
        momentary: true,
        timer: undefined,
        timerDuration: 10000,
      },
      linkedIds: ['clock_gate'],
    },
    {
      id: 'clock_btn_4',
      type: 'button',
      position: { x: 47, y: 24, z: 0.5 },
      initialState: {
        pressed: false,
        momentary: true,
        timer: undefined,
        timerDuration: 10000,
      },
      linkedIds: ['clock_gate'],
    },
    // Central clock mechanism
    {
      id: 'clock_mechanism',
      type: 'spike_trap',
      position: { x: 41.5, y: 19.5, z: 2 },
      initialState: {
        active: true,
        rotation: 0,
        rotationSpeed: 45,
        armLength: 3,
        damageOnContact: true,
      },
    },
    {
      id: 'clock_gate',
      type: 'door',
      position: { x: 40.5, y: 26, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },

    // === CRYPT ===
    // Spike traps
    {
      id: 'crypt_spikes_1',
      type: 'spike_trap',
      position: { x: 5, y: 29, z: 0 },
      initialState: {
        active: true,
        rotation: 0,
        rotationSpeed: 0,
        armLength: 0,
        damageOnContact: true,
        cycleTime: 2000,
        cycleOffset: 0,
      },
    },
    {
      id: 'crypt_spikes_2',
      type: 'spike_trap',
      position: { x: 8, y: 29, z: 0 },
      initialState: {
        active: true,
        rotation: 0,
        rotationSpeed: 0,
        armLength: 0,
        damageOnContact: true,
        cycleTime: 2000,
        cycleOffset: 500,
      },
    },
    {
      id: 'crypt_spikes_3',
      type: 'spike_trap',
      position: { x: 11, y: 29, z: 0 },
      initialState: {
        active: true,
        rotation: 0,
        rotationSpeed: 0,
        armLength: 0,
        damageOnContact: true,
        cycleTime: 2000,
        cycleOffset: 1000,
      },
    },
    {
      id: 'crypt_spikes_4',
      type: 'spike_trap',
      position: { x: 5, y: 34, z: 0 },
      initialState: {
        active: true,
        rotation: 0,
        rotationSpeed: 0,
        armLength: 0,
        damageOnContact: true,
        cycleTime: 2000,
        cycleOffset: 1000,
      },
    },
    {
      id: 'crypt_spikes_5',
      type: 'spike_trap',
      position: { x: 8, y: 34, z: 0 },
      initialState: {
        active: true,
        rotation: 0,
        rotationSpeed: 0,
        armLength: 0,
        damageOnContact: true,
        cycleTime: 2000,
        cycleOffset: 500,
      },
    },
    {
      id: 'crypt_spikes_6',
      type: 'spike_trap',
      position: { x: 11, y: 34, z: 0 },
      initialState: {
        active: true,
        rotation: 0,
        rotationSpeed: 0,
        armLength: 0,
        damageOnContact: true,
        cycleTime: 2000,
        cycleOffset: 0,
      },
    },
    {
      id: 'crypt_gate',
      type: 'door',
      position: { x: 16, y: 36.5, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },
    {
      id: 'crypt_lever',
      type: 'lever',
      position: { x: 4, y: 37, z: 0 },
      initialState: {
        position: 'off',
        requiresStrength: true,
      },
      linkedIds: ['crypt_gate'],
    },

    // === TREASURE VAULT ===
    {
      id: 'checkpoint_vault',
      type: 'checkpoint',
      position: { x: 24.5, y: 33.5, z: 1.5 },
      initialState: { activated: false },
    },
    // Four corner pressure plates
    {
      id: 'vault_plate_1',
      type: 'pressure_plate',
      position: { x: 18.5, y: 29.5, z: 0.5 },
      initialState: {
        activated: false,
        weightThreshold: 'light',
        currentWeight: 0,
      },
      linkedIds: ['vault_lock_1'],
    },
    {
      id: 'vault_plate_2',
      type: 'pressure_plate',
      position: { x: 30.5, y: 29.5, z: 0.5 },
      initialState: {
        activated: false,
        weightThreshold: 'heavy',
        currentWeight: 0,
      },
      linkedIds: ['vault_lock_2'],
    },
    {
      id: 'vault_plate_3',
      type: 'pressure_plate',
      position: { x: 18.5, y: 36.5, z: 0.5 },
      initialState: {
        activated: false,
        weightThreshold: 'heavy',
        currentWeight: 0,
      },
      linkedIds: ['vault_lock_3'],
    },
    {
      id: 'vault_plate_4',
      type: 'pressure_plate',
      position: { x: 30.5, y: 36.5, z: 0.5 },
      initialState: {
        activated: false,
        weightThreshold: 'light',
        currentWeight: 0,
      },
      linkedIds: ['vault_lock_4'],
    },
    // Vault locks (all must be triggered)
    {
      id: 'vault_lock_1',
      type: 'button',
      position: { x: 23, y: 32, z: 1.2 },
      initialState: { pressed: false, momentary: false, cooldown: 0 },
    },
    {
      id: 'vault_lock_2',
      type: 'button',
      position: { x: 26, y: 32, z: 1.2 },
      initialState: { pressed: false, momentary: false, cooldown: 0 },
    },
    {
      id: 'vault_lock_3',
      type: 'button',
      position: { x: 23, y: 35, z: 1.2 },
      initialState: { pressed: false, momentary: false, cooldown: 0 },
    },
    {
      id: 'vault_lock_4',
      type: 'button',
      position: { x: 26, y: 35, z: 1.2 },
      initialState: { pressed: false, momentary: false, cooldown: 0 },
    },
    {
      id: 'vault_gate',
      type: 'door',
      position: { x: 33, y: 36.5, z: 0 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },
    // Crates for puzzle
    {
      id: 'vault_crate_1',
      type: 'crate',
      position: { x: 20, y: 32, z: 0 },
      initialState: { gridX: 20, gridY: 32, beingPushed: false },
    },
    {
      id: 'vault_crate_2',
      type: 'crate',
      position: { x: 29, y: 35, z: 0 },
      initialState: { gridX: 29, gridY: 35, beingPushed: false },
    },

    // === ASCENSION PATH ===
    // Moving platforms
    {
      id: 'ascend_platform_1',
      type: 'platform',
      position: { x: 39, y: 31, z: 0.6 },
      initialState: {
        currentPosition: 0,
        moving: true,
        direction: 1,
        speed: 1,
        waypoints: [
          { x: 39, y: 31, z: 0.6 },
          { x: 39, y: 35, z: 0.6 },
        ],
      },
    },
    {
      id: 'ascend_platform_2',
      type: 'platform',
      position: { x: 42, y: 35, z: 0.9 },
      initialState: {
        currentPosition: 0,
        moving: true,
        direction: 1,
        speed: 0.8,
        waypoints: [
          { x: 42, y: 35, z: 0.9 },
          { x: 44, y: 35, z: 1.2 },
        ],
      },
    },
    // Final hazard
    {
      id: 'ascend_hazard',
      type: 'hazard',
      position: { x: 36, y: 35, z: -0.5 },
      initialState: {
        active: true,
        hazardType: 'spikes',
      },
    },
    // Victory gate
    {
      id: 'victory_gate',
      type: 'door',
      position: { x: 45, y: 36, z: 1.2 },
      initialState: {
        open: false,
        locked: true,
        requiresHeavy: false,
      },
    },
    // Final dual plates
    {
      id: 'final_plate_dog',
      type: 'pressure_plate',
      position: { x: 46, y: 35, z: 1.2 },
      initialState: {
        activated: false,
        weightThreshold: 'light',
        currentWeight: 0,
      },
      linkedIds: ['victory_gate'],
    },
    {
      id: 'final_plate_panda',
      type: 'pressure_plate',
      position: { x: 46, y: 37, z: 1.2 },
      initialState: {
        activated: false,
        weightThreshold: 'heavy',
        currentWeight: 0,
      },
      linkedIds: ['victory_gate'],
    },
    // Final checkpoint
    {
      id: 'checkpoint_victory',
      type: 'checkpoint',
      position: { x: 46, y: 36, z: 1.2 },
      initialState: { activated: false },
    },
  ];

  // === GUARDS ===
  const guards: GuardConfig[] = [
    // Guard Sanctum - elite guards
    {
      id: 'guard_sanctum_1',
      position: { x: 37, y: 4, z: 0 },
      patrolRoute: [
        { x: 37, y: 4, z: 0 },
        { x: 45, y: 4, z: 0 },
        { x: 45, y: 8, z: 0 },
        { x: 37, y: 8, z: 0 },
      ],
      visionAngle: 90,
      visionRange: 6,
      moveSpeed: 2,
    },
    {
      id: 'guard_sanctum_2',
      position: { x: 43, y: 11, z: 0 },
      patrolRoute: [
        { x: 43, y: 11, z: 0 },
        { x: 37, y: 11, z: 0 },
        { x: 37, y: 8, z: 0 },
        { x: 43, y: 8, z: 0 },
      ],
      visionAngle: 75,
      visionRange: 5,
      moveSpeed: 2.5,
    },
    // Clock Tower guard
    {
      id: 'guard_clock',
      position: { x: 36, y: 19, z: 0 },
      patrolRoute: [
        { x: 36, y: 19, z: 0 },
        { x: 36, y: 22, z: 0 },
        { x: 47, y: 22, z: 0 },
        { x: 47, y: 19, z: 0 },
      ],
      visionAngle: 60,
      visionRange: 4,
      moveSpeed: 3,
    },
    // Treasure Vault guards
    {
      id: 'guard_vault_1',
      position: { x: 19, y: 28, z: 0 },
      patrolRoute: [
        { x: 19, y: 28, z: 0 },
        { x: 30, y: 28, z: 0 },
      ],
      visionAngle: 120,
      visionRange: 6,
      moveSpeed: 1.5,
    },
    {
      id: 'guard_vault_2',
      position: { x: 30, y: 37, z: 0 },
      patrolRoute: [
        { x: 30, y: 37, z: 0 },
        { x: 19, y: 37, z: 0 },
      ],
      visionAngle: 120,
      visionRange: 6,
      moveSpeed: 1.5,
    },
  ];

  // === CAMERA NODES ===
  const cameraNodes: CameraNodeConfig[] = [
    {
      id: 'camera_sanctum',
      position: { x: 45, y: 4, z: 1 },
      defaultRotation: 180,
      minRotation: 90,
      maxRotation: 270,
      viewRadius: 8,
    },
    {
      id: 'camera_atrium',
      position: { x: 24.5, y: 15, z: 2 },
      defaultRotation: 180,
      minRotation: 0,
      maxRotation: 360,
      viewRadius: 10,
    },
  ];

  // === PUZZLES ===
  const puzzles: PuzzleConfig[] = [
    {
      id: 'puzzle_entrance',
      name: 'Temple Entrance',
      description: 'Work together to open the temple gates.',
      objectives: [
        {
          id: 'obj_entrance_plate',
          description: 'Panda: Stand on the heavy plate',
          condition: { type: 'interactable_state', targetId: 'entrance_plate', state: { activated: true } },
        },
        {
          id: 'obj_entrance_lever',
          description: 'Dog: Pull the lever',
          condition: { type: 'interactable_state', targetId: 'entrance_lever', state: { position: 'on' } },
        },
      ],
      completionReward: 'entrance_gate',
    },
    {
      id: 'puzzle_mirrors',
      name: 'Hall of Mirrors',
      description: 'Align the mirrors to direct the laser beam to the target.',
      objectives: [
        {
          id: 'obj_laser_target',
          description: 'Activate the laser receptor',
          condition: { type: 'interactable_state', targetId: 'laser_target', state: { pressed: true } },
        },
      ],
      completionReward: 'mirror_gate',
    },
    {
      id: 'puzzle_sanctum',
      name: 'Guard Sanctum',
      description: 'Disable security and pass through the elite guard patrol.',
      objectives: [
        {
          id: 'obj_sanctum_security',
          description: 'Disable the security system',
          condition: { type: 'interactable_state', targetId: 'sanctum_switch', state: { position: 'on' } },
        },
        {
          id: 'obj_sanctum_checkpoint',
          description: 'Reach the checkpoint',
          condition: { type: 'interactable_state', targetId: 'checkpoint_sanctum', state: { activated: true } },
        },
      ],
      completionReward: 'sanctum_gate',
    },
    {
      id: 'puzzle_water',
      name: 'Water Garden',
      description: 'Raise the bridges and cross the water hazard.',
      objectives: [
        {
          id: 'obj_water_bridges',
          description: 'Raise both bridges',
          condition: { type: 'all_objectives' },
        },
        {
          id: 'obj_water_cross',
          description: 'Cross to the exit',
          condition: { type: 'interactable_state', targetId: 'water_plate', state: { activated: true } },
        },
      ],
      completionReward: 'water_gate',
    },
    {
      id: 'puzzle_atrium',
      name: 'Central Atrium',
      description: 'Reach the central altar and activate it.',
      objectives: [
        {
          id: 'obj_atrium_altar',
          description: 'Activate the central altar',
          condition: { type: 'interactable_state', targetId: 'atrium_altar', state: { pressed: true } },
        },
      ],
    },
    {
      id: 'puzzle_clock',
      name: 'Clock Tower',
      description: 'Press all four timed buttons while avoiding the rotating mechanism.',
      objectives: [
        {
          id: 'obj_clock_buttons',
          description: 'Activate all timed buttons simultaneously',
          condition: { type: 'interactable_state', targetId: 'clock_gate', state: { open: true } },
        },
      ],
      completionReward: 'clock_gate',
    },
    {
      id: 'puzzle_crypt',
      name: 'Crypt Gauntlet',
      description: 'Navigate the spike traps with precise timing.',
      objectives: [
        {
          id: 'obj_crypt_lever',
          description: 'Panda: Pull the strength lever',
          condition: { type: 'interactable_state', targetId: 'crypt_lever', state: { position: 'on' } },
        },
      ],
      completionReward: 'crypt_gate',
    },
    {
      id: 'puzzle_vault',
      name: 'Treasure Vault',
      description: 'Activate all four corner plates to unlock the vault.',
      objectives: [
        {
          id: 'obj_vault_1',
          description: 'Activate northwest plate (light)',
          condition: { type: 'interactable_state', targetId: 'vault_plate_1', state: { activated: true } },
        },
        {
          id: 'obj_vault_2',
          description: 'Activate northeast plate (heavy)',
          condition: { type: 'interactable_state', targetId: 'vault_plate_2', state: { activated: true } },
        },
        {
          id: 'obj_vault_3',
          description: 'Activate southwest plate (heavy)',
          condition: { type: 'interactable_state', targetId: 'vault_plate_3', state: { activated: true } },
        },
        {
          id: 'obj_vault_4',
          description: 'Activate southeast plate (light)',
          condition: { type: 'interactable_state', targetId: 'vault_plate_4', state: { activated: true } },
        },
      ],
      completionReward: 'vault_gate',
    },
    {
      id: 'puzzle_ascension',
      name: 'Ascension',
      description: 'Navigate the moving platforms and reach the final gates.',
      objectives: [
        {
          id: 'obj_final_dog',
          description: 'Dog: Reach the light plate',
          condition: { type: 'interactable_state', targetId: 'final_plate_dog', state: { activated: true } },
        },
        {
          id: 'obj_final_panda',
          description: 'Panda: Reach the heavy plate',
          condition: { type: 'interactable_state', targetId: 'final_plate_panda', state: { activated: true } },
        },
      ],
      completionReward: 'victory_gate',
    },
  ];

  return {
    id: 'temple',
    name: 'The Temple',
    width,
    height,
    tiles,
    spawns: {
      dog: { x: 3, y: 7, z: 0 },
      panda: { x: 4, y: 8, z: 0 },
    },
    interactables,
    puzzles,
    guards,
    cameraNodes,
    checkpoints: [
      { x: 4, y: 7, z: 0 },
      { x: 40, y: 5, z: 0.5 },
      { x: 24.5, y: 19.5, z: 1.5 },
      { x: 24.5, y: 33.5, z: 1.5 },
      { x: 46, y: 36, z: 1.2 },
    ],
  };
}
