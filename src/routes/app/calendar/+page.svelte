<script lang="ts">
    import { Table, Td, Th, Tr } from '$/components/table';
    import { API } from '$/lib/api';
    import { Calendar } from '$/lib/functions';
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';

    const { data }: { data: PageData } = $props();

    console.log(data.users);

    const calendar = new Calendar();

    const days = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];
    const shortDays = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

    let isMobile = $state(browser ? window.innerWidth < 1024 : true);
    const handleResize = () => {
        isMobile = window.innerWidth < 1024;
    };

    onMount(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });

    let selectedDay = $state(calendar.today);

    const resolveMonth = async () => {
        await API.calendar.POST({
            from: calendar.getFirstDayOfCalendar(),
            to: calendar.getLastDayOfCalendar()
        });
    };

    onMount(() => {
        resolveMonth();
    });
</script>

<div class="flex-1">
    <Table>
        <thead>
            <Tr>
                {#each isMobile ? shortDays : days as day}
                    <Th>{day}</Th>
                {/each}
            </Tr>
        </thead>
        <tbody class="text-center align-middle">
            {#each calendar.monthWeekIterator() as week}
                <Tr>
                    {#each week as day}
                        <Td
                            class={{
                                'text-gray-500': !day.isCurrentMonth,
                                'font-bold text-sky-500': day.isToday,
                                'cursor-pointer': true,
                                'bg-sky-500 text-white': day.date.toDateString() === selectedDay.toDateString()
                            }}
                        >
                            {day.date.getDate()}
                        </Td>
                    {/each}
                </Tr>
            {/each}
        </tbody>
    </Table>
</div>
