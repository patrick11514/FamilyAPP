<script lang="ts">
    import type { Snippet } from 'svelte';
    import { twMerge } from 'tailwind-merge';

    const { children, class: cls = '' }: { children: Snippet; class?: string } = $props();
</script>

<h1 class={twMerge('border-b-text font-poppins mx-auto w-max border-b-4 text-2xl font-bold lg:text-3xl', cls)}>{@render children()}</h1>
