import { z } from 'zod';
import { loggedProcedure } from '../../api';
import { FormDataInput, type ErrorApiResponse } from '@patrick115/sveltekitapi';
import type { ErrorList } from '$/lib/errors';
import { MAX_FILE_SIZE } from '$env/static/private';
import { uploadFile } from '../../functions';
import type { Response, ResponseWithData } from '$/types/types';
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
    }),
    loggedProcedure.PATCH.input(
        z.object({
            id: z.number(),
            toState: z.literal(0).or(z.literal(1)).or(z.literal(2)) // 0 - we want to untaken it, 1 - taken, 2 - given
        })
    ).query(async ({ input, ctx }) => {
        const present = await conn.selectFrom('present').selectAll().where('id', '=', input.id).executeTakeFirst();
        if (!present) {
            return {
                status: false,
                code: 401,
                message: 'presents.notFound' satisfies ErrorList
            } satisfies ErrorApiResponse;
        }

        if (present.user_id === ctx.id) {
            return {
                status: false,
                code: 401,
                message: 'presents.own' satisfies ErrorList
            } satisfies ErrorApiResponse;
        }

        //Possible states
        // 0 -> 1 We want to take package, but we need to check, if it's not already taken (eg state != 0)
        // 1 -> 0 We want to untake package, but we need to check, if we are the one who took it (eg reserved_id == ctx.id)
        // 1 -> 2 We want to complete package, but we need to check, if we are the one who took it (eg reserved_id == ctx.id)
        // 2 -> 1 We want to uncomplete package, but we need to check, if we are the one who completed it (eg reserved_id == ctx.id)
        // and error will be presents.input

        if (input.toState === 1) {
            if (present.state === 2 && present.reserved_id !== ctx.id) {
                return {
                    status: false,
                    code: 401,
                    message: 'presents.input' satisfies ErrorList
                } satisfies ErrorApiResponse;
            }
        }

        ///@TODO

        try {
            await conn
                .updateTable('present')
                .set({
                    state: input.toState,
                    reserved_id: input.toState === 0 ? null : ctx.id
                })
                .execute();

            const newData = (await conn.selectFrom('present').selectAll().where('id', '=', input.id).executeTakeFirst())!;
            return {
                status: true,
                data: newData
            } satisfies ResponseWithData<typeof newData>;
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
