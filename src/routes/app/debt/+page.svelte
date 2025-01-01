<script lang="ts">
    import Title from '$/components/headers/Title.svelte';
    import type { DeArray } from '$/types/types';
    import type { PageData } from './$types';

    const { data }: { data: PageData } = $props();

    type PersonDebt = Omit<DeArray<(typeof data)['whom']>, 'who'>[];

    const grouppedData: Record<number, PersonDebt> = {};

    for (const { who, ...rest } of data.whom.filter((item) => item.resolved_on === null)) {
        if (!(who in grouppedData)) {
            grouppedData[who] = [];
        }

        grouppedData[who].push(rest);
    }
</script>

<div class="flex flex-1 flex-col">
    <Title class="mb-2">Dlužíš</Title>
    <table>
        <thead>
            <tr>
                <th>Kdo</th>
                <th>Kolik</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {#if Object.values(grouppedData).length === 0}
                <tr>
                    <th colspan={3} class="text-center font-poppins text-xl font-bold lg:text-2xl"> Nikomu nic nedlužíš :) </th>
                </tr>
            {:else}
                {#each Object.entries(grouppedData) as [who, list] (who)}
                    <tr>
                        <td>
                            {who}
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>
