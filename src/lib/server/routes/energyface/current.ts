import { protectedProcedure } from '../../api';
import { EnergyFace } from '../../energyface/main';

const energyFace = new EnergyFace();

export default protectedProcedure.GET.query(async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // Note: getMonth() returns 0-11
    const day = now.getDate();

    const [, upper] = await energyFace.getDataFromDay(year, month, day);

    // Get the most recent temperature reading (current temp)
    const currentReading = upper && upper.length > 0 ? upper[upper.length - 1] : null;

    if (!currentReading) {
        return {
            status: true,
            data: {
                temperature: null,
                timestamp: null
            }
        };
    }

    // Format for Home Assistant - return temperature value and ISO timestamp
    return {
        status: true,
        data: {
            temperature: currentReading.y,
            timestamp: currentReading.x.toISOString()
        }
    };
});
