/*eslint-disable @typescript-eslint/no-explicit-any*/

import { Kysely } from 'kysely';

export const up = async (conn: Kysely<any>) => {
    await conn.schema
        .createTable('timetable_entry')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('user_id', 'integer', (col) =>
            col.notNull().references('user.id').onDelete('cascade')
        )
        .addColumn('day', 'integer', (col) => col.notNull()) // 0=Mon, 6=Sun
        .addColumn('start_min', 'integer', (col) => col.notNull()) // minutes from midnight
        .addColumn('end_min', 'integer', (col) => col.notNull()) // minutes from midnight
        .addColumn('title', 'varchar(100)', (col) => col.notNull())
        .addColumn('type', 'varchar(20)', (col) => col.notNull()) // 'lecture' | 'practice'
        .addColumn('subject', 'varchar(100)', (col) => col.notNull())
        .execute();

    await conn.schema
        .createTable('daily_routine')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('user_id', 'integer', (col) =>
            col.notNull().references('user.id').onDelete('cascade')
        )
        .addColumn('day', 'integer', (col) => col.notNull())
        .addColumn('wake_time', 'integer') // minutes from midnight
        .addColumn('transport_morning_type', 'varchar(20)') // 'bus' | 'car'
        .addColumn('transport_morning_time', 'integer')
        .addColumn('transport_evening_type', 'varchar(20)') // 'bus' | 'car'
        .addColumn('transport_evening_time', 'integer')
        .addColumn('home_arrival_time', 'integer')
        .execute();
};

export const down = async (conn: Kysely<any>) => {
    await conn.schema.dropTable('daily_routine').execute();
    await conn.schema.dropTable('timetable_entry').execute();
};
