import z from 'zod';
import { loggedProcedure } from '../../api';
import { EnergyFace } from '../../energyface/main';

const energyFace = new EnergyFace();

export default loggedProcedure.POST.input(
    z.object({
        year: z.number(),
        month: z.number(),
        day: z.number()
    })
).query(async ({ input }) => {
    const [lower, upper] = await energyFace.getDataFromDay(
        input.year,
        input.month,
        input.day
    );

    return {
        status: true,
        data: {
            lower: lower || [],
            upper: upper || []
        }
    };
});
