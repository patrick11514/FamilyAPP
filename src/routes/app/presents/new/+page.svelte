<script lang="ts">
    import { Button, Entry, Input } from '$/components/form';
    import Title from '$/components/headers/Title.svelte';
    import Icon from '$/components/Icon.svelte';
    import { API } from '$/lib/api';
    import { extractError, matchError } from '$/lib/errors';
    import { SwalAlert } from '$/lib/functions';
    import { goto } from '$app/navigation';
    import type { Snapshot } from '@sveltejs/kit';

    const fields = ['name', 'description', 'link', 'price', 'image'] as const;
    const defaultValues = ['', '', '', 0, [] as (File | null)[]] as const;

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

        if (data.name.value == '') {
            data.name.error = 'Zadej prosím název';
        }

        if (data.price.value <= 0) {
            data.price.error = 'Zadej prosím platnou cenu';
        }

        const files = data.image.value.filter((file) => file !== null);

        if (files.length > 1) {
            data.image.error = 'Vyber prosím jen jeden obrázek';
        }

        if (Object.values(data).some((item) => item.error !== undefined)) {
            return;
        }

        const formData = new FormData();
        formData.set('name', data.name.value);
        formData.set('description', data.description.value);
        formData.set('link', data.link.value);
        formData.set('price', data.price.value.toString());
        if (files.length == 1) {
            formData.set('image', files[0]);
        }

        const response = await API.presents.PUT(formData);

        if (!response.status) {
            if (matchError(response.message, 'presents.file')) {
                data.image.error = extractError(response.message);
            } else if (matchError(response.message, 'presents.size')) {
                data.image.error = extractError(response.message);
            } else if (matchError(response.message, 'presents.input')) {
                SwalAlert({
                    icon: 'error',
                    title: extractError(response.message)
                });
            } else if (matchError(response.message, 'presents.negative')) {
                data.price.error = extractError(response.message);
            } else if (matchError(response.message, 'presents.range')) {
                data.price.error = extractError(response.message);
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
            title: 'Dárek byl úspěšně přidán'
        });

        goto('/app/presents/mine');
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

<Icon onclick={() => goto('/app/presents/mine')} name="bi-arrow-return-left" class="text-2xl lg:text-3xl" />

<section class="md:border-accent md:bg-secondary flex flex-1 flex-col items-center justify-center gap-4 p-4 md:m-auto md:flex-0 md:rounded-md md:border-2 md:p-8">
    <Title>Nový dárek</Title>
    <Entry id="name" label="Název" error={data.name.error}>
        <Input id="name" bind:value={data.name.value} invalid={data.name.error} />
    </Entry>
    <Entry id="description" label="Popis" note="(nepovinné)" error={data.description.error}>
        <Input id="description" bind:value={data.description.value} invalid={data.description.error} />
    </Entry>
    <Entry id="link" label="Odkaz" note="(nepovinné)" error={data.link.error}>
        <Input id="link" bind:value={data.link.value} invalid={data.link.error} />
    </Entry>
    <Entry id="price" label="Cena" error={data.price.error}>
        <Input id="price" type="number" step={0.00001} bind:value={data.price.value} invalid={data.price.error} />
    </Entry>
    <Button onclick={handle}>Přidat</Button>
</section>
