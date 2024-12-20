import type { UserData, UserState } from '$/types/types';
import type { Cookies } from '@sveltejs/kit';
import { jwt } from './variables';

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
