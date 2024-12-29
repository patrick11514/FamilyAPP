<script lang="ts">
    import Button from '$/components/form/Button.svelte';
    import Entry from '$/components/form/Entry.svelte';
    import Input from '$/components/form/Input.svelte';
    import Title from '$/components/headers/Title.svelte';
    import Footer from '$/components/navigation/Footer.svelte';
    import { API } from '$/lib/api';
    import { extractError, matchError } from '$/lib/errors';
    import { SwalAlert } from '$/lib/functions';
    import { getState } from '$/lib/state.svelte';
    import { goto } from '$app/navigation';

    const fields = ['username', 'password'] as const;
    type DataType = Record<
        (typeof fields)[number],
        {
            value: string;
            error?: string;
        }
    >;

    const data = $state(Object.fromEntries(fields.map((item) => [item, { value: '' }])) as DataType);

    const _state = getState();

    const login = async () => {
        Object.values(data).forEach((item) => (item.error = undefined));

        if (!data.username.value) {
            data.username.error = 'Vyplň prosím uživatelské jméno';
        }

        if (!data.password.value) {
            data.password.error = 'Vyplň prosím heslo';
        }

        if (Object.values(data).some((item) => item.error !== undefined)) {
            return;
        }

        const response = await API.auth.login({
            username: data.username.value,
            password: data.password.value
        });

        if (!response.status) {
            SwalAlert({
                icon: 'error',
                title: extractError(response.message)
            });

            if (matchError(response.message, 'auth.login.username')) {
                data.username.error = extractError(response.message);
            } else if (matchError(response.message, 'auth.login.password')) {
                data.password.error = extractError(response.message);
            }

            return;
        }

        SwalAlert({
            icon: 'success',
            title: 'Byl jsi úspěšně přihlášen'
        });

        _state.userState = {
            logged: true,
            data: response.data
        };

        goto('/app');
    };
</script>

<svelte:head>
    <title>Přihlášení | FamilyAPP</title>
</svelte:head>

<section class="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:m-auto md:flex-[0] md:rounded-md md:border-2 md:border-accent md:bg-secondary md:p-8">
    <Title class="text-center text-3xl lg:text-4xl">Přihlášení</Title>
    <Entry id="username" label="Uživatelské jméno" error={data.username.error}>
        <Input id="username" bind:value={data.username.value} invalid={data.username.error} />
    </Entry>
    <Entry id="password" label="Heslo" error={data.password.error}>
        <Input id="password" type="password" bind:value={data.password.value} invalid={data.password.error} />
    </Entry>
    <Button onclick={login} class="w-1/2 md:hover:bg-red-500">Přihlásit se</Button>
</section>
<Footer />
