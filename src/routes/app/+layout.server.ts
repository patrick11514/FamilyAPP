import { getCookieData } from '$/lib/server/functions';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (({ cookies }) => {
    if (!getCookieData(cookies).logged) {
        redirect(302, '/');
    }
}) satisfies LayoutServerLoad;
