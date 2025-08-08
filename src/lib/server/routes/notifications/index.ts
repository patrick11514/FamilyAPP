import type { Permission } from '$/lib/permissions';
import type { Response } from '$/types/types';
import type { ErrorApiResponse } from '@patrick115/sveltekitapi';
import { z } from 'zod';
import { permProcedure } from '../../api';
import { sendNotification } from '../../functions';

export const NOTIFICATION_PERMISSION = 'admin.notifications' as Permission;

const notificationProcedure = permProcedure([NOTIFICATION_PERMISSION]);

export default [
    notificationProcedure.POST.input(
        z.object({
            userId: z.number(),
            title: z.string().min(1, 'Title is required'),
            body: z.string().min(1, 'Body is required'),
            icon: z.string().optional(),
            tag: z.string().optional(),
            priority: z.enum(['high', 'normal', 'low']).optional()
        })
    ).query(async ({ input }) => {
        try {
            await sendNotification(input.userId, {
                title: input.title,
                body: input.body,
                icon: input.icon,
                tag: input.tag,
                priority: input.priority
            });

            return {
                status: true
            } satisfies Response;
        } catch (err) {
            console.error('Failed to send test notification:', err);
            return {
                status: false,
                code: 500,
                message: 'Failed to send notification'
            } satisfies ErrorApiResponse;
        }
    })
];
