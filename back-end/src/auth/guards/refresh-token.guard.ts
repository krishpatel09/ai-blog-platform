import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
    constructor() {
        super();
    }

    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            throw (
                err ||
                new UnauthorizedException('Your session has expired. Please log in again.')
            );
        }
        return user;
    }
}