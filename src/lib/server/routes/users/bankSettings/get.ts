import type { ResponseWithData } from '$/types/types';
import { loggedProcedure } from '../../../api';
import { conn } from '../../../variables';

export default loggedProcedure.GET.query(async ({ ctx }) => {
    const user = await conn
        .selectFrom('user')
        .select(['bank_account_prefix', 'bank_account_number', 'bank_code'])
        .where('id', '=', ctx.id)
        .executeTakeFirst();

    return {
        status: true,
        data: user ?? null
    } satisfies ResponseWithData<typeof user>;
});
