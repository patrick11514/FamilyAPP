import type { DePromise, Response, ResponseWithData, UserData } from '$/types/types';
import { COOKIE_EXPIRE } from '$env/static/private';
import { z } from 'zod';
import { loggedProcedure } from '../../api';
import { getUserPermissions } from '../../functions';
import { conn, jwt } from '../../variables';
import type { ErrorApiResponse } from '@patrick115/sveltekitapi';

export default [
    loggedProcedure.GET.query(async ({ ctx, ev: { cookies } }) => {
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
    }),
    loggedProcedure.PUT.input(
        z.object({
            id: z.number(),
            permission: z.string()
        })
    ).query(async ({ input }) => {
        try {
            await conn
                .insertInto('group_permissions')
                .values({
                    group_id: input.id,
                    permission: input.permission
                })
                .execute();

            return {
                status: true
            } satisfies Response;
        } catch (err) {
            console.error(err);
            return {
                status: false,
                code: 500,

                message: 'Něco se nepovedlo na serveru :('
            } satisfies ErrorApiResponse;
        }
    }),
    loggedProcedure.DELETE.input(
        z.object({
            id: z.number(),
            permission: z.string()
        })
    ).query(async ({ input }) => {
        try {
            await conn
                .deleteFrom('group_permissions')
                .where((eb) => eb.and([eb('group_id', '=', input.id), eb('permission', '=', input.permission)]))
                .execute();

            return {
                status: true
            } satisfies Response;
        } catch (err) {
            console.error(err);
            return {
                status: false,
                code: 500,

                message: 'Něco se nepovedlo na serveru :('
            } satisfies ErrorApiResponse;
        }
    })
];
