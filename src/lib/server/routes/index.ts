import { router } from '../api';
import auth from './auth';
import groups from './groups';
import invitation from './invitation';
import permissions from './permissions';
import users from './users';
import debt from './debt';
import push from './push';
import calendar from './calendar';

export const r = router({
    auth,
    permissions,
    groups,
    users,
    invitation,
    debt,
    push,
    calendar
});

export type AppRouter = typeof r;
