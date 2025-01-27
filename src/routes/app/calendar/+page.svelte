<script lang="ts">
    import { Table, Td, Th, Tr } from '$/components/table';
    import { Calendar } from '$/lib/functions';
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';

    const calendar = new Calendar();

    const days = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];
    const shortDays = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

    let isMobile = $state(browser ? window.innerWidth < 1024 : false);
    const handleResize = () => {
        isMobile = window.innerWidth < 1024;
    };

    onMount(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
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
                                'text-gray-800': !day.isCurrentMonth,
                                'font-bold text-red-500': day.isToday
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
