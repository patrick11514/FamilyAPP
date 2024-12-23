<script lang="ts">
    import type { Snippet } from 'svelte';

    const { textColor, backgroundColor, children }: { textColor: string; backgroundColor: string; children: Snippet } = $props();
</script>

<div
    style="color: {textColor}; background-color:{backgroundColor};"
    class="inline-block rounded-md border-2 border-black border-opacity-20 px-2 py-1 text-center font-poppins font-bold"
>
    {@render children()}
</div>
