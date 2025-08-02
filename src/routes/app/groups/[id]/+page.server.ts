import { conn } from '$/lib/server/variables';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Group } from '$/types/database';
import type { Selectable } from 'kysely';

export const load = (async ({ params }) => {
    const id = parseInt(params.id);
    if (isNaN(id)) redirect(302, '/app/groups');
    //check
    const data = await conn
        .selectFrom('group')
        .innerJoin('group_permissions', 'group.id', 'group_id')
        .selectAll()
        .where('id', '=', id)
        .execute();
    if (data.length === 0) redirect(302, '/app/groups');

    const groupData = {
        id: -1,
        name: '',
        bg_color: '',
        text_color: '',
        permissions: [] as string[]
    } satisfies Selectable<Group> & {
        permissions: string[];
    };

    for (const item of data) {
        groupData.id = item.id;
        groupData.name = item.name;
        groupData.bg_color = item.bg_color;
        groupData.text_color = item.text_color;
        groupData.permissions.push(item.permission);
    }

    return {
        groupData
    };
}) satisfies PageServerLoad;
