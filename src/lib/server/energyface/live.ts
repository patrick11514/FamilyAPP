import { ENERGYFACE_ID } from '$env/static/private';
import { XMLParser } from 'fast-xml-parser';

export type PumpMode = 'AUTO' | 'ON' | 'OFF';

export interface EnergyFaceLiveData {
    id: string;
    uptime: string;
    lastDate: string;
    lastTime: string;
    solarTemp: number;
    solarPipeTemp: number;
    boilerTopTemp: number;
    boilerBottomTemp: number;
    pumpActive: boolean;
    pumpMode: PumpMode;
    pwmSpeed: number;
    wifiSignal: number;
    statusError: string;
}

const parseTemp = (val: unknown): number => {
    if (typeof val !== 'string' && typeof val !== 'number') return 0;
    const str = String(val).replace('°C', '').trim();
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
};

const parser = new XMLParser();

export const getEnergyFaceLive = async (): Promise<EnergyFaceLiveData | null> => {
    const url = `https://energyface.eu/Data/${ENERGYFACE_ID}/IN.xml?t=${Date.now()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`EnergyFace XML fetch failed: ${response.statusText}`);
            return null;
        }
        const xmlText = await response.text();
        const parsed = parser.parse(xmlText);
        const data = parsed?.datafeeder;

        if (!data) {
            console.error('Invalid EnergyFace XML structure');
            return null;
        }

        const po2Val = parseInt(String(data.PO2 ?? 0), 10);
        let pumpMode: PumpMode = 'AUTO';
        if (po2Val === 1) pumpMode = 'ON';
        else if (po2Val === 2) pumpMode = 'OFF';

        return {
            id: String(data.ID ?? ENERGYFACE_ID),
            uptime: String(data.cas ?? ''),
            lastDate: String(data.LastDate ?? ''),
            lastTime: String(data.LastTime ?? ''),
            solarTemp: parseTemp(data.T_K ?? data.T_K1),
            solarPipeTemp: parseTemp(data.T_D7 ?? data.Term3),
            boilerTopTemp: parseTemp(data.T_D1 ?? data.Term1),
            boilerBottomTemp: parseTemp(data.T_D8 ?? data.Term2),
            pumpActive: String(data.O2 ?? '0') === '1',
            pumpMode,
            pwmSpeed: parseInt(String(data.PWM1 ?? 0), 10),
            wifiSignal: parseInt(String(data.PRS1 ?? 0), 10),
            statusError: String(data.error ?? 'V pořádku')
        };
    } catch (err) {
        console.error('Error fetching EnergyFace live feed:', err);
        return null;
    }
};

export const setEnergyFacePumpMode = async (mode: PumpMode): Promise<boolean> => {
    const customValue = mode === 'AUTO' ? 0 : mode === 'ON' ? 1 : 2;
    const url = `https://energyface.eu/EspOUT.php?ID=${ENERGYFACE_ID}&Custom=OUT2=${customValue}`;
    try {
        const res = await fetch(url);
        return res.ok;
    } catch (err) {
        console.error('Failed to set EnergyFace pump mode:', err);
        return false;
    }
};
