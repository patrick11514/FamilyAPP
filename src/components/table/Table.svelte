<script lang="ts">
    import type { HTMLTableAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    const { children, class: cls, ...props }: HTMLTableAttributes = $props();
</script>

<table {...props} class={twMerge('w-full border-collapse border-2 border-text', cls?.toString())}>
    {@render children?.()}
</table>
