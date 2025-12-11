<script lang="ts">
    import Footer from '$/components/navigation/Footer.svelte';
    import Navigation from '$/components/navigation/Navigation.svelte';
    import { API } from '$/lib/api';
    import { SwalAlert } from '$/lib/functions';
    import { getState, logged } from '$/lib/state.svelte';
    import { subscribePush } from '$/lib/web-push';
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import { onMount, type Snippet } from 'svelte';
    import { UAParser } from 'ua-parser-js';
    import type { PageData } from './$types';

    const { children, data }: { children: Snippet; data: PageData } = $props();

    const _state = getState();
    const PERMS_UPDATE = 5 * 60 * 1000; //5minutes

    let isIphone = $state(false);
    if (browser) {
        const parsed = UAParser(navigator.userAgent);
        isIphone = parsed.os.is('iOS');
    }

    onMount(() => {
        if (!logged(_state.userState)) return;
        if (!isIphone) {
            subscribePush().then((value) => {
                if (typeof value === 'boolean') {
                    _state.pushEnabled = value;
                    return;
                }

                SwalAlert({
                    icon: 'error',
                    title: 'Nepovedlo se povolit notifikace',
                    text: value
                });
            });
        }

        const data = _state.userState.data;

        const interval = setInterval(async () => {
            const fetched = await API.permissions.GET();
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
    <div class="flex w-full flex-1 flex-col p-2">
        {@render children()}
        <Footer version={data.version} />
    </div>
</section>
