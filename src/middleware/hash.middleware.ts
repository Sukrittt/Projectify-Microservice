import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HashMiddleware implements NestMiddleware {
  private readonly expectedHash: string;

  constructor() {
    dotenv.config();
    this.expectedHash = process.env.HASH_KEY;
  }

  //verify hash key
  private verifyHash(providedKey: string): boolean {
    const providedHashkey = Buffer.from(providedKey);
    const expectedHashKey = Buffer.from(this.expectedHash);

    if (providedHashkey.length !== expectedHashKey.length) {
      throw new UnauthorizedException('Invalid hash key');
    }

    if (crypto.timingSafeEqual(providedHashkey, expectedHashKey)) {
      return true;
    } else {
      throw new UnauthorizedException('Invalid hash key');
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    const providedKey = req.headers.authorization?.split(' ')[1];

    if (!providedKey) {
      throw new UnauthorizedException('Hash key is required');
    }

    if (!this.verifyHash(providedKey as string)) {
      throw new UnauthorizedException('Invalid hash key');
    }
    next();
  }
}
