import { getCookieData } from '$/lib/server/functions';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { conn } from '$/lib/server/variables';

export const load = (async ({ cookies, params }) => {
    const data = getCookieData(cookies);
    if (!data.logged) redirect(302, '/');

    const id = parseInt(params.id);
    if (isNaN(id)) redirect(302, '/app/debt');

    //check if the user is the owner of the debt
    const found = await conn
        .selectFrom('debt')
        .select('id')
        .where((eb) => eb.and([eb('id', '=', id), eb('whom', '=', data.data.id)]))
        .executeTakeFirst();
    if (!found) {
        redirect(302, '/app/debt');
    }
}) satisfies PageServerLoad;
