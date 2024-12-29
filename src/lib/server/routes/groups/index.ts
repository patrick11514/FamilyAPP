import type { Permission } from '$/lib/permissions';
import type { ResponseWithData } from '$/types/types';
import { z } from 'zod';
import { permProcedure } from '../../api';
import { conn } from '../../variables';
import { hexColor } from '../../functions';

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
        conn.insertInto('group').values(input).execute();
    })
];
