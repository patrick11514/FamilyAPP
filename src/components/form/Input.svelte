<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    let { class: cls, value = $bindable(), invalid = $bindable(undefined), ...props }: HTMLInputAttributes & { invalid?: string } = $props();

    let el = $state<HTMLInputElement>();
    $effect(() => {
        el?.setCustomValidity(invalid ?? '');
    });
</script>

<input
    bind:this={el}
    {...props}
    class={twMerge(
        'rounded-md border-2 border-white bg-secondary px-4 py-1 text-2xl font-bold text-text outline-none transition-colors duration-200 placeholder:text-text invalid:border-accent focus:border-primary lg:text-3xl',
        cls?.toString()
    )}
    bind:value
/>
