import type { DB } from '$/types/database';
import { JWT_SECRET, DATABASE_NAME, DATABASE_IP, DATABASE_PASSWORD, DATABASE_PORT, DATABASE_USER, PRIVATE_VAPI_KEY } from '$env/static/private';
import { PUBLIC_VAPI_KEY } from '$env/static/public';
import { JWTCookies } from './cookies/main';
import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import webPush from 'web-push';

export const jwt = new JWTCookies(JWT_SECRET);
const dialect = new MysqlDialect({
    pool: createPool({
        host: DATABASE_IP,
        port: parseInt(DATABASE_PORT),
        user: DATABASE_USER,
        password: DATABASE_PASSWORD,
        database: DATABASE_NAME
    })
});

export const conn = new Kysely<DB>({
    dialect
});

export const VAPI = {
    publicKey: PUBLIC_VAPI_KEY,
    privateKey: PRIVATE_VAPI_KEY
};

webPush.setVapidDetails('mailto:ja@patrick115.eu', VAPI.publicKey, VAPI.privateKey);

export const VERSION = process.env.npm_package_version;
