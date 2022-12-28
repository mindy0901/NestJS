import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator((data: string | undefined, context: ExecutionContext) => {
    const { user } = context.switchToHttp().getRequest();

    return data ? user?.[data] : user;
});
