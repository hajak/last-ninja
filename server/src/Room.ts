/**
 * Panda & Dog - Room Management
 * Handles room lifecycle and game state
 */

import { PROTOCOL } from '../../shared/protocol';
import type {
  EntityState,
  GameState,
  InputState,
  InteractableState,
  LevelData,
  PingMarker,
  PingType,
  PuzzleCondition,
  Role,
  RoomState,
  RoomStatus,
  WorldPos,
} from '../../shared/types';
import { DOG, PANDA, PING, HAZARD } from '../../shared/constants';
import { getLevel } from '../../shared/levels';

// ============================================
// Types
// ============================================
interface PlayerPuzzleState {
  completed: boolean;
  objectives: Map<string, boolean>;
}

interface RespawnEvent {
  entityId: string;
  role: Role;
  position: WorldPos;
  reason: 'hazard' | 'guard';
}

type GuardAlertState = 'idle' | 'suspicious' | 'alert' | 'returning';

interface GuardState {
  id: string;
  position: WorldPos;
  facing: number; // angle in degrees
  patrolRoute: WorldPos[];
  patrolIndex: number;
  patrolDirection: 1 | -1;
  alertState: GuardAlertState;
  alertTimer: number;
  lastSeenPlayerPos: WorldPos | null;
  visionAngle: number; // degrees
  visionRange: number; // tiles
  moveSpeed: number;
}

interface DistractionEvent {
  position: WorldPos;
  type: 'whistle' | 'rock';
  createdAt: number;
  duration: number;
}

