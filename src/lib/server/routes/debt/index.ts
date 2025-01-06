import { z } from 'zod';
import { loggedProcedure } from '../../api';
import { FormDataInput, type ErrorApiResponse } from '@patrick115/sveltekitapi';
import fs from 'node:fs';
import crypto from 'node:crypto';
import Path from 'node:path';
import type { ErrorList } from '$/lib/errors';
import { FILE_FOLDER, MAX_FILE_SIZE } from '$env/static/private';
import { conn } from '../../variables';
import type { Response } from '$/types/types';

export default [
    loggedProcedure.PUT.input(FormDataInput).query(async ({ input, ctx }) => {
        if (!input.has('who') || !input.has('amount') || !input.has('when')) {
            return {
                status: false,
                code: 401,
                message: 'debt.input' satisfies ErrorList
            } satisfies ErrorApiResponse;
        }

        const schema = z.object({
            who: z.coerce.number(),
            amount: z.coerce.number().min(0, 'debt.negative' satisfies ErrorList),
            when: z.string()
        });

        const data = schema.safeParse({
            who: input.get('who'),
            amount: input.get('amount'),
            when: input.get('when')
        });

        if (!data.success) {
            return {
                status: false,
                code: 401,
                message: 'debt.input' satisfies ErrorList
            } satisfies ErrorApiResponse;
        }

        let fileName: string | undefined = undefined;
        //handle file
        if (input.has('image')) {
            const file = input.get('image')!;
            if (typeof file === 'string') {
                return {
                    status: false,
                    code: 401,
                    message: 'debt.file' satisfies ErrorList
                } satisfies ErrorApiResponse;
            }

            if (file.size > parseInt(MAX_FILE_SIZE)) {
                return {
                    status: false,
                    code: 401,
                    message: 'debt.size' satisfies ErrorList
                } satisfies ErrorApiResponse;
            }

            const arrayBuffer = await file.arrayBuffer();
            const path = Path.parse(file.name);
            const name = crypto.randomBytes(16).toString('hex') + path.ext;

            if (!fs.existsSync(FILE_FOLDER)) {
                fs.mkdirSync(FILE_FOLDER);
            }

            fs.writeFileSync(Path.join(FILE_FOLDER, name), Buffer.from(arrayBuffer));

            fileName = name;
        }

        try {
            await conn
                .insertInto('debt')
                .values({
                    who: data.data.who,
                    whom: ctx.id,
                    price: data.data.amount,
                    photo: fileName,
                    when: new Date(data.data.when)
                })
                .execute();

            return {
                status: true
            } satisfies Response
        } catch (err) {
            console.error(err);
            return {
                status: false,
                code: 500,
                message: 'Něco se nepovedlo na serveru'
            } satisfies ErrorApiResponse;
        }
    })
];
