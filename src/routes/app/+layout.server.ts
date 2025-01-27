import { getCookieData } from '$/lib/server/functions';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { conn } from '$/lib/server/variables';

export const load = (async ({ cookies }) => {
    if (!getCookieData(cookies).logged) {
        redirect(302, '/');
    }

    return {
        users: await conn.selectFrom('user').select(['id', 'username', 'firstname', 'lastname']).execute()
    };
}) satisfies LayoutServerLoad;
