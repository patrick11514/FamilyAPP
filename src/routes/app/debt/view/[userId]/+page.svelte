<script lang="ts">
    import { Button } from '$/components/form';
    import Title from '$/components/headers/Title.svelte';
    import Icon from '$/components/Icon.svelte';
    import { Table, Td, Th, Tr } from '$/components/table';
    import { API } from '$/lib/api';
    import { formatUser, SwalAlert, toDate } from '$/lib/functions';
    import type { DeArray } from '$/types/types';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import type { PageData } from './$types';

    const { data }: { data: PageData } = $props();

    const intl = Intl.DateTimeFormat('cs-CZ', {
        month: 'long',
        year: 'numeric'
    });

    const groupData = (debts: (typeof data)['data']) => {
        return debts.reduce(
            (acc, item) => {
                const key = intl.format(new Date(item.when));
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push({ ...item, checked: false });
                return acc;
            },
            {} as Record<
                string,
                (DeArray<PageData['data']> & {
                    checked: boolean;
                })[]
            >
        );
    };

    let groupped = $state(groupData(data.data));

    const prices = $derived(Object.values(groupped).map((items) => items.reduce((acc, item) => (item.checked ? acc + parseFloat(item.price) : acc), 0)));
    const total = $derived(prices.reduce((acc, price) => acc + price, 0));

    const confirm = async () => {
        const confirm = await SwalAlert({
            toast: false,
            title: 'Opravdu chceš potvrdit vybrané dluhy jako vyřízené?',
            position: 'center',
            timer: 0,
            showConfirmButton: true,
            confirmButtonText: 'Ano',
            showCancelButton: true,
            cancelButtonText: 'Ne'
        });

        if (!confirm.isConfirmed) return;

        const response = await API.debt.POST({
            whom: parseInt(page.params.userId),
            ids: Object.values(groupped)
                .flat()
                .filter((item) => item.checked)
                .map((item) => item.id)
        });

        if (!response.status) {
            SwalAlert({
                title: response.message,
                icon: 'error'
            });
            return;
        }
        SwalAlert({
            title: 'Dluhy byly úspěšně vyřízeny',
            icon: 'success'
        });

        if (response.data.length == 0) {
            goto('/app/debt');
            return;
        }

        //update
        groupped = groupData(response.data);
    };
</script>

<section class="flex flex-1 flex-col gap-2">
    <div class="flex w-full items-center">
        <Icon onclick={() => goto('/app/debt')} name="bi-arrow-return-left" class="text-2xl lg:text-3xl" />
        <Title class="mx-auto">Dlužení {formatUser(data.userInfo)}</Title>
    </div>

    <div class="flex items-center justify-between">
        <h2>Vybráno celkem: {total} Kč</h2>
        <Button onclick={confirm} disabled={total === 0} class="w-auto">Povrdit</Button>
    </div>

    <Table>
        <thead>
            <Tr>
                <Th colspan={2}>Měsíc</Th>
                <Th colspan={2}>Vybraná částka</Th>
            </Tr>
        </thead>
        <tbody class="text-center">
            {#each Object.entries(groupped) as [month, items], idx}
                <Tr>
                    <Td colspan={2}>{month}</Td>
                    <Td colspan={2}>{prices[idx]} Kč</Td>
                </Tr>
                <Tr>
                    <Td><input type="checkbox" onchange={(ev) => items.forEach((item) => (item.checked = ev.currentTarget.checked))} /></Td>
                    <Td>Datum</Td>
                    <Td>Částka</Td>
                    <Td>Obrázek</Td>
                </Tr>

                {#each items as item}
                    <Tr>
                        <Td><input type="checkbox" bind:checked={item.checked} /></Td>
                        <Td>{toDate(item.when)}</Td>
                        <Td>{parseFloat(item.price)} Kč</Td>
                        <Td>
                            {#if item.photo}
                                <a class="break-all text-sky-600" href="/images/{item.photo}" target="_blank">{item.photo}</a>
                            {:else}
                                -
                            {/if}
                        </Td>
                    </Tr>
                {/each}
            {/each}
        </tbody>
    </Table>
</section>
