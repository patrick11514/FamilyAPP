import { loggedProcedure } from '../../api';
import { getEnergyFaceLive } from '../../energyface/live';

export default loggedProcedure.GET.query(async () => {
    const liveData = await getEnergyFaceLive();
    if (!liveData) {
        return {
            status: false,
            message: 'Nepodařilo se načíst živá data z EnergyFace'
        };
    }

    return {
        status: true,
        data: liveData
    };
});
