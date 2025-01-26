import { getCookieData } from '$/lib/server/functions';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { conn } from '$/lib/server/variables';
import { getDebtsByUserId } from '$/lib/server/routes/debt';

export const load = (async ({ cookies, params }) => {
    const data = getCookieData(cookies);
    if (!data.logged) redirect(302, '/');

    const userId = parseInt(params.userId);
    if (isNaN(userId)) redirect(302, '/app/debt');

    //check if the user is the owner of the debt
    const records = await getDebtsByUserId(userId, data.data.id);
    if (records.length === 0) {
        redirect(302, '/app/debt');
    }

    return {
        data: records,
        userInfo: (await conn.selectFrom('user').select(['id', 'firstname', 'lastname']).where('id', '=', userId).executeTakeFirst())!
    };
}) satisfies PageServerLoad;
