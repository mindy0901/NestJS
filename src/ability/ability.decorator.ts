import { SetMetadata } from '@nestjs/common';
import { AppAbility } from './ability.factory';

export interface AbilityHandler {
    handle(ability: AppAbility): boolean;
}

type AbilityHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = AbilityHandler | AbilityHandlerCallback;

export const CHECK_ABILITIES_KEY = 'check_ability';
export const CheckAbilites = (...handlers: PolicyHandler[]) => SetMetadata(CHECK_ABILITIES_KEY, handlers);
