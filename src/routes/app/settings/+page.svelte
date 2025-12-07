<script lang="ts">
    import { Button, Input, Select } from '$/components/form';
    import Title from '$/components/headers/Title.svelte';
    import { BANK_CODES } from '$/lib/bankCodes';
    import { API } from '$/lib/api';
    import { SwalAlert } from '$/lib/functions';
    import { onMount } from 'svelte';

    let bankAccountPrefix = $state<string>('');
    let bankAccountNumber = $state<string>('');
    let bankCode = $state<string>('');

    onMount(async () => {
        const response = await API.users.bankSettings.GET();
        if (response.status && response.data) {
            bankAccountPrefix = response.data.bank_account_prefix ?? '';
            bankAccountNumber = response.data.bank_account_number ?? '';
            bankCode = response.data.bank_code ?? '';
        }
    });

    const saveSettings = async () => {
        const response = await API.users.bankSettings.PATCH({
            bank_account_prefix: bankAccountPrefix || null,
            bank_account_number: bankAccountNumber || null,
            bank_code: bankCode || null
        });

        if (!response.status) {
            SwalAlert({
                icon: 'error',
                title: response.message
            });
            return;
        }

        SwalAlert({
            icon: 'success',
            title: 'Nastavení bankovního účtu bylo úspěšně uloženo'
        });
    };
</script>

<section class="flex flex-1 flex-col gap-4 p-4">
    <Title>Nastavení</Title>

    <div class="bg-secondary rounded-lg p-4 shadow-md">
        <h2 class="mb-4 text-xl font-bold">Bankovní účet</h2>
        <p class="mb-4 text-sm opacity-75">
            Zadejte informace o vašem bankovním účtu pro generování QR kódů k platbám
        </p>

        <div class="flex flex-col gap-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                    type="text"
                    label="Předčíslí"
                    bind:value={bankAccountPrefix}
                    placeholder="např. 19"
                />
                <Input
                    type="text"
                    label="Číslo účtu"
                    bind:value={bankAccountNumber}
                    placeholder="např. 2000145399"
                />
                <Select label="Kód banky" bind:value={bankCode}>
                    <option value="" selected>Vyberte banku</option>
                    {#each BANK_CODES as bank (bank.code)}
                        <option value={bank.code}>{bank.code} - {bank.name}</option>
                    {/each}
                </Select>
            </div>

            <div class="text-sm opacity-75">
                <strong>Formát účtu:</strong>
                {bankAccountPrefix || '0'}-{bankAccountNumber ||
                    'XXXXXXXXXX'}/{bankCode || 'XXXX'}
            </div>

            <Button onclick={saveSettings} class="w-full md:w-auto">
                Uložit nastavení
            </Button>
        </div>
    </div>
</section>
