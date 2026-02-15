<script lang="ts">
    import type { DailyRoutine } from '$/types/database';
    import { minToTime } from '$lib/timetableConfig';
    import type { Selectable } from 'kysely';
    import EntryModal from './EntryModal.svelte';
    import RoutineControls from './RoutineControls.svelte';

    type LocalEntry = {
        id?: number;
        day: number;
        start_min: number;
        end_min: number;
        title: string;
        type: 'lecture' | 'practice';
        subject: string;
        room?: string | null;
    };

    let { timetable, routine, isMe, onAdd, onDelete, onUpdateRoutine } = $props<{
        timetable: LocalEntry[];
        routine: Selectable<DailyRoutine>[];
        isMe: boolean;
        onAdd: (e: LocalEntry) => void;
        onDelete: (id: number) => void;
        onUpdateRoutine: (r: Partial<Selectable<DailyRoutine>>) => void;
    }>();

    // Configuration
    const days = ['Po', 'Út', 'St', 'Čt', 'Pá'];
    // Grid range from 7:00 to 20:00 (780 min total duration)
    const dayStartMin = 7 * 60; // 07:00
    const dayEndMin = 20 * 60; // 20:00
    const totalDuration = dayEndMin - dayStartMin;

    function getPositionStyles(start: number, end: number) {
        // Clamp values
        const s = Math.max(start, dayStartMin);
        const e = Math.min(end, dayEndMin);

        const top = ((s - dayStartMin) / totalDuration) * 100;
        const height = ((e - s) / totalDuration) * 100;

        return `top: ${top}%; height: ${height}%;`;
    }

    let showModal = $state(false);
    let editingEntry = $state<LocalEntry | undefined>(undefined);
    let selectedDay = $state(0);

    function startAdd(dayIndex: number) {
        if (!isMe) return;
        selectedDay = dayIndex;
        editingEntry = undefined;
        showModal = true;
    }

    function startEdit(entry: LocalEntry, e: MouseEvent) {
        if (!isMe) return;
        e.stopPropagation();
        editingEntry = entry;
        selectedDay = entry.day;
        showModal = true;
    }
</script>

