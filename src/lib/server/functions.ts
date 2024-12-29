import type { UserData, UserState } from '$/types/types';
import type { Cookies } from '@sveltejs/kit';
import { conn, jwt } from './variables';
import { z } from 'zod';

export const getCookieData = (cookies: Cookies): UserState => {
    const cookie = cookies.get('session');
    if (!cookie) {
        return {
            logged: false
        };
    }

    const data = jwt.getCookie<UserData>(cookie);

    if (!data) {
        return {
            logged: false
        };
    }

    return {
        logged: true,
        data
    };
};

export const getUserPermissions = async (id: number) => {
    const groupRel = await conn.selectFrom('user_group').select('group_id').where('user_id', '=', id).executeTakeFirst();
    if (!groupRel) {
        return {
            group: undefined,
            permissions: [] as string[]
        };
    }

    const perms = await conn.selectFrom('group_permissions').select('permission').where('group_id', '=', groupRel.group_id).execute();
    const group = await conn.selectFrom('group').selectAll().where('group.id', '=', groupRel.group_id).executeTakeFirst();

    return {
        group: group!,
        permissions: perms.map((p) => p.permission)
    };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hexColor = z.custom<string>((data: any) => {
    if (typeof data !== 'string') return false;
    if (data === null || data === undefined) return false;

    if (data.length != 4 && data.length != 7) return false;
    if (data[0] !== '#') return false;

    const isHexDigit = (char: string) => '0123456789ABCDEF'.split('').includes(char);

    return !data
        .substring(1)
        .split('')
        .some((ch) => !isHexDigit(ch));
});
