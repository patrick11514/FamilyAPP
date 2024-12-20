import { router } from '../api';
import auth from './auth';

export const r = router({
    auth
});

export type AppRouter = typeof r;
