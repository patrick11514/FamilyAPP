import { sql } from 'kysely';
import z from 'zod';
import { loggedProcedure } from '../../api';
import { conn } from '../../variables';

export default {
    get: loggedProcedure.GET.query(async () => {
        let config = await conn
            .selectFrom('solar_cooling')
            .selectAll()
            .where('id', '=', 1)
            .executeTakeFirst();

        if (!config) {
            await conn
                .insertInto('solar_cooling')
                .values({
                    id: 1,
                    enabled: 0,
                    max_temp: '75.0',
                    down_temp: '60.0',
                    overheat_temp: '80.0',
                    freeze_temp: '-15.0',
                    freeze_target_temp: '-10.0',
                    updated_at: sql`NOW()`
                })
                .execute();

            config = await conn
                .selectFrom('solar_cooling')
                .selectAll()
                .where('id', '=', 1)
                .executeTakeFirst();
        }

        return {
            status: true,
            data: {
                enabled: Boolean(config?.enabled ?? 0),
                maxTemp: Number(config?.max_temp ?? 75.0),
                downTemp: Number(config?.down_temp ?? 60.0),
                overheatTemp: Number(config?.overheat_temp ?? 80.0),
                freezeTemp: Number(config?.freeze_temp ?? -15.0),
                freezeTargetTemp: Number(config?.freeze_target_temp ?? -10.0),
                activeOverride: config?.active_override ?? null,
                lastAction: config?.last_action ?? null,
                lastActionAt: config?.last_action_at
                    ? new Date(config.last_action_at).toISOString()
                    : null
            }
        };
    }),

    save: loggedProcedure.POST.input(
        z.object({
            enabled: z.boolean(),
            maxTemp: z.number().min(30).max(95),
            downTemp: z.number().min(20).max(90),
            overheatTemp: z.number().min(60).max(100),
            freezeTemp: z.number().min(-30).max(10),
            freezeTargetTemp: z.number().min(-20).max(20)
        })
    ).query(async ({ input }) => {
        if (input.downTemp >= input.maxTemp) {
            return {
                status: false,
                message: 'Cílová teplota musí být nižší než maximální teplota.'
            };
        }

        if (input.freezeTemp >= input.freezeTargetTemp) {
            return {
                status: false,
                message:
                    'Teplota spuštění protimrazové ochrany musí být nižší než cílová teplota.'
            };
        }

        await conn
            .insertInto('solar_cooling')
            .values({
                id: 1,
                enabled: input.enabled ? 1 : 0,
                max_temp: input.maxTemp.toFixed(1),
                down_temp: input.downTemp.toFixed(1),
                overheat_temp: input.overheatTemp.toFixed(1),
                freeze_temp: input.freezeTemp.toFixed(1),
                freeze_target_temp: input.freezeTargetTemp.toFixed(1),
                updated_at: sql`NOW()`
            })
            .onDuplicateKeyUpdate({
                enabled: input.enabled ? 1 : 0,
                max_temp: input.maxTemp.toFixed(1),
                down_temp: input.downTemp.toFixed(1),
                overheat_temp: input.overheatTemp.toFixed(1),
                freeze_temp: input.freezeTemp.toFixed(1),
                freeze_target_temp: input.freezeTargetTemp.toFixed(1),
                updated_at: sql`NOW()`
            })
            .execute();

        return {
            status: true,
            message: 'Nastavení automatického chlazení bylo úspěšně uloženo.'
        };
    })
};
