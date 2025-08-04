import { toDate } from '$/lib/functions';
import { EnergyFace } from '../energyface/main';
import { sendNotificationToMultiple, type Cron } from '../functions';
import { conn } from '../variables';

const energyFace = new EnergyFace();

const MIN_TEMP = 30;
const MAX_TEMP = 70;

enum IncidentType {
    NORMAL = 'NORMAL',
    LOW = 'LOW',
    HIGH = 'HIGH'
}

const getIncidentType = (temp: number): IncidentType => {
    if (temp < MIN_TEMP) return IncidentType.LOW;
    if (temp > MAX_TEMP) return IncidentType.HIGH;
    return IncidentType.NORMAL;
};

const getNotificationMessage = (
    incidentType: IncidentType,
    previousState: string,
    temp: number,
    timestamp: number
): { title: string; body: string } | null => {
    // Only send notification if state changed
    if (incidentType === previousState) {
        return null;
    }

    const timeStr = toDate(timestamp);

    if (incidentType === IncidentType.NORMAL) {
        // Temperature returned to normal
        return {
            title: 'Teplota vody se normalizovala',
            body: `Teplota vody v ${timeStr} je nyní ${temp} °C a vrátila se do normálního rozsahu.`
        };
    } else {
        // Temperature went out of range (either LOW or HIGH)
        const rangeText =
            incidentType === IncidentType.LOW
                ? 'pod minimální hodnotu'
                : 'nad maximální hodnotu';
        return {
            title: 'Varování ohledně teploty vody',
            body: `Teplota vody v ${timeStr} dosáhla ${temp} °C, což je ${rangeText} povoleného rozsahu.`
        };
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

        // Get the previous state from database
        let previousState = await conn
            .selectFrom('temp_notification_state')
            .select(['id', 'current_state'])
            .orderBy('id', 'desc')
            .limit(1)
            .executeTakeFirst();

        // If no previous state exists, initialize it
        if (!previousState) {
            await conn
                .insertInto('temp_notification_state')
                .values({
                    current_state: IncidentType.NORMAL,
                    last_temp: temp,
                    last_check: now
                })
                .execute();
            previousState = { id: 1, current_state: IncidentType.NORMAL };
        }

        // Check if we need to send a notification
        const notificationMessage = getNotificationMessage(
            currentIncident,
            previousState.current_state,
            temp,
            latestTemp.x
        );

        if (notificationMessage) {
            const registered = await conn
                .selectFrom('enabled_temp_notifications')
                .selectAll()
                .execute();
            const registeredUsers = registered.map((r) => r.userId);

            await sendNotificationToMultiple(registeredUsers, {
                ...notificationMessage,
                data: {
                    url: '/app/water-temperature'
                }
            });
        }

        // Update the state in database
        await conn
            .updateTable('temp_notification_state')
            .set({
                current_state: currentIncident,
                last_temp: temp,
                last_check: now
            })
            .where('id', '=', previousState.id)
            .execute();
    }
] satisfies Cron;
