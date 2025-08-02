import type { PageServerLoad } from './$types';
import fs from 'node:fs';

export const load = (async () => {
    const files = fs
        .readdirSync('./changelog')
        .map((file) => fs.readFileSync(`./changelog/${file}`, 'utf-8'));

    return {
        changelog: files.toReversed()
    };
}) satisfies PageServerLoad;
