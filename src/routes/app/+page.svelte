<script lang="ts">
    import Title from '$/components/headers/Title.svelte';
    import Icon from '$/components/Icon.svelte';
    import { eventIsInDay, getEventName, getEventRange } from '$/lib/calendarUtils';
    import { formatUser, locale } from '$/lib/functions';
    import type { PageData } from './$types';

    const { data }: { data: PageData } = $props();
</script>

<section class="flex flex-1 flex-col items-center gap-2">
    <Title>Blízké události</Title>
    {#await data.recentEvents}
        <p class="text-center font-bold text-gray-500">Načítám události...</p>
    {:then events}
        {#if events.length == 0}
            <p class="text-center font-bold text-gray-500">Nejsou žádné blízké události :(</p>
        {:else}
            <div class="divide-primary border-primary flex w-[80%] flex-col gap-2 divide-y-2 rounded-md border-2 p-2">
                {#each events as event}
                    {@const range = getEventRange(event, new Date())}
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-between">
                            <p class="font-bold">{getEventName(event, new Date())}</p>
                            <p>
                                {#if eventIsInDay(new Date(), event)}
                                    Dnes
                                {:else if eventIsInDay(new Date(new Date().getTime() + 86400000), event)}
                                    Zítra
                                {:else}
                                    za {locale((event.from.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000 || 0, {
                                        one: 'den',
                                        two: 'dny',
                                        five: 'dní'
                                    })}
                                {/if}: {range}
                            </p>
                        </div>
                        <p>{event.description}</p>

                        <p><Icon name="bi-person-fill" /> {formatUser(data.users.find((user) => user.id === event.user_id)!)}</p>
                    </div>
                {/each}
            </div>
        {/if}
    {/await}
</section>
