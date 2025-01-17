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

const uploadFile = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const path = Path.parse(file.name);
    const name = crypto.randomBytes(16).toString('hex') + path.ext;

    if (!fs.existsSync(FILE_FOLDER)) {
        fs.mkdirSync(FILE_FOLDER);
    }

    fs.writeFileSync(Path.join(FILE_FOLDER, name), Buffer.from(arrayBuffer));
    return name;
};

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

            fileName = await uploadFile(file);
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
            } satisfies Response;
        } catch (err) {
            if (err instanceof Error) {
                if ('code' in err) {
                    if (err.code === 'ER_WARN_DATA_OUT_OF_RANGE') {
                        return {
                            status: false,
                            code: 401,
                            message: 'debt.range' satisfies ErrorList
                        } satisfies ErrorApiResponse;
                    }
                }
            }
            return {
                status: false,
                code: 500,
                message: 'Něco se nepovedlo na serveru'
            } satisfies ErrorApiResponse;
        }
    }),
    loggedProcedure.DELETE.input(z.number()).query(async ({ ctx, input }) => {
        try {
            conn.deleteFrom('debt')
                .where((eb) => eb.and([eb('id', '=', input), eb('whom', '=', ctx.id)]))
                .execute();
            return {
                status: true
            } satisfies Response;
        } catch (err) {
            console.error(err);
            return {
                status: false,
                code: 500,
                message: ''
            } satisfies ErrorApiResponse;
        }
    }),
    loggedProcedure.PATCH.input(FormDataInput).query(async ({ input, ctx }) => {
        if (!input.has('id')) {
            return {
                status: false,
                code: 401,
                message: 'debt.input' satisfies ErrorList
            } satisfies ErrorApiResponse;
        }

        const schema = z.object({
            id: z.coerce.number(),
            who: z.coerce.number().optional(),
            amount: z.coerce
                .number()
                .min(0, 'debt.negative' satisfies ErrorList)
                .optional(),
            when: z.string().optional()
        });

        const data = schema.safeParse({
            id: input.get('id'),
            who: input.get('who') ?? undefined,
            amount: input.get('amount') ?? undefined,
            when: input.get('when') ?? undefined
        });

        if (!data.success) {
            return {
                status: false,
                code: 401,
                message: 'debt.input' satisfies ErrorList
            } satisfies ErrorApiResponse;
        }

        //get current fileName
        const debt = await conn
            .selectFrom('debt')
            .select('photo')
            .where((eb) => eb.and([eb('id', '=', data.data.id), eb('whom', '=', ctx.id)]))
            .executeTakeFirst();
        if (!debt) {
            return {
                status: false,
                code: 401,
                message: 'debt.input' satisfies ErrorList
            } satisfies ErrorApiResponse;
        }

        let fileName: string | null | undefined = undefined;

        //check if file is deleted, or added
        if (input.has('image')) {
            const file = input.get('image')!;

            if (typeof file === 'string') {
                if (file === 'deleted') {
                    if (debt.photo) {
                        fs.rmSync(Path.join(FILE_FOLDER, debt.photo));
                        fileName = null;
                    }
                }
            } else {
                if (file.size > parseInt(MAX_FILE_SIZE)) {
                    return {
                        status: false,
                        code: 401,
                        message: 'debt.size' satisfies ErrorList
                    } satisfies ErrorApiResponse;
                }

                fileName = await uploadFile(file);
            }
        }

        try {
            //update data
            await conn
                .updateTable('debt')
                .set({
                    ...data.data,
                    when: data.data.when ? new Date(data.data.when) : undefined,
                    photo: fileName
                })
                .where('id', '=', data.data.id)
                .execute();

            return {
                status: true
            } satisfies Response;
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
