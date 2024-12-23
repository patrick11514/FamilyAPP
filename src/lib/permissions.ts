import type { UserData } from '$/types/types';

export type Permission = `${string}.${string}`;

export class Permissions {
    private permissions: Permission[] = [];

    private static isValidPermission(value: string): value is Permission {
        return value.split('.').length === 2;
    }

    constructor(userData?: UserData) {
        if (userData) {
            this.permissions = userData.permissions.filter(Permissions.isValidPermission);
        }
    }

    hasPermission(permission: Permission) {
        return this.permissions.includes(permission);
    }

    hasGroup(group: string) {
        return this.permissions.some((perm) => perm.split('.')[0] === group);
    }
}
