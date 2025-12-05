/*eslint-disable @typescript-eslint/no-explicit-any*/

import { Kysely, sql } from 'kysely';

export const up = async (conn: Kysely<any>) => {
    await conn.schema
        .alterTable('present')
        .addColumn('created_at', 'timestamp', (col) =>
            col.notNull().defaultTo(sql`current_timestamp()`)
        )
        .addColumn('updated_at', 'timestamp', (col) =>
            col.modifyFront(sql`NULL`).defaultTo(sql`NULL`)
        )
        .execute();
};

export const down = async (conn: Kysely<any>) => {
    await conn.schema.alterTable('present').dropColumn('created_at').execute();
    await conn.schema.alterTable('present').dropColumn('updated_at').execute();
};
