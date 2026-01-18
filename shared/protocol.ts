/**
 * Panda & Dog - Network Protocol
 * Message types for WebSocket communication
 */

import type {
  EntityState,
  GameState,
  InputState,
  InteractableState,
  PingMarker,
  PingType,
  PuzzleState,
  Role,
  RoomState,
  WorldPos,
} from './types.js';

// ============================================
// Protocol Constants
// ============================================
export const PROTOCOL = {
  VERSION: '1.0.0',

  // Tick rates
  SERVER_TICK_RATE: 20, // 20 Hz server simulation
  CLIENT_SEND_RATE: 20, // 20 Hz input send rate
  STATE_SEND_RATE: 20, // 20 Hz state broadcast

  // Timeouts
  HEARTBEAT_INTERVAL: 5000, // 5 seconds
  RECONNECT_WINDOW: 20000, // 20 seconds to reconnect
  ROOM_TIMEOUT: 300000, // 5 minutes room idle timeout

  // Limits
  MAX_PINGS_PER_PLAYER: 5,
  PING_COOLDOWN: 500, // 500ms between pings
  PING_LIFETIME: 10000, // 10 seconds default

  // Room codes
  ROOM_CODE_LENGTH: 4,
  ROOM_CODE_CHARS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // Avoid confusing chars
};

// ============================================
// Client -> Server Messages
// ============================================
export type ClientMessage =
  | CreateRoomMessage
  | JoinRoomMessage
  | LeaveRoomMessage
  | InputMessage
  | InteractMessage
  | PingMarkerMessage
  | ClearPingMessage
  | PauseMessage
  | HeartbeatMessage;

export interface CreateRoomMessage {
  type: 'create_room';
  timestamp: number;
  levelId: string;
}

export interface JoinRoomMessage {
  type: 'join_room';
  timestamp: number;
  roomCode: string;
  preferredRole?: Role;
}

export interface LeaveRoomMessage {
  type: 'leave_room';
  timestamp: number;
}

export interface InputMessage {
  type: 'input';
  timestamp: number;
  tick: number;
  input: InputState;
  position: WorldPos;
}

export interface InteractMessage {
  type: 'interact';
  timestamp: number;
  targetId: string;
  action: string;
  data?: Record<string, unknown>;
}

export interface PingMarkerMessage {
  type: 'ping_marker';
  timestamp: number;
  position: WorldPos;
  pingType: PingType;
}

export interface ClearPingMessage {
  type: 'clear_ping';
  timestamp: number;
  pingId: string;
}

export interface PauseMessage {
  type: 'pause';
  timestamp: number;
  paused: boolean;
}

export interface HeartbeatMessage {
  type: 'heartbeat';
  timestamp: number;
}

// ============================================
// Server -> Client Messages
// ============================================
export type ServerMessage =
  | RoomCreatedMessage
  | RoomJoinedMessage
  | RoomErrorMessage
  | PlayerJoinedMessage
  | PlayerLeftMessage
  | GameStartMessage
  | StateUpdateMessage
  | InteractionResultMessage
  | PingReceivedMessage
  | PingExpiredMessage
  | GamePausedMessage
  | PuzzleUpdateMessage
  | LevelCompleteMessage
  | HeartbeatAckMessage
  | EntityRespawnMessage;

export interface RoomCreatedMessage {
  type: 'room_created';
  timestamp: number;
  roomCode: string;
  qrCodeUrl: string;
  role: Role;
}

export interface RoomJoinedMessage {
  type: 'room_joined';
  timestamp: number;
  roomCode: string;
  role: Role;
  roomState: RoomState;
  gameState: GameState;
}

export interface RoomErrorMessage {
  type: 'room_error';
  timestamp: number;
  error: 'not_found' | 'full' | 'role_taken' | 'connection_failed';
  message: string;
}

export interface PlayerJoinedMessage {
  type: 'player_joined';
  timestamp: number;
  role: Role;
}

export interface PlayerLeftMessage {
  type: 'player_left';
  timestamp: number;
  role: Role;
  reconnectWindow: number;
}

export interface GameStartMessage {
  type: 'game_start';
  timestamp: number;
  gameState: GameState;
}

export interface StateUpdateMessage {
  type: 'state_update';
  timestamp: number;
  tick: number;
  entities: EntityState[];
  interactables: InteractableState[];
  pings: PingMarker[];
  puzzleStates?: PuzzleState[];
}

export interface InteractionResultMessage {
  type: 'interaction_result';
  timestamp: number;
  targetId: string;
  action: string;
  success: boolean;
  newState?: Record<string, unknown>;
  reason?: string;
}

export interface PingReceivedMessage {
  type: 'ping_received';
  timestamp: number;
  ping: PingMarker;
}

export interface PingExpiredMessage {
  type: 'ping_expired';
  timestamp: number;
  pingId: string;
}

export interface GamePausedMessage {
  type: 'game_paused';
  timestamp: number;
  paused: boolean;
  pausedBy: Role;
}

export interface PuzzleUpdateMessage {
  type: 'puzzle_update';
  timestamp: number;
  puzzleId: string;
  objectives: { id: string; completed: boolean }[];
  completed: boolean;
}

export interface LevelCompleteMessage {
  type: 'level_complete';
  timestamp: number;
  puzzlesCompleted: number;
  totalPuzzles: number;
  timeElapsed: number;
}

export interface HeartbeatAckMessage {
  type: 'heartbeat_ack';
  timestamp: number;
  serverTime: number;
}

export type RespawnReason = 'hazard' | 'guard' | 'spike_trap' | 'fall';

export interface EntityRespawnMessage {
  type: 'entity_respawn';
  timestamp: number;
  entityId: string;
  role: Role;
  position: WorldPos;
  reason: RespawnReason;
}

// ============================================
// Type Guards
// ============================================
export function isClientMessage(msg: unknown): msg is ClientMessage {
  return typeof msg === 'object' && msg !== null && 'type' in msg && 'timestamp' in msg;
}

export function isServerMessage(msg: unknown): msg is ServerMessage {
  return typeof msg === 'object' && msg !== null && 'type' in msg && 'timestamp' in msg;
}
