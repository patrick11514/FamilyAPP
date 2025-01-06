<script lang="ts">
    import Entry from '$/components/form/Entry.svelte';
    import Select from '$/components/form/Select.svelte';
    import Title from '$/components/headers/Title.svelte';
    import Icon from '$/components/Icon.svelte';
    import { goto } from '$app/navigation';
    import type { Snapshot } from '@sveltejs/kit';
    import type { PageData } from './$types.js';
    import Input from '$/components/form/Input.svelte';
    import FileSelect from '$/components/form/FileSelect.svelte';
    import Button from '$/components/form/Button.svelte';
    import { SwalAlert, toLocalDateString } from '$/lib/functions.js';
    import { API } from '$/lib/api.js';
    import { extractError, matchError } from '$/lib/errors.js';

    const { data: pageData }: { data: PageData } = $props();

    const fields = ['who', 'amount', 'when', 'image'] as const;
    const defaultValues = [null as null | number, 0, toLocalDateString(), [] as (File | null)[]] as const;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type Indices<T extends readonly any[]> = Exclude<keyof T, keyof []>;

    type DataType = {
        [Index in Indices<typeof fields> as (typeof fields)[Index]]: {
            value: (typeof defaultValues)[Index];
            error?: string;
        };
    };
    let data = $state(Object.fromEntries(fields.map((item, idx) => [item, { value: defaultValues[idx] }])) as DataType);

    const handle = async () => {
        Object.values(data).forEach((item) => (item.error = undefined));

        if (data.who.value == null || !pageData.users.map((user) => user.id).includes(data.who.value)) {
            data.who.error = 'Vyber prosím uživatele';
        }

        if (data.amount.value <= 0) {
            data.amount.error = 'Vyber prosím částku';
        }

        if (data.when.value == '') {
            data.when.error = 'Vyber prosím čas';
        }

        const files = data.image.value.filter((file) => file !== null);

        if (files.length > 1) {
            data.image.error = 'Vyber prosím jen jeden obrázek';
        }

        if (Object.values(data).some((item) => item.error !== undefined)) {
            return;
        }

        const formData = new FormData();
        formData.set('who', data.who.value!.toString());
        formData.set('amount', data.amount.value.toString());
        formData.set('when', data.when.value);
        if (files.length == 1) {
            formData.set('image', files[0]);
        }

        const response = await API.debt.PUT(formData);

        if (!response.status) {
            if (matchError(response.message, 'debt.input')) {
                SwalAlert({
                    icon: 'error',
                    title: extractError(response.message)
                });
            } else if (matchError(response.message, 'debt.negative')) {
                data.amount.error = extractError(response.message);
            } else if (matchError(response.message, 'debt.file')) {
                data.image.error = extractError(response.message);
            } else if (matchError(response.message, 'debt.size')) {
                data.image.error = extractError(response.message);
            } else {
                SwalAlert({
                    icon: 'error',
                    title: response.message
                });
            }

            return;
        }

        SwalAlert({
            icon: 'success',
            title: 'Dluh vytvořen'
        });

        goto('/app/debt');
    };

    export const snapshot = {
        capture: () => {
            return data;
        },
        restore: (value) => {
            data = {
                ...value,
                image: {
                    value: []
                }
            };
        }
    } satisfies Snapshot<Omit<DataType, 'image'>>;
</script>

<Icon onclick={() => goto('/app/debt')} name="bi-arrow-return-left" class="text-2xl lg:text-3xl" />
<section class="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:m-auto md:flex-[0] md:rounded-md md:border-2 md:border-accent md:bg-secondary md:p-8">
    <Title>Přidání nového dlužení</Title>
    <Entry id="who" label="Dlužník" error={data.who.error}>
        <Select id="who" bind:value={data.who.value} invalid={data.who.error}>
            <option value={null} selected disabled>Vyber dlužníka</option>
            {#each pageData.users as user}
                <option value={user.id}>{user.firstname} {user.lastname}</option>
            {/each}
        </Select>
    </Entry>
    <Entry id="amount" label="Částka" note="(používá se desetinná tečka)" error={data.amount.error}>
        <Input id="amount" type="number" step="any" bind:value={data.amount.value} invalid={data.amount.error} />
    </Entry>
    <Entry id="when" label="Kdy" note="(proběhla například platba/placení)" error={data.when.error}>
        <Input id="when" type="datetime-local" bind:value={data.when.value} invalid={data.when.error} />
    </Entry>
    <Entry id="img" label="Obrázek" note="(nepovinné)" error={data.image.error}>
        <FileSelect id="img" bind:value={data.image.value} accept="image/png, image/jpg, image/jpeg" />
    </Entry>

    <Button onclick={handle}>Přidat</Button>
</section>
