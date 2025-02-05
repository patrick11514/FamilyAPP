<script lang="ts">
    import { onMount, type Snippet } from 'svelte';
    import Navigation from '$/components/navigation/Navigation.svelte';
    import { getState, logged } from '$/lib/state.svelte';
    import { API } from '$/lib/api';
    import { goto, invalidateAll } from '$app/navigation';
    import Title from '$/components/headers/Title.svelte';
    import Footer from '$/components/navigation/Footer.svelte';
    import { urlBase64ToUint8Array } from '$/lib/functions';
    import { PUBLIC_VAPI_KEY } from '$env/static/public';
    import type { PageData } from './$types';
    import Icon from '$/components/Icon.svelte';

    const { children, data }: { children: Snippet; data: PageData } = $props();

    const _state = getState();
    const PERMS_UPDATE = 5 * 60 * 1000; //5minutes

    const setupPush = async () => {
        if (!('serviceWorker' in navigator || 'PushManager' in window)) {
            console.log('Service workers are not supported or push manager is not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register('/webworker/push-worker.js');
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
    };

    type Point = {
        x: number;
        y: number;
    };

    let reloadElement = $state() as HTMLElement;

    let touching = $state(false);
    let touchBegin = $state<Point | null>(null);
    let willReload = $state(false);

    const touchStart = (e: TouchEvent | MouseEvent) => {
        touching = true;
        if ('touches' in e) {
            touchBegin = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else {
            touchBegin = {
                x: e.clientX,
                y: e.clientY
            };
        }

        reloadElement.classList.remove('duration-200');
    };

    const onMove = (e: TouchEvent | MouseEvent) => {
        if (!touching || !touchBegin) return;

        let currentPoint: Point;

        if ('touches' in e) {
            currentPoint = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else {
            currentPoint = {
                x: e.clientX,
                y: e.clientY
            };
        }

        let deltaY = touchBegin.y - currentPoint.y;
        const screenHeigh = window.innerHeight;

        //if scroll 40% of the screen, reload
        if (deltaY * -1 > screenHeigh * 0.4) {
            willReload = true;
            return;
        }

        willReload = false;

        let baseTop = -40;
        let maxTop = baseTop - screenHeigh * 0.4;

        //clap to max
        if (deltaY < maxTop) {
            deltaY = maxTop;
        }

        //update
        reloadElement.style.top = `${baseTop - deltaY}px`;
        reloadElement.style.rotate = `${-(deltaY / (screenHeigh * 0.4)) * 360}deg`;

        console.log(e);
    };

    const touchEnd = () => {
        touching = false;
        touchBegin = null;

        reloadElement.classList.add('duration-200');

        console.log(willReload);

        if (willReload) {
            console.log('reloading');
            invalidateAll();
        }

        reloadElement.style.top = '-40px';
        reloadElement.style.rotate = '0deg';
        willReload = false;
    };

    onMount(() => {
        //start
        document.addEventListener('touchstart', touchStart);
        document.addEventListener('mousedown', touchStart);
        //dragging
        document.addEventListener('touchmove', onMove);
        document.addEventListener('mousemove', onMove);
        //end
        document.addEventListener('touchend', touchEnd);
        document.addEventListener('mouseup', touchEnd);

        return () => {
            //cleanup
            document.removeEventListener('touchstart', touchStart);
            document.removeEventListener('mousedown', touchStart);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('touchend', touchEnd);
            document.removeEventListener('mouseup', touchEnd);
        };
    });

    onMount(() => {
        if (!logged(_state.userState)) return;

        setupPush();

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

<Icon
    id="reload-icon"
    style="top: -40px;"
    bind:self={reloadElement}
    name="bi-arrow-clockwise"
    class="bg-text absolute left-1/2 aspect-square w-9 -translate-x-[50%] rounded-full p-1 text-center text-xl text-black"
/>
<section class="flex flex-1 flex-col md:flex-row">
    <Navigation />
    <div class="flex w-full flex-1 flex-col p-2">
        <Title class="m-0 hidden md:block">{_state.title}</Title>
        {@render children()}
        <Footer version={data.version} />
    </div>
</section>
