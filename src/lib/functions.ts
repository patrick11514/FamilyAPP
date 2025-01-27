import { browser } from '$app/environment';
import Swal, { type SweetAlertOptions } from 'sweetalert2';
import type { ClassValue } from 'svelte/elements';

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const SwalAlert = <$Type = unknown>(data: SweetAlertOptions) => {
    if (!browser) {
        return {
            isConfirmed: false
        } as const;
    }

    return Swal.fire<$Type>({
        toast: true,
        position: 'top-end',
        timer: 2000,
        timerProgressBar: true,
        showCancelButton: false,
        showConfirmButton: false,
        ...data
    });
};

export const toDate = (date: number | string | Date) => {
    const d = new Date(date);

    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds} ${day}.${month}.${year}`;
};

export const toLocalDateString = (d?: Date) => {
    const date = d ?? new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const capital = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
};

export const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
};

//eslint-disable-next-line
type Degenerator<Type> = Type extends Generator<infer Value, any, any> ? Value : never;

export class Calendar {
    private _today = new Date();

    /**
     * Gets the first day of month (1. day of the month)
     */
    getFirstDayOfMonth() {
        return new Date(this._today.getFullYear(), this._today.getMonth(), 1);
    }

    /**
     * Gets the last day of month (last day of the month - 30. or 31. or 28. or 29.)
     */
    getLastDayOfMonth() {
        return new Date(this._today.getFullYear(), this._today.getMonth() + 1, 0);
    }

    /**
     * Gets first day of calendar. Calendar starts from Monday, so
     * if month stars from Tuesday, we need to include day before as
     * Monday and this will be returned.
     */
    getFirstDayOfCalendar() {
        const firstDay = this.getFirstDayOfMonth();

        //get the first day of the week
        //0 = Sunday, but we want to start from Monday
        firstDay.setDate(firstDay.getDate() - firstDay.getDay() + 1);
        return firstDay;
    }

    /**
     * Gets last day of calendar. Calendar ends on Sunday, so
     * if month ends on Saturday, we need to include day after as
     * Sunday and this will be returned.
     */
    getLastDayOfCalendar() {
        //get the last day of the month
        const lastDay = this.getLastDayOfMonth();
        lastDay.setDate(lastDay.getDate() + 7 - lastDay.getDay());
        return lastDay;
    }

    /**
     * Gets the current day
     */
    get today() {
        return new Date(this._today);
    }

    /**
     * Itterate over days of the month
     * This includes the days from previous month and next, if
     * the month does not start on Monday and does not end on Sunday
     */
    *monthDayIterator() {
        const firstDay = this.getFirstDayOfCalendar();
        const lastDay = this.getLastDayOfCalendar();

        const currentDay = new Date(firstDay);
        while (true) {
            yield {
                date: new Date(currentDay),
                isCurrentMonth: currentDay.getMonth() === this._today.getMonth(),
                isToday: currentDay.toDateString() === this._today.toDateString()
            };

            currentDay.setDate(currentDay.getDate() + 1);

            if (currentDay > lastDay) {
                break;
            }
        }
    }

    /**
     * Itterate over weeks of the month
     * This includes the days from previous month and next, if
     * the month does not start on Monday and does not end on Sunday
     */
    *monthWeekIterator() {
        const iterator = this.monthDayIterator();
        let week: Degenerator<ReturnType<typeof this.monthDayIterator>>[] = [];

        for (const day of iterator) {
            week.push(day);

            if (day.date.getDay() === 0) {
                yield week;
                week = [];
            }
        }

        if (week.length > 0) {
            yield week;
        }
    }
}

export const resolveSvelteClass = (classes: ClassValue): string => {
    if (typeof classes === 'string') {
        return classes;
    }

    if (Array.isArray(classes)) {
        return classes
            .filter((item) => typeof item === 'string')
            .map(resolveSvelteClass)
            .join(' ');
    }

    if (typeof classes === 'object') {
        return Object.entries(classes)
            .filter(([, value]) => value)
            .map(([key]) => key)
            .join(' ');
    }

    return '';
};

export const formatUser = (user: { firstname: string; lastname: string }) => {
    return `${user.firstname} ${user.lastname}`;
};
