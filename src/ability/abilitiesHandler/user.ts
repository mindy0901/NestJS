import { AbilityHandler } from '../ability.decorator';
import { Action, AppAbility } from '../ability.factory';

export class ReadUsers implements AbilityHandler {
    handle(ability: AppAbility) {
        return ability.can(Action.ReadAll, 'User');
    }
}
export class ReadUser implements AbilityHandler {
    handle(ability: AppAbility) {
        return ability.can(Action.Read, 'User');
    }
}
export class CreateUser implements AbilityHandler {
    handle(ability: AppAbility) {
        return ability.can(Action.Create, 'User');
    }
}
