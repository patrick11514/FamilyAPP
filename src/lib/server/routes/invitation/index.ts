import type { ResponseWithData } from '$/types/types';
import type { ErrorApiResponse } from '@patrick115/sveltekitapi';
import { conn } from '../../variables';
import { userProcedure } from '../users';
import crypto from 'node:crypto';

export default [
    userProcedure.GET.query(async () => {
        const code = crypto.randomBytes(5).toString('hex');

        try {
            await conn
                .insertInto('invitation')
                .values({
                    code
                })
                .execute();

            return {
                status: true,
                data: code
            } satisfies ResponseWithData<string>;
        } catch (err) {
            console.error(err);
            return {
                status: false,
                code: 500,
                message: ''
            } satisfies ErrorApiResponse;
        }
    })
];
