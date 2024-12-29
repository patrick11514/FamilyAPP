<script lang="ts">
    import { onMount, type Snippet } from 'svelte';
    import Navigation from '$/components/navigation/Navigation.svelte';
    import { getState, logged } from '$/lib/state.svelte';
    import { API } from '$/lib/api';
    import { goto } from '$app/navigation';
    import Title from '$/components/headers/Title.svelte';
    import Footer from '$/components/navigation/Footer.svelte';

    const { children }: { children: Snippet } = $props();

    const _state = getState();
    const PERMS_UPDATE = 5 * 60 * 1000; //5minutes

    onMount(() => {
        if (!logged(_state.userState)) return;
        const data = _state.userState.data;

        const interval = setInterval(async () => {
            const fetched = await API.permissions.get();
            if (!fetched.status) {
                //logged out
                _state.userState = {
                    logged: false
                };
                goto('/');
                return;
            }

            data.permissions = fetched.data.permissions;
            data.group = fetched.data.group;
        }, PERMS_UPDATE);

        return () => {
            clearInterval(interval);
        };
    });
</script>

<section class="flex flex-1 flex-col md:flex-row">
    <Navigation />
    <div class="flex h-full w-full flex-1 flex-col p-2">
        <Title class="m-0 hidden md:block">{_state.title}</Title>
        {@render children()}
        <Footer />
    </div>
</section>
