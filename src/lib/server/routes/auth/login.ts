import { z } from 'zod';
import { procedure } from '../../api';
import { conn, jwt } from '../../variables';
import type { ErrorApiResponse } from '@patrick115/sveltekitapi';
import bcrypt from 'bcrypt';
import { COOKIE_EXPIRE } from '$env/static/private';
import type { ResponseWithData, UserData } from '$/types/types';
import type { ErrorList } from '$/lib/errors';
import { getUserPermissions } from '../../functions';

export default procedure.POST.input(
    z.object({
        username: z.string(),
        password: z.string()
    })
).query(async ({ input, ev: { cookies } }) => {
    const data = await conn.selectFrom('user').selectAll().where('username', '=', input.username).executeTakeFirst();
    if (!data) {
        return {
            status: false,
            code: 400,
            message: 'auth.login.username' satisfies ErrorList
        } satisfies ErrorApiResponse;
    }

    if (!bcrypt.compareSync(input.password, data.password)) {
        return {
            status: false,
            code: 400,
            message: 'auth.login.password' satisfies ErrorList
        } satisfies ErrorApiResponse;
    }

    const userData = {
        ...data,
        password: undefined,
        ...(await getUserPermissions(data.id))
    };

    const cookie = jwt.setCookie(userData);
    cookies.set('session', cookie, {
        path: '/',
        maxAge: parseInt(COOKIE_EXPIRE)
    });

    return {
        status: true,
        data: userData
    } satisfies ResponseWithData<UserData>;
});
