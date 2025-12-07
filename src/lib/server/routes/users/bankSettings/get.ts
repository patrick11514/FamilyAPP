import type { ErrorList } from '$/lib/errors';
import type { ResponseWithData } from '$/types/types';
import type { ErrorApiResponse } from '@patrick115/sveltekitapi';
import { loggedProcedure } from '../../../api';
import { conn } from '../../../variables';

export default loggedProcedure.GET.query(async ({ ctx }) => {
    const user = await conn
        .selectFrom('user')
        .select(['bank_account_prefix', 'bank_account_number', 'bank_code'])
        .where('id', '=', ctx.id)
        .executeTakeFirst();

    if (!user) {
        return {
            status: false,
            code: 404,
            message: 'users.notFound' satisfies ErrorList
        } satisfies ErrorApiResponse;
    }

    return {
        status: true,
        data: user
    } satisfies ResponseWithData<typeof user>;
});
