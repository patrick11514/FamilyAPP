/*eslint-disable @typescript-eslint/no-explicit-any*/

import { Kysely } from 'kysely';

export const up = async (conn: Kysely<any>) => {
    await conn.schema
        .alterTable('timetable_entry')
        .addColumn('room', 'varchar(20)')
        .execute();
};

export const down = async (conn: Kysely<any>) => {
    await conn.schema.alterTable('timetable_entry').dropColumn('room').execute();
};
