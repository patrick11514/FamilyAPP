import { getCookieData } from '$/lib/server/functions';
import { conn } from '$/lib/server/variables';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, cookies, parent }) => {
    const parentData = await parent();

    const userData = getCookieData(cookies);

    if (!userData.logged) {
        redirect(302, '/app/presents/mine');
    }

    const data = await conn
        .selectFrom('present')
        .selectAll()
        .where('user_id', params.page === 'mine' ? '=' : '!=', userData.data.id)
        .orderBy('state', 'asc')
        .orderBy('id', 'desc')
        .execute();

    return {
        data,
        users: parentData.users
    };
}) satisfies PageServerLoad;
