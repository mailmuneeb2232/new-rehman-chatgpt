import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    return req.ip ?? req.connection.remoteAddress ?? 'unknown';
  }
}
