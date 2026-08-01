import { sql } from 'kysely';
import { getEnergyFaceLive, setEnergyFacePumpMode } from '../energyface/live';
import type { Cron } from '../functions';
import { conn } from '../variables';

export default [
    '0 */1 * * * *',
    async () => {
        const live = await getEnergyFaceLive();
        if (!live) return;

        const config = await conn
            .selectFrom('solar_cooling')
            .selectAll()
            .where('id', '=', 1)
            .executeTakeFirst();

        if (!config) return;

        const enabled = Boolean(config.enabled);
        const maxTemp = Number(config.max_temp ?? 75.0);
        const downTemp = Number(config.down_temp ?? 60.0);
        const overheatTemp = Number(config.overheat_temp ?? 80.0);
        const freezeTemp = Number(config.freeze_temp ?? -15.0);
        const freezeTargetTemp = Number(config.freeze_target_temp ?? -10.0);
        let activeOverride = config.active_override ?? null;

        const { solarTemp, boilerTopTemp, pumpMode } = live;

        // 1. Freeze Protection (highest priority safety rule)
        if (solarTemp <= freezeTemp) {
            if (pumpMode !== 'ON') {
                await setEnergyFacePumpMode('ON');
                await conn
                    .updateTable('solar_cooling')
                    .set({
                        active_override: 'FREEZE_PROTECTION',
                        last_action: 'Spuštěna protimrazová ochrana soláru (ON)',
                        last_action_at: sql`NOW()`,
                        updated_at: sql`NOW()`
                    })
                    .where('id', '=', 1)
                    .execute();
            }
            return;
        }

        if (activeOverride === 'FREEZE_PROTECTION' && solarTemp >= freezeTargetTemp) {
            await setEnergyFacePumpMode('AUTO');
            await conn
                .updateTable('solar_cooling')
                .set({
                    active_override: null,
                    last_action: 'Ukončena protimrazová ochrana soláru (vráceno na AUTO)',
                    last_action_at: sql`NOW()`,
                    updated_at: sql`NOW()`
                })
                .where('id', '=', 1)
                .execute();
            activeOverride = null;
        }

        // 2. Overheat Protection for Solar Collector (if pump is OFF when collector gets very hot)
        if (solarTemp >= overheatTemp && pumpMode === 'OFF') {
            await setEnergyFacePumpMode('AUTO');
            await conn
                .updateTable('solar_cooling')
                .set({
                    active_override: 'OVERHEAT_PROTECTION',
                    last_action:
                        'Aktivována ochrana před přehřátím kolektoru (zmena z OFF na AUTO)',
                    last_action_at: sql`NOW()`,
                    updated_at: sql`NOW()`
                })
                .where('id', '=', 1)
                .execute();
            activeOverride = 'OVERHEAT_PROTECTION';
        } else if (
            activeOverride === 'OVERHEAT_PROTECTION' &&
            solarTemp < overheatTemp - 5
        ) {
            await conn
                .updateTable('solar_cooling')
                .set({
                    active_override: null,
                    updated_at: sql`NOW()`
                })
                .where('id', '=', 1)
                .execute();
            activeOverride = null;
        }

        // 3. Automated Cooling (only if feature is enabled)
        if (!enabled) return;

        // Trigger Cooling: Top boiler temp > maxTemp AND solar collector is colder than boiler
        const isSolarColderThanBoiler = solarTemp - 5 < boilerTopTemp;

        if (boilerTopTemp > maxTemp && isSolarColderThanBoiler) {
            if (pumpMode !== 'ON' && activeOverride !== 'HEATING_PREVENTION') {
                await setEnergyFacePumpMode('ON');
                await conn
                    .updateTable('solar_cooling')
                    .set({
                        active_override: 'COOLING',
                        last_action: `Spuštěno automatické chlazení bojleru (teplota ${boilerTopTemp} °C > ${maxTemp} °C)`,
                        last_action_at: sql`NOW()`,
                        updated_at: sql`NOW()`
                    })
                    .where('id', '=', 1)
                    .execute();
            }
        } else if (activeOverride === 'COOLING') {
            // Target temperature reached
            if (boilerTopTemp <= downTemp) {
                await setEnergyFacePumpMode('AUTO');
                await conn
                    .updateTable('solar_cooling')
                    .set({
                        active_override: null,
                        last_action: `Dosáhnutá cílová teplota (${boilerTopTemp} °C <= ${downTemp} °C), chlazení dokončeno`,
                        last_action_at: sql`NOW()`,
                        updated_at: sql`NOW()`
                    })
                    .where('id', '=', 1)
                    .execute();
            } else if (solarTemp >= boilerTopTemp) {
                // Heating prevention (morning / sun shining while cooling was active)
                await setEnergyFacePumpMode('OFF');
                await conn
                    .updateTable('solar_cooling')
                    .set({
                        active_override: 'HEATING_PREVENTION',
                        last_action: `Slunce ohřívá solár (${solarTemp} °C >= ${boilerTopTemp} °C), čerpadlo přepnuto na OFF pro zabránění ohřevu`,
                        last_action_at: sql`NOW()`,
                        updated_at: sql`NOW()`
                    })
                    .where('id', '=', 1)
                    .execute();
            }
        } else if (activeOverride === 'HEATING_PREVENTION') {
            // Check if water cooled down naturally or solar is colder again
            if (boilerTopTemp <= downTemp || solarTemp < boilerTopTemp - 5) {
                await setEnergyFacePumpMode('AUTO');
                await conn
                    .updateTable('solar_cooling')
                    .set({
                        active_override: null,
                        last_action: 'Prevence ohřevu ukončena, čerpadlo vráceno do AUTO',
                        last_action_at: sql`NOW()`,
                        updated_at: sql`NOW()`
                    })
                    .where('id', '=', 1)
                    .execute();
            }
        }
    }
] satisfies Cron;
