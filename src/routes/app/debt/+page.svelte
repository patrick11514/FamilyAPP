<script lang="ts">
    import Title from '$/components/headers/Title.svelte';
    import Icon from '$/components/Icon.svelte';
    import Table from '$/components/Table.svelte';
    import { toDate } from '$/lib/functions';
    import type { DeArray } from '$/types/types';
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';

    const { data }: { data: PageData } = $props();

    type PersonDebt = Omit<DeArray<(typeof data)['who']>, 'whom'>[];

    const grouppedData: Record<number, PersonDebt> = {};

    for (const { whom, ...rest } of data.who.filter((item) => item.resolved_on === null)) {
        if (!(whom in grouppedData)) {
            grouppedData[whom] = [];
        }

        grouppedData[whom].push(rest);
    }
</script>

{#snippet add()}
    <div class="flex w-full justify-center">
        <Icon onclick={() => goto('/app/debt/new')} name="bi-plus-lg" class="text-green-600" />
    </div>
{/snippet}

<div class="flex flex-1 flex-col">
    <Title class="my-2">Dlužíš</Title>
    {#if Object.values(grouppedData).length === 0}
        <h1 class="text-center font-poppins text-xl font-bold lg:text-2xl">Nikomu nic nedlužíš :)</h1>
    {:else}
        <Table
            head={{
                who: 'Kdo',
                amount: 'Kolik',
                icons: ''
            }}
            data={Object.entries(grouppedData).map(([who, list]) => {
                const user = data.users.find((user) => user.id === parseInt(who))!;
                return {
                    who: `${user.firstname} ${user.lastname}`,
                    amount: list
                        .map((record) => parseFloat(record.price))
                        .reduce((a, b) => a + b, 0)
                        .toFixed(2),
                    icons: ''
                };
            })}
        />
    {/if}
    <Title class="my-2">Tobě je dluženo</Title>
    <Table
        head={{
            who: 'Od koho',
            amount: 'Kolik',
            when: 'Kdy',
            payed: 'Zaplaceno',
            icons: ''
        }}
        data={[
            ...data.whom.map((item) => {
                const user = data.users.find((user) => user.id === item.who)!;
                return {
                    who: `${user.firstname} ${user.lastname}`,
                    amount: item.price,
                    when: toDate(item.when),
                    payed: item.resolved_on === null ? 'Ne' : toDate(item.resolved_on)
                };
            }),
            {
                who: {
                    colspan: 4,
                    value: add
                }
            }
        ]}
    />
</div>
