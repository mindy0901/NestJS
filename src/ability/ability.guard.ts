import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CHECK_ABILITIES_KEY, PolicyHandler } from './ability.decorator';
import { AbilityFactory, AppAbility } from './ability.factory';

@Injectable()
export class AbilitiesGuard implements CanActivate {
    constructor(private reflector: Reflector, private caslAbilityFactory: AbilityFactory) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const policyHandlers = this.reflector.get<PolicyHandler[]>(CHECK_ABILITIES_KEY, context.getHandler()) || [];
        const { user } = context.switchToHttp().getRequest();
        const ability = this.caslAbilityFactory.defineAbilitiesFor(user);
        return policyHandlers.every((handler) => this.execPolicyHandler(handler, ability));
    }

    private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
        if (typeof handler === 'function') {
            return handler(ability);
        }
        return handler.handle(ability);
    }
}
