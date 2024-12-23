import type { Response } from '$/types/types';
import { loggedProcedure } from '../../api';

export default loggedProcedure.GET.query(async ({ ev: { cookies } }) => {
    cookies.delete('session', {
        path: '/'
    });

    return {
        status: true
    } satisfies Response;
});
