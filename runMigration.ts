/* eslint-disable no-console */

import { Migrator, FileMigrationProvider, MysqlDialect, Kysely } from 'kysely';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createPool } from 'mysql2';
dotenv.config();

const dialect = new MysqlDialect({
    pool: createPool({
        host: process.env.DATABASE_IP,
        port: parseInt(process.env.DATABASE_PORT!),
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
    })
});

const conn = new Kysely({ dialect });
const migrator = new Migrator({
    db: conn,
    provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.resolve(import.meta.dirname, './migrations')
    })
});

async function runMigrations() {
    const result = await migrator.migrateToLatest();

    if (result.error) {
        console.error('Migration failed:', result.error);
        process.exit(1);
    }

    console.log('Migrations applied successfully.');
}

async function downMigration() {
    const result = await migrator.migrateDown();

    if (result.error) {
        console.error('Rollback failed:', result.error);
        process.exit(1);
    }

    console.log('Rollback successful.');
}

if (process.argv.includes('--rollback')) {
    downMigration().then(() => process.exit(0));
} else {
    runMigrations().then(() => process.exit(0));
}
