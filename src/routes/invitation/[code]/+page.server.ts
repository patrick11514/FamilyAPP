import { conn } from '$/lib/server/variables';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
    const result = await conn.selectFrom('invitation').select('id').where('code', '=', params.code).executeTakeFirst();

    if (!result) {
        redirect(302, '/');
    }
}) satisfies PageServerLoad;
