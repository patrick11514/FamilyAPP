/*eslint-disable @typescript-eslint/no-explicit-any*/

import { Kysely, sql } from 'kysely';

export const up = async (conn: Kysely<any>) => {
    await conn.schema
        .createTable('user')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('username', 'varchar(50)', (col) => col.notNull())
        .addColumn('firstname', 'varchar(50)', (col) => col.notNull())
        .addColumn('lastname', 'varchar(50)', (col) => col.notNull())
        .addColumn('password', 'varchar(60)', (col) => col.notNull())
        .execute();

    await conn.schema
        .createTable('calendar')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('user_id', 'integer', (col) => col.notNull().references('user.id'))
        .addColumn('from', 'datetime', (col) => col.notNull())
        .addColumn('to', 'datetime', (col) => col.notNull())
        .addColumn('name', 'varchar(50)', (col) => col.notNull())
        .addColumn('description', 'varchar(255)')
        .addColumn('full_day', sql`bit(1)`, (col) => col.notNull())
        .execute();

    await conn.schema
        .createTable('debt')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('who', 'integer', (col) => col.notNull().references('user.id'))
        .addColumn('whom', 'integer', (col) => col.notNull().references('user.id'))
        .addColumn('price', 'decimal(20, 5)', (col) => col.notNull())
        .addColumn('photo', 'varchar(255)')
        .addColumn('when', 'timestamp', (col) =>
            col.notNull().defaultTo(sql`current_timestamp()`)
        )
        .addColumn('resolved_on', 'timestamp', (col) =>
            col.modifyFront(sql`NULL`).defaultTo(sql`NULL`)
        )
        .execute();

    await conn.schema
        .createTable('group')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('name', 'varchar(25)', (col) => col.notNull())
        .addColumn('bg_color', 'varchar(7)', (col) => col.notNull())
        .addColumn('text_color', 'varchar(7)', (col) => col.notNull())
        .execute();

    await conn.schema
        .createTable('group_permissions')
        .addColumn('group_id', 'integer', (col) => col.notNull().references('group.id'))
        .addColumn('permission', 'varchar(255)', (col) => col.notNull())
        .addPrimaryKeyConstraint('group_permission', ['group_id', 'permission'])
        .execute();

    await conn.schema
        .createTable('invitation')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('code', 'varchar(10)', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) =>
            col.notNull().defaultTo(sql`current_timestamp()`)
        )
        .addColumn('user_id', 'integer', (col) => col.notNull().references('user.id'))
        .execute();

    await conn.schema
        .createTable('present')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('user_id', 'integer', (col) => col.notNull().references('user.id'))
        .addColumn('name', 'varchar(50)', (col) => col.notNull())
        .addColumn('description', 'varchar(255)')
        .addColumn('link', 'varchar(512)')
        .addColumn('image', 'varchar(125)')
        .addColumn('price', 'decimal(20, 5)', (col) => col.notNull())
        .addColumn('reserved_id', 'integer', (col) => col.references('user.id'))
        .addColumn('state', 'integer', (col) => col.notNull().defaultTo(0))
        .execute();

    await conn.schema
        .createTable('user_group')
        .addColumn('user_id', 'integer', (col) => col.notNull().references('user.id'))
        .addColumn('group_id', 'integer', (col) => col.notNull().references('group.id'))
        .addPrimaryKeyConstraint('user_group', ['user_id'])
        .execute();

    await conn.schema
        .createTable('web_push')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('userId', 'integer', (col) => col.notNull().references('user.id'))
        .addColumn('endpoint', 'varchar(512)', (col) => col.notNull())
        .addColumn('p256dh', 'varchar(255)', (col) => col.notNull())
        .addColumn('auth', 'varchar(255)', (col) => col.notNull())
        .execute();
};

export const down = async (conn: Kysely<any>) => {
    await conn.schema.dropTable('web_push').execute();
    await conn.schema.dropTable('user_group').execute();
    await conn.schema.dropTable('present').execute();
    await conn.schema.dropTable('invitation').execute();
    await conn.schema.dropTable('group_permissions').execute();
    await conn.schema.dropTable('group').execute();
    await conn.schema.dropTable('debt').execute();
    await conn.schema.dropTable('calendar').execute();
    await conn.schema.dropTable('user').execute();
};
