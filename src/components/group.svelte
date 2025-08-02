<script lang="ts">
    import type { Snippet } from 'svelte';

    const {
        textColor,
        backgroundColor,
        children
    }: { textColor: string; backgroundColor: string; children: Snippet } = $props();
</script>

<div
    style="color: {textColor}; background-color:{backgroundColor};"
    class="border-opacity-20 font-poppins inline-block rounded-md border-2 border-black px-2 py-1 text-center font-bold"
>
    {@render children()}
</div>
