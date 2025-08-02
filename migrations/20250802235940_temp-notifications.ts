/*eslint-disable @typescript-eslint/no-explicit-any*/

import { Kysely } from 'kysely';

export const up = async (conn: Kysely<any>) => {
    //"array" of users, which have enabled temperature notifications
    await conn.schema
        .createTable('enabled_temp_notifications')
        .addColumn('userId', 'integer', (col) =>
            col.primaryKey().references('user.id').notNull()
        )
        .execute();
};

export const down = async (conn: Kysely<any>) => {
    await conn.schema.dropTable('enabled_temp_notifications').execute();
};
