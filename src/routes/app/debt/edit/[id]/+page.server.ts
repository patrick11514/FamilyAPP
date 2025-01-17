import { getCookieData } from '$/lib/server/functions';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { conn } from '$/lib/server/variables';

export const load = (async ({ cookies, params, parent }) => {
    const parentData = await parent();

    const data = getCookieData(cookies);
    if (!data.logged) redirect(302, '/');

    const id = parseInt(params.id);
    if (isNaN(id)) redirect(302, '/app/debt');

    //check if the user is the owner of the debt
    const found = await conn
        .selectFrom('debt')
        .selectAll()
        .where((eb) => eb.and([eb('debt.id', '=', id), eb('debt.whom', '=', data.data.id)]))
        .executeTakeFirst();
    if (!found) {
        redirect(302, '/app/debt');
    }

    return {
        data: found,
        users: parentData.users
    };
}) satisfies PageServerLoad;
