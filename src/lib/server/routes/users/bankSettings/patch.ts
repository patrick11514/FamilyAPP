import type { Response } from '$/types/types';
import type { ErrorApiResponse } from '@patrick115/sveltekitapi';
import { z } from 'zod';
import { loggedProcedure } from '../../../api';
import { conn } from '../../../variables';

export default loggedProcedure.PATCH.input(
    z.object({
        bank_account_prefix: z.string().nullable(),
        bank_account_number: z.string().nullable(),
        bank_code: z.string().nullable()
    })
).query(async ({ ctx, input }) => {
    try {
        await conn
            .updateTable('user')
            .set({
                bank_account_prefix: input.bank_account_prefix,
                bank_account_number: input.bank_account_number,
                bank_code: input.bank_code
            })
            .where('id', '=', ctx.id)
            .execute();

        return {
            status: true
        } satisfies Response;
    } catch (err) {
        console.error(err);
        return {
            status: false,
            code: 500,
            message: 'Nepovedlo se uložit nastavení účtu'
        } satisfies ErrorApiResponse;
    }
});
