import { router } from '../api';
import auth from './auth';
import groups from './groups';
import invitation from './invitation';
import permissions from './permissions';
import users from './users';

export const r = router({
    auth,
    permissions,
    groups,
    users,
    invitation
});

export type AppRouter = typeof r;
