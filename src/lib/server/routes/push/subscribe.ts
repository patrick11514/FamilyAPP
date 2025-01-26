import { z } from 'zod';
import { loggedProcedure } from '../../api';
import { conn } from '../../variables';
import type { Response } from '$/types/types';
import type { ErrorApiResponse } from '@patrick115/sveltekitapi';

export default loggedProcedure.POST.input(
    z.object({
        endpoint: z.string(),
        expirationTime: z.number().nullable(),
        keys: z.object({
            p256dh: z.string(),
            auth: z.string()
        })
    })
).query(async ({ input, ctx }) => {
    try {
        await conn
            .insertInto('web_push')
            .values({
                userId: ctx.id,
                endpoint: input.endpoint,
                p256dh: input.keys.p256dh,
                auth: input.keys.auth
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
            message: 'Internal Server Error'
        } satisfies ErrorApiResponse;
    }
});
