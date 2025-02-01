<script lang="ts">
    import Icon from '$/components/Icon.svelte';
    import { page } from '$app/state';
    import type { PageData } from './$types';
    import type { Present as PresentDB } from '$/types/database';
    import type { Selectable } from 'kysely';
    import { goto } from '$app/navigation';

    const PRESENT_OPEN = 0;
    const PRESENT_RESERVED = 1;
    const PRESENT_CLOSED = 2;

    type Present = Selectable<PresentDB>;

    const { data }: { data: PageData } = $props();

    const presents = $state(data.data);

    let grouped: Record<number, Present[]> = {};

    for (const present of presents) {
        if (!(present.user_id in grouped)) {
            grouped[present.user_id] = [];
        }
        grouped[present.user_id].push(present);
    }

    console.log(grouped);
</script>

{#snippet presentList(presents: Present[])}
    {#if presents.length === 0}
        <h1 class="font-poppins text-center text-xl font-bold">
            {#if page.params.page === 'mine'}Nemáš žádné dárky{:else}Nemá žádné dárky{/if}
        </h1>
    {:else}{/if}
{/snippet}

<div class="flex w-full flex-1 flex-col">
    <div class="font-poppins mb-4 flex w-full items-center justify-center gap-4">
        <a class={{ 'font-bold underline': page.params.page === 'mine' }} href="/app/presents/mine"><Icon name="bi-gift-fill" /> Moje dárky</a>
        <a class={{ 'font-bold underline': page.params.page === 'others' }} href="/app/presents/others"><Icon name="bi-box2-heart-fill" /> Ostatních dárky</a>
    </div>
    <div class="flex flex-1 flex-col gap-2">
        {#if page.params.page === 'mine'}
            <Icon onclick={() => goto('/app/presents/new')} name="bi-plus-lg" class="mx-auto text-xl text-green-500" />
            {@render presentList(presents)}
        {:else}
            OTHER
        {/if}
    </div>
</div>
