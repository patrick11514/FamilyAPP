import { z } from 'zod';
import { loggedProcedure } from '../../api';
import { FormDataInput, type ErrorApiResponse } from '@patrick115/sveltekitapi';
import type { ErrorList } from '$/lib/errors';
import { MAX_FILE_SIZE } from '$env/static/private';
import { uploadFile } from '../../functions';
import type { Response } from '$/types/types';
import { conn } from '../../variables';

export default [
    loggedProcedure.PUT.input(FormDataInput).query(async ({ input, ctx }) => {
        if (!input.has('name') || !input.has('description') || !input.has('link') || !input.has('price')) {
            return {
                status: false,
                code: 401,
                message: 'presents.input' satisfies ErrorList
            };
        }

        const schema = z.object({
            name: z.string(),
            description: z.string().nullable(),
            link: z.string().nullable(),
            price: z.coerce.number().min(0, 'debt.negative' satisfies ErrorList)
        });

        const data = schema.safeParse({
            name: input.get('name'),
            description: input.get('description') || null,
            link: input.get('link') || null,
            price: input.get('price')
        });

        if (!data.success) {
            return {
                status: false,
                code: 401,
                message: 'presents.input' satisfies ErrorList
            };
        }

        const file = input.get('image');

        let fileName: string | undefined = undefined;

        if (file) {
            if (typeof file === 'string') {
                return {
                    status: false,
                    code: 401,
                    message: 'presents.file' satisfies ErrorList
                };
            }

            if (file.size > parseInt(MAX_FILE_SIZE)) {
                return {
                    status: false,
                    code: 401,
                    message: 'presents.size' satisfies ErrorList
                };
            }

            fileName = await uploadFile(file);
        }

        try {
            await conn
                .insertInto('present')
                .values({
                    user_id: ctx.id,
                    image: fileName,
                    ...data.data
                })
                .execute();

            return {
                status: true
            } satisfies Response;
        } catch (err) {
            if (err instanceof Error) {
                if ('code' in err) {
                    if (err.code === 'ER_WARN_DATA_OUT_OF_RANGE') {
                        return {
                            status: false,
                            code: 401,
                            message: 'presents.range' satisfies ErrorList
                        } satisfies ErrorApiResponse;
                    }
                }
            }

            console.error(err);
            return {
                status: false,
                code: 500,
                message: 'Něco se nepovedlo na serveru'
            } satisfies ErrorApiResponse;
        }
    })
];
