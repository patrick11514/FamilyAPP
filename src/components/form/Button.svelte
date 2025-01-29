<script lang="ts">
    import { resolveSvelteClass } from '$/lib/functions';
    import type { HTMLButtonAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    const { children, class: cls, ...props }: HTMLButtonAttributes = $props();
</script>

<button
    {...props}
    class={twMerge(
        'bg-accent font-poppins hover:bg-secondary w-full cursor-pointer rounded-md px-4 py-2 font-bold transition-all duration-200 active:translate-y-1 disabled:grayscale',
        resolveSvelteClass(cls ?? '')
    )}
>
    {@render children?.()}
</button>
