import type { Permission } from '$/lib/permissions';
import type { Response, ResponseWithData } from '$/types/types';
import { z } from 'zod';
import { permProcedure } from '../../api';
import { conn } from '../../variables';
import { hexColor } from '../../functions';
import type { ErrorApiResponse } from '@patrick115/sveltekitapi';

export const GROUP_PERMISSION = 'admin.groups' as Permission;

const groupProcedure = permProcedure([GROUP_PERMISSION]);

export default [
    groupProcedure.GET.query(async () => {
        const groups = await conn.selectFrom('group').selectAll().execute();
        return {
            status: true,
            data: groups
        } satisfies ResponseWithData<typeof groups>;
    }),
    groupProcedure.PUT.input(
        z.object({
            name: z.string(),
            bg_color: hexColor,
            text_color: hexColor
        })
    ).query(async ({ input }) => {
        try {
            const result = await conn.insertInto('group').values(input).execute();
            return {
                status: true,
                data: Number(result[0].insertId!)
            } satisfies ResponseWithData<number>;
        } catch (err) {
            console.error(err);
            return {
                status: false,
                code: 500,
                message: 'Něco se nepovedlo na serveru :('
            } satisfies ErrorApiResponse;
        }
    }),
    groupProcedure.DELETE.input(z.number()).query(async ({ input }) => {
        try {
            await conn.deleteFrom('group').where('id', '=', input).execute();
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
    groupProcedure.PATCH.input(
        z.object({
            id: z.number(),
            name: z.string(),
            bg_color: hexColor,
            text_color: hexColor
        })
    ).query(async ({ input }) => {
        try {
            await conn
                .updateTable('group')
                .set(input)
                .where('id', '=', input.id)
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
