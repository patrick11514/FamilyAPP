import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCookieData } from '$/lib/server/functions';
import { conn } from '$/lib/server/variables';

export const load = (async ({ params, cookies }) => {
    const id = parseInt(params.id);

    if (isNaN(id)) {
        redirect(302, '/app/presents/mine');
    }

    const userState = getCookieData(cookies);

    if (!userState.logged) {
        redirect(302, '/app/presents/mine');
    }

    const present = await conn.selectFrom('present').selectAll().where('id', '=', id).executeTakeFirst();

    if (!present) {
        redirect(302, '/app/presents/mine');
    }

    if (present.user_id !== userState.data.id) {
        redirect(302, '/app/presents/mine');
    }

    return {
        data: present
    };
}) satisfies PageServerLoad;
