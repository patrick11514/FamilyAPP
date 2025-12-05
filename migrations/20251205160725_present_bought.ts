/*eslint-disable @typescript-eslint/no-explicit-any*/

import { Kysely } from 'kysely';

export const up = async (conn: Kysely<any>) => {
    await conn.schema
        .alterTable('present')
        .addColumn('bought', 'integer', (col) => col.notNull().defaultTo(0))
        .execute();
};

export const down = async (conn: Kysely<any>) => {
    await conn.schema.alterTable('present').dropColumn('bought').execute();
};
