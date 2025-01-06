<script lang="ts">
    import type { HTMLSelectAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    let { children, class: cls, value = $bindable(), invalid = $bindable(undefined), ...props }: HTMLSelectAttributes & { invalid?: string } = $props();

    let el = $state<HTMLSelectElement>();

    $effect(() => {
        el?.setCustomValidity(invalid ?? '');
    });
</script>

<select
    bind:this={el}
    {...props}
    class={twMerge(
        'rounded-md border-2 border-white bg-secondary px-4 py-1 text-2xl font-bold text-text outline-none transition-colors duration-200 placeholder:text-text invalid:border-accent focus:border-primary lg:text-3xl',
        cls?.toString()
    )}
    bind:value
>
    {@render children?.()}
</select>
