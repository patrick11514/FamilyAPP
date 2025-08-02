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
        //parse data
        const today = new Date(year, month, day);
        today.setHours(0, 0, 0, 0);
        return data?.map((entry) => {
            return {
                y: entry.y,
                x: new Date(today.getTime() + entry.x * 60 * 60 * 1000)
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