<div class="flex flex-col gap-6">
    <!-- Header with Times -->
    <div class="border-primary bg-background overflow-x-auto rounded-lg border shadow-sm">
        <div class="grid min-w-[800px] grid-cols-[50px_repeat(5,1fr)]">
            <!-- Time Column Header -->
            <div
                class="bg-secondary border-primary text-text border-r border-b p-2 text-center text-base font-bold opacity-70"
            >
                Čas
            </div>
            {#each days as day, i (i)}
                <div
                    class="bg-secondary border-primary text-text group relative border-b p-2 text-center text-base font-bold"
                >
                    {day}
                    {#if isMe}
                        <button
                            class="text-accent hover:text-primary absolute top-1 right-1 opacity-0 transition group-hover:opacity-100"
                            onclick={() => startAdd(i)}
                            title="Přidat předmět"
                            aria-label="Add class"
                        >
                            <i class="bi bi-plus-circle-fill"></i>
                        </button>
                    {/if}
                </div>
            {/each}

            <!-- Routine Row Top (Morning) -->
            <div
                class="bg-background border-primary text-text flex items-center justify-center border-r border-b p-1 text-center text-[10px] opacity-50"
            >
                <i class="bi bi-sunrise-fill text-yellow-500"></i>
            </div>
            {#each days as day, i (i)}
                <div class="border-primary bg-background border-b p-1">
                    <span class="hidden">{day}</span>
                    <RoutineControls
                        day={i}
                        type="morning"
                        data={routine.find((r: Selectable<DailyRoutine>) => r.day === i)}
                        {isMe}
                        onChange={onUpdateRoutine}
                    />
                </div>
            {/each}

            <!-- Main Timetable Grid -->
            <div class="border-primary bg-background relative h-[800px] border-r">
                <!-- Hour Markers -->
                {#each Array.from({ length: 14 }, (_, i) => i + 7) as hour (hour)}
                    <div
                        class="border-primary text-text absolute flex w-full justify-center border-t text-sm opacity-70"
                        style={getPositionStyles(hour * 60, hour * 60)}
                    >
                        <span class="bg-background -mt-2.5 px-1">{hour}:00</span>
                    </div>
                {/each}
            </div>

            {#each days as day, i (i)}
                <div
                    class="border-primary bg-background/50 hover:bg-secondary/20 relative h-[800px] border-r transition-colors"
                >
                    <span class="hidden">{day}</span>
                    <!-- Grid Background Lines -->
                    {#each Array.from({ length: 14 }, (_, i) => i + 7) as hour (hour)}
                        <div
                            class="border-primary/20 absolute w-full border-t"
                            style={getPositionStyles(hour * 60, hour * 60)}
                        ></div>
                    {/each}

                    <!-- Entries -->
                    {#each timetable.filter((e: LocalEntry) => e.day === i) as entry (entry.id ?? entry.start_min)}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div
                            class="absolute inset-x-1 z-10 flex cursor-pointer flex-col justify-center overflow-hidden rounded border p-1 text-sm shadow-sm transition hover:scale-[1.02] hover:shadow-md"
                            class:bg-red-900={entry.type === 'lecture'}
                            class:border-red-700={entry.type === 'lecture'}
                            class:text-red-100={entry.type === 'lecture'}
                            class:bg-blue-900={entry.type === 'practice'}
                            class:border-blue-700={entry.type === 'practice'}
                            class:text-blue-100={entry.type === 'practice'}
                            style={getPositionStyles(entry.start_min, entry.end_min)}
                            onclick={(e) => startEdit(entry, e)}
                        >
                            <div class="truncate font-bold">{entry.subject}</div>
                            <div class="truncate opacity-75">{entry.title}</div>
                            {#if entry.room}
                                <div
                                    class="absolute right-1 bottom-0.5 truncate text-xs opacity-60"
                                >
                                    <i class="bi bi-geo-alt-fill text-[10px]"></i>
                                    {entry.room}
                                </div>
                            {/if}
                            <div class="mt-0.5 text-xs opacity-60">
                                {minToTime(entry.start_min)} - {minToTime(entry.end_min)}
                            </div>
                        </div>
                    {/each}

                    {#if isMe && timetable.filter((e: LocalEntry) => e.day === i).length === 0}
                        <div
                            class="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 hover:opacity-100"
                        >
                            <button
                                class="rounded-full bg-blue-50 p-2 text-blue-400 hover:bg-blue-100"
                                onclick={() => startAdd(i)}
                                aria-label="Add class to empty day"
                            >
                                <i class="bi bi-plus-lg"></i>
                            </button>
                        </div>
                    {/if}
                </div>
            {/each}

            <!-- Routine Row Bottom (Evening/Home) -->
            <div
                class="bg-background border-primary text-text flex items-center justify-center border-t border-r p-1 text-center text-[10px] opacity-50"
            >
                <i class="bi bi-moon-stars-fill text-indigo-400"></i>
            </div>
            {#each days as day, i (i)}
                <div class="border-primary bg-background border-t p-1">
                    <span class="hidden">{day}</span>
                    <RoutineControls
                        day={i}
                        type="evening"
                        data={routine.find((r: Selectable<DailyRoutine>) => r.day === i)}
                        {isMe}
                        onChange={onUpdateRoutine}
                    />
                </div>
            {/each}
        </div>
    </div>
</div>

{#if showModal}
    <EntryModal
        day={selectedDay}
        entry={editingEntry}
        onSave={(e) => {
            onAdd(e);
            showModal = false;
        }}
        onDelete={(id) => {
            onDelete(id);
            showModal = false;
        }}
        onClose={() => (showModal = false)}
    />
{/if}
