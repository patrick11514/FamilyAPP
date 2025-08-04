/*eslint-disable @typescript-eslint/no-explicit-any*/

import { Kysely } from 'kysely';

export const up = async (conn: Kysely<any>) => {
    // Create table to track temperature notification state
    // This table will have only one row to store the current state
    await conn.schema
        .createTable('temp_notification_state')
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('current_state', 'varchar(10)', (col) =>
            col.notNull().defaultTo('NORMAL')
        )
        .addColumn('last_temp', 'decimal(5,2)', (col) => col.notNull().defaultTo(0))
        .addColumn('last_check', 'timestamp', (col) =>
            col.notNull().defaultTo('CURRENT_TIMESTAMP')
        )
        .execute();

    // Insert initial state
    await conn
        .insertInto('temp_notification_state')
        .values({
            current_state: 'NORMAL',
            last_temp: 30,
            last_check: new Date()
        })
        .execute();
};

export const down = async (conn: Kysely<any>) => {
    await conn.schema.dropTable('temp_notification_state').execute();
};
