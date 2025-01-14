<script lang="ts">
    import type { SvelteHTMLElements } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    const { children, class: cls, ...props }: SvelteHTMLElements['td'] = $props();
</script>

<td {...props} class={twMerge('border-2 border-text', cls?.toString())}>
    {@render children?.()}
</td>
