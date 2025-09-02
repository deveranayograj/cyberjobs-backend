import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { ArgumentMetadata } from '@nestjs/common';

/**
 * Extracts userId from req.user (JWT) and converts to bigint
 */
@Injectable()
export class ParseUserIdPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        const req: Request = value;
        const userId = (req.user as any)?.id ?? (req.user as any)?.sub;

        if (!userId) throw new BadRequestException('User ID not found in request');

        try {
            return BigInt(userId);
        } catch {
            throw new BadRequestException('User ID is not a valid bigint');
        }
    }
}
