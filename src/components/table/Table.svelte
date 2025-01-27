<script lang="ts">
    import { resolveSvelteClass } from '$/lib/functions';
    import type { HTMLTableAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    const { children, class: cls, ...props }: HTMLTableAttributes = $props();
</script>

<table {...props} class={twMerge('border-text w-full border-collapse border-2', resolveSvelteClass(cls ?? ''))}>
    {@render children?.()}
</table>
