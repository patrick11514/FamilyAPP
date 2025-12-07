import type { ErrorList } from '$/lib/errors';
import type { Response } from '$/types/types';
import type { ErrorApiResponse } from '@patrick115/sveltekitapi';
import { z } from 'zod';
import { loggedProcedure } from '../../../api';
import { conn } from '../../../variables';

export default loggedProcedure.PATCH.input(
    z
        .object({
            bank_account_prefix: z
                .string()
                .nullable()
                .transform((val) => (val === '' ? null : val))
                .refine((val) => val === null || /^\d{0,10}$/.test(val), {
                    message: 'Předčíslí musí obsahovat pouze číslice'
                }),
            bank_account_number: z
                .string()
                .transform((val) => (val === '' ? null : val))
                .refine((val) => val === null || /^\d{1,20}$/.test(val), {
                    message: 'Číslo účtu musí obsahovat pouze číslice'
                }),
            bank_code: z
                .string()
                .transform((val) => (val === '' ? null : val))
                .refine((val) => val === null || /^\d{4}$/.test(val), {
                    message: 'Kód banky musí obsahovat právě 4 číslice'
                })
        })
        .refine(
            (data) => {
                // If either account_number or bank_code is provided, both must be provided
                const hasAccountNumber = data.bank_account_number !== null;
                const hasBankCode = data.bank_code !== null;
                return hasAccountNumber === hasBankCode;
            },
            {
                message: 'Číslo účtu a kód banky musí být zadány společně',
                path: ['bank_account_number']
            }
        )
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