// ============================================
// Room Code Generation
// ============================================
function generateRoomCode(): string {
  const chars = PROTOCOL.ROOM_CODE_CHARS;
  let code = '';
  for (let i = 0; i < PROTOCOL.ROOM_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ============================================
// Room Class
// ============================================
export class Room {
  private roomCode: string;
  private levelId: string;
  private levelData: LevelData | null = null;
  private status: RoomStatus = 'waiting';
  private createdAt: number;
  private startedAt = 0;
  private players = new Map<string, Role>();
  private entities = new Map<string, EntityState>();
  private interactables = new Map<string, InteractableState>();
  private pings = new Map<string, PingMarker>();
  private puzzleStates = new Map<string, PlayerPuzzleState>();
  private tick_ = 0;
  private paused = false;
  private lastPingTime = new Map<string, number>();
  private pendingRespawns: RespawnEvent[] = [];
  private guards = new Map<string, GuardState>();
  private distractions: DistractionEvent[] = [];
  private checkpointPosition: { dog: WorldPos; panda: WorldPos } | null = null;

  constructor(roomCode: string, levelId: string, creatorId: string) {
    this.roomCode = roomCode;
    this.levelId = levelId;
    this.createdAt = Date.now();
    // Creator is always Dog
    this.players.set(creatorId, 'dog');
  }

  // ============================================
  // Room State
  // ============================================
  getRoomCode(): string {
    return this.roomCode;
  }

  getRoomState(): RoomState {
    const dogId = this.getPlayerByRole('dog');
    const pandaId = this.getPlayerByRole('panda');

    return {
      roomCode: this.roomCode,
      status: this.status,
      levelId: this.levelId,
      players: {
        dog: dogId ? { id: dogId, role: 'dog', connected: true, lastSeen: Date.now() } : undefined,
        panda: pandaId ? { id: pandaId, role: 'panda', connected: true, lastSeen: Date.now() } : undefined,
      },
      createdAt: this.createdAt,
    };
  }

  getGameState(): GameState {
    return {
      tick: this.tick_,
      timestamp: Date.now(),
      entities: this.getEntityStates(),
      interactables: this.getInteractableStates(),
      pings: this.getPings(),
      puzzleStates: this.getPuzzleStates(),
    };
  }

  // ============================================
  // Player Management
  // ============================================
  addPlayer(playerId: string, role: Role): boolean {
    if (this.players.size >= 2) return false;
    if (this.getPlayerByRole(role)) return false;

    this.players.set(playerId, role);

    // Create entity for player
    this.createPlayerEntity(playerId, role);

    if (this.players.size === 2) {
      this.status = 'ready';
    }

    return true;
  }

  removePlayer(playerId: string): void {
    const role = this.players.get(playerId);
    this.players.delete(playerId);

    if (role) {
      this.entities.delete(`${role}_entity`);
    }

    if (this.status === 'playing') {
      this.status = 'paused';
    } else if (this.players.size === 0) {
      this.status = 'waiting';
    }
  }

  getPlayerRole(playerId: string): Role | undefined {
    return this.players.get(playerId);
  }

  getPlayerByRole(role: Role): string | undefined {
    for (const [id, r] of this.players) {
      if (r === role) return id;
    }
    return undefined;
  }

  isFull(): boolean {
    return this.players.size === 2;
  }

  isEmpty(): boolean {
    return this.players.size === 0;
  }

  isPlaying(): boolean {
    return this.status === 'playing';
  }

  // ============================================
  // Entity Management
  // ============================================
  private createPlayerEntity(playerId: string, role: Role): void {
    const spawn = this.getSpawnPosition(role);
    const entityId = `${role}_entity`;

    this.entities.set(entityId, {
      id: entityId,
      type: role,
      position: spawn,
      velocity: { x: 0, y: 0 },
      facing: 'S',
      state: 'idle',
    });
  }

  getSpawnPosition(role: Role): WorldPos {
    if (this.levelData?.spawns) {
      const spawn = role === 'dog' ? this.levelData.spawns.dog : this.levelData.spawns.panda;
      if (spawn) {
        return { ...spawn };
      }
    }

    // Default spawn positions
    if (role === 'dog') {
      return { x: 5, y: 5, z: 0 };
    } else {
      return { x: 7, y: 5, z: 0 };
    }
  }

  getEntityStates(): EntityState[] {
    return Array.from(this.entities.values());
  }

  // ============================================
  // Game Control
  // ============================================
  startGame(): GameState {
    this.status = 'playing';
    this.startedAt = Date.now();
    this.tick_ = 0;

    // Initialize level
    this.initializeLevel();

    return this.getGameState();
  }

  private initializeLevel(): void {
    const level = getLevel(this.levelId);
    if (!level) {
      console.error(`Failed to load level: ${this.levelId}`);
      this.createPlaceholderLevel();
      return;
    }

    this.levelData = level;

    // Clear existing state
    this.interactables.clear();
    this.puzzleStates.clear();

    // Load interactables from level data
    for (const config of level.interactables) {
      this.interactables.set(config.id, {
        id: config.id,
        type: config.type,
        position: { ...config.position },
        state: { ...config.initialState },
        linkedIds: config.linkedIds ? [...config.linkedIds] : [],
      });
    }

    // Initialize puzzle states
    for (const puzzleConfig of level.puzzles) {
      const objectives = new Map<string, boolean>();
      for (const obj of puzzleConfig.objectives) {
        objectives.set(obj.id, false);
      }
      this.puzzleStates.set(puzzleConfig.id, {
        completed: false,
        objectives,
      });
    }

    // Update spawn positions for existing entities
    for (const [, entity] of this.entities) {
      const role = entity.type as Role;
      if (role === 'dog' && level.spawns.dog) {
        entity.position = { ...level.spawns.dog };
      } else if (role === 'panda' && level.spawns.panda) {
        entity.position = { ...level.spawns.panda };
      }
    }

    console.log(
      `Loaded level: ${level.name} with ${level.interactables.length} interactables and ${level.puzzles.length} puzzles`
    );
  }

  private createPlaceholderLevel(): void {
    // Fallback placeholder level
    this.interactables.set('door_1', {
      id: 'door_1',
      type: 'door',
      position: { x: 10, y: 5, z: 0 },
      state: { open: false, locked: false, requiresHeavy: false },
      linkedIds: [],
    });

    this.interactables.set('lever_1', {
      id: 'lever_1',
      type: 'lever',
      position: { x: 8, y: 8, z: 0 },
      state: { position: 'off', requiresStrength: false },
      linkedIds: ['door_1'],
    });
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.status = paused ? 'paused' : 'playing';
  }

  getTick(): number {
    return this.tick_;
  }

  getElapsedTime(): number {
    return this.startedAt > 0 ? Date.now() - this.startedAt : 0;
  }

  // ============================================
  // Game Tick
  // ============================================
  tick(): void {
    if (this.paused) return;

    this.tick_++;

    // Update pressure plates
    this.updatePressurePlates();

    // Update winches
    this.updateWinches();

    // Update platforms
    this.updatePlatforms();

    // Update timed buttons
    this.updateTimedButtons();

    // Update conveyors
    this.updateConveyors();

    // Update guards (AI, patrol, detection)
    this.updateGuards();

    // Update distractions
    this.updateDistractions();

    // Check hazard collisions
    this.checkHazardCollisions();

    // Check guard detection
    this.checkGuardDetection();

    // Check puzzle completion
    this.checkPuzzleCompletion();

    // Expire old pings
    this.expirePings();
  }

  /**
   * Update timed buttons - they auto-release after their timer expires.
   */
  private updateTimedButtons(): void {
    for (const [, interactable] of this.interactables) {
      if (interactable.type !== 'button') continue;

      const state = interactable.state as {
        pressed: boolean;
        momentary: boolean;
        timer?: number;
        timerDuration?: number;
      };

      if (state.pressed && state.timer !== undefined && state.timerDuration) {
        state.timer -= 50; // 50ms per tick
        if (state.timer <= 0) {
          state.pressed = false;
          state.timer = undefined;
          // Trigger linked objects (toggle off)
          this.triggerLinkedObjects(interactable);
        }
      }
    }
  }

  /**
   * Update conveyor belts - move entities and crates on them.
   */
  private updateConveyors(): void {
    for (const [, interactable] of this.interactables) {
      if (interactable.type !== 'conveyor') continue;

      const state = interactable.state as {
        active: boolean;
        direction: { x: number; y: number };
        speed: number;
        width: number;
        length: number;
      };

      if (!state.active) continue;

      const conveyorSpeed = state.speed * 0.05; // Per tick movement

      // Move entities on conveyor
      for (const entity of this.entities.values()) {
        if (this.isOnConveyor(entity.position, interactable.position, state)) {
          entity.position.x += state.direction.x * conveyorSpeed;
          entity.position.y += state.direction.y * conveyorSpeed;
        }
      }

      // Move crates on conveyor
      for (const [, other] of this.interactables) {
        if (other.type !== 'crate') continue;
        if (this.isOnConveyor(other.position, interactable.position, state)) {
          other.position.x += state.direction.x * conveyorSpeed;
          other.position.y += state.direction.y * conveyorSpeed;
        }
      }
    }
  }

  private isOnConveyor(
    entityPos: WorldPos,
    conveyorPos: WorldPos,
    state: { width: number; length: number; direction: { x: number; y: number } }
  ): boolean {
    const dx = entityPos.x - conveyorPos.x;
    const dy = entityPos.y - conveyorPos.y;

    // Simplified bounding box check
    const halfWidth = state.width / 2;
    const halfLength = state.length / 2;

    return Math.abs(dx) < halfLength && Math.abs(dy) < halfWidth;
  }

  /**
   * Update guard AI - patrol, investigate, chase.
   */
  private updateGuards(): void {
    for (const [, guard] of this.guards) {
      switch (guard.alertState) {
        case 'idle':
          this.updateGuardPatrol(guard);
          break;
        case 'suspicious':
          this.updateGuardSuspicious(guard);
          break;
        case 'alert':
          this.updateGuardAlert(guard);
          break;
        case 'returning':
          this.updateGuardReturning(guard);
          break;
      }
    }
  }

  private updateGuardPatrol(guard: GuardState): void {
    if (guard.patrolRoute.length === 0) return;

    const target = guard.patrolRoute[guard.patrolIndex];
    const dx = target.x - guard.position.x;
    const dy = target.y - guard.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.2) {
      // Reached waypoint, move to next
      guard.patrolIndex += guard.patrolDirection;
      if (guard.patrolIndex >= guard.patrolRoute.length) {
        guard.patrolIndex = guard.patrolRoute.length - 2;
        guard.patrolDirection = -1;
      } else if (guard.patrolIndex < 0) {
        guard.patrolIndex = 1;
        guard.patrolDirection = 1;
      }
    } else {
      // Move towards waypoint
      const speed = guard.moveSpeed * 0.05;
      guard.position.x += (dx / dist) * speed;
      guard.position.y += (dy / dist) * speed;
      guard.facing = Math.atan2(dy, dx) * (180 / Math.PI);
    }
  }

  private updateGuardSuspicious(guard: GuardState): void {
    guard.alertTimer -= 50;

    if (guard.lastSeenPlayerPos) {
      // Move towards last seen position
      const dx = guard.lastSeenPlayerPos.x - guard.position.x;
      const dy = guard.lastSeenPlayerPos.y - guard.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0.5) {
        const speed = guard.moveSpeed * 0.03; // Slower when suspicious
        guard.position.x += (dx / dist) * speed;
        guard.position.y += (dy / dist) * speed;
        guard.facing = Math.atan2(dy, dx) * (180 / Math.PI);
      }
    }

    if (guard.alertTimer <= 0) {
      guard.alertState = 'returning';
      guard.lastSeenPlayerPos = null;
    }
  }

  private updateGuardAlert(guard: GuardState): void {
    if (!guard.lastSeenPlayerPos) {
      guard.alertState = 'suspicious';
      guard.alertTimer = 3000;
      return;
    }

    // Chase player
    const dx = guard.lastSeenPlayerPos.x - guard.position.x;
    const dy = guard.lastSeenPlayerPos.y - guard.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0.3) {
      const speed = guard.moveSpeed * 0.07; // Faster when alert
      guard.position.x += (dx / dist) * speed;
      guard.position.y += (dy / dist) * speed;
      guard.facing = Math.atan2(dy, dx) * (180 / Math.PI);
    }
  }

  private updateGuardReturning(guard: GuardState): void {
    if (guard.patrolRoute.length === 0) {
      guard.alertState = 'idle';
      return;
    }

    // Find nearest patrol waypoint
    let nearestIndex = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < guard.patrolRoute.length; i++) {
      const wp = guard.patrolRoute[i];
      const dx = wp.x - guard.position.x;
      const dy = wp.y - guard.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = i;
      }
    }

    const target = guard.patrolRoute[nearestIndex];
    const dx = target.x - guard.position.x;
    const dy = target.y - guard.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.3) {
      guard.patrolIndex = nearestIndex;
      guard.alertState = 'idle';
    } else {
      const speed = guard.moveSpeed * 0.04;
      guard.position.x += (dx / dist) * speed;
      guard.position.y += (dy / dist) * speed;
      guard.facing = Math.atan2(dy, dx) * (180 / Math.PI);
    }
  }

  /**
   * Update distractions - remove expired ones, attract guards.
   */
  private updateDistractions(): void {
    const now = Date.now();
    this.distractions = this.distractions.filter(d => now - d.createdAt < d.duration);

    // Guards investigate distractions
    for (const distraction of this.distractions) {
      for (const [, guard] of this.guards) {
        if (guard.alertState === 'alert') continue; // Already chasing

        const dx = distraction.position.x - guard.position.x;
        const dy = distraction.position.y - guard.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Hearing range
        const hearingRange = distraction.type === 'whistle' ? 8 : 5;
        if (dist < hearingRange) {
          guard.alertState = 'suspicious';
          guard.alertTimer = 5000;
          guard.lastSeenPlayerPos = { ...distraction.position };
        }
      }
    }
  }

  /**
   * Check if guards can see players and trigger alert.
   */
  private checkGuardDetection(): void {
    for (const [, guard] of this.guards) {
      for (const entity of this.entities.values()) {
        if (this.canGuardSeeEntity(guard, entity)) {
          if (guard.alertState !== 'alert') {
            guard.alertState = 'alert';
          }
          guard.lastSeenPlayerPos = { ...entity.position };
          guard.alertTimer = 5000;
        }
      }

      // Check if guard catches player (close range)
      for (const entity of this.entities.values()) {
        const dx = entity.position.x - guard.position.x;
        const dy = entity.position.y - guard.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.8 && guard.alertState === 'alert') {
          // Caught! Respawn both players at checkpoint
          this.respawnPlayersAtCheckpoint('guard');
          // Reset guard
          guard.alertState = 'returning';
          guard.lastSeenPlayerPos = null;
        }
      }
    }
  }

  private canGuardSeeEntity(guard: GuardState, entity: EntityState): boolean {
    const dx = entity.position.x - guard.position.x;
    const dy = entity.position.y - guard.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Out of range
    if (dist > guard.visionRange) return false;

    // Check angle
    const angleToEntity = Math.atan2(dy, dx) * (180 / Math.PI);
    let angleDiff = angleToEntity - guard.facing;

    // Normalize angle difference
    while (angleDiff > 180) angleDiff -= 360;
    while (angleDiff < -180) angleDiff += 360;

    if (Math.abs(angleDiff) > guard.visionAngle / 2) return false;

    // Check line of sight (simplified - just check for walls)
    const steps = Math.ceil(dist * 2);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const checkX = guard.position.x + dx * t;
      const checkY = guard.position.y + dy * t;

      if (!this.isPositionWalkable(checkX, checkY, 0.1)) {
        return false; // Wall blocks view
      }
    }

    return true;
  }

  private respawnPlayersAtCheckpoint(reason: 'hazard' | 'guard'): void {
    const checkpoint = this.checkpointPosition || {
      dog: this.getSpawnPosition('dog'),
      panda: this.getSpawnPosition('panda'),
    };

    for (const [, entity] of this.entities) {
      const role = entity.type as Role;
      const spawnPos = role === 'dog' ? checkpoint.dog : checkpoint.panda;
      entity.position = { ...spawnPos };
      entity.velocity = { x: 0, y: 0 };
      entity.state = 'idle';

      this.pendingRespawns.push({
        entityId: entity.id,
        role,
        position: spawnPos,
        reason,
      });
    }
  }

  /**
   * Create a distraction at a position (Dog whistle or Panda rock throw).
   */
  createDistraction(position: WorldPos, type: 'whistle' | 'rock'): void {
    this.distractions.push({
      position,
      type,
      createdAt: Date.now(),
      duration: type === 'whistle' ? 3000 : 2000,
    });
  }

  /**
   * Set checkpoint position for respawning.
   */
  setCheckpoint(dogPos: WorldPos, pandaPos: WorldPos): void {
    this.checkpointPosition = {
      dog: { ...dogPos },
      panda: { ...pandaPos },
    };
  }

  /**
   * Get guard states for client rendering.
   */
  getGuardStates(): GuardState[] {
    return Array.from(this.guards.values());
  }

  /**
   * Check if any entities are touching active hazards.
   * If so, respawn them at their spawn point.
   */
  private checkHazardCollisions(): void {
    for (const entity of this.entities.values()) {
      for (const [, interactable] of this.interactables) {
        if (interactable.type !== 'hazard') continue;

        const hazardState = interactable.state as { active: boolean };
        if (!hazardState.active) continue;

        // Check distance to hazard
        const dx = entity.position.x - interactable.position.x;
        const dy = entity.position.y - interactable.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < HAZARD.COLLISION_RADIUS) {
          // Entity touched hazard - respawn them
          this.respawnEntity(entity);
        }
      }
    }
  }

  /**
   * Respawn an entity at their spawn position.
   * Queues a respawn event for the server to broadcast.
   */
  private respawnEntity(entity: EntityState): void {
    const role = entity.type as Role;
    const spawn = this.getSpawnPosition(role);

    // Reset position and velocity
    entity.position = { ...spawn };
    entity.velocity = { x: 0, y: 0 };
    entity.state = 'idle';

    // Queue respawn event for broadcast
    this.pendingRespawns.push({
      entityId: entity.id,
      role,
      position: spawn,
      reason: 'hazard',
    });
  }

  /**
   * Get and clear pending respawn events.
   * Called by server to broadcast respawn notifications.
   */
  getPendingRespawns(): RespawnEvent[] {
    const events = [...this.pendingRespawns];
    this.pendingRespawns = [];
    return events;
  }

  private updatePressurePlates(): void {
    for (const [, interactable] of this.interactables) {
      if (interactable.type !== 'pressure_plate') continue;

      const plateState = interactable.state as {
        activated: boolean;
        weightThreshold: 'light' | 'heavy';
        currentWeight: number;
      };

      // Check for entities/crates on the plate
      let totalWeight = 0;
      const platePos = interactable.position;
      const plateRadius = 0.8;

      // Check entities
      for (const entity of this.entities.values()) {
        const dx = entity.position.x - platePos.x;
        const dy = entity.position.y - platePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < plateRadius) {
          // Dog = light weight, Panda = heavy weight
          totalWeight += entity.type === 'panda' ? 2 : 1;
        }
      }

      // Check crates on plate
      for (const other of this.interactables.values()) {
        if (other.type !== 'crate') continue;

        const dx = other.position.x - platePos.x;
        const dy = other.position.y - platePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < plateRadius) {
          totalWeight += 2; // Crates are heavy
        }
      }

      const wasActivated = plateState.activated;
      plateState.currentWeight = totalWeight;
      const requiredWeight = plateState.weightThreshold === 'heavy' ? 2 : 1;
      plateState.activated = totalWeight >= requiredWeight;

      // Trigger linked objects on state change
      if (plateState.activated !== wasActivated) {
        this.handlePressurePlateChange(interactable, plateState.activated);
      }
    }
  }

  private handlePressurePlateChange(plate: InteractableState, activated: boolean): void {
    if (!plate.linkedIds) return;

    for (const linkedId of plate.linkedIds) {
      const linked = this.interactables.get(linkedId);
      if (!linked) continue;

      if (linked.type === 'hazard') {
        // Deactivate hazard when plate is pressed
        const hazardState = linked.state as { active: boolean };
        hazardState.active = !activated;
      } else if (linked.type === 'door') {
        // Check if this door requires multiple plates
        this.checkDoorUnlock(linked);
      }
    }
  }

  private checkDoorUnlock(door: InteractableState): void {
    // Find all pressure plates linked to this door
    const requiredPlates: InteractableState[] = [];
    for (const [, interactable] of this.interactables) {
      if (interactable.type === 'pressure_plate' && interactable.linkedIds?.includes(door.id)) {
        requiredPlates.push(interactable);
      }
    }

    // Check if all required plates are activated
    const allActivated = requiredPlates.every((plate) => {
      const state = plate.state as { activated: boolean };
      return state.activated;
    });

    const doorState = door.state as { locked: boolean; open: boolean };
    if (allActivated && requiredPlates.length > 0) {
      doorState.locked = false;
      doorState.open = true;
    } else if (requiredPlates.length > 0) {
      doorState.locked = true;
      doorState.open = false;
    }
  }

  private updateWinches(): void {
    for (const [, interactable] of this.interactables) {
      if (interactable.type !== 'winch') continue;

      const winchState = interactable.state as {
        extended: number;
        operating: boolean;
        requiresPower: boolean;
        poweredById?: string;
      };

      // Check if power is required and provided
      if (winchState.requiresPower && winchState.poweredById) {
        const powerSource = this.interactables.get(winchState.poweredById);
        if (powerSource && powerSource.type === 'lever') {
          const leverState = powerSource.state as { position: string };
          if (leverState.position !== 'on') {
            winchState.operating = false;
            continue;
          }
        }
      }

      // Update extension
      if (winchState.operating) {
        winchState.extended = Math.min(1, winchState.extended + 0.02);

        if (winchState.extended >= 1) {
          winchState.operating = false;
          // Trigger linked platforms
          this.triggerWinchPlatforms(interactable);
        }
      }
    }
  }

  private triggerWinchPlatforms(winch: InteractableState): void {
    if (!winch.linkedIds) return;

    for (const linkedId of winch.linkedIds) {
      const linked = this.interactables.get(linkedId);
      if (!linked || linked.type !== 'platform') continue;

      const platformState = linked.state as {
        currentPosition: number;
        moving: boolean;
        waypoints?: WorldPos[];
      };

      // Move platform to extended position
      platformState.currentPosition = 1;
      platformState.moving = false;

      // Update platform position to the raised waypoint
      if (platformState.waypoints && platformState.waypoints.length > 1) {
        linked.position = { ...platformState.waypoints[1] };
      }
    }
  }

  private updatePlatforms(): void {
    for (const [, interactable] of this.interactables) {
      if (interactable.type !== 'platform') continue;

      const platformState = interactable.state as {
        currentPosition: number;
        moving: boolean;
        direction: 1 | -1;
        speed: number;
        waypoints?: WorldPos[];
      };

      if (!platformState.moving || !platformState.waypoints || platformState.waypoints.length < 2) {
        continue;
      }

      // Update position along path
      platformState.currentPosition += platformState.direction * platformState.speed * 0.02;

      // Clamp and reverse direction at endpoints
      if (platformState.currentPosition >= 1) {
        platformState.currentPosition = 1;
        platformState.direction = -1;
      } else if (platformState.currentPosition <= 0) {
        platformState.currentPosition = 0;
        platformState.direction = 1;
      }

      // Interpolate position between waypoints
      const start = platformState.waypoints[0];
      const end = platformState.waypoints[1];
      const t = platformState.currentPosition;

      interactable.position = {
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
        z: start.z + (end.z - start.z) * t,
      };
    }
  }

  private checkPuzzleCompletion(): void {
    if (!this.levelData) return;

    for (const puzzleConfig of this.levelData.puzzles) {
      const puzzleState = this.puzzleStates.get(puzzleConfig.id);
      if (!puzzleState || puzzleState.completed) continue;

      let allRequired = true;
      for (const objective of puzzleConfig.objectives) {
        const completed = this.checkObjective(objective.condition);
        puzzleState.objectives.set(objective.id, completed);

        if (!objective.optional && !completed) {
          allRequired = false;
        }
      }

      if (allRequired) {
        puzzleState.completed = true;
        console.log(`Puzzle completed: ${puzzleConfig.name}`);

        // Trigger completion reward
        if (puzzleConfig.completionReward) {
          const reward = this.interactables.get(puzzleConfig.completionReward);
          if (reward && reward.type === 'door') {
            const doorState = reward.state as { locked: boolean; open: boolean };
            doorState.locked = false;
            doorState.open = true;
          }
        }
      }
    }
  }

  private checkObjective(condition: PuzzleCondition): boolean {
    switch (condition.type) {
      case 'interactable_state': {
        if (!condition.targetId || !condition.state) return false;
        const interactable = this.interactables.get(condition.targetId);
        if (!interactable) return false;

        // Check if the interactable's state matches the condition
        for (const [key, value] of Object.entries(condition.state)) {
          if ((interactable.state as Record<string, unknown>)[key] !== value) {
            return false;
          }
        }
        return true;
      }

      case 'both_players_in_zone': {
        if (!condition.zoneMin || !condition.zoneMax) return false;

        let dogInZone = false;
        let pandaInZone = false;

        for (const entity of this.entities.values()) {
          const pos = entity.position;
          const inZone =
            pos.x >= condition.zoneMin.x &&
            pos.x <= condition.zoneMax.x &&
            pos.y >= condition.zoneMin.y &&
            pos.y <= condition.zoneMax.y;

          if (inZone) {
            if (entity.type === 'dog') dogInZone = true;
            if (entity.type === 'panda') pandaInZone = true;
          }
        }

        return dogInZone && pandaInZone;
      }

      case 'all_objectives': {
        // This is handled by the main puzzle completion check
        return true;
      }

      default:
        return false;
    }
  }

  // ============================================
  // Input Handling
  // ============================================
  handleInput(playerId: string, tick: number, input: InputState, position: WorldPos): void {
    const role = this.players.get(playerId);
    if (!role) return;

    const entityId = `${role}_entity`;
    const entity = this.entities.get(entityId);
    if (!entity) return;

    // Update entity state based on input
    const speed =
      role === 'dog' ? (input.run ? DOG.RUN_SPEED : DOG.WALK_SPEED) : input.run ? PANDA.RUN_SPEED : PANDA.WALK_SPEED;

    entity.velocity = {
      x: input.moveX * speed,
      y: input.moveY * speed,
    };

    // Update facing direction
    if (input.moveX !== 0 || input.moveY !== 0) {
      entity.facing = this.getDirection(input.moveX, input.moveY);
    }

    // Update state
    if (input.moveX !== 0 || input.moveY !== 0) {
      entity.state = input.run ? 'run' : 'walk';
    } else {
      entity.state = 'idle';
    }

    // Validate position with collision detection
    const validatedPosition = this.validatePosition(entity.position, position, role);
    entity.position = validatedPosition;
  }

  /**
   * Validate a movement position against tile collisions.
   * Returns the validated position (may be clamped or rejected).
   */
  private validatePosition(currentPos: WorldPos, targetPos: WorldPos, role: Role): WorldPos {
    if (!this.levelData) return targetPos;

    const collisionRadius = role === 'dog' ? DOG.COLLISION_RADIUS : PANDA.COLLISION_RADIUS;

    // Check if target position is walkable
    if (this.isPositionWalkable(targetPos.x, targetPos.y, collisionRadius)) {
      return targetPos;
    }

    // Try sliding along X axis only
    if (this.isPositionWalkable(targetPos.x, currentPos.y, collisionRadius)) {
      return { x: targetPos.x, y: currentPos.y, z: targetPos.z };
    }

    // Try sliding along Y axis only
    if (this.isPositionWalkable(currentPos.x, targetPos.y, collisionRadius)) {
      return { x: currentPos.x, y: targetPos.y, z: targetPos.z };
    }

    // Can't move - stay at current position
    return currentPos;
  }

  /**
   * Check if a world position is walkable considering collision radius.
   */
  private isPositionWalkable(x: number, y: number, radius: number): boolean {
    if (!this.levelData) return true;

    // Check bounds
    if (x < radius || x >= this.levelData.width - radius ||
        y < radius || y >= this.levelData.height - radius) {
      return false;
    }

    // Check the four corners of the collision box
    const offsets = [
      { dx: -radius, dy: -radius },
      { dx: radius, dy: -radius },
      { dx: -radius, dy: radius },
      { dx: radius, dy: radius },
    ];

    for (const offset of offsets) {
      const checkX = Math.floor(x + offset.dx);
      const checkY = Math.floor(y + offset.dy);

      if (checkY >= 0 && checkY < this.levelData.tiles.length) {
        const row = this.levelData.tiles[checkY];
        if (row && checkX >= 0 && checkX < row.length) {
          const tile = row[checkX];
          if (!tile.walkable) {
            return false;
          }
        }
      }
    }

    // Check collision with closed doors
    for (const [, interactable] of this.interactables) {
      if (interactable.type === 'door') {
        const doorState = interactable.state as { open: boolean };
        if (!doorState.open) {
          const dx = Math.abs(x - interactable.position.x);
          const dy = Math.abs(y - interactable.position.y);
          if (dx < 0.6 && dy < 0.6) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private getDirection(x: number, y: number): 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' {
    if (y < 0 && x === 0) return 'N';
    if (y < 0 && x > 0) return 'NE';
    if (y === 0 && x > 0) return 'E';
    if (y > 0 && x > 0) return 'SE';
    if (y > 0 && x === 0) return 'S';
    if (y > 0 && x < 0) return 'SW';
    if (y === 0 && x < 0) return 'W';
    if (y < 0 && x < 0) return 'NW';
    return 'S';
  }

  // ============================================
  // Interaction Handling
  // ============================================
  handleInteraction(
    playerId: string,
    targetId: string,
    action: string,
    data?: Record<string, unknown>
  ): { success: boolean; newState?: Record<string, unknown>; reason?: string } {
    const role = this.players.get(playerId);
    if (!role) {
      return { success: false, reason: 'Invalid player' };
    }

    const interactable = this.interactables.get(targetId);
    if (!interactable) {
      return { success: false, reason: 'Interactable not found' };
    }

    // Validate permission based on role and interactable type
    if (!this.canInteract(role, interactable, action)) {
      return { success: false, reason: 'Permission denied' };
    }

    // Process interaction
    return this.processInteraction(interactable, action, role, data);
  }

  private canInteract(role: Role, interactable: InteractableState, action: string): boolean {
    switch (interactable.type) {
      case 'crate':
        // Only Panda can push crates
        return role === 'panda' && action === 'push';

      case 'winch':
        // Only Panda can operate winches
        return role === 'panda';

      case 'pressure_plate':
        // Can't directly interact with pressure plates
        return false;

      case 'lever': {
        const leverState = interactable.state as { requiresStrength: boolean };
        if (leverState.requiresStrength && role === 'dog') {
          return false;
        }
        return true;
      }

      case 'door': {
        const doorState = interactable.state as { locked: boolean; requiresHeavy: boolean };
        if (doorState.locked) return false;
        if (doorState.requiresHeavy && role === 'dog') {
          return false;
        }
        return true;
      }

      case 'camera_node':
        // Only Dog can use camera nodes
        return role === 'dog';

      case 'button':
        // Both can use buttons
        return true;

      default:
        return true;
    }
  }

  private processInteraction(
    interactable: InteractableState,
    action: string,
    role: Role,
    data?: Record<string, unknown>
  ): { success: boolean; newState?: Record<string, unknown>; reason?: string } {
    switch (interactable.type) {
      case 'door': {
        const state = interactable.state as { open: boolean };
        if (action === 'toggle') {
          state.open = !state.open;
          return { success: true, newState: state };
        }
        break;
      }

      case 'lever': {
        const state = interactable.state as { position: 'off' | 'on' };
        if (action === 'toggle') {
          state.position = state.position === 'off' ? 'on' : 'off';
          // Trigger linked objects
          this.triggerLinkedObjects(interactable);
          return { success: true, newState: state };
        }
        break;
      }

      case 'button': {
        const state = interactable.state as { pressed: boolean; momentary: boolean };
        if (action === 'press') {
          state.pressed = true;
          this.triggerLinkedObjects(interactable);
          return { success: true, newState: state };
        } else if (action === 'release' && state.momentary) {
          state.pressed = false;
          return { success: true, newState: state };
        }
        break;
      }

      case 'crate': {
        const state = interactable.state as { beingPushed: boolean; gridX: number; gridY: number };
        if (action === 'push') {
          // Get pusher position to determine direction
          const entityId = `${role}_entity`;
          const entity = this.entities.get(entityId);
          if (!entity) break;

          // Calculate push direction based on entity position relative to crate
          const dx = interactable.position.x - entity.position.x;
          const dy = interactable.position.y - entity.position.y;

          // Normalize to unit direction
          let pushX = 0;
          let pushY = 0;
          if (Math.abs(dx) > Math.abs(dy)) {
            pushX = dx > 0 ? 1 : -1;
          } else {
            pushY = dy > 0 ? 1 : -1;
          }

          // Calculate new position
          const newX = interactable.position.x + pushX;
          const newY = interactable.position.y + pushY;

          // Validate push (check bounds and collisions)
          if (this.isValidCratePosition(newX, newY)) {
            state.beingPushed = true;
            state.gridX = Math.round(newX);
            state.gridY = Math.round(newY);

            interactable.position.x = newX;
            interactable.position.y = newY;

            // Clear beingPushed after a short delay
            setTimeout(() => {
              state.beingPushed = false;
            }, 200);

            return { success: true, newState: state };
          }

          return { success: false, reason: 'Cannot push there' };
        }
        break;
      }

      case 'winch': {
        const state = interactable.state as { operating: boolean };
        if (action === 'operate_start') {
          state.operating = true;
          return { success: true, newState: state };
        } else if (action === 'operate_stop') {
          state.operating = false;
          return { success: true, newState: state };
        }
        break;
      }
    }

    return { success: false, reason: 'Invalid action' };
  }

  private isValidCratePosition(x: number, y: number): boolean {
    // Check level bounds
    if (this.levelData) {
      if (x < 1 || x >= this.levelData.width - 1 || y < 1 || y >= this.levelData.height - 1) {
        return false;
      }

      // Check tile walkability
      const tileY = Math.floor(y);
      const tileX = Math.floor(x);
      if (tileY >= 0 && tileY < this.levelData.tiles.length) {
        const row = this.levelData.tiles[tileY];
        if (row && tileX >= 0 && tileX < row.length) {
          const tile = row[tileX];
          if (!tile.walkable || tile.type === 'water' || tile.type === 'void') {
            return false;
          }
        }
      }
    }

    // Check collision with other crates
    for (const [, other] of this.interactables) {
      if (other.type !== 'crate') continue;

      const dx = Math.abs(other.position.x - x);
      const dy = Math.abs(other.position.y - y);

      if (dx < 0.9 && dy < 0.9) {
        return false;
      }
    }

    return true;
  }

  private triggerLinkedObjects(source: InteractableState): void {
    if (!source.linkedIds) return;

    for (const linkedId of source.linkedIds) {
      const linked = this.interactables.get(linkedId);
      if (!linked) continue;

      // Toggle linked objects
      if (linked.type === 'door') {
        const state = linked.state as { open: boolean };
        state.open = !state.open;
      } else if (linked.type === 'platform') {
        const state = linked.state as { moving: boolean };
        state.moving = !state.moving;
      }
    }
  }

  getInteractableStates(): InteractableState[] {
    return Array.from(this.interactables.values());
  }

  // ============================================
  // Ping System
  // ============================================
  addPing(playerId: string, position: WorldPos, pingType: PingType): PingMarker | null {
    const role = this.players.get(playerId);
    if (!role) return null;

    // Rate limit
    const lastPing = this.lastPingTime.get(playerId) || 0;
    if (Date.now() - lastPing < PING.COOLDOWN) {
      return null;
    }

    // Count existing pings by this player
    let playerPingCount = 0;
    for (const ping of this.pings.values()) {
      if (ping.createdBy === role) playerPingCount++;
    }

    if (playerPingCount >= PING.MAX_PER_PLAYER) {
      // Remove oldest ping
      let oldest: PingMarker | null = null;
      for (const ping of this.pings.values()) {
        if (ping.createdBy === role) {
          if (!oldest || ping.createdAt < oldest.createdAt) {
            oldest = ping;
          }
        }
      }
      if (oldest) {
        this.pings.delete(oldest.id);
      }
    }

    const ping: PingMarker = {
      id: `ping_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      position,
      type: pingType,
      createdBy: role,
      createdAt: Date.now(),
      expiresAt: Date.now() + PING.LIFETIME,
    };

    this.pings.set(ping.id, ping);
    this.lastPingTime.set(playerId, Date.now());

    return ping;
  }

  removePing(pingId: string, playerId: string): boolean {
    const ping = this.pings.get(pingId);
    if (!ping) return false;

    const role = this.players.get(playerId);
    if (ping.createdBy !== role) return false;

    this.pings.delete(pingId);
    return true;
  }

  private expirePings(): void {
    const now = Date.now();
    for (const [id, ping] of this.pings) {
      if (now >= ping.expiresAt) {
        this.pings.delete(id);
      }
    }
  }

  getPings(): PingMarker[] {
    return Array.from(this.pings.values());
  }

  // ============================================
  // Puzzle System
  // ============================================
  checkPuzzles(): { puzzleId: string; objectives: { id: string; completed: boolean }[]; completed: boolean }[] {
    const results: { puzzleId: string; objectives: { id: string; completed: boolean }[]; completed: boolean }[] = [];

    for (const [puzzleId, state] of this.puzzleStates) {
      const objectives: { id: string; completed: boolean }[] = [];
      for (const [objId, completed] of state.objectives) {
        objectives.push({ id: objId, completed });
      }
      results.push({ puzzleId, objectives, completed: state.completed });
    }

    return results;
  }

  getPuzzleStates(): { id: string; name: string; completed: boolean; objectives: { id: string; description: string; completed: boolean; optional: boolean }[] }[] {
    if (!this.levelData) return [];

    const states: { id: string; name: string; completed: boolean; objectives: { id: string; description: string; completed: boolean; optional: boolean }[] }[] = [];

    for (const puzzleConfig of this.levelData.puzzles) {
      const puzzleState = this.puzzleStates.get(puzzleConfig.id);
      if (!puzzleState) continue;

      const objectives = puzzleConfig.objectives.map((obj) => ({
        id: obj.id,
        description: obj.description,
        completed: puzzleState.objectives.get(obj.id) || false,
        optional: obj.optional || false,
      }));

      states.push({
        id: puzzleConfig.id,
        name: puzzleConfig.name,
        completed: puzzleState.completed,
        objectives,
      });
    }

    return states;
  }

  isLevelComplete(): boolean {
    // Check if all non-optional puzzles are complete
    for (const state of this.puzzleStates.values()) {
      if (!state.completed) return false;
    }
    return this.puzzleStates.size > 0;
  }

  getCompletedPuzzleCount(): number {
    let count = 0;
    for (const state of this.puzzleStates.values()) {
      if (state.completed) count++;
    }
    return count;
  }

  getTotalPuzzleCount(): number {
    return this.puzzleStates.size;
  }
}

// ============================================
// Room Manager
// ============================================
export class RoomManager {
  private rooms = new Map<string, Room>();

  createRoom(
    creatorId: string,
    levelId: string
  ): { success: boolean; roomCode?: string; qrCodeUrl?: string; error?: string } {
    // Generate unique room code
    let roomCode: string;
    let attempts = 0;
    do {
      roomCode = generateRoomCode();
      attempts++;
    } while (this.rooms.has(roomCode) && attempts < 100);

    if (attempts >= 100) {
      return { success: false, error: 'Could not generate unique room code' };
    }

    const room = new Room(roomCode, levelId, creatorId);
    this.rooms.set(roomCode, room);

    // Generate QR code URL
    const joinUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/join/${roomCode}`;

    return {
      success: true,
      roomCode,
      qrCodeUrl: joinUrl, // Client will generate actual QR image
    };
  }

  joinRoom(
    roomCode: string,
    playerId: string,
    preferredRole?: Role
  ): { success: boolean; role?: Role; error?: string; errorCode?: string } {
    const room = this.rooms.get(roomCode.toUpperCase());

    if (!room) {
      return { success: false, error: 'Room not found', errorCode: 'not_found' };
    }

    if (room.isFull()) {
      return { success: false, error: 'Room is full', errorCode: 'full' };
    }

    // Determine role
    const existingRole = room.getPlayerByRole('dog') ? 'dog' : null;
    let role: Role;

    if (existingRole === 'dog') {
      // Dog exists, must be Panda
      role = 'panda';
    } else {
      // No Dog yet, prefer Dog but respect preference
      role = preferredRole === 'panda' ? 'panda' : 'dog';
    }

    if (room.getPlayerByRole(role)) {
      return { success: false, error: 'Role already taken', errorCode: 'role_taken' };
    }

    room.addPlayer(playerId, role);

    return { success: true, role };
  }

  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode.toUpperCase());
  }

  removeRoom(roomCode: string): void {
    this.rooms.delete(roomCode.toUpperCase());
  }

  getRooms(): Map<string, Room> {
    return this.rooms;
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  cleanupStaleRooms(): void {
    const now = Date.now();
    const timeout = PROTOCOL.ROOM_TIMEOUT;

    for (const [code, room] of this.rooms) {
      const state = room.getRoomState();
      if (room.isEmpty() && now - state.createdAt > timeout) {
        this.rooms.delete(code);
        console.log(`Cleaned up stale room: ${code}`);
      }
    }
  }
}
