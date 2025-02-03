<script lang="ts">
    import Icon from '$/components/Icon.svelte';
    import { page } from '$app/state';
    import type { PageData } from './$types';
    import type { Present as PresentDB } from '$/types/database';
    import type { Selectable } from 'kysely';
    import { goto } from '$app/navigation';
    import { getState } from '$/lib/state.svelte';
    import { formatUser, SwalAlert } from '$/lib/functions';
    import { untrack } from 'svelte';
    import { API } from '$/lib/api';
    import { extractError, matchError } from '$/lib/errors';

    const PRESENT_OPEN = 0;
    const PRESENT_RESERVED = 1;
    const PRESENT_CLOSED = 2;

    type Present = Selectable<PresentDB>;

    const { data }: { data: PageData } = $props();

    let presents = $state(data.data);

    let grouped = $state<Record<number, Present[]>>({});

    const _state = getState();
    const userState = _state.userState;

    let opened = $state<Record<number, boolean>>({});
    let minePage = $state(page.params.page === 'mine');

    $effect(() => {
        minePage = page.params.page === 'mine';

        untrack(() => {
            presents = data.data;
        });
    });

    $effect(() => {
        grouped = {};

        for (const present of presents) {
            if (userState.logged && userState.data.id === present.user_id) {
                continue; // skip my own presents
            }
            untrack(() => {
                if (!(present.user_id in grouped)) {
                    grouped[present.user_id] = [];
                }
                if (!(present.user_id in opened)) {
                    opened[present.user_id] = false;
                }
                grouped[present.user_id].push(present);
            });
        }
    });

    const states = $derived({
        [PRESENT_OPEN]: 'Volný',
        [PRESENT_RESERVED]: minePage ? 'Volný' : 'Rezervovaný', // because we don't want to spoil the surprise
        [PRESENT_CLOSED]: 'Předaný'
    });
    const stateColors = $derived({
        [PRESENT_OPEN]: 'text-green-500',
        [PRESENT_RESERVED]: minePage ? 'text-green-500' : 'text-yellow-500',
        [PRESENT_CLOSED]: 'text-red-500'
    });

    const UpdateStates = {
        0: 'Dárek byl úspěšně vrácen',
        1: 'Dǎrek byl úspěšně rezervován',
        2: 'Dárek byl úspěšně předán'
    };

    const updateState = async (id: number, toState: 0 | 1 | 2) => {
        const response = await API.presents.PATCH({
            id,
            toState
        });

        if (!response.status) {
            if (matchError(response.message, 'presents.notFound')) {
                SwalAlert({
                    title: extractError(response.message),
                    icon: 'error'
                });
            } else if (matchError(response.message, 'presents.own')) {
                SwalAlert({
                    title: extractError(response.message),
                    icon: 'error'
                });
            } else if (matchError(response.message, 'presents.input')) {
                SwalAlert({
                    title: extractError(response.message),
                    icon: 'error'
                });
            } else {
                SwalAlert({
                    title: response.message,
                    icon: 'error'
                });
            }
            return;
        }

        const idx = presents.findIndex((present) => present.id === id)!;
        presents[idx] = response.data;

        SwalAlert({
            title: UpdateStates[toState],
            icon: 'success'
        });
    };
</script>

{#if userState.logged}
    {#snippet presentList(presents: Present[])}
        {#if presents.length === 0}
            <h1 class="font-poppins text-center text-xl font-bold">
                {#if page.params.page === 'mine'}Nemáš žádné dárky{:else}Nemá žádné dárky{/if}
            </h1>
        {:else}
            {#each presents as present}
                <div class="border-text flex flex-row gap-2 rounded-md border-2 p-2">
                    <div class="flex w-1/4 items-center justify-center">
                        {#if present.image}
                            <img src="/images/{present.image}" alt="" />
                        {:else}
                            <Icon name="bi-image" class="text-4xl" />
                        {/if}
                    </div>
                    <div class="flex w-full flex-col">
                        <div class="border-b-text flex justify-between border-b-2 font-bold">
                            <h1>{present.name}</h1>
                            <span>{parseFloat(present.price)} Kč</span>
                        </div>
                        {#if present.description}
                            <span>{present.description}</span>
                        {/if}
                        <div class="mt-auto flex justify-between">
                            <span>Stav: <span class={stateColors[present.state as 0 | 1 | 2]}>{states[present.state as 0 | 1 | 2]}</span></span>
                            <div class="flex gap-2 text-xl">
                                {#if !minePage && present.state === 0}
                                    <Icon onclick={() => updateState(present.id, 1)} name="bi-gift" />
                                {:else if !minePage && present.state === 1 && present.reserved_id === userState.data.id}
                                    <Icon onclick={() => updateState(present.id, 2)} name="bi-check-square" />
                                    <Icon onclick={() => updateState(present.id, 0)} name="bi-gift-fill" />
                                {:else if !minePage && present.state === 2 && present.reserved_id === userState.data.id}
                                    <Icon onclick={() => updateState(present.id, 1)} name="bi-check-square-fill" />
                                {/if}
                                {#if present.link}
                                    <a href={present.link} target="_blank">
                                        <Icon name="bi-link-45deg" />
                                    </a>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        {/if}
    {/snippet}

    <div class="flex w-full flex-1 flex-col">
        <div class="font-poppins mb-4 flex w-full items-center justify-center gap-4">
            <a class={{ 'font-bold underline': page.params.page === 'mine' }} href="/app/presents/mine"><Icon name="bi-gift-fill" /> Moje dárky</a>
            <a class={{ 'font-bold underline': page.params.page === 'others' }} href="/app/presents/others"><Icon name="bi-box2-heart-fill" /> Ostatních dárky</a>
        </div>
        <div class="flex flex-1 flex-col gap-2">
            {#if minePage}
                <Icon onclick={() => goto('/app/presents/new')} name="bi-plus-lg" class="mx-auto text-xl text-green-500" />
                {@render presentList(presents)}
            {:else}
                {#each Object.entries(grouped) as [userId, presents] (userId)}
                    {@const idNum = parseInt(userId)}
                    <button onclick={() => (opened[idNum] = !opened[idNum])} class="cursor-pointer text-2xl font-bold">
                        <Icon name={opened[idNum] ? 'bi-caret-down-fill' : 'bi-caret-up-fill'} />
                        {formatUser(data.users.find((user) => user.id === idNum)!)}
                    </button>
                    {#if opened[idNum]}
                        <div class="flex flex-col gap-2">
                            {@render presentList(presents)}
                        </div>
                    {/if}
                {/each}
            {/if}
        </div>
    </div>
{/if}
