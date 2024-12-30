<script lang="ts">
    import Select from '$/components/form/Select.svelte';
    import Icon from '$/components/Icon.svelte';
    import { API } from '$/lib/api';
    import { SwalAlert } from '$/lib/functions';
    import type { User } from '$/types/database';
    import type { NormalizeId } from '$/types/types';
    import { page } from '$app/state';
    import type { PageData } from './$types';

    const { data }: { data: PageData } = $props();

    const groups = data.groups;
    let users = $state<
        (NormalizeId<Omit<User, 'password'>> & {
            group_id: number | null;
        })[]
    >();

    const resolveUsers = (userData: (typeof data)['users']) => {
        if (!userData.status) return;

        users = userData.data;
    };

    resolveUsers(data.users);

    const updateGroup = async (userId: number, group: number | null) => {
        const response = await API.users.PATCH({
            id: userId,
            group
        });

        if (!response.status) {
            SwalAlert({
                icon: 'error',
                title: response.message
            });
            return;
        }

        SwalAlert({
            icon: 'success',
            title: 'Skupina úspěšně aktualizována'
        });
    };

    const createInvitation = async () => {
        const response = await API.invitation.GET();
        if (!response.status) {
            SwalAlert({
                icon: 'error',
                title: response.message
            });
            return;
        }

        const link = `${page.url.origin}/invitation/${response.data}`;

        try {
            await navigator.clipboard.writeText(link);

            SwalAlert({
                icon: 'success',
                title: 'Pozívací odkaz byl úspěšně zkopírován'
            });
        } catch (err) {
            console.error(err);
            await SwalAlert({
                icon: 'error',
                title: 'Nepovedlo se zkopírovat odkaz\n\nAAA'
            });

            SwalAlert({
                toast: false,
                timer: 0,
                title: link,
                position: 'center',
                showConfirmButton: true,
                confirmButtonText: 'Ok'
            });
        }
    };
</script>

<div class="mt-2 h-full w-full flex-1">
    {#if users}
        <table class="w-full border-collapse border-2 border-text">
            <thead>
                <tr class="border-2 border-text">
                    <th class="border-2 border-text">Id</th>
                    <th class="border-2 border-text">Jméno</th>
                    <th class="border-2 border-text">Skupina</th>
                </tr>
            </thead>
            <tbody>
                {#each users as user}
                    <tr class="border-2 border-text">
                        <td class="border-2 border-text">{user.id}</td>
                        <td class="border-2 border-text">{user.username}</td>
                        <td class="border-2 border-text">
                            <Select class="w-full border-none text-center" bind:value={user.group_id} onchange={() => updateGroup(user.id, user.group_id)}>
                                <option value={null} selected>Žádná</option>
                                {#each groups as group}
                                    <option value={group.id}>{group.name}</option>
                                {/each}
                            </Select>
                        </td>
                    </tr>
                {/each}
                <tr>
                    <td class="border-2 border-text text-center text-2xl" colspan={3}>
                        <Icon onclick={createInvitation} name="bi-plus-lg" class="text-green-600" />
                    </td>
                </tr>
            </tbody>
        </table>
    {/if}
</div>
