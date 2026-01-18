/**
 * Panda & Dog - Shared Types
 * Common type definitions used by both client and server
 */

export interface Vec2 {
  x: number;
  y: number;
}

export interface WorldPos {
  x: number;
  y: number;
  z: number;
}

export type Role = 'dog' | 'panda';
export type Direction8 = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface EntityState {
  id: string;
  type: 'dog' | 'panda';
  position: WorldPos;
  velocity: Vec2;
  facing: Direction8;
  state: string;
  animation?: string;
}

export interface InputState {
  moveX: number;
  moveY: number;
  run: boolean;
  jump: boolean;
  interact: boolean;
  surveillance: boolean;
  operateHold: boolean;
}

export type InteractableType =
  | 'door'
  | 'lever'
  | 'pressure_plate'
  | 'crate'
  | 'winch'
  | 'camera_node'
  | 'platform'
  | 'button'
  | 'hazard'
  | 'conveyor'
  | 'timed_button'
  | 'mirror'
  | 'teleporter'
  | 'checkpoint'
  | 'spike_trap';

export interface InteractableState {
  id: string;
  type: InteractableType;
  position: WorldPos;
  state: Record<string, unknown>;
  linkedIds?: string[];
}

export interface DoorState extends InteractableState {
  type: 'door';
  state: {
    open: boolean;
    locked: boolean;
    requiresHeavy: boolean;
  };
}

export interface LeverState extends InteractableState {
  type: 'lever';
  state: {
    position: 'off' | 'on' | 'held';
    requiresStrength: boolean;
  };
}

export interface PressurePlateState extends InteractableState {
  type: 'pressure_plate';
  state: {
    activated: boolean;
    weightThreshold: 'light' | 'heavy';
    currentWeight: number;
  };
}

export interface CrateState extends InteractableState {
  type: 'crate';
  state: {
    gridX: number;
    gridY: number;
    beingPushed: boolean;
    pushDirection?: Direction8;
  };
}

export interface WinchState extends InteractableState {
  type: 'winch';
  state: {
    extended: number;
    operating: boolean;
    requiresPower: boolean;
    poweredById?: string;
  };
}

export interface CameraNodeState extends InteractableState {
  type: 'camera_node';
  state: {
    active: boolean;
    rotation: number;
    minRotation: number;
    maxRotation: number;
    viewingPlayerId?: string;
  };
}

export interface PlatformState extends InteractableState {
  type: 'platform';
  state: {
    currentPosition: number;
    moving: boolean;
    direction: 1 | -1;
    speed: number;
    waypoints: WorldPos[];
  };
}

export interface ButtonState extends InteractableState {
  type: 'button';
  state: {
    pressed: boolean;
    momentary: boolean;
    cooldown: number;
  };
}

export interface HazardState extends InteractableState {
  type: 'hazard';
  state: {
    active: boolean;
    hazardType: 'laser' | 'spikes' | 'electric';
    cycleTime?: number;
    cycleOffset?: number;
  };
}

export type PingType = 'look' | 'go' | 'wait' | 'interact' | 'danger';

export interface PingMarker {
  id: string;
  position: WorldPos;
  type: PingType;
  createdBy: Role;
  createdAt: number;
  expiresAt: number;
}

export type RoomStatus = 'waiting' | 'ready' | 'playing' | 'paused' | 'completed';

export interface RoomState {
  roomCode: string;
  status: RoomStatus;
  levelId: string;
  players: {
    dog?: PlayerInfo;
    panda?: PlayerInfo;
  };
  createdAt: number;
}

export interface PlayerInfo {
  id: string;
  role: Role;
  connected: boolean;
  lastSeen: number;
}

export interface GameState {
  tick: number;
  timestamp: number;
  entities: EntityState[];
  interactables: InteractableState[];
  pings: PingMarker[];
  puzzleStates: PuzzleState[];
  guards?: GuardStateClient[];
}

// Guard state for client rendering
export type GuardAlertState = 'idle' | 'suspicious' | 'alert' | 'returning';

export interface GuardStateClient {
  id: string;
  position: WorldPos;
  facing: number;
  alertState: GuardAlertState;
  visionAngle: number;
  visionRange: number;
}

export interface PuzzleState {
  id: string;
  name: string;
  completed: boolean;
  objectives: ObjectiveState[];
}

export interface ObjectiveState {
  id: string;
  description: string;
  completed: boolean;
  optional: boolean;
}

export interface LevelData {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: TileData[][];
  spawns: {
    dog: WorldPos;
    panda: WorldPos;
  };
  interactables: InteractableConfig[];
  puzzles: PuzzleConfig[];
  cameraNodes?: CameraNodeConfig[];
  guards?: GuardConfig[];
  checkpoints?: WorldPos[];
}

export interface GuardConfig {
  id: string;
  position: WorldPos;
  patrolRoute: WorldPos[];
  visionAngle: number;
  visionRange: number;
  moveSpeed: number;
}

export interface TileData {
  type: TileType;
  elevation: number;
  walkable: boolean;
}

export type TileType = 'ground' | 'grass' | 'stone' | 'water' | 'wall' | 'bridge' | 'void';

export interface InteractableConfig {
  id: string;
  type: InteractableType;
  position: WorldPos;
  initialState: Record<string, unknown>;
  linkedIds?: string[];
}

export interface PuzzleConfig {
  id: string;
  name: string;
  description: string;
  objectives: {
    id: string;
    description: string;
    condition: PuzzleCondition;
    optional?: boolean;
  }[];
  completionReward?: string;
}

export interface PuzzleCondition {
  type: 'interactable_state' | 'both_players_in_zone' | 'all_objectives';
  targetId?: string;
  state?: Record<string, unknown>;
  zoneMin?: WorldPos;
  zoneMax?: WorldPos;
}

export interface CameraNodeConfig {
  id: string;
  position: WorldPos;
  defaultRotation: number;
  minRotation: number;
  maxRotation: number;
  viewRadius: number;
}
