import { toDate } from '$/lib/functions';
import { EnergyFace } from '../energyface/main';
import { sendNotificationToMultiple, type Cron, asyncExists } from '../functions';
import { conn } from '../variables';
import fs from 'node:fs/promises';
import { join } from 'path';

const energyFace = new EnergyFace();

const MIN_TEMP = 25;
const MAX_TEMP = 75;
const TEMP_LOCK_FILE = join(process.cwd(), '.temp-lock');

enum IncidentType {
    NONE,
    LOW,
    HIGH
}

const getIncidentType = (temp: number): IncidentType => {
    if (temp < MIN_TEMP) return IncidentType.LOW;
    if (temp > MAX_TEMP) return IncidentType.HIGH;
    return IncidentType.NONE;
};

interface TempLockData {
    state: IncidentType;
    temp: number;
    timestamp: number;
}

const readTempLock = async (): Promise<TempLockData | null> => {
    if (!(await asyncExists(TEMP_LOCK_FILE))) {
        return null;
    }
    try {
        const data = await fs.readFile(TEMP_LOCK_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return null;
    }
};

const writeTempLock = async (data: TempLockData): Promise<void> => {
    await fs.writeFile(TEMP_LOCK_FILE, JSON.stringify(data));
};

const removeTempLock = async (): Promise<void> => {
    if (await asyncExists(TEMP_LOCK_FILE)) {
        await fs.unlink(TEMP_LOCK_FILE);
    }
};

export default [
    '0 */30 * * * *',
    async () => {
        const now = new Date();
        const [, upper] = await energyFace.getDataFromDay(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
        if (!upper) {
            console.error('No upper data available for energy face');
            return;
        }

        const latestTemp = upper[upper.length - 1];
        if (!latestTemp) {
            console.error('No latest temperature data available');
            return;
        }

        const temp = latestTemp.y;
        const currentIncident = getIncidentType(temp);
        const lockData = await readTempLock();

        // If temperature is normal
        if (currentIncident === IncidentType.NONE) {
            // If there's a lock file (previous state was abnormal), send normalization notification
            if (lockData) {
                const registered = await conn
                    .selectFrom('enabled_temp_notifications')
                    .selectAll()
                    .execute();
                const registeredUsers = registered.map((r) => r.userId);

                await sendNotificationToMultiple(registeredUsers, {
                    title: 'Teplota vody se normalizovala',
                    body: `Teplota vody v ${toDate(latestTemp.x)} je nyní ${temp} °C a vrátila se do normálního rozsahu.`,
                    data: {
                        url: '/app/water-temperature'
                    }
                });

                // Remove the lock file
                await removeTempLock();
            }
            return;
        }

        // Temperature is abnormal (LOW or HIGH)
        // Only send notification if this is a new incident or changed type
        if (!lockData || lockData.state !== currentIncident) {
            const registered = await conn
                .selectFrom('enabled_temp_notifications')
                .selectAll()
                .execute();
            const registeredUsers = registered.map((r) => r.userId);

            const rangeText =
                currentIncident === IncidentType.LOW
                    ? 'pod minimální hodnotu'
                    : 'nad maximální hodnotu';

            await sendNotificationToMultiple(registeredUsers, {
                title: 'Varování ohledně teploty vody',
                body: `Teplota vody v ${toDate(latestTemp.x)} dosáhla ${temp} °C, což je ${rangeText} povoleného rozsahu.`,
                data: {
                    url: '/app/water-temperature'
                }
            });

            // Create or update the lock file
            await writeTempLock({
                state: currentIncident,
                temp: temp,
                timestamp: latestTemp.x.getTime()
            });
        }
    }
] satisfies Cron;
