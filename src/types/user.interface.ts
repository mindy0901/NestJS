import { Role } from '@prisma/client';

export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    role: Role;
    createdAt: string;
    updatedAt: string;
}

export type RequestUser = Pick<User, 'id' | 'username' | 'email' | 'role'>;

export type SignupUserForm = Pick<User, 'username' | 'password' | 'email' | 'role'>;

export type SigninUserForm = Pick<User, 'username' | 'password'>;

export type UpdateUserForm = Pick<User, 'username' | 'email' | 'role'>;

export type UserAccessToken = Pick<User, 'id' | 'role'> & {
    iat: number;
    exp: number;
};

export type UserRefreshToken = Pick<User, 'id' | 'role'> & {
    iat: number;
    exp: number;
};
