<script lang="ts">
    import '../fonts.css';
    import '../app.css';
    import 'bootstrap-icons/font/bootstrap-icons.min.css';

    import { API } from '$/lib/api';
    import { type Snippet } from 'svelte';
    import type { LayoutData } from './$types';
    import { logged, setState } from '$/lib/state.svelte';

    let { children, data }: { children: Snippet; data: LayoutData } = $props();

    API.hydrateFromServer(data.api);

    if (logged(data.userState)) {
        const _data = data.userState.data;
        if (data.permissions.status) {
            _data.permissions = data.permissions.data.permissions;
            _data.group = data.permissions.data.group;
        }
    }

    setState({
        userState: data.userState,
        title: ''
    });
</script>

<main class="xl:font-xl flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-background font-roboto text-lg text-text lg:text-xl">
    {@render children()}
</main>
