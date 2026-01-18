/**
 * Global type declarations for Node.js
 * These provide minimal type stubs when @types/node is unavailable
 */

declare const process: {
  env: Record<string, string | undefined>;
  cwd: () => string;
};

declare const console: {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
};

declare function setTimeout(callback: () => void, ms: number): number;
declare function setInterval(callback: () => void, ms: number): number;
declare function clearInterval(handle: number): void;

declare class Buffer {
  static from(data: string | Buffer): Buffer;
  toString(): string;
}

declare module 'http' {
  import { EventEmitter } from 'events';

  export interface IncomingMessage {
    url?: string;
    method?: string;
    headers: Record<string, string | string[] | undefined>;
  }

  export interface ServerResponse {
    writeHead(statusCode: number, headers?: Record<string, string>): void;
    end(data?: string | Buffer): void;
  }

  export function createServer(
    requestListener?: (req: IncomingMessage, res: ServerResponse) => void
  ): Server;

  export interface Server extends EventEmitter {
    listen(port: number, host?: string, callback?: () => void): void;
    close(callback?: () => void): void;
  }
}

declare module 'fs' {
  export function readFileSync(path: string): Buffer;
  export function existsSync(path: string): boolean;
}

declare module 'path' {
  export function join(...paths: string[]): string;
  export function extname(path: string): string;
}

declare module 'events' {
  export class EventEmitter {
    on(event: string, listener: (...args: unknown[]) => void): this;
    emit(event: string, ...args: unknown[]): boolean;
  }
}
