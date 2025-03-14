import { router } from '../api';
import auth from './auth';
import groups from './groups';
import invitation from './invitation';
import permissions from './permissions';
import users from './users';
import debt from './debt';
import push from './push';
import calendar from './calendar';
import presents from './presents';
import shoppinglist from './shoppinglist';

export const r = router({
    auth,
    permissions,
    groups,
    users,
    invitation,
    debt,
    push,
    calendar,
    presents,
    shoppinglist
});

export type AppRouter = typeof r;
