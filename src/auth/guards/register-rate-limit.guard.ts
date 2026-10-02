/**
 * Limits registration attempts per IP to slow down automated email probing.
 * Uses a fixed window kept in memory for this process.
 */

import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

export const REGISTER_LIMIT = 5;
export const REGISTER_WINDOW_MS = 60_000;

// ponytail: per-process memory; move to Redis if the API runs on several instances.
@Injectable()
export class RegisterRateLimitGuard implements CanActivate {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();

  canActivate(context: ExecutionContext): boolean {
    const ip = context.switchToHttp().getRequest<Request>().ip ?? 'unknown';
    const now = Date.now();

    if (this.hits.size > 10_000) {
      for (const [key, entry] of this.hits) {
        if (entry.resetAt <= now) this.hits.delete(key);
      }
    }

    const entry = this.hits.get(ip);
    if (!entry || entry.resetAt <= now) {
      this.hits.set(ip, { count: 1, resetAt: now + REGISTER_WINDOW_MS });
      return true;
    }

    if (++entry.count > REGISTER_LIMIT) {
      throw new HttpException(
        'Too many registration attempts, try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
