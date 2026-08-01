<script lang="ts">
    import Icon from '$/components/Icon.svelte';
    import { API } from '$/lib/api';
    import { SwalAlert } from '$/lib/functions';
    import { onMount } from 'svelte';

    let enabled = $state(false);
    let maxTemp = $state(75);
    let downTemp = $state(60);
    let overheatTemp = $state(80);
    let freezeTemp = $state(-15);
    let freezeTargetTemp = $state(-10);

    let activeOverride = $state<string | null>(null);
    let lastAction = $state<string | null>(null);
    let lastActionAt = $state<string | null>(null);

    let loading = $state(true);
    let saving = $state(false);

    const loadConfig = async () => {
        const res = await API.energyface.cooling.get();
        if (res.status && res.data) {
            enabled = res.data.enabled;
            maxTemp = res.data.maxTemp;
            downTemp = res.data.downTemp;
            overheatTemp = res.data.overheatTemp;
            freezeTemp = res.data.freezeTemp;
            freezeTargetTemp = res.data.freezeTargetTemp;
            activeOverride = res.data.activeOverride;
            lastAction = res.data.lastAction;
            lastActionAt = res.data.lastActionAt;
        }
        loading = false;
    };

    const saveConfig = async () => {
        saving = true;
        const res = await API.energyface.cooling.save({
            enabled,
            maxTemp,
            downTemp,
            overheatTemp,
            freezeTemp,
            freezeTargetTemp
        });
        saving = false;

        if (res.status) {
            SwalAlert({
                icon: 'success',
                title: res.message
            });
            await loadConfig();
        } else {
            SwalAlert({
                icon: 'error',
                title: 'Chyba při ukládání',
                text: res.message
            });
        }
    };

    onMount(() => {
        loadConfig();
    });
</script>

<div
    class="border-primary/20 bg-secondary/80 flex flex-col gap-6 rounded-2xl border p-4 shadow-xl backdrop-blur-md md:p-6"
