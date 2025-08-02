/*eslint-disable @typescript-eslint/no-explicit-any*/

import { Kysely, sql } from 'kysely';

export const up = async (conn: Kysely<any>) => {
    await conn.schema
        .createTable('shoppinglist')
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('name', 'varchar(125)', (col) => col.notNull())
        .addColumn('count', 'integer', (col) => col.notNull())
        .addColumn('user_id', 'integer', (col) => col.references('user.id').notNull())
        .addColumn('created_at', 'timestamp', (col) =>
            col.notNull().defaultTo(sql`current_timestamp()`)
        )
        .addColumn('image', 'varchar(255)')
        .addColumn('bought_by', 'integer', (col) => col.references('user.id'))
        .addColumn('bought_at', 'timestamp', (col) =>
            col.modifyFront(sql`NULL`).defaultTo(sql`NULL`)
        )
        .execute();
};

export const down = async (conn: Kysely<any>) => {
    await conn.schema.dropTable('shoppinglist').execute();
};
