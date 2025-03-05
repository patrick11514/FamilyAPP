<script lang="ts">
    import type { Snippet } from 'svelte';

    const {
        children,
        id = '',
        label,
        error = undefined,
        auto = false,
        note = '',
        row = false,
        small = false
    }: {
        children: Snippet;
        id?: string;
        label: string;
        error?: string;
        auto?: boolean;
        note?: string;
        row?: boolean;
        small?: boolean;
    } = $props();
</script>

<div class:w-full={!auto} class={{ 'flex flex-col': !row, 'flex flex-row gap-2': row }}>
    <label class={['mb-2 font-bold', !small ? 'text-xl lg:text-2xl' : 'text-sm lg:text-base']} for={id}>
        {label} <span class="text-base text-gray-500 lg:text-lg">{note}</span>
    </label>
    {@render children()}
    <span class:invisible={!error} class="text-sm font-bold text-red-500">{error ?? '...'}</span>
</div>
