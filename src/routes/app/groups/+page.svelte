<script lang="ts">
    import GroupTag from '$/components/group.svelte';
    import Icon from '$/components/Icon.svelte';
    import { SwalAlert } from '$/lib/functions';
    import type { Group } from '$/types/database';
    import type { NormalizeId } from '$/types/types';
    import type { PageData, Snapshot } from './$types';

    const { data }: { data: PageData } = $props();

    let groups = $state<NormalizeId<Group>[]>();
    let staticGroups = $state<NormalizeId<Group>[]>();

    const resolveGroups = (groupData: (typeof data)['groups']) => {
        if (!groupData.status) return;

        groups = groupData.data;
        staticGroups = structuredClone(groupData.data);
    };

    let groupStatuses = $state<boolean[]>([]);

    $effect(() => {
        if (!groups || !staticGroups) return;

        groupStatuses = groups.map(
            (group, idx) => group.name != staticGroups![idx]?.name || group.bg_color != staticGroups![idx]?.bg_color || group.text_color != staticGroups![idx]?.text_color
        );
    });

    $effect(() => console.log(groupStatuses));

    resolveGroups(data.groups);

    const updateGroup = (groupId: number) => {};

    const addGroup = (groupId: number) => {};

    const tryUpdateGroup = (groupId: number) => {
        if (groupStatuses?.[groupId] === false) {
            SwalAlert({
                icon: 'error',
                text: 'Tato skupina nemá žádnou novou úpravu'
            });
            return;
        }

        return staticGroups![groupId] === undefined ? addGroup(groupId) : updateGroup(groupId);
    };

    const resetGroup = (groupId: number) => {
        if (!groups || !staticGroups) return;

        groups[groupId] = { ...staticGroups[groupId] };
    };

    const addNew = () => {
        if (!groups || !staticGroups) return;

        groups.push({
            id: groups.length + 1,
            name: 'group',
            bg_color: '#000',
            text_color: '#fff'
        });
    };

    export const snapshot = {
        capture: () => {
            return {
                groups,
                staticGroups
            };
        },
        restore: (values) => {
            groups = values.groups;
            staticGroups = values.staticGroups;
        }
    } satisfies Snapshot<{
        groups: typeof groups;
        staticGroups: typeof staticGroups;
    }>;
</script>

<div class="divide-y-white mt-2 h-full w-full flex-1 gap-2 divide-y-2">
    {#if groups}
        <table class="w-full border-collapse border-2 border-text">
            <thead>
                <tr class="border-2 border-text">
                    <th class="border-2 border-text">Id</th>
                    <th class="border-2 border-text">Jméno</th>
                    <th class="border-2 border-text">Barva Textu</th>
                    <th class="border-2 border-text">Barva Pozadí</th>
                    <th class="border-2 border-text">Ukázka</th>
                    <th class="border-2 border-text"></th>
                </tr>
            </thead>
            <tbody>
                {#each groups as group, idx}
                    {@const inputs = { text: undefined as HTMLInputElement | undefined, background: undefined as HTMLInputElement | undefined }}
                    <tr class="border-2 border-text">
                        <td class="border-2 border-text">{group.id}</td>
                        <td class="border-2 border-text">
                            <input class="w-full border-none bg-transparent text-center outline-none" bind:value={group.name} size={1} />
                        </td>
                        <td onclick={() => inputs.text?.click()} class="border-2 border-text" style="background-color: {group.text_color};">
                            <input bind:this={inputs.text} bind:value={group.text_color} hidden type="color" />
                        </td>
                        <td onclick={() => inputs.background?.click()} class="border-2 border-text" style="background-color: {group.bg_color};">
                            <input bind:this={inputs.background} bind:value={group.bg_color} hidden type="color" />
                        </td>
                        <td class="flex items-center justify-center">
                            <GroupTag backgroundColor={group.bg_color} textColor={group.text_color}>{group.name}</GroupTag>
                        </td>
                        <td class="border-2 border-text text-xl">
                            <div class="flex items-center justify-center">
                                {#if groupStatuses?.[idx] !== false}
                                    <Icon onclick={() => tryUpdateGroup(idx)} name="bi-check-lg" class="text-green-600" />
                                    {#if staticGroups!.length > idx}
                                        <Icon onclick={() => resetGroup(idx)} name="bi-arrow-counterclockwise" class="text-red-600" />
                                    {/if}
                                {/if}
                                <Icon name="bi-trash-fill" class="text-red-500" />
                            </div>
                        </td>
                    </tr>
                {/each}
                <tr class="border-2 border-text">
                    <td class="border-2 border-text text-center text-2xl" colspan={6}>
                        <Icon onclick={addNew} name="bi-plus-lg" class="text-green-600" />
                    </td>
                </tr>
            </tbody>
        </table>
    {/if}
</div>
