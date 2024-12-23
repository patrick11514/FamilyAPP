import type { DePromise, ResponseWithData } from '$/types/types';
import { loggedProcedure } from '../../api';
import { getUserPermissions } from '../../functions';

export default loggedProcedure.GET.query(async ({ ctx }) => {
    return {
        status: true,
        data: await getUserPermissions(ctx.id)
    } satisfies ResponseWithData<DePromise<ReturnType<typeof getUserPermissions>>>;
});
