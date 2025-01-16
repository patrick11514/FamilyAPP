import { conn } from '$/lib/server/variables';
import type { LayoutServerLoad } from './$types';

export const load = (async () => {
    return {
        users: await conn.selectFrom('user').select(['id', 'username', 'firstname', 'lastname']).execute()
    };
}) satisfies LayoutServerLoad;
