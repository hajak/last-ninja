/**
 * Panda & Dog - Network Client
 * Handles WebSocket communication with the game server
 */

import type {
  ClientMessage,
  ServerMessage,
  InputMessage,
  InteractMessage,
  PingMarkerMessage,
} from '../../../shared/protocol';
import { PROTOCOL } from '../../../shared/protocol';
import type { InputState, PingType, WorldPos, Role } from '../../../shared/types';

type EventCallback = (event: ServerMessage) => void;

export class NetworkClient {
  private ws: WebSocket | null = null;
  private serverUrl: string;
  private listeners = new Map<string, Set<EventCallback>>();
  private heartbeatInterval: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private currentTick = 0;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.serverUrl);

        this.ws.onopen = () => {
          console.log('Connected to server');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: ServerMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse server message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('Disconnected from server');
          this.stopHeartbeat();
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: ServerMessage): void {
    // Emit to all listeners
    const listeners = this.listeners.get('message');
    if (listeners) {
      for (const callback of listeners) {
        callback(message);
      }
    }

    // Emit to type-specific listeners
    const typeListeners = this.listeners.get(message.type);
    if (typeListeners) {
      for (const callback of typeListeners) {
        callback(message);
      }
    }
  }

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private send(message: ClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  createRoom(levelId: string): void {
    this.send({
      type: 'create_room',
      timestamp: Date.now(),
      levelId,
    });
  }

  joinRoom(roomCode: string, preferredRole?: Role): void {
    this.send({
      type: 'join_room',
      timestamp: Date.now(),
      roomCode,
      preferredRole,
    });
  }

  leaveRoom(): void {
    this.send({
      type: 'leave_room',
      timestamp: Date.now(),
    });
  }

  sendInput(input: InputState, position: WorldPos): void {
    this.currentTick++;
    const message: InputMessage = {
      type: 'input',
      timestamp: Date.now(),
      tick: this.currentTick,
      input,
      position,
    };
    this.send(message);
  }

  sendInteraction(targetId: string, action: string, data?: Record<string, unknown>): void {
    const message: InteractMessage = {
      type: 'interact',
      timestamp: Date.now(),
      targetId,
      action,
      data,
    };
    this.send(message);
  }

  sendPing(position: WorldPos, pingType: PingType): void {
    const message: PingMarkerMessage = {
      type: 'ping_marker',
      timestamp: Date.now(),
      position,
      pingType,
    };
    this.send(message);
  }

  clearPing(pingId: string): void {
    this.send({
      type: 'clear_ping',
      timestamp: Date.now(),
      pingId,
    });
  }

  setPaused(paused: boolean): void {
    this.send({
      type: 'pause',
      timestamp: Date.now(),
      paused,
    });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      this.send({
        type: 'heartbeat',
        timestamp: Date.now(),
      });
    }, PROTOCOL.HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
