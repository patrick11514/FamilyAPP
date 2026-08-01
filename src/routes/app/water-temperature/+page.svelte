<script lang="ts">
    import MonthSelector from '$/components/form/MonthSelector.svelte';
    import Icon from '$/components/Icon.svelte';
    import SolarCoolingControls from '$/components/solar/SolarCoolingControls.svelte';
    import SolarSchema from '$/components/solar/SolarSchema.svelte';
    import { API } from '$/lib/api';
    import { Calendar, SwalAlert } from '$/lib/functions';
    import { getState } from '$/lib/state.svelte';
    import { browser } from '$app/environment';
    import Chart from 'chart.js/auto';
    import 'chartjs-adapter-date-fns';
    import { onMount } from 'svelte';
    import { SvelteDate } from 'svelte/reactivity';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    type TabType = 'schema' | 'chart' | 'cooling';
    let activeTab = $state<TabType>('chart');

    let canvas = $state<HTMLCanvasElement>();
    const calendar = new Calendar();

    const today = new Date();
    let year = $state(today.getFullYear());
    let month = $state(today.getMonth());
    let day = $state(today.getDate());
    let maxDays = $state(calendar.getLastDayOfMonth(today).getDate());

    let lastUpdate = new SvelteDate();
    let lastUpper = $state(0);
    let lastLower = $state(0);

    let topToday = $state(0);

    $effect(() => {
        maxDays = calendar.getLastDayOfMonth(new Date(year, month)).getDate();
        if (day > maxDays) {
            day = maxDays;
        }
    });

    $effect(() => {
        if (browser) {
            localStorage.setItem('water_temp_tab', activeTab);
        }
    });

    const nextDay = () => {
        const date = new Date(year, month, day + 1);
        if (date > today) return;
        year = date.getFullYear();
        month = date.getMonth();
        day = date.getDate();
    };

    const previousDay = () => {
        const date = new Date(year, month, day - 1);
        year = date.getFullYear();
        month = date.getMonth();
        day = date.getDate();
    };

    const handleKeys = (ev: KeyboardEvent) => {
        if (activeTab !== 'chart') return;
        if (ev.key === 'ArrowLeft') {
            previousDay();
        } else if (ev.key === 'ArrowRight') {
            nextDay();
        }
    };

    let chart: Chart<'line', { x: Date; y: number }[]> | undefined;

    const loadData = async (year: number, month: number, day: number) => {
        if (!chart) return;
        const data = await API.energyface.get({ year, month, day });
        if (!data.status) {
            SwalAlert({
                icon: 'error',
                title: 'Nepodařilo se načíst data'
            });
            return;
        }
        const { lower, upper } = data.data;
        chart.data.datasets[0].data = lower;
        chart.data.datasets[1].data = upper;

        chart.update();

        const _lastLower = lower[lower.length - 1];
        const _lastUpper = upper[upper.length - 1];
        if (_lastLower && _lastUpper) {
            const lastDate = new Date(
                _lastLower.x > _lastUpper.x ? _lastLower.x : _lastUpper.x
            );
            lastUpdate.setHours(lastDate.getHours(), lastDate.getMinutes(), 0, 0);

            lastLower = _lastLower.y;
            lastUpper = _lastUpper.y;
        }

        topToday = [...upper, ...lower].reduce(
            (max, cur) => (cur.y > max ? cur.y : max),
            0
        );
    };

    $effect(() => {
        if (browser && activeTab === 'chart' && canvas && !chart) {
            import('chartjs-plugin-zoom').then((module) => {
                if (!chart && canvas) {
                    Chart.register(module.default);
                    const baseConfig = {
                        lineTension: 0.3,
                        pointRadius: 0,
                        fill: false
                    };

                    chart = new Chart(canvas, {
                        type: 'line',
                        data: {
                            datasets: [
                                {
                                    label: 'Voda dole',
                                    data: [],
                                    borderColor: 'oklch(62.3% 0.214 259.815)',
                                    backgroundColor: 'oklch(62.3% 0.214 259.815)',
                                    ...baseConfig
                                },
                                {
                                    label: 'Voda nahoře',
                                    data: [],
                                    borderColor: 'oklch(63.7% 0.237 25.331)',
                                    backgroundColor: 'oklch(63.7% 0.237 25.331)',
                                    ...baseConfig
                                }
                            ]
                        },
                        options: {
                            scales: {
                                x: {
                                    type: 'time',
                                    time: {
                                        unit: 'minute',
                                        displayFormats: {
                                            minute: 'HH:mm',
                                            hour: 'HH:mm'
                                        },
                                        tooltipFormat: 'HH:mm'
                                    },
                                    ticks: {
                                        color: 'white',
                                        font: {
                                            size: 14,
                                            weight: 'bold'
                                        }
                                    }
                                },
                                y: {
                                    ticks: {
                                        color: 'white',
                                        font: {
                                            size: 14
                                        }
                                    }
                                }
                            },
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: {
                                mode: 'index',
                                intersect: false
                            },
                            animation: {
                                duration: 0
                            },
                            plugins: {
                                zoom: {
                                    pan: {
                                        enabled: true,
                                        mode: 'x',
                                        onPanComplete: ({ chart: chartInstance }) => {
                                            const xAxis = chartInstance.scales.x;
                                            if (!xAxis) return;
                                            const minTime = xAxis.min;
                                            const maxTime = xAxis.max;

                                            const dayStart = new Date(
                                                year,
                                                month,
                                                day,
                                                0,
                                                0,
                                                0,
                                                0
                                            ).getTime();
                                            const dayEnd = new Date(
                                                year,
                                                month,
                                                day,
                                                23,
                                                59,
                                                59,
                                                999
                                            ).getTime();

                                            // If panned past the left edge (earlier than day start)
                                            if (minTime < dayStart - 30 * 60 * 1000) {
                                                previousDay();
                                            }
                                            // If panned past the right edge (later than day end)
                                            else if (maxTime > dayEnd + 30 * 60 * 1000) {
                                                nextDay();
                                            }
                                        }
                                    },
                                    zoom: {
                                        wheel: {
                                            enabled: true
                                        },
                                        pinch: {
                                            enabled: true
                                        },
                                        mode: 'x'
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: (ctx) =>
                                            `${ctx.dataset.label}: ${ctx.formattedValue} °C`
                                    },
                                    titleFont: {
                                        size: 16
                                    },
                                    bodyFont: {
                                        size: 14
                                    },
                                    footerFont: {
                                        size: 12
                                    },
                                    backgroundColor: '#222',
                                    titleColor: '#fff',
                                    bodyColor: '#fff',
                                    footerColor: '#ccc'
                                },
                                legend: {
                                    labels: {
                                        color: 'white',
                                        font: {
                                            size: 14
                                        }
                                    }
                                }
                            }
                        }
                    });

                    loadData(year, month, day);
                }
            });
        } else if (activeTab !== 'chart' && chart) {
            chart.destroy();
            chart = undefined;
        }
    });

    onMount(() => {
        const urlTab = new URLSearchParams(window.location.search).get(
            'tab'
        ) as TabType | null;
        const storedTab = localStorage.getItem('water_temp_tab') as TabType | null;
        const validTabs: TabType[] = ['schema', 'chart', 'cooling'];

        if (urlTab && validTabs.includes(urlTab)) {
            activeTab = urlTab;
        } else if (storedTab && validTabs.includes(storedTab)) {
            activeTab = storedTab;
        } else {
            activeTab = 'chart';
        }

        window.addEventListener('keydown', handleKeys);
        return () => {
            window.removeEventListener('keydown', handleKeys);
            if (chart) {
                chart.destroy();
            }
        };
    });

    $effect(() => {
        if (activeTab === 'chart') {
            const date = new Date(year, month, day);
            if (date > today) {
                year = today.getFullYear();
                month = today.getMonth();
                day = today.getDate();
                return;
            }
            loadData(year, month, day);
        }
    });

    const resetDay = () => {
        const isAlreadyToday =
            year === today.getFullYear() &&
            month === today.getMonth() &&
            day === today.getDate();

        if (isAlreadyToday) {
            loadData(year, month, day);
        } else {
            year = today.getFullYear();
            month = today.getMonth();
            day = today.getDate();
        }
    };

    const resetZoom = () => {
        chart?.resetZoom();
    };

    const _state = getState();

    let subscribed = $state(data.subscribed);

    const toggleNotifications = async () => {
        if (!_state.pushEnabled) {
            SwalAlert({
                icon: 'info',
                title: 'Pro povolení notifikací ohledně teploty vody je potřeba mít povolené notifikace v aplikaci.',
                timer: 10000
            });
            return;
        }

        if (subscribed) {
            const confirm = await SwalAlert({
                toast: false,
                timer: 0,
                position: 'center',
                title: 'Opravdu se chceš odhlásit z notifikací?',
                showConfirmButton: true,
                confirmButtonText: 'Ano',
                showCancelButton: true,
                cancelButtonText: 'Ne'
            });
            if (!confirm) return;

            const result = await API.energyface.subscription.DELETE('');
            if (!result.status) {
                SwalAlert({
                    icon: 'error',
                    title: 'Nepodařilo se odhlásit z notifikací'
                });
                return;
            }
            subscribed = false;
            SwalAlert({
                icon: 'success',
                title: 'Byl jsi úspěšně odhlášen z notifikací'
            });
            return;
        }

        const confirmation = await SwalAlert({
            toast: false,
            timer: 0,
            position: 'center',
            title: 'Opravdu se chceš přihlásit k notifikacím ohledně teploty vody?',
            showConfirmButton: true,
            confirmButtonText: 'Ano',
            showCancelButton: true,
            cancelButtonText: 'Ne'
        });
        if (!confirmation) return;

        const subscription = await API.energyface.subscription.PUT('');
        if (!subscription.status) {
            SwalAlert({
                icon: 'error',
                title: 'Nepodařilo se přihlásit k notifikacím'
            });
            return;
        }
        subscribed = true;
        SwalAlert({
            icon: 'success',
            title: 'Byl jsi úspěšně přihlášen k notifikacím'
        });
    };
