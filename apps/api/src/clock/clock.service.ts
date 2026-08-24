import { Injectable } from '@nestjs/common';

@Injectable()
export class ClockService {
  now(): number {
    return Date.now();
  }

  setTimeout(callback: () => void, ms: number): NodeJS.Timeout {
    return setTimeout(callback, ms);
  }

  clearTimeout(handle: NodeJS.Timeout): void {
    clearTimeout(handle);
  }
}
