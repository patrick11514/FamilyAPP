<script lang="ts">
    import type { HTMLButtonAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    const { children, class: cls, ...props }: HTMLButtonAttributes = $props();
</script>

<button
    {...props}
    class={twMerge(
        'w-full rounded-md bg-accent px-4 py-2 font-poppins font-bold transition-all duration-200 hover:bg-secondary active:translate-y-1 disabled:grayscale',
        cls?.toString()
    )}
>
    {@render children?.()}
</button>
