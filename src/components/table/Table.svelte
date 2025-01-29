<script lang="ts">
    import { resolveSvelteClass } from '$/lib/functions';
    import type { HTMLTableAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    let {
        children,
        class: cls,
        self = $bindable(),
        ...props
    }: HTMLTableAttributes & {
        self: HTMLTableElement;
    } = $props();
</script>

<table bind:this={self} {...props} class={twMerge('border-text w-full border-collapse border-2', resolveSvelteClass(cls ?? ''))}>
    {@render children?.()}
</table>
