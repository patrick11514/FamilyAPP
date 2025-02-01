import { conn, jwt } from '$/lib/server/variables';
import type { UserData } from '$/types/types';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, cookies, parent }) => {
    const parentData = await parent();

    const cookie = cookies.get('session')!;
    const userData = jwt.getCookie<UserData>(cookie)!;

    const data = await conn
        .selectFrom('present')
        .selectAll()
        .where('user_id', params.page === 'mine' ? '=' : '!=', userData.id)
        .execute();

    return {
        data,
        users: parentData.users
    };
}) satisfies PageServerLoad;
