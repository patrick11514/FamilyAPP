import z from 'zod';
import { loggedProcedure } from '../../api';
import { setEnergyFacePumpMode } from '../../energyface/live';

export default loggedProcedure.POST.input(
    z.object({
        mode: z.enum(['AUTO', 'ON', 'OFF'])
    })
).query(async ({ input }) => {
    const success = await setEnergyFacePumpMode(input.mode);
    if (!success) {
        return {
            status: false,
            message: 'Nepodařilo se odeslat požadavek na čerpadlo'
        };
    }

    return {
        status: true,
        message: `Mód čerpadla byl změněn na ${input.mode}`
    };
});
