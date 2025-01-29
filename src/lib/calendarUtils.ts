import type { Calendar } from '$/types/database';
import type { NormalizeId } from '$/types/types';
import { toTime } from './functions';

export type Event = Omit<NormalizeId<Calendar>, 'full_day' | 'description'> & {
    full_day: { data: [0 | 1] };
    description: string | null;
};

export const getEventName = (event: Event, selectedDay: Date) => {
    //if event is multi-day, we want to add to the end (1 day of 2) etc..
    if (event.from.getDate() === event.to.getDate() && event.from.getMonth() === event.to.getMonth() && event.from.getFullYear() === event.to.getFullYear()) {
        return event.name;
    }

    //event can go through multiple months
    const begin = new Date(event.from);

    let totalDays = 0;
    let counting = true;
    let currentDays = 1;

    while (true) {
        if (begin.getDate() === selectedDay.getDate() && begin.getMonth() === selectedDay.getMonth() && begin.getFullYear() === selectedDay.getFullYear()) {
            counting = false;
        }

        if (begin.getDate() === event.to.getDate() && begin.getMonth() === event.to.getMonth() && begin.getFullYear() === event.to.getFullYear()) {
            totalDays++;
            break;
        }

        totalDays++;
        if (counting) currentDays++;

        begin.setDate(begin.getDate() + 1);
    }

    return `${event.name} (den ${currentDays} z ${totalDays})`;
};

export const getEventRange = (event: Event, selectedDay: Date) => {
    if (event.full_day.data[0] == 1) {
        return 'Celodenní';
    }

    const startOfDay = new Date(selectedDay);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDay);
    endOfDay.setHours(23, 59, 59, 999);

    if (event.from.getTime() < startOfDay.getTime() && event.to.getTime() > endOfDay.getTime()) {
        return 'Celodenní';
    }

    const start = event.from.getTime() < startOfDay.getTime() ? '00:00' : toTime(event.from);
    const end = event.to.getTime() > endOfDay.getTime() ? '23:59' : toTime(event.to);

    return `${start} - ${end}`;
};

export const eventIsInDay = (date: Date, event: Event) => {
    //so event is included in this day:
    //1. event starts on this day
    //2. event ends on this day
    //3. event starts some days before and ends some days after

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    if (event.from.getTime() < startOfDay.getTime() && event.to.getTime() > endOfDay.getTime()) {
        return true;
    }

    return (
        (event.from.getDate() === date.getDate() && event.from.getMonth() === date.getMonth()) || (event.to.getDate() === date.getDate() && event.to.getMonth() === date.getMonth())
    );
};
