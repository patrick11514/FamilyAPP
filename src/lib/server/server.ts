import { APIServer } from '@patrick115/sveltekitapi';
import { context } from './context';
import { r } from './routes/index';

export const Server = new APIServer({
    router: r,
    path: '/api',
    context
});
