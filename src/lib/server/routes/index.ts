import { router } from '../api';
import auth from './auth';
import groups from './groups';
import invitation from './invitation';
import permissions from './permissions';
import users from './users';
import debt from './debt';

export const r = router({
    auth,
    permissions,
    groups,
    users,
    invitation,
    debt
});

export type AppRouter = typeof r;
