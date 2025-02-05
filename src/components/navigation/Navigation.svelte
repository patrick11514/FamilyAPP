<script lang="ts">
    import { API } from '$/lib/api';
    import { formatUser, SwalAlert } from '$/lib/functions';
    import { getState, logged } from '$/lib/state.svelte';
    import type { BootstrapIcon } from '$/types/bootstrap_icons';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import Title from '../headers/Title.svelte';
    import Icon from '../Icon.svelte';
    import { Permissions, type Permission } from '$/lib/permissions';
    import Group from '../group.svelte';
    import ClickOutside from '../clickOutside.svelte';
    import { twMerge } from 'tailwind-merge';

    const BASE = '/app' as const;
    const routes: {
        name: string;
        path: string;
        icon: BootstrapIcon;
        startsWith?: boolean;
        hidden?: boolean;
        permissions?: Permission[];
    }[] = [
        {
            name: 'Domů',
            path: '',
            icon: 'bi-house-fill'
        },
        {
            name: 'Rozvrhovník',
            path: '/timetable',
            icon: 'bi-calendar2-week'
        },
        {
            name: 'Dárkovník',
            path: '/presents',
            icon: 'bi-gift-fill',
            startsWith: true
        },
        {
            name: 'Dlužníček',
            path: '/debt',
            icon: 'bi-cash-coin',
            startsWith: true
        },
        {
            name: 'Datumovník',
            path: '/calendar',
            icon: 'bi-calendar3'
        },
        {
            name: 'Poznámkovník',
            path: '/notes',
            icon: 'bi-stickies-fill'
        },
        {
            name: 'Správa skupin',
            path: '/groups',
            startsWith: true,
            icon: 'bi-people-fill',
            permissions: ['admin.groups']
        },
        {
            name: 'Správa uživatelů',
            path: '/users',
            startsWith: true,
            icon: 'bi-key-fill',
            permissions: ['admin.users']
        },
        {
            name: 'Seznam změn',
            path: '/changelog',
            icon: 'bi-list',
            hidden: true
        }
    ];

    let route = $state<(typeof routes)[number]>();

    const _state = getState();

    $effect(() => {
        const pathname = page.url.pathname.replace(BASE, '');
        route = routes.find((route) => (route.startsWith ? pathname.startsWith(route.path) : pathname === route.path));
    });

    $effect(() => {
        _state.title = route ? route.name : '';
    });

    let opened = $state(false);

    const logout = async () => {
        const result = await API.auth.logout();
        if (!result.status) {
            SwalAlert({
                icon: 'error',
                title: 'Nepovedlo se odhlásit'
            });
            return;
        }
        SwalAlert({
            icon: 'success',
            title: 'Byl jsi úspěšně odhlášen'
        });

        _state.userState = {
            logged: false
        };

        goto('/');
    };

    let permissions = $derived(new Permissions(logged(_state.userState) ? _state.userState.data : undefined));
</script>

<svelte:head>
    <title>{route?.name ?? ''} | FamilyAPP</title>
</svelte:head>

<div class="flex items-center gap-2 p-2 md:hidden">
    <Icon
        onclick={() => (opened = true)}
        name="bi-list"
        class="border-primary bg-secondary hover:bg-accent active:bg-accent rounded-md border-[1px] px-1.5 py-0.5 text-3xl font-bold transition-colors duration-200"
    />
    <Title>{_state.title}</Title>
</div>

<ClickOutside
    clickoutside={() => (opened = false)}
    class={twMerge(
        'bg-secondary absolute top-0 left-0 flex min-h-screen w-1/2 min-w-96 flex-col p-2 transition-transform duration-500 md:static md:w-auto md:translate-x-0',
        !opened ? '-translate-x-full' : ''
    )}
>
    <div class="flex flex-row justify-between px-2 md:justify-end">
        <Icon onclick={() => (opened = false)} name="bi-x-lg" class="text-3xl font-bold md:hidden" />
        <Icon onclick={logout} name="bi-box-arrow-in-right" class="text-3xl font-bold" />
    </div>
    <div class="flex flex-col items-center justify-center gap-2">
        <Title>Uživatelské menu:</Title>
        {#if logged(_state.userState)}
            {@const data = _state.userState.data}
            <h1 class="font-poppins text-xl font-bold">Přihlášen jako:</h1>
            <h1 class="font-poppins font-bold">
                {formatUser(data)}
                {#if data.group}
                    {@const group = data.group}
                    <Group textColor={group.text_color} backgroundColor={group.bg_color}>{group.name}</Group>
                {/if}
            </h1>
        {/if}
    </div>
    <hr class="my-4" />
    <div class="flex flex-1 flex-col items-center justify-center gap-2">
        <div class="flex h-full w-max flex-1 flex-col gap-2 overflow-y-auto">
            {#each routes.filter( (route) => ((route.permissions ? route.permissions.some( (perm) => permissions.hasPermission(perm) ) : true) && route.hidden !== undefined ? !route.hidden : true) ) as _route, i (i)}
                <a
                    class:border-b-2={_route.name == route?.name}
                    class:hover:after:scale-x-100={_route.name != route?.name}
                    href="/app{_route.path}"
                    onclick={() => (opened = false)}
                    class="border-b-text font-poppins after:bg-text w-max text-2xl font-bold after:block after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:transition-transform after:duration-200"
                >
                    <Icon name={_route.icon} />
                    {_route.name}
                </a>
            {/each}
        </div>
    </div>
</ClickOutside>
