import { ENERGYFACE_ID } from '$env/static/private';
import z from 'zod';
import { fetchData } from '../../functions';
import { EnergyFaceLabels } from './utils';

const schema = z.array(
    z.object({
        x: z.number(),
        y: z.number()
    })
);

const pad = (value: number) => {
    return value.toString().padStart(2, '0');
};

export class EnergyFace {
    private async makeDeviceRequest(
        deviceId: number,
        year: number,
        month: number,
        day: number
    ) {
        const paddedMonth = pad(month + 1);
        const paddedDay = pad(day);
        const paddedDevice = deviceId;
        const url = `https://energyface.eu/Data/${ENERGYFACE_ID}/GrafData/${year}/${paddedMonth}/${paddedDay}_${paddedDevice}.json`;
        const data = await fetchData(url, schema);

        return data?.map((entry) => {
            const hours = Math.floor(entry.x);
            const remainderMins = (entry.x - hours) * 100;
            const minutes = Math.floor(remainderMins + 0.0001);
            const seconds = Math.round((remainderMins - minutes) * 60);

            const timestamp = new Date(year, month, day, hours, minutes, seconds);
            return {
                y: entry.y,
                x: timestamp
            };
        });
    }

    async getDataFromDay(year: number, month: number, day: number) {
        const args = [year, month, day] as const;
        return Promise.all([
            this.makeDeviceRequest(EnergyFaceLabels['Akumulace dole'], ...args),
            this.makeDeviceRequest(EnergyFaceLabels['Akumulace nahoře'], ...args)
        ]);
    }
}
