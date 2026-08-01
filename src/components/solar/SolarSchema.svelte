<script lang="ts">
    import Icon from '$/components/Icon.svelte';
    import { API } from '$/lib/api';
    import { SwalAlert } from '$/lib/functions';
    import { onDestroy, onMount } from 'svelte';

    type PumpMode = 'AUTO' | 'ON' | 'OFF';

    interface LiveData {
        id: string;
        uptime: string;
        lastDate: string;
        lastTime: string;
        solarTemp: number;
        solarPipeTemp: number;
        boilerTopTemp: number;
        boilerBottomTemp: number;
        pumpActive: boolean;
        pumpMode: PumpMode;
        pwmSpeed: number;
        wifiSignal: number;
        statusError: string;
    }

    let liveData = $state<LiveData | null>(null);
    let loading = $state(true);
    let updatingMode = $state(false);
    let timer: ReturnType<typeof setInterval>;

    const loadLiveData = async () => {
        const res = await API.energyface.live();
        if (res.status && res.data) {
            liveData = res.data;
        }
        loading = false;
    };

    const changePumpMode = async (mode: PumpMode) => {
        if (!liveData || liveData.pumpMode === mode || updatingMode) return;
        updatingMode = true;

        const res = await API.energyface.control({ mode });
        updatingMode = false;

        if (res.status) {
            SwalAlert({
                icon: 'success',
                title: `Režim čerpadla byl nastaven na ${mode}`,
                timer: 2000
            });
            await loadLiveData();
        } else {
            SwalAlert({
                icon: 'error',
                title: 'Nepodařilo se změnit režim čerpadla',
                text: res.message
            });
        }
    };

    onMount(() => {
        loadLiveData();
        timer = setInterval(loadLiveData, 10000);
    });

    onDestroy(() => {
        if (timer) clearInterval(timer);
    });
</script>

<div
    class="border-primary/20 bg-secondary/80 flex flex-col gap-6 rounded-2xl border p-4 shadow-xl backdrop-blur-md md:p-6"
