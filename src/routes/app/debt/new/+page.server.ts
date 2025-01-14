import type { PageServerLoad } from './$types';
import { conn } from '$/lib/server/variables';

export const load = (async () => {
    return {
        users: await conn.selectFrom('user').select(['id', 'username', 'firstname', 'lastname']).execute()
    };
}) satisfies PageServerLoad;
