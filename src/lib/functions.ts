import { browser } from '$app/environment';
import Swal, { type SweetAlertOptions } from 'sweetalert2';

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const SwalAlert = <$Type = unknown>(data: SweetAlertOptions) => {
    if (!browser) {
        return {
            isConfirmed: false
        } as const;
    }

    return Swal.fire<$Type>({
        toast: true,
        position: 'top-end',
        timer: 2000,
        timerProgressBar: true,
        showCancelButton: false,
        showConfirmButton: false,
        ...data
    });
};
