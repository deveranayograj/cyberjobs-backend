// core/decorators/current-user-id.decorator.ts
import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { ParseUserIdPipe } from '@app/core/pipes/parse-userid.pipe';

export const CurrentUserId = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        const pipe = new ParseUserIdPipe();
        try {
            return pipe.transform(req, { type: 'custom', metatype: null, data: null });
        } catch (err) {
            throw new BadRequestException(err.message);
        }
    },
);
