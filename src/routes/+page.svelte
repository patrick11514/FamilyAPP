<script lang="ts">
    import Button from '$/components/form/Button.svelte';
    import Entry from '$/components/form/Entry.svelte';
    import Input from '$/components/form/Input.svelte';
    import Title from '$/components/headers/Title.svelte';
    import { API } from '$/lib/api';
    import { extractError } from '$/lib/errors';
    import { SwalAlert } from '$/lib/functions';

    const fields = ['username', 'password'] as const;
    type DataType = Record<
        (typeof fields)[number],
        {
            value: string;
            error?: string;
        }
    >;

    const data = $state(Object.fromEntries(fields.map((item) => [item, { value: '' }])) as DataType);

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
            return;
        }

        //ok
    };
</script>

<section class="flex flex-1 flex-col items-center justify-center gap-4 p-4">
    <Title class="text-center text-3xl lg:text-4xl">Přihlášení</Title>
    <Entry id="username" label="Uživatelské jméno" error={data.username.error}>
        <Input id="username" bind:value={data.username.value} invalid={data.username.error} />
    </Entry>
    <Entry id="password" label="Heslo" error={data.password.error}>
        <Input id="password" type="password" bind:value={data.password.value} invalid={data.password.error} />
    </Entry>
    <Button onclick={login} class="w-1/2">Přihlásit se</Button>
</section>
