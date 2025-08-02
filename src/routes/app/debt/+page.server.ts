import { getCookieData } from '$/lib/server/functions';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { conn } from '$/lib/server/variables';

export const load = (async ({ cookies, parent }) => {
    const parentData = await parent();

    const data = getCookieData(cookies);
    if (!data.logged) redirect(302, '/');

    const debts = await conn
        .selectFrom('debt')
        .selectAll()
        .where((eb) =>
            eb.or([eb('who', '=', data.data.id), eb('whom', '=', data.data.id)])
        )
        .orderBy('when desc')
        .execute();

    return {
        who: debts.filter((debt) => debt.who === data.data.id),
        whom: debts.filter((debt) => debt.whom === data.data.id),
        users: parentData.users
    };
}) satisfies PageServerLoad;
