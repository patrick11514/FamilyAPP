<script lang="ts">
    import Title from '$/components/headers/Title.svelte';
    import Icon from '$/components/Icon.svelte';
    import { goto } from '$app/navigation';

    const fields = [] as const;
    const defaultValues = [] as const;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type Indices<T extends readonly any[]> = Exclude<keyof T, keyof []>;

    type DataType = {
        [Index in Indices<typeof fields> as (typeof fields)[Index]]: {
            value: (typeof defaultValues)[Index];
            error?: string;
        };
    };
    const data = $state(Object.fromEntries(fields.map((item, idx) => [item, { value: defaultValues[idx] }])) as DataType);

    const handle = async () => {
        Object.values(data).forEach((item) => (item.error = undefined));

        if (Object.values(data).some((item) => item.error !== undefined)) {
            return;
        }
    };
</script>

<Icon onclick={() => goto('/app/presents/mine')} name="bi-arrow-return-left" class="text-2xl lg:text-3xl" />

<section class="md:border-accent md:bg-secondary flex flex-1 flex-col items-center justify-center gap-4 p-4 md:m-auto md:flex-0 md:rounded-md md:border-2 md:p-8">
    <Title>Nový dárek</Title>
</section>
