import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';

/**
 * Converts query or param strings to BigInt
 */
@Injectable()
export class ParseBigIntQueryPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (value === undefined || value === null) {
            throw new BadRequestException(`${metadata.data ?? 'ID'} parameter missing`);
        }

        try {
            return BigInt(value);
        } catch {
            throw new BadRequestException(`${metadata.data ?? 'ID'} must be a valid bigint`);
        }
    }
}
