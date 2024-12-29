import type { DePromise, ResponseWithData, UserData } from '$/types/types';
import { COOKIE_EXPIRE } from '$env/static/private';
import { loggedProcedure } from '../../api';
import { getUserPermissions } from '../../functions';
import { jwt } from '../../variables';

export default loggedProcedure.GET.query(async ({ ctx, ev: { cookies } }) => {
    const permissions = await getUserPermissions(ctx.id);

    const updatedCookie = jwt.setCookie({
        ...ctx,
        permissions: permissions.permissions,
        group: permissions.group
    } satisfies UserData);

    cookies.set('session', updatedCookie, {
        path: '/',
        maxAge: parseInt(COOKIE_EXPIRE)
    });

    return {
        status: true,
        data: permissions
    } satisfies ResponseWithData<DePromise<ReturnType<typeof getUserPermissions>>>;
});
