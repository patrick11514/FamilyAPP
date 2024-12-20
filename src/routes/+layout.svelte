<script lang="ts">
    import '../fonts.css';
    import '../app.css';

    import { API } from '$/lib/api';
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';

    let { children, data }: { children: Snippet; data: LayoutData } = $props();

    API.hydrateFromServer(data.api);
</script>

<main class="xl:font-xl bg-background font-roboto text-text flex h-full min-h-screen w-full flex-col overflow-x-hidden text-lg">
    <section class="flex flex-1 flex-col">
        {@render children()}
    </section>
</main>
