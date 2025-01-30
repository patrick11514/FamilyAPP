import { getCookieData } from '$/lib/server/functions';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { conn } from '$/lib/server/variables';

export const load = (async ({ cookies, parent }) => {
    if (!getCookieData(cookies).logged) {
        redirect(302, '/');
    }

    const parentData = await parent();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const afterWeek = new Date(startOfDay);
    afterWeek.setDate(afterWeek.getDate() + 7);

    return {
        recentEvents: conn
            .selectFrom('calendar')
            .selectAll()
            .where((eb) => eb.or([eb.and([eb('to', '>=', startOfDay), eb('from', '<=', startOfDay)]), eb.and([eb('from', '>=', startOfDay), eb('from', '<', afterWeek)])]))
            .limit(5)
            .orderBy('from', 'desc')
            .execute()
            .then((events) =>
                events.map((event) => {
                    return {
                        ...event,
                        full_day: {
                            data: [event.full_day.at(0)] as [0 | 1]
                        }
                    };
                })
            ),
        users: await conn.selectFrom('user').select(['id', 'username', 'firstname', 'lastname']).execute(),
        version: parentData.version
    };
}) satisfies LayoutServerLoad;
