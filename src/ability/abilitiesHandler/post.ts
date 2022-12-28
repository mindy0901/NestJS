import { AbilityHandler } from '../ability.decorator';
import { Action, AppAbility } from '../ability.factory';

export class ReadPosts implements AbilityHandler {
    handle(ability: AppAbility) {
        return ability.can(Action.ReadAll, 'Post');
    }
}

export class CreatePost implements AbilityHandler {
    handle(ability: AppAbility) {
        return ability.can(Action.Create, 'Post');
    }
}
