<script lang="ts">
    import { onMount, type Snippet } from 'svelte';
    import Navigation from '$/components/navigation/Navigation.svelte';
    import { getState, logged } from '$/lib/state.svelte';
    import { API } from '$/lib/api';
    import { goto } from '$app/navigation';
    import Footer from '$/components/navigation/Footer.svelte';
    import { urlBase64ToUint8Array } from '$/lib/functions';
    import { PUBLIC_VAPI_KEY } from '$env/static/public';
    import type { PageData } from './$types';
    import Icon from '$/components/Icon.svelte';

    const { children, data }: { children: Snippet; data: PageData } = $props();

    const _state = getState();
    const PERMS_UPDATE = 5 * 60 * 1000; //5minutes
    const isSafari = navigator.userAgent.includes('Safari');
    const granted = Notification.permission === 'granted';

    const setupPush = async () => {
        /* eslint-disable no-console */
        if (!('serviceWorker' in navigator || 'PushManager' in window)) {
            console.log('Service workers are not supported or push manager is not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register('/webworker/push-worker.js');
            console.log(registration.pushManager);
            const subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                console.log('Subscribing to push notifications');
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPI_KEY)
                });

                //eslint-disable-next-line
                await API.push.subscribe(subscription as any);
            }
        } catch (e) {
            console.error(e);
        }
        /* eslint-enable no-console */
    };

    onMount(() => {
        if (!logged(_state.userState)) return;
        //if device is not safari, access notifications immidietly
        if (!isSafari) {
            setupPush();
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
        <div class="flex flex-row justify-between">
            {#if isSafari && !granted}
                <button onclick={setupPush}><Icon onclick={setupPush} name="bi-bell-fill" /> Klikni pro povolení notifikací (Jabko :))</button>
            {/if}
        </div>
        {@render children()}
        <Footer version={data.version} />
    </div>
</section>
