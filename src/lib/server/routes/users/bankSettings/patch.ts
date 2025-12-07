import type { ErrorList } from '$/lib/errors';
import type { Response } from '$/types/types';
import type { ErrorApiResponse } from '@patrick115/sveltekitapi';
import { z } from 'zod';
import { loggedProcedure } from '../../../api';
import { conn } from '../../../variables';

export default loggedProcedure.PATCH.input(
    z.object({
        bank_account_prefix: z
            .string()
            .regex(/^\d{0,10}$/, 'Předčíslí musí obsahovat pouze číslice')
            .nullable()
            .transform((val) => (val === '' ? null : val)),
        bank_account_number: z
            .string()
            .regex(/^\d{1,20}$/, 'Číslo účtu musí obsahovat pouze číslice')
            .nullable()
            .transform((val) => (val === '' ? null : val)),
        bank_code: z
            .string()
            .regex(/^\d{4}$/, 'Kód banky musí obsahovat právě 4 číslice')
            .nullable()
            .transform((val) => (val === '' ? null : val))
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
            message: 'server.error' satisfies ErrorList
        } satisfies ErrorApiResponse;
    }
});
