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

    const userInfo = await conn
        .selectFrom('user')
        .select([
            'id',
            'firstname',
            'lastname',
            'bank_account_prefix',
            'bank_account_number',
            'bank_code'
        ])
        .where('id', '=', userId)
        .executeTakeFirst();

    return {
        data: records,
        userInfo: userInfo!
    };
}) satisfies PageServerLoad;