</script>

<section class="flex flex-1 flex-col gap-4">
    <!-- Top Action Bar & Tab Switcher -->
    <div
        class="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3"
    >
        <!-- Sub-tabs -->
        <div
            class="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1"
        >
            <button
                onclick={() => (activeTab = 'chart')}
                class="flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all"
                class:bg-amber-500={activeTab === 'chart'}
                class:text-slate-950={activeTab === 'chart'}
                class:text-gray-300={activeTab !== 'chart'}
                class:hover:text-white={activeTab !== 'chart'}
            >
                <Icon name="bi-graph-up" />
                <span>Graf historie</span>
            </button>

            <button
                onclick={() => (activeTab = 'schema')}
                class="flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all"
                class:bg-amber-500={activeTab === 'schema'}
                class:text-slate-950={activeTab === 'schema'}
                class:text-gray-300={activeTab !== 'schema'}
                class:hover:text-white={activeTab !== 'schema'}
            >
                <Icon name="bi-diagram-3-fill" />
                <span>Schéma & Řízení</span>
            </button>

            <button
                onclick={() => (activeTab = 'cooling')}
                class="flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all"
                class:bg-amber-500={activeTab === 'cooling'}
                class:text-slate-950={activeTab === 'cooling'}
                class:text-gray-300={activeTab !== 'cooling'}
                class:hover:text-white={activeTab !== 'cooling'}
            >
                <Icon name="bi-snow" />
                <span>Chlazení</span>
            </button>
        </div>

        <!-- Quick Actions (Notifications) -->
        <div class="flex items-center gap-2">
            <button
                onclick={toggleNotifications}
                title={subscribed ? 'Odhlásit z notifikací' : 'Přihlásit k notifikacím'}
                class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-gray-200 transition-all hover:bg-white/10"
            >
                <Icon
                    name={subscribed ? 'bi-bell-fill' : 'bi-bell'}
                    class={subscribed ? 'text-amber-400' : 'text-gray-400'}
                />
                <span class="hidden sm:inline"
                    >{subscribed ? 'Notifikace aktivní' : 'Zapnout notifikace'}</span
                >
            </button>
        </div>
    </div>

    <!-- Active Tab Content -->
    {#if activeTab === 'schema'}
        <SolarSchema />
    {:else if activeTab === 'cooling'}
        <SolarCoolingControls />
    {:else if activeTab === 'chart'}
        <div class="flex flex-1 flex-col gap-4">
            <div class="flex w-full items-center gap-2 text-xl font-medium">
                <Icon
                    onclick={previousDay}
                    name="bi-chevron-left"
                    class="cursor-pointer p-1 hover:text-amber-400"
                />
                <select
                    bind:value={year}
                    class="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-sm text-white"
                >
                    <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
                    {#each Array.from({ length: 10 }) as _, i (i)}
                        {@const y = year - 5 + i}
                        <option value={y}>{y}</option>
                    {/each}
                </select>
                <MonthSelector bind:value={month} />
                <select
                    bind:value={day}
                    class="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-sm text-white"
                >
                    <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
                    {#each Array.from({ length: maxDays }) as _, i (i)}
                        <option value={i + 1}>{i + 1}</option>
                    {/each}
                </select>
                <Icon
                    onclick={nextDay}
                    name="bi-chevron-right"
                    class="cursor-pointer p-1 hover:text-amber-400"
                />
                <Icon
                    name="bi-zoom-out"
                    onclick={resetZoom}
                    class="ml-auto cursor-pointer p-1 hover:text-amber-400"
                    title="Obnovit přiblížení"
                />
                <Icon
                    name="bi-arrow-counterclockwise"
                    onclick={resetDay}
                    class="cursor-pointer p-1 hover:text-amber-400"
                    title="Dnešní den"
                />
            </div>

            <div class="mx-auto flex flex-col items-center gap-1 text-center font-bold">
                <h2 class="text-sm text-gray-400">
                    Poslední aktualizace: {lastUpdate.toLocaleString('cs-CZ', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </h2>
                <div class="flex flex-wrap justify-center gap-4 text-lg">
                    <span class="text-white"
                        >Nejvíce dnes: <strong class="text-amber-400"
                            >{topToday} °C</strong
                        ></span
                    >
                    <span class="text-red-400"
                        >Voda nahoře: <strong>{lastUpper} °C</strong></span
                    >
                    <span class="text-blue-400"
                        >Voda dole: <strong>{lastLower} °C</strong></span
                    >
                </div>
            </div>

            <div
                class="min-h-[350px] flex-1 rounded-xl border border-white/10 bg-slate-950/40 p-2"
            >
                <canvas bind:this={canvas}></canvas>
            </div>
        </div>
    {/if}
</section>
