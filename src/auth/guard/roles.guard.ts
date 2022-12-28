import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLE_KEY } from '../decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        console.log('RBCA Authorization');
        const requiredRole = this.reflector.getAllAndOverride<Role>(ROLE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRole) return true;

        const { user } = context.switchToHttp().getRequest();

        console.log('require', requiredRole, 'current', user.role);

        if (requiredRole === user.role) return true;

        return false;
    }
}
