import { Server } from '$/lib/server/server';
import { conn } from '$/lib/server/variables';
import type { PageServerLoad } from './$types';

export const load = (async (ev) => {
    return {
        users: await Server.ssr.users.GET(ev),
        groups: await conn.selectFrom('group').selectAll().execute()
    };
}) satisfies PageServerLoad;
