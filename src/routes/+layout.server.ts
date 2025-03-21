import { getCookieData } from '$/lib/server/functions';
import { Server } from '$/lib/server/server';
import { VERSION } from '$/lib/server/variables';
import type { LayoutServerLoad } from './$types';

export const load = (async (ev) => {
    return {
        api: Server.hydrateToClient(),
        userState: getCookieData(ev.cookies),
        permissions: await Server.ssr.permissions.GET(ev),
        version: VERSION!
    };
}) satisfies LayoutServerLoad;
