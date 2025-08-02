import { browser } from '$app/environment';
import type { ClassValue } from 'svelte/elements';
import Swal, { type SweetAlertOptions } from 'sweetalert2';
import type { ZodSchema } from 'zod';

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

export const toTime = (date: number | string | Date, withSeconds = false) => {
    const d = new Date(date);

    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    if (!withSeconds) {
        return `${hours}:${minutes}`;
    }

    const seconds = d.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
};

export const toDate = (date: number | string | Date, withoutTime = false) => {
    const d = new Date(date);

    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    if (withoutTime) {
        return `${day}.${month}.${year}`;
    }

    return `${toTime(d)} ${day}.${month}.${year}`;
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
     * @param today - Date to get the first day of the month
     */
    getFirstDayOfMonth(today = this._today) {
        return new Date(today.getFullYear(), today.getMonth(), 1);
    }

    /**
     * Gets the last day of month (last day of the month - 30. or 31. or 28. or 29.)
     * @param today - Date to get the last day of the month
     */
    getLastDayOfMonth(today = this._today) {
        return new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    /**
     * Gets first day of calendar. Calendar starts from Monday, so
     * if month stars from Tuesday, we need to include day before as
     * Monday and this will be returned.
     * @param today - Date to get the first day of the calendar
     */
    getFirstDayOfCalendar(today = this._today) {
        const firstDay = this.getFirstDayOfMonth(today);

        //get the first day of the week
        //0 = Sunday, but we want to start from Monday
        firstDay.setDate(firstDay.getDate() - firstDay.getDay() + 1);
        return firstDay;
    }

    /**
     * Gets last day of calendar. Calendar ends on Sunday, so
     * if month ends on Saturday, we need to include day after as
     * Sunday and this will be returned.
     * @param today - Date to get the last day of the calendar
     */
    getLastDayOfCalendar(today = this._today) {
        //get the last day of the month
        const lastDay = this.getLastDayOfMonth(today);
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
     * @param today - Date to itterate over
     */
    *monthDayIterator(today = this._today) {
        const firstDay = this.getFirstDayOfCalendar(today);
        const lastDay = this.getLastDayOfCalendar(today);

        const currentDay = new Date(firstDay);
        while (true) {
            yield {
                date: new Date(currentDay),
                isCurrentMonth: currentDay.getMonth() === today.getMonth(),
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
     * @param today - Date to itterate over
     */
    *monthWeekIterator(today = this._today) {
        const iterator = this.monthDayIterator(today);
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

export const locale = (
    number: number,
    dictionary: {
        one: string;
        two: string;
        five: string;
    }
) => {
    if (number === 1) {
        return `${number} ${dictionary.one}`;
    } else if (number >= 2 && number <= 4) {
        return `${number} ${dictionary.two}`;
    } else {
        return `${number} ${dictionary.five}`;
    }
};

export const fetchData = async <$Type>(
    url: string,
    schema: ZodSchema<$Type>,
    options?: RequestInit
): Promise<$Type | undefined> => {
    try {
        const request = await fetch(url, options);
        if (!request.ok) {
            return undefined;
        }
        const data = await request.json();
        const parsedData = schema.safeParse(data);
        if (!parsedData.success) {
            // eslint-disable-next-line no-console
            console.error('Data parsing error:', parsedData.error);
            return undefined;
        }
        return parsedData.data as $Type;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return undefined;
    }
};
