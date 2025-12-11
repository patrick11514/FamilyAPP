import type { Permission } from '$/lib/permissions';
import type { Response } from '$/types/types';
import type { ErrorApiResponse } from '@patrick115/sveltekitapi';
import { z } from 'zod';
import { permProcedure } from '../../api';
import { sendNotification } from '../../functions';

export const NOTIFICATION_PERMISSION = 'admin.notifications' as Permission;

const notificationProcedure = permProcedure([NOTIFICATION_PERMISSION]);

const send = notificationProcedure.POST.input(
    z.object({
        userId: z.number(),
        title: z.string(),
        body: z.string()
    })
).query(async ({ input }) => {
    try {
        await sendNotification(input.userId, {
            title: input.title,
            body: input.body
        });

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
});

export default {
    send
};
