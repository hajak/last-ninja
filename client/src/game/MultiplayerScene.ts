/**
 * Panda & Dog - Multiplayer Scene
 * Main game scene handling multiplayer coordination
 */

import { Container, Application, Text, TextStyle } from 'pixi.js';
import type {
  EntityState,
  GameState,
  InteractableState,
  PingMarker,
  WorldPos,
  Role,
  InputState,
} from '../../../shared/types';
import type {
  ServerMessage,
  InteractionResultMessage,
  EntityRespawnMessage,
} from '../../../shared/protocol';
import { INTERACTION_RANGE, COLORS } from '../../../shared/constants';
import { InteractableRenderer } from './InteractableRenderer';
import { NetworkClient } from '../network/NetworkClient';

interface CharacterRenderer {
  position: WorldPos;
  container: Container;
  getPosition(): WorldPos;
}

export class MultiplayerScene {
  private app: Application;
  private container: Container;
  private networkClient: NetworkClient;
  private role: Role;

  private entities = new Map<string, CharacterRenderer>();
  private interactables = new Map<string, InteractableRenderer>();
  private pings = new Map<string, Container>();

  private interactionPrompt: Text | null = null;
  private nearbyInteractableId: string | null = null;

  private localPlayerId: string;
  private gameState: GameState | null = null;

  constructor(app: Application, networkClient: NetworkClient, role: Role, playerId: string) {
    this.app = app;
    this.networkClient = networkClient;
    this.role = role;
    this.localPlayerId = playerId;

    this.container = new Container();
    this.container.sortableChildren = true;
    this.app.stage.addChild(this.container);

    this.setupNetworkHandlers();
    this.createInteractionPrompt();
  }

  private setupNetworkHandlers(): void {
    this.networkClient.on('message', (event: ServerMessage) => {
      this.handleNetworkEvent(event);
    });
  }

  /**
   * Handle network events from the server.
   * FIXED: Now properly handles interaction_result for user feedback.
   */
  private handleNetworkEvent(event: ServerMessage): void {
    switch (event.type) {
      case 'state_update': {
        this.updateGameState(event);
        break;
      }

      case 'interaction_result': {
        // FIXED: Now handling interaction results for user feedback
        const data = event as InteractionResultMessage;
        if (!data.success && data.reason) {
          this.showInteractionFeedback(data.reason);
        } else if (data.success) {
          // Optional: Show success feedback
          this.showInteractionFeedback('', true);
        }
        break;
      }

      case 'entity_respawn': {
        // Handle respawn due to hazard collision
        const respawnData = event as EntityRespawnMessage;
        this.handleEntityRespawn(respawnData);
        break;
      }

      case 'ping_received': {
        this.addPing(event.ping);
        break;
      }

      case 'ping_expired': {
        this.removePing(event.pingId);
        break;
      }

      case 'puzzle_update': {
        // Handle puzzle update
        console.log(`Puzzle ${event.puzzleId} update:`, event.objectives);
        if (event.completed) {
          this.showNotification(`Puzzle completed!`);
        }
        break;
      }

      case 'level_complete': {
        this.showNotification(`Level Complete! Time: ${Math.floor(event.timeElapsed / 1000)}s`);
        break;
      }

      case 'game_paused': {
        this.showNotification(event.paused ? 'Game Paused' : 'Game Resumed');
        break;
      }
    }
  }

  private updateGameState(event: { entities: EntityState[]; interactables: InteractableState[]; pings: PingMarker[] }): void {
    // Update entities
    for (const entity of event.entities) {
      const renderer = this.entities.get(entity.id);
      if (renderer) {
        renderer.position.x = entity.position.x;
        renderer.position.y = entity.position.y;
        renderer.position.z = entity.position.z;
      }
    }

    // Update interactables
    for (const interactable of event.interactables) {
      const renderer = this.interactables.get(interactable.id);
      if (renderer) {
        renderer.updateState(interactable);
      }
    }

    // Update pings
    const currentPingIds = new Set(event.pings.map((p) => p.id));
    for (const [id] of this.pings) {
      if (!currentPingIds.has(id)) {
        this.removePing(id);
      }
    }
    for (const ping of event.pings) {
      if (!this.pings.has(ping.id)) {
        this.addPing(ping);
      }
    }
  }

  private handleEntityRespawn(event: EntityRespawnMessage): void {
    const renderer = this.entities.get(event.entityId);
    if (renderer) {
      renderer.position.x = event.position.x;
      renderer.position.y = event.position.y;
      renderer.position.z = event.position.z;
    }

    // Show respawn notification
    if (event.role === this.role) {
      this.showNotification('Hazard! Respawning...', COLORS.HAZARD);
    }
  }

  /**
   * Check for nearby interactables that the player can interact with.
   * FIXED: Uses world coordinates instead of screen coordinates for distance calculation.
   */
  private checkNearbyInteractables(): void {
    const localCharId = `${this.role}_entity`;
    const localChar = this.entities.get(localCharId);
    if (!localChar) {
      this.nearbyInteractableId = null;
      this.updateInteractionPrompt();
      return;
    }

    // Get local character's WORLD position
    const localWorldPos = localChar.getPosition();

    let closestId: string | null = null;
    let closestDistance = INTERACTION_RANGE;

    for (const [id, renderer] of this.interactables) {
      // FIXED: Use world coordinates from the renderer's state, NOT screen coordinates
      // Previously this used renderer.container.x/y which are screen coordinates
      const interactableWorldPos = renderer.position;

      // Calculate distance in WORLD space
      const dx = interactableWorldPos.x - localWorldPos.x;
      const dy = interactableWorldPos.y - localWorldPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestId = id;
      }
    }

