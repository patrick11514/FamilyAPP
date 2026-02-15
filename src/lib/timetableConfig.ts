export const TIME_BLOCKS = [
    { start: '07:15', end: '08:00' },
    { start: '08:00', end: '08:45' },
    // Break 15m -> 09:00
    { start: '09:00', end: '09:45' },
    { start: '09:45', end: '10:30' },
    // Break 15m -> 10:45
    { start: '10:45', end: '11:30' },
    { start: '11:30', end: '12:15' },
    // Break 15m -> 12:30 (Wait, user said 12:15 is end of block. Assuming 15m break pattern continues)
    { start: '12:30', end: '13:15' },
    { start: '13:15', end: '14:00' },
    // Break 15m -> 14:15
    { start: '14:15', end: '15:00' },
    { start: '15:00', end: '15:45' },
    // Break 15m -> 16:00
    { start: '16:00', end: '16:45' },
    { start: '16:45', end: '17:30' },
    // Break 15m -> 17:45
    { start: '17:45', end: '18:30' },
    { start: '18:30', end: '19:15' }
];

export function timeToMin(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

export function minToTime(min: number): string {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
