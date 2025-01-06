import { getCookieData } from '$/lib/server/functions';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { conn } from '$/lib/server/variables';

export const load = (async ({ cookies }) => {
    const data = getCookieData(cookies);
    if (!data.logged) redirect(302, '/');
    return {
        users: await conn.selectFrom('user').select(['id', 'username', 'firstname', 'lastname']).execute()
    };
}) satisfies PageServerLoad;
