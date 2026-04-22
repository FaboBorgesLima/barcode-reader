import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { TokenPayload } from '../../service/tokenService';

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): TokenPayload => {
        const request = ctx.switchToHttp().getRequest<Request>();
        return (request as any).user as TokenPayload;
    },
);

export const CurrentToken = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest<Request>();
        return (request as any).token as string;
    },
);
