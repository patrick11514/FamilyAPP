import * as cron from 'node-cron';
import checkWaterTemp from './lib/server/crons/checkWaterTemp';
import { registerCrons } from './lib/server/functions';

if (process.crontsRegistered) {
    //destroy all existing tasks to avoid duplicates
    cron.getTasks().forEach((task) => task.destroy());
}

registerCrons([checkWaterTemp]);
process.crontsRegistered = true;
