import { env } from '$env/dynamic/private';
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

const getCloudXmlData = async (): Promise<Record<string, unknown> | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    const url = `https://energyface.eu/Data/${ENERGYFACE_ID}/IN.xml?t=${Date.now()}`;
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) return null;
        const xmlText = await response.text();
        const parsed = parser.parse(xmlText);
        return parsed?.datafeeder ?? null;
    } catch {
        clearTimeout(timeoutId);
        return null;
    }
};

const getLocalWebSocketData = (
    ip: string
): Promise<Partial<EnergyFaceLiveData> | null> => {
    return new Promise((resolve) => {
        try {
            const ws = new WebSocket(`ws://${ip}:81/`);
            let resolved = false;
            let cidlaData: string[] | null = null;
            let nastaveniData: string[] | null = null;

            const checkAndResolve = () => {
                if (cidlaData && nastaveniData && !resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    try {
                        ws.close();
                    } catch {
                        /* ignore */
                    }

                    const now = new Date();
                    const lastDate = now.toLocaleDateString('cs-CZ');
                    const lastTime = now.toLocaleTimeString('cs-CZ', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    const solarTemp = parseTemp(cidlaData[3]);
                    const boilerTopTemp = parseTemp(cidlaData[5]);
                    const boilerBottomTemp = parseTemp(cidlaData[11]);
                    const solarPipeTemp = parseTemp(cidlaData[12]);

                    const pumpActive = cidlaData[22] === '1';

                    const po2Val = parseInt(nastaveniData[16] || '0', 10);
                    let pumpMode: PumpMode = 'AUTO';
                    if (po2Val === 1) pumpMode = 'ON';
                    else if (po2Val === 2) pumpMode = 'OFF';

                    const wifiSignal = parseInt(nastaveniData[55] || '0', 10);

                    resolve({
                        id: String(ENERGYFACE_ID),
                        lastDate,
                        lastTime,
                        solarTemp,
                        solarPipeTemp,
                        boilerTopTemp,
                        boilerBottomTemp,
                        pumpActive,
                        pumpMode,
                        pwmSpeed: 0,
                        wifiSignal: isNaN(wifiSignal) ? 0 : wifiSignal,
                        statusError: cidlaData[25] || 'V pořádku'
                    });
                }
            };

            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    try {
                        ws.close();
                    } catch {
                        /* ignore */
                    }
                    resolve(null);
                }
            }, 2500);

            ws.onopen = () => {
                ws.send('l');
                ws.send('O');
            };

            ws.onmessage = (event) => {
                const msg = String(event.data || '');
                if (msg.startsWith('Cidla#')) {
                    cidlaData = msg.split('#');
                    checkAndResolve();
                } else if (msg.startsWith('Nastaveni#')) {
                    nastaveniData = msg.split('#');
                    checkAndResolve();
                }
            };

            ws.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(null);
                }
            };
        } catch {
            resolve(null);
        }
    });
};

const sendLocalWebSocketCommand = (ip: string, mode: PumpMode): Promise<boolean> => {
    return new Promise((resolve) => {
        try {
            const ws = new WebSocket(`ws://${ip}:81/`);
            let resolved = false;

            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    try {
                        ws.close();
                    } catch {
                        /* ignore */
                    }
                    resolve(false);
                }
            }, 2500);

            const cmd = mode === 'AUTO' ? 'b13' : mode === 'ON' ? 'b14' : 'b15';

            const sendCmd = () => {
                try {
                    ws.send(cmd);
                } catch {
                    /* ignore */
                }
            };

            ws.onopen = () => {
                sendCmd();
            };

            ws.onmessage = (event) => {
                const msg = String(event.data || '');
                if (msg === 'Connected') {
                    sendCmd();
                    setTimeout(sendCmd, 100);
                } else if (msg.startsWith('Nastaveni#') || msg.startsWith('EFx20#')) {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeout);
                        setTimeout(() => {
                            try {
                                ws.close();
                            } catch {
                                /* ignore */
                            }
                        }, 100);
                        resolve(true);
                    }
                }
            };

            ws.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(false);
                }
            };
        } catch {
            resolve(false);
        }
    });
};

export const getEnergyFaceLive = async (): Promise<EnergyFaceLiveData | null> => {
    const localIp = env.ENERGYFACE_LOCAL_IP;

    if (localIp) {
        const [localRes, cloudRes] = await Promise.allSettled([
            getLocalWebSocketData(localIp),
            getCloudXmlData()
        ]);

        const localData = localRes.status === 'fulfilled' ? localRes.value : null;
        const cloudData = cloudRes.status === 'fulfilled' ? cloudRes.value : null;

        if (localData) {
            const uptime = cloudData?.cas ? String(cloudData.cas) : 'Lokální Wi-Fi';
            const wifiSignal =
                localData.wifiSignal && localData.wifiSignal > 0
                    ? localData.wifiSignal
                    : parseInt(String(cloudData?.PRS1 ?? 0), 10);

            return {
                id: localData.id ?? String(ENERGYFACE_ID),
                uptime,
                lastDate: localData.lastDate ?? '',
                lastTime: localData.lastTime ?? '',
                solarTemp: localData.solarTemp ?? 0,
                solarPipeTemp: localData.solarPipeTemp ?? 0,
                boilerTopTemp: localData.boilerTopTemp ?? 0,
                boilerBottomTemp: localData.boilerBottomTemp ?? 0,
                pumpActive: localData.pumpActive ?? false,
                pumpMode: localData.pumpMode ?? 'AUTO',
                pwmSpeed: localData.pwmSpeed ?? 0,
                wifiSignal: isNaN(wifiSignal) ? 0 : wifiSignal,
                statusError: localData.statusError ?? 'V pořádku'
            };
        }
    }

    const data = await getCloudXmlData();
    if (!data) return null;

    const po2Val = parseInt(String(data.PO2 ?? 0), 10);
    let pumpMode: PumpMode = 'AUTO';
    if (po2Val === 1) pumpMode = 'ON';
    else if (po2Val === 2) pumpMode = 'OFF';

    return {
        id: String(data.ID ?? ENERGYFACE_ID),
        uptime: String(data.cas ?? 'N/A'),
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
};

export const setEnergyFacePumpMode = async (mode: PumpMode): Promise<boolean> => {
    const localIp = env.ENERGYFACE_LOCAL_IP;

    if (localIp) {
        const localSuccess = await sendLocalWebSocketCommand(localIp, mode);
        if (localSuccess) {
            return true;
        }
    }

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
