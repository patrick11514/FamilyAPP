import { conn } from '$/lib/server/variables';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
    const parentData = await parent();

    const data = await conn.selectFrom('shoppinglist').selectAll().execute();

    return {
        data,
        users: parentData.users
    };
}) satisfies PageServerLoad;
