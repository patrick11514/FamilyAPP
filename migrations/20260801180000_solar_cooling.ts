/*eslint-disable @typescript-eslint/no-explicit-any*/

import { Kysely, sql } from 'kysely';

export const up = async (conn: Kysely<any>) => {
    await conn.schema
        .createTable('solar_cooling')
        .addColumn('id', 'integer', (col) => col.primaryKey())
        .addColumn('enabled', 'integer', (col) => col.notNull().defaultTo(0))
        .addColumn('max_temp', 'decimal(5, 2)', (col) => col.notNull().defaultTo(75.0))
        .addColumn('down_temp', 'decimal(5, 2)', (col) => col.notNull().defaultTo(60.0))
        .addColumn('overheat_temp', 'decimal(5, 2)', (col) =>
            col.notNull().defaultTo(80.0)
        )
        .addColumn('freeze_temp', 'decimal(5, 2)', (col) =>
            col.notNull().defaultTo(-15.0)
        )
        .addColumn('freeze_target_temp', 'decimal(5, 2)', (col) =>
            col.notNull().defaultTo(-10.0)
        )
        .addColumn('active_override', 'varchar(50)')
        .addColumn('last_action', 'varchar(255)')
        .addColumn('last_action_at', 'datetime')
        .addColumn('updated_at', 'datetime')
        .execute();

    // Insert initial default configuration row
    await conn
        .insertInto('solar_cooling')
        .values({
            id: 1,
            enabled: 0,
            max_temp: '75.0',
            down_temp: '60.0',
            overheat_temp: '80.0',
            freeze_temp: '-15.0',
            freeze_target_temp: '-10.0',
            updated_at: sql`NOW()`
        })
        .execute();
};

export const down = async (conn: Kysely<any>) => {
    await conn.schema.dropTable('solar_cooling').execute();
};
