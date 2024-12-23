<script lang="ts">
    import { onMount, type Snippet } from 'svelte';
    import Navigation from '$/components/navigation/Navigation.svelte';
    import { getState, logged } from '$/lib/state.svelte';
    import { API } from '$/lib/api';

    const { children }: { children: Snippet } = $props();

    const _state = getState();
    const PERMS_UPDATE = 30 * 1000; //5minutes

    onMount(() => {
        if (!logged(_state.userState)) return;
        const data = _state.userState.data;

        const interval = setInterval(async () => {
            const fetched = await API.permissions.get();
            if (!fetched.status) return;

            data.permissions = fetched.data.permissions;
            data.group = fetched.data.group;
        }, PERMS_UPDATE);

        return () => {
            clearInterval(interval);
        };
    });
</script>

<section class="flex flex-col p-2 md:flex-row">
    <Navigation />
    <div class="flex h-full w-full flex-1 flex-col">
        {@render children()}
    </div>
</section>
