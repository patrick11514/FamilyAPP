import { router } from '../api';
import auth from './auth';
import groups from './groups';
import permissions from './permissions';

export const r = router({
    auth,
    permissions,
    groups
});

export type AppRouter = typeof r;