>
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-white/10 pb-4">
        <div class="flex items-center gap-3">
            <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400"
            >
                <Icon name="bi-snow" class="text-2xl" />
            </div>
            <div>
                <h2 class="font-poppins text-xl font-bold text-white md:text-2xl">
                    Automatické Chlazení & Ochrana
                </h2>
                <p class="text-xs text-gray-400">
                    Chytré řízení teploty vody a bezpečnostní limity
                </p>
            </div>
        </div>

        <!-- Master Switch -->
        <label class="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" bind:checked={enabled} class="peer sr-only" />
            <div
                class="peer h-7 w-13 rounded-full bg-gray-700 peer-checked:bg-cyan-500 peer-focus:outline-none after:absolute after:top-0.5 after:left-[2px] after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"
            ></div>
        </label>
    </div>

    {#if loading}
        <div class="flex h-40 items-center justify-center">
            <div
                class="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"
            ></div>
        </div>
    {:else}
        <!-- Status Banner -->
        <div
            class="flex items-start gap-3 rounded-xl border p-4 text-sm"
            class:border-cyan-500-40={activeOverride === 'COOLING'}
            class:bg-cyan-500-10={activeOverride === 'COOLING'}
            class:border-amber-500-40={activeOverride === 'HEATING_PREVENTION' ||
                activeOverride === 'OVERHEAT_PROTECTION'}
            class:bg-amber-500-10={activeOverride === 'HEATING_PREVENTION' ||
                activeOverride === 'OVERHEAT_PROTECTION'}
            class:border-blue-500-40={activeOverride === 'FREEZE_PROTECTION'}
            class:bg-blue-500-10={activeOverride === 'FREEZE_PROTECTION'}
            class:border-white-10={!activeOverride}
            class:bg-white-5={!activeOverride}
        >
            <Icon
                name={activeOverride ? 'bi-exclamation-triangle-fill' : 'bi-shield-check'}
                class="mt-0.5 text-xl {activeOverride === 'COOLING'
                    ? 'text-cyan-400'
                    : activeOverride === 'HEATING_PREVENTION' ||
                        activeOverride === 'OVERHEAT_PROTECTION'
                      ? 'text-amber-400'
                      : activeOverride === 'FREEZE_PROTECTION'
                        ? 'text-blue-400'
                        : 'text-emerald-400'}"
            />
            <div class="flex-1">
                <div class="font-bold text-white">
                    {#if activeOverride === 'COOLING'}
                        Aktivní automatické chlazení vody
                    {:else if activeOverride === 'HEATING_PREVENTION'}
                        Pozastaveno chlazení (Prevence ohřevu sluncem)
                    {:else if activeOverride === 'FREEZE_PROTECTION'}
                        Aktivní protimrazová ochrana solárního okruhu
                    {:else if activeOverride === 'OVERHEAT_PROTECTION'}
                        Aktivní ochrana před přehřátím solárního kolektoru
                    {:else}
                        Systém je v normálním stavu {!enabled
                            ? '(Automatické chlazení vypnuto)'
                            : ''}
                    {/if}
                </div>
                {#if lastAction}
                    <p class="mt-1 text-xs text-gray-300">{lastAction}</p>
                {/if}
                {#if lastActionAt}
                    <span class="mt-1 block text-[10px] text-gray-400"
                        >Poslední změna: {new Date(lastActionAt).toLocaleString(
                            'cs-CZ'
                        )}</span
                    >
                {/if}
            </div>
        </div>

        <!-- Inputs Grid -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- Max Boiler Temp -->
            <div
                class="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4"
            >
                <div class="flex items-center justify-between text-sm">
                    <span class="font-medium text-gray-200"
                        >Max. teplota bojleru pro spuštění</span
                    >
                    <span class="font-mono text-base font-bold text-rose-400"
                        >{maxTemp} °C</span
                    >
                </div>
                <input
                    type="range"
                    min="40"
                    max="90"
                    step="1"
                    bind:value={maxTemp}
                    class="h-2 w-full cursor-pointer rounded-lg bg-gray-700 accent-rose-500"
                />
                <p class="text-[11px] text-gray-400">
                    Při překročení se spustí oběhové čerpadlo pro ochlazení vody v bojleru
                    skrze solární panel.
                </p>
            </div>

            <!-- Down Target Temp -->
            <div
                class="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4"
            >
                <div class="flex items-center justify-between text-sm">
                    <span class="font-medium text-gray-200"
                        >Cílová teplota po ochlazení</span
                    >
                    <span class="font-mono text-base font-bold text-cyan-400"
                        >{downTemp} °C</span
                    >
                </div>
                <input
                    type="range"
                    min="30"
                    max="80"
                    step="1"
                    bind:value={downTemp}
                    class="h-2 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-500"
                />
                <p class="text-[11px] text-gray-400">
                    Jakmile teplota bojleru klesne na tuto hodnotu, čerpadlo se přepne
                    zpět do AUTO režimu.
                </p>
            </div>

            <!-- Overheat Protection Temp -->
            <div
                class="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4"
            >
                <div class="flex items-center justify-between text-sm">
                    <span class="font-medium text-gray-200"
                        >Ochrana přehřátí kolektoru</span
                    >
                    <span class="font-mono text-base font-bold text-amber-400"
                        >{overheatTemp} °C</span
                    >
                </div>
                <input
                    type="range"
                    min="65"
                    max="95"
                    step="1"
                    bind:value={overheatTemp}
                    class="h-2 w-full cursor-pointer rounded-lg bg-gray-700 accent-amber-500"
                />
                <p class="text-[11px] text-gray-400">
                    Pokud teplota na kolektoru dosáhne této hranice a čerpadlo je VYPNUTO,
                    přepne se automaticky na AUTO.
                </p>
            </div>

            <!-- Freeze Protection Temp -->
            <div
                class="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4"
            >
                <div class="flex items-center justify-between text-sm">
                    <span class="font-medium text-gray-200"
                        >Protimrazová ochrana kolektoru</span
                    >
                    <span class="font-mono text-base font-bold text-blue-400"
                        >{freezeTemp} °C</span
                    >
                </div>
                <input
                    type="range"
                    min="-25"
                    max="5"
                    step="1"
                    bind:value={freezeTemp}
                    class="h-2 w-full cursor-pointer rounded-lg bg-gray-700 accent-blue-500"
                />
                <p class="text-[11px] text-gray-400">
                    V zimě při poklesu pod tuto teplotu spustí čerpadlo (ON) na oběh pro
                    zabránění zamrznutí kolektoru.
                </p>
            </div>
        </div>

        <!-- Submit Button -->
        <button
            onclick={saveConfig}
            disabled={saving}
            class="font-poppins flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-base font-bold text-white transition-all hover:bg-cyan-500 active:scale-98 disabled:opacity-50"
        >
            <Icon name="bi-floppy-fill" class={saving ? 'animate-bounce' : ''} />
            <span>Uložit nastavení chlazení</span>
        </button>
    {/if}
</div>
