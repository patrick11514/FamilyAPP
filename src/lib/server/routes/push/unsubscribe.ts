import type { Response } from '$/types/types';
import type { ErrorApiResponse } from '@patrick115/sveltekitapi';
import { z } from 'zod';
import { loggedProcedure } from '../../api';
import { conn } from '../../variables';

export default loggedProcedure.POST.input(
    z.object({
        endpoint: z.string()
    })
).query(async ({ input, ctx }) => {
    try {
        await conn
            .deleteFrom('web_push')
            .where('userId', '=', ctx.id)
            .where('endpoint', '=', input.endpoint)
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