    this.nearbyInteractableId = closestId;
    this.updateInteractionPrompt();
  }

  private createInteractionPrompt(): void {
    const style = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 16,
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    });

    this.interactionPrompt = new Text('', style);
    this.interactionPrompt.anchor.set(0.5, 1);
    this.interactionPrompt.visible = false;
    this.app.stage.addChild(this.interactionPrompt);
  }

  private updateInteractionPrompt(): void {
    if (!this.interactionPrompt) return;

    if (!this.nearbyInteractableId) {
      this.interactionPrompt.visible = false;
      return;
    }

    const renderer = this.interactables.get(this.nearbyInteractableId);
    if (!renderer) {
      this.interactionPrompt.visible = false;
      return;
    }

    const state = renderer.getState();
    let promptText = '';

    switch (state.type) {
      case 'door': {
        const doorState = state.state as { open: boolean; locked: boolean };
        if (doorState.locked) {
          promptText = 'Locked';
        } else {
          promptText = `[E] ${doorState.open ? 'Close' : 'Open'} Door`;
        }
        break;
      }
      case 'lever':
        promptText = '[E] Toggle Lever';
        break;
      case 'button':
        promptText = '[E] Press Button';
        break;
      case 'crate':
        if (this.role === 'panda') {
          promptText = '[E] Push Crate';
        } else {
          promptText = 'Too heavy for Dog';
        }
        break;
      case 'winch':
        if (this.role === 'panda') {
          promptText = '[E] Operate Winch';
        } else {
          promptText = 'Requires Panda';
        }
        break;
      case 'camera_node':
        if (this.role === 'dog') {
          promptText = '[E] Use Camera';
        } else {
          promptText = 'Dog only';
        }
        break;
      default:
        promptText = '';
    }

    if (promptText) {
      this.interactionPrompt.text = promptText;
      this.interactionPrompt.visible = true;
      // Position prompt above the interactable
      const container = renderer.getContainer();
      this.interactionPrompt.position.set(container.x, container.y - 60);
    } else {
      this.interactionPrompt.visible = false;
    }
  }

  /**
   * Show feedback when an interaction succeeds or fails.
   * FIXED: Added interaction feedback that was missing before.
   */
  private showInteractionFeedback(message: string, success = false): void {
    if (!this.interactionPrompt) return;

    if (message) {
      // Error feedback
      this.interactionPrompt.text = message;
      this.interactionPrompt.style.fill = '#ff6666';
      this.interactionPrompt.visible = true;

      // Reset after delay
      setTimeout(() => {
        if (this.interactionPrompt) {
          this.interactionPrompt.style.fill = '#ffffff';
          this.updateInteractionPrompt();
        }
      }, 2000);
    } else if (success) {
      // Brief success flash
      this.interactionPrompt.style.fill = '#66ff66';
      setTimeout(() => {
        if (this.interactionPrompt) {
          this.interactionPrompt.style.fill = '#ffffff';
        }
      }, 300);
    }
  }

  private showNotification(message: string, color: number = 0xffffff): void {
    const style = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 24,
      fill: color,
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    });

    const notification = new Text(message, style);
    notification.anchor.set(0.5);
    notification.position.set(this.app.screen.width / 2, this.app.screen.height / 3);
    this.app.stage.addChild(notification);

    // Fade out and remove
    let alpha = 1;
    const fadeInterval = setInterval(() => {
      alpha -= 0.02;
      notification.alpha = alpha;
      if (alpha <= 0) {
        clearInterval(fadeInterval);
        notification.destroy();
      }
    }, 50);
  }

  /**
   * Handle player interaction input (E key press).
   */
  handleInteraction(): void {
    if (!this.nearbyInteractableId) return;

    const renderer = this.interactables.get(this.nearbyInteractableId);
    if (!renderer) return;

    const state = renderer.getState();
    let action = '';

    switch (state.type) {
      case 'door':
        action = 'toggle';
        break;
      case 'lever':
        action = 'toggle';
        break;
      case 'button':
        action = 'press';
        break;
      case 'crate':
        action = 'push';
        break;
      case 'winch':
        action = 'operate_start';
        break;
      case 'camera_node':
        action = 'activate';
        break;
    }

    if (action) {
      this.networkClient.sendInteraction(this.nearbyInteractableId, action);
    }
  }

  private addPing(ping: PingMarker): void {
    // Create ping visual
    const pingContainer = new Container();
    // ... ping rendering logic
    this.pings.set(ping.id, pingContainer);
    this.container.addChild(pingContainer);
  }

  private removePing(pingId: string): void {
    const ping = this.pings.get(pingId);
    if (ping) {
      ping.destroy();
      this.pings.delete(pingId);
    }
  }

  update(deltaTime: number): void {
    // Check for nearby interactables
    this.checkNearbyInteractables();

    // Update interactable animations
    for (const renderer of this.interactables.values()) {
      renderer.update(deltaTime);
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
    if (this.interactionPrompt) {
      this.interactionPrompt.destroy();
    }
  }
}
