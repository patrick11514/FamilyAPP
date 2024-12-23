import type { AsyncReturnType, CreateContext } from '@patrick115/sveltekitapi';
import { getCookieData } from './functions';

export const context = (async ({ cookies }) => {
    return getCookieData(cookies);
}) satisfies CreateContext;

export type Context = AsyncReturnType<typeof context>;