>
    <!-- Header Row -->
    <div
        class="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4"
    >
        <div class="flex items-center gap-3">
            <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400"
            >
                <Icon name="bi-sun-fill" class="text-2xl" />
            </div>
            <div>
                <h2 class="font-poppins text-xl font-bold text-white md:text-2xl">
                    Solární Systém
                </h2>
                <p class="text-xs text-gray-400">
                    {#if liveData}
                        Poslední přenos: {liveData.lastDate} {liveData.lastTime}
                    {:else}
                        Načítání dat...
                    {/if}
                </p>
            </div>
        </div>

        <button
            onclick={loadLiveData}
            disabled={loading}
            class="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm font-medium text-gray-200 transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
        >
            <Icon name="bi-arrow-clockwise" class={loading ? 'animate-spin' : ''} />
            <span>Obnovit</span>
        </button>
    </div>

    {#if loading && !liveData}
        <div class="flex h-64 items-center justify-center">
            <div class="flex flex-col items-center gap-3">
                <div
                    class="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"
                ></div>
                <p class="text-sm font-medium text-gray-400">Načítání schématu...</p>
            </div>
        </div>
    {:else if liveData}
        <!-- Vector Schematic SVG -->
        <div
            class="relative overflow-hidden rounded-xl border border-white/5 bg-slate-950/60 p-4 md:p-6"
        >
            <svg viewBox="0 0 800 480" class="h-auto w-full drop-shadow-md">
                <defs>
                    <!-- Tank Gradient -->
                    <linearGradient id="tankGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.85" />
                        <stop offset="45%" stop-color="#f97316" stop-opacity="0.75" />
                        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.85" />
                    </linearGradient>

                    <!-- Solar Collector Gradient -->
                    <linearGradient id="solarGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#1e293b" />
                        <stop offset="50%" stop-color="#334155" />
                        <stop offset="100%" stop-color="#0f172a" />
                    </linearGradient>
                </defs>

                <!-- Solar Collector Unit (Neat Position) -->
                <g transform="translate(80, 50)">
                    <!-- Collector Frame -->
                    <rect
                        x="0"
                        y="0"
                        width="180"
                        height="95"
                        rx="8"
                        fill="url(#solarGradient)"
                        stroke="#f97316"
                        stroke-width="2"
                    />
                    <!-- Solar Grid Lines -->
                    <line
                        x1="36"
                        y1="0"
                        x2="36"
                        y2="95"
                        stroke="#38bdf8"
                        stroke-width="1"
                        stroke-dasharray="2,2"
                        opacity="0.5"
                    />
                    <line
                        x1="72"
                        y1="0"
                        x2="72"
                        y2="95"
                        stroke="#38bdf8"
                        stroke-width="1"
                        stroke-dasharray="2,2"
                        opacity="0.5"
                    />
                    <line
                        x1="108"
                        y1="0"
                        x2="108"
                        y2="95"
                        stroke="#38bdf8"
                        stroke-width="1"
                        stroke-dasharray="2,2"
                        opacity="0.5"
                    />
                    <line
                        x1="144"
                        y1="0"
                        x2="144"
                        y2="95"
                        stroke="#38bdf8"
                        stroke-width="1"
                        stroke-dasharray="2,2"
                        opacity="0.5"
                    />
                    <!-- Mounting Stand Support -->
                    <rect x="20" y="95" width="140" height="6" fill="#475569" rx="2" />
                    <line
                        x1="40"
                        y1="101"
                        x2="40"
                        y2="120"
                        stroke="#64748b"
                        stroke-width="4"
                        stroke-linecap="round"
                    />
                    <line
                        x1="140"
                        y1="101"
                        x2="140"
                        y2="120"
                        stroke="#64748b"
                        stroke-width="4"
                        stroke-linecap="round"
                    />
                </g>

                <!-- Pipes Circuit -->
                <!-- Hot Supply Pipe (Solar Outlet -> Boiler Top) -->
                <path
                    d="M 260 80 L 510 80 L 510 160"
                    fill="none"
                    stroke="#ef4444"
                    stroke-width="6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M 260 80 L 510 80 L 510 160"
                    fill="none"
                    stroke="#fca5a5"
                    stroke-width="3"
                    stroke-dasharray="8,8"
                    class={liveData.pumpActive || liveData.pumpMode === 'ON'
                        ? 'animate-flow'
                        : ''}
                />

                <!-- Cold Return Pipe (Boiler Bottom -> Pump -> Solar Inlet) -->
                <path
                    d="M 510 380 L 510 410 L 140 410 L 140 145"
                    fill="none"
                    stroke="#3b82f6"
                    stroke-width="6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M 510 380 L 510 410 L 140 410 L 140 145"
                    fill="none"
                    stroke="#93c5fd"
                    stroke-width="3"
                    stroke-dasharray="8,8"
                    class={liveData.pumpActive || liveData.pumpMode === 'ON'
                        ? 'animate-flow-reverse'
                        : ''}
                />

                <!-- Solar Circulation Pump (OUT2) -->
                <g transform="translate(330, 410)">
                    <circle
                        cx="0"
                        cy="0"
                        r="24"
                        fill="#1e293b"
                        stroke={liveData.pumpActive || liveData.pumpMode === 'ON'
                            ? '#22c55e'
                            : '#64748b'}
                        stroke-width="3"
                    />
                    <circle cx="0" cy="0" r="18" fill="#0f172a" />

                    <!-- Spinning Impeller Blades (Precise rotation around 0,0) -->
                    <g
                        class={liveData.pumpActive || liveData.pumpMode === 'ON'
                            ? 'animate-spin-impeller'
                            : ''}
                    >
                        <path
                            d="M 0 0 L 0 -12 M 0 0 L 10 6 M 0 0 L -10 6"
                            stroke={liveData.pumpActive || liveData.pumpMode === 'ON'
                                ? '#4ade80'
                                : '#94a3b8'}
                            stroke-width="4"
                            stroke-linecap="round"
                        />
                    </g>
                </g>

                <!-- Water Boiler Tank (Clean Buffer) -->
                <g transform="translate(480, 130)">
                    <rect
                        x="0"
                        y="0"
                        width="160"
                        height="260"
                        rx="30"
                        fill="url(#tankGradient)"
                        stroke="#94a3b8"
                        stroke-width="3"
                    />
                    <rect
                        x="10"
                        y="10"
                        width="140"
                        height="240"
                        rx="20"
                        fill="none"
                        stroke="white"
                        stroke-dasharray="4,4"
                        opacity="0.2"
                    />
                </g>

                <!-- Temperature Sensor Badges -->
                <!-- Solar Collector Temp Badge -->
                <g transform="translate(110, 15)">
                    <rect
                        x="0"
                        y="0"
                        width="120"
                        height="32"
                        rx="8"
                        fill="#0f172a"
                        stroke="#f97316"
                        stroke-width="2"
                    />
                    <text x="10" y="21" fill="#fb923c" font-size="11" font-weight="bold"
                        >Kolektor</text
                    >
                    <text
                        x="110"
                        y="21"
                        text-anchor="end"
                        fill="white"
                        font-size="13"
                        font-weight="bold">{liveData.solarTemp} °C</text
                    >
                </g>

                <!-- Solar Pipe Temp Badge -->
                <g transform="translate(340, 355)">
                    <rect
                        x="0"
                        y="0"
                        width="115"
                        height="32"
                        rx="8"
                        fill="#0f172a"
                        stroke="#38bdf8"
                        stroke-width="2"
                    />
                    <text x="10" y="20" fill="#38bdf8" font-size="11" font-weight="bold"
                        >Potrubí</text
                    >
                    <text
                        x="105"
                        y="20"
                        text-anchor="end"
                        fill="white"
                        font-size="13"
                        font-weight="bold">{liveData.solarPipeTemp} °C</text
                    >
                </g>

                <!-- Boiler Top Temp Badge (Spacious to prevent text collision) -->
                <g transform="translate(650, 160)">
                    <rect
                        x="0"
                        y="0"
                        width="145"
                        height="36"
                        rx="8"
                        fill="#0f172a"
                        stroke="#ef4444"
                        stroke-width="2"
                    />
                    <text x="10" y="22" fill="#fca5a5" font-size="11" font-weight="bold"
                        >Bojler nahoře</text
                    >
                    <text
                        x="135"
                        y="22"
                        text-anchor="end"
                        fill="#f87171"
                        font-size="13"
                        font-weight="bold">{liveData.boilerTopTemp} °C</text
                    >
                </g>

                <!-- Boiler Bottom Temp Badge (Spacious to prevent text collision) -->
                <g transform="translate(650, 320)">
                    <rect
                        x="0"
                        y="0"
                        width="145"
                        height="36"
                        rx="8"
                        fill="#0f172a"
                        stroke="#3b82f6"
                        stroke-width="2"
                    />
                    <text x="10" y="22" fill="#93c5fd" font-size="11" font-weight="bold"
                        >Bojler dole</text
                    >
                    <text
                        x="135"
                        y="22"
                        text-anchor="end"
                        fill="#60a5fa"
                        font-size="13"
                        font-weight="bold">{liveData.boilerBottomTemp} °C</text
                    >
                </g>

                <!-- Pump Label Badge (Moved down with top margin from pump image) -->
                <g transform="translate(240, 460)">
                    <text
                        x="90"
                        y="0"
                        text-anchor="middle"
                        fill="#cbd5e1"
                        font-size="12"
                        font-weight="bold">Čerpadlo soláru (OUT2)</text
                    >
                </g>
            </svg>
        </div>

        <!-- Controls & Status Box -->
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <!-- Pump Mode Controls Card -->
            <div
                class="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
            >
                <div>
                    <div class="flex items-center justify-between">
                        <span
                            class="text-sm font-semibold tracking-wider text-gray-400 uppercase"
                            >Řízení Solárního Čerpadla</span
                        >
                        <span
                            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold"
                            class:bg-emerald-500-20={liveData.pumpActive}
                            class:text-emerald-400={liveData.pumpActive}
                            class:bg-slate-700={!liveData.pumpActive}
                            class:text-slate-300={!liveData.pumpActive}
                        >
                            <span
                                class="h-2 w-2 rounded-full"
                                class:bg-emerald-400={liveData.pumpActive}
                                class:animate-ping={liveData.pumpActive}
                                class:bg-slate-400={!liveData.pumpActive}
                            ></span>
                            {liveData.pumpActive ? 'ČERPADLO BĚŽÍ' : 'ČERPADLO STOJÍ'}
                        </span>
                    </div>
                    <p class="mt-1 text-xs text-gray-400">
                        Nastavení provozního režimu relé solárního okruhu:
                    </p>
                </div>

                <!-- Mode Selectors (AUTO / ON / OFF) -->
                <div class="grid grid-cols-3 gap-2">
                    <button
                        onclick={() => changePumpMode('AUTO')}
                        disabled={updatingMode}
                        class="flex flex-col items-center justify-center gap-1 rounded-xl border p-3 font-semibold transition-all active:scale-95 disabled:opacity-50"
                        class:border-amber-500={liveData.pumpMode === 'AUTO'}
                        class:bg-amber-500-20={liveData.pumpMode === 'AUTO'}
                        class:text-amber-300={liveData.pumpMode === 'AUTO'}
                        class:border-white-10={liveData.pumpMode !== 'AUTO'}
                        class:bg-white-5={liveData.pumpMode !== 'AUTO'}
                        class:text-gray-300={liveData.pumpMode !== 'AUTO'}
                    >
                        <Icon name="bi-cpu" class="text-xl" />
                        <span class="text-xs">AUTO</span>
                    </button>

                    <button
                        onclick={() => changePumpMode('ON')}
                        disabled={updatingMode}
                        class="flex flex-col items-center justify-center gap-1 rounded-xl border p-3 font-semibold transition-all active:scale-95 disabled:opacity-50"
                        class:border-emerald-500={liveData.pumpMode === 'ON'}
                        class:bg-emerald-500-20={liveData.pumpMode === 'ON'}
                        class:text-emerald-300={liveData.pumpMode === 'ON'}
                        class:border-white-10={liveData.pumpMode !== 'ON'}
                        class:bg-white-5={liveData.pumpMode !== 'ON'}
                        class:text-gray-300={liveData.pumpMode !== 'ON'}
                    >
                        <Icon name="bi-play-fill" class="text-xl" />
                        <span class="text-xs">ZAPNUTO</span>
                    </button>

                    <button
                        onclick={() => changePumpMode('OFF')}
                        disabled={updatingMode}
                        class="flex flex-col items-center justify-center gap-1 rounded-xl border p-3 font-semibold transition-all active:scale-95 disabled:opacity-50"
                        class:border-rose-500={liveData.pumpMode === 'OFF'}
                        class:bg-rose-500-20={liveData.pumpMode === 'OFF'}
                        class:text-rose-300={liveData.pumpMode === 'OFF'}
                        class:border-white-10={liveData.pumpMode !== 'OFF'}
                        class:bg-white-5={liveData.pumpMode !== 'OFF'}
                        class:text-gray-300={liveData.pumpMode !== 'OFF'}
                    >
                        <Icon name="bi-power" class="text-xl" />
                        <span class="text-xs">VYPNUTO</span>
                    </button>
                </div>
            </div>

            <!-- Stats & Diagnostics Grid -->
            <div class="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                <div
                    class="flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                >
                    <span class="text-gray-400">Síla Wi-Fi signálu</span>
                    <div
                        class="mt-1 flex items-center gap-2 text-base font-bold text-white"
                    >
                        <Icon name="bi-wifi" class="text-sky-400" />
                        <span>{liveData.wifiSignal} %</span>
                    </div>
                </div>

                <div
                    class="flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                >
                    <span class="text-gray-400">Čas provozu (Uptime)</span>
                    <div
                        class="mt-1 flex items-center gap-2 text-xs font-bold text-white"
                    >
                        <Icon name="bi-clock-history" class="text-emerald-400" />
                        <span>{liveData.uptime || 'N/A'}</span>
                    </div>
                </div>

                <div
                    class="flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                >
                    <span class="text-gray-400">Stav jednotky</span>
                    <div
                        class="mt-1 flex items-center gap-2 text-xs font-bold text-white"
                    >
                        <Icon name="bi-shield-check" class="text-indigo-400" />
                        <span>{liveData.statusError}</span>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    @keyframes flow {
        from {
            stroke-dashoffset: 32;
        }
        to {
            stroke-dashoffset: 0;
        }
    }
    @keyframes flow-reverse {
        from {
            stroke-dashoffset: 0;
        }
        to {
            stroke-dashoffset: 32;
        }
    }
    @keyframes spin-center {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .animate-flow {
        animation: flow 1s linear infinite;
    }
    .animate-flow-reverse {
        animation: flow-reverse 1s linear infinite;
    }
    .animate-spin-impeller {
        transform-origin: 0px 0px;
        animation: spin-center 1.2s linear infinite;
    }
</style>
