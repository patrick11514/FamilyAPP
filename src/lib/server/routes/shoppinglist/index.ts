import { z } from 'zod';
import { loggedProcedure } from '../../api';
import { FormDataInput, type ErrorApiResponse } from '@patrick115/sveltekitapi';
import type { ErrorList } from '$/lib/errors';
import { MAX_FILE_SIZE } from '$env/static/private';
import { uploadFile } from '../../functions';
import { conn } from '../../variables';
import type { Response } from '$/types/types';

export default [
    loggedProcedure.PUT.input(FormDataInput).query(async ({ input, ctx }) => {
        const schema = z.object({
            name: z.string(),
            count: z.string()
        });

        const data = {
            name: input.get('name'),
            count: input.get('count')
        };

        const parsed = schema.safeParse(data);

        if (!parsed.success) {
            return {
                status: false,
                code: 401,
                message: 'shoppinglist.input' satisfies ErrorList
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

            fileName = await uploadFile(file);
        }

        try {
            await conn
                .insertInto('shoppinglist')
                .values({
                    name: parsed.data.name,
                    count: parseInt(parsed.data.count),
                    image: fileName,
                    user_id: ctx.id
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
                message: 'Něco se nepovedlo na serveru'
            } satisfies ErrorApiResponse;
        }
    })
];
