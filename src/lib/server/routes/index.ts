import { router } from '../api';
import auth from './auth';
import permissions from './permissions';

export const r = router({
    auth,
    permissions
});

export type AppRouter = typeof r;
