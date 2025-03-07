import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async () => {
    redirect(302, '/app/presents/mine');
}) satisfies PageLoad;
