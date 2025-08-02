import type { WebPush } from '$/types/database';
import type { UserData, UserState } from '$/types/types';
import { FILE_FOLDER } from '$env/static/private';
import type { Awaitable } from '@patrick115/sveltekitapi';
import type { Cookies } from '@sveltejs/kit';
import type { Selectable } from 'kysely';
import * as cron from 'node-cron';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { default as Path } from 'node:path';
import webPush from 'web-push';
import { z } from 'zod';
import { conn, jwt } from './variables';

export const getCookieData = (cookies: Cookies): UserState => {
    const cookie = cookies.get('session');
    if (!cookie) {
        return {
            logged: false
        };
    }

    const data = jwt.getCookie<UserData>(cookie);

    if (!data) {
        return {
            logged: false
        };
    }

    return {
        logged: true,
        data
    };
};

export const getUserPermissions = async (id: number) => {
    const groupRel = await conn
        .selectFrom('user_group')
        .select('group_id')
        .where('user_id', '=', id)
        .executeTakeFirst();
    if (!groupRel) {
        return {
            group: undefined,
            permissions: [] as string[]
        };
    }

    const perms = await conn
        .selectFrom('group_permissions')
        .select('permission')
        .where('group_id', '=', groupRel.group_id)
        .execute();
    const group = await conn
        .selectFrom('group')
        .selectAll()
        .where('group.id', '=', groupRel.group_id)
        .executeTakeFirst();

    return {
        group: group!,
        permissions: perms.map((p) => p.permission)
    };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hexColor = z.custom<string>((data: any) => {
    if (typeof data !== 'string') return false;
    if (data === null || data === undefined) return false;

    if (data.length !== 4 && data.length !== 7) return false;
    if (data[0] !== '#') return false;

    const isHexDigit = (char: string) => '0123456789abcdef'.split('').includes(char);

    return !data
        .toLowerCase()
        .substring(1)
        .split('')
        .some((ch) => !isHexDigit(ch));
});

type NotificationPayload = {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    actions?: {
        action: string;
        title: string;
    }[];
    timestamp?: number;
    priority?: 'high' | 'normal' | 'low';
    tag?: string;
    silent?: boolean;
    data?: Record<string, unknown>;
};

export const sendSingleNotification = async (
    payload: string,
    push: Selectable<WebPush>
) => {
    const obj = {
        endpoint: push.endpoint,
        keys: {
            p256dh: push.p256dh,
            auth: push.auth
        }
    };

    try {
        await webPush.sendNotification(obj, payload);
    } catch (e) {
        if (e !== null && typeof e === 'object' && 'statusCode' in e)
            if (e.statusCode === 410) {
                return false;
            }
    }
};

export const batchNotifications = async (
    notification: NotificationPayload,
    pushes: Selectable<WebPush>[]
) => {
    const payload = JSON.stringify({
        icon: '/icons/favicon-196x196.png',
        badge: '/icons/favicon-196x196.png',
        timestamp: Date.now(),
        silent: false,
        ...notification
    });

    const promises = pushes.map((push) => sendSingleNotification(payload, push));
    const results = await Promise.all(promises);

    const removeIds = results
        .map((result, idx) => {
            if (result === false) {
                return pushes[idx].id;
            }
            return false;
        })
        .filter((id) => id !== false);

    if (removeIds.length === 0) return;

    await conn.deleteFrom('web_push').where('id', 'in', removeIds).execute();
};

export const sendNotification = async (
    userId: number,
    notification: NotificationPayload
) => {
    const pushes = await conn
        .selectFrom('web_push')
        .selectAll()
        .where('userId', '=', userId)
        .execute();

    await batchNotifications(notification, pushes);
};

export const sendNotificationToMultiple = async (
    userIds: number[],
    notification: NotificationPayload
) => {
    const pushes = await conn
        .selectFrom('web_push')
        .selectAll()
        .where('userId', 'in', userIds)
        .execute();

    await batchNotifications(notification, pushes);
};

export const sendNotificationToAll = async (notification: NotificationPayload) => {
    const pushes = await conn.selectFrom('web_push').selectAll().execute();

    await batchNotifications(notification, pushes);
};

export const asyncExists = async (path: string): Promise<boolean> => {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
};

export const uploadFile = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const path = Path.parse(file.name);
    const name = crypto.randomBytes(16).toString('hex') + path.ext;

    if (!(await asyncExists(FILE_FOLDER))) {
        await fs.mkdir(FILE_FOLDER);
    }

    await fs.writeFile(Path.join(FILE_FOLDER, name), Buffer.from(arrayBuffer));
    return name;
};

export type Cron =
    | [string, () => Awaitable<void>]
    | [string, () => Awaitable<void>, cron.TaskOptions];

/* eslint-disable no-console */
export const registerCrons = (crons: Cron[]) => {
    console.log('Registering crons...');

    for (const arr of crons) {
        cron.schedule(arr[0], arr[1], arr[2] ?? {});
    }

    console.log(`Registered ${crons.length} crons`);
};
/* eslint-enable no-console */
