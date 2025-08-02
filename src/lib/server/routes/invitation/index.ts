import type { Response, ResponseWithData } from '$/types/types';
import type { ErrorApiResponse } from '@patrick115/sveltekitapi';
import { conn } from '../../variables';
import { userProcedure } from '../users';
import crypto from 'node:crypto';
import { procedure } from '../../api';
import { z } from 'zod';
import type { ErrorList } from '$/lib/errors';
import bcrypt from 'bcrypt';
import { HASH_ROUNDS } from '$env/static/private';

export default [
    userProcedure.GET.query(async ({ ctx }) => {
        const code = crypto.randomBytes(5).toString('hex');

        try {
            await conn
                .insertInto('invitation')
                .values({
                    code,
                    user_id: ctx.id
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
    }),
    procedure.POST.input(
        z.object({
            username: z.string().trim(),
            firstname: z.string().trim(),
            lastname: z.string().trim(),
            password: z.string().trim(),
            code: z.string()
        })
    ).query(async ({ input }) => {
        const invitation = await conn
            .selectFrom('invitation')
            .selectAll()
            .where('code', '=', input.code)
            .executeTakeFirst();
        if (!invitation) {
            return {
                status: false,
                code: 401,
                message: 'invitation.code' satisfies ErrorList
            } satisfies ErrorApiResponse;
        }

        const user = await conn
            .selectFrom('user')
            .select('id')
            .where('username', '=', input.username)
            .executeTakeFirst();

        if (user) {
            return {
                status: false,
                code: 401,
                message: 'auth.register.username' satisfies ErrorList
            } satisfies ErrorApiResponse;
        }

        const hashed = bcrypt.hashSync(input.password, parseInt(HASH_ROUNDS));

        try {
            await conn.deleteFrom('invitation').where('code', '=', input.code).execute();

            await conn
                .insertInto('user')
                .values({
                    username: input.username,
                    firstname: input.firstname,
                    lastname: input.lastname,
                    password: hashed
                })
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
