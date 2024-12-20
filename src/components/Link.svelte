<script lang="ts">
    import type { Snippet } from 'svelte';
    import { twMerge } from 'tailwind-merge';

    const { children, link, class: cls = '' }: { children: Snippet; link: string; class?: string } = $props();
</script>

<a href={link} class={twMerge('text-accent underline ', cls)}>
    {@render children()}
</a>
