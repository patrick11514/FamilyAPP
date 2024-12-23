import type { User, Group } from './database';

export type NormalizeId<$From extends { id: unknown }> = Omit<$From, 'id'> & { id: number };

export type UserData = Omit<NormalizeId<User>, 'password'> & {
    permissions: string[];
    group?: NormalizeId<Group>;
};

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

export type DePromise<$Promise> = $Promise extends Promise<infer $Type> ? $Type : $Promise;
