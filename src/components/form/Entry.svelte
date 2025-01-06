<script lang="ts">
    import type { Snippet } from 'svelte';

    const {
        children,
        id = '',
        label,
        error = undefined,
        auto = false,
        note = ''
    }: {
        children: Snippet;
        id?: string;
        label: string;
        error?: string;
        auto?: boolean;
        note?: string;
    } = $props();
</script>

<div class:w-full={!auto} class="flex flex-col">
    <label class="mb-2 text-xl font-bold lg:text-2xl" for={id}>{label} <span class="text-base text-gray-500 lg:text-lg">{note}</span></label>
    {@render children()}
    <span class:invisible={!error} class="text-sm font-bold text-red-500">{error ?? '...'}</span>
</div>
