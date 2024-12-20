import type { User } from './database';

export type NormalizeId<$From extends { id: unknown }> = Omit<$From, 'id'> & { id: number };

export type UserData = Omit<NormalizeId<User>, 'password'>;

export type UserState =
    | {
        logged: false;
    }
    | {
        logged: true;
        data: UserData;
    };

export type Response = {
    status: true;
};

export type ResponseWithData<$DataType> = Response & {
    data: $DataType;
};
