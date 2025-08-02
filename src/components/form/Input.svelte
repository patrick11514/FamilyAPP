<script lang="ts">
    import { resolveSvelteClass } from '$/lib/functions';
    import type { HTMLInputAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    let {
        class: cls,
        value = $bindable(),
        invalid = $bindable(undefined),
        ...props
    }: HTMLInputAttributes & { invalid?: string } = $props();

    let el = $state<HTMLInputElement>();
    $effect(() => {
        el?.setCustomValidity(invalid ?? '');
    });
</script>

<input
    bind:this={el}
    {...props}
    class={twMerge(
        'bg-secondary text-text placeholder:text-text invalid:border-accent focus:border-primary rounded-md border-2 border-white px-4 py-1 text-2xl font-bold outline-hidden transition-colors duration-200 lg:text-3xl',
        resolveSvelteClass(cls ?? '')
    )}
    bind:value
/>
