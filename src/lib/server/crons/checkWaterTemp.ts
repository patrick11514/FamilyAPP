import { toDate } from '$/lib/functions';
import { EnergyFace } from '../energyface/main';
import { sendNotificationToMultiple, type Cron } from '../functions';
import { conn } from '../variables';

const energyFace = new EnergyFace();

const MIN_TEMP = 30;
const MAX_TEMP = 70;

enum IncidentType {
    NONE,
    LOW,
    HIGH
}

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
        let incident = IncidentType.NONE;

        if (temp < MIN_TEMP) {
            incident = IncidentType.LOW;
        }

        if (temp > MAX_TEMP) {
            incident = IncidentType.HIGH;
        }

        if (incident === IncidentType.NONE) return;

        const registered = await conn
            .selectFrom('enabled_temp_notifications')
            .selectAll()
            .execute();
        const registeredUsers = registered.map((r) => r.userId);

        sendNotificationToMultiple(registeredUsers, {
            title: 'Varování ohledně teploty vody',
            body: `Teplota vody v ${toDate(latestTemp.x)} dosáhla ${temp} °C, což je mimo povolený rozsah.`,
            data: {
                url: '/app/water-temperature'
            }
        });
    }
] satisfies Cron;
