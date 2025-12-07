/*eslint-disable @typescript-eslint/no-explicit-any*/

import { Kysely } from 'kysely';

export const up = async (conn: Kysely<any>) => {
    await conn.schema
        .alterTable('user')
        .addColumn('bank_account_prefix', 'varchar(10)')
        .execute();

    await conn.schema
        .alterTable('user')
        .addColumn('bank_account_number', 'varchar(20)')
        .execute();

    await conn.schema.alterTable('user').addColumn('bank_code', 'varchar(4)').execute();
};

export const down = async (conn: Kysely<any>) => {
    await conn.schema.alterTable('user').dropColumn('bank_account_prefix').execute();
    await conn.schema.alterTable('user').dropColumn('bank_account_number').execute();
    await conn.schema.alterTable('user').dropColumn('bank_code').execute();
};
