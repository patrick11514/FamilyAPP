import { PUBLIC_VAPI_KEY } from '$env/static/public';
import { API } from './api';
import { urlBase64ToUint8Array } from './functions';
/* eslint-disable no-console */

const CLIENT_URL = '/webworker/push-worker.js';

export enum Error {
    NOT_SUPPORTED = 'Váš prohlížeč nepodporuje notifikace',
    NO_NOTIFICATION = 'Pokud váš systém je IOS, je potřeba aplikaci stáhnout (přidat na plochu)'
}

export const subscribePush = async () => {
    if (!('serviceWorker' in navigator || 'PushManager' in window)) {
        console.log('Service workers are not supported or push manager is not supported');
        return Error.NOT_SUPPORTED;
    }

    if (!('Notification' in window)) {
        return Error.NO_NOTIFICATION;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return false;
        }

        const registration = await navigator.serviceWorker.register(CLIENT_URL);
        const subscription = await registration.pushManager.getSubscription();
        console.log('Current subscription:', subscription);

        if (!subscription) {
            console.log('Subscribing to push notifications');
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPI_KEY)
            });

            //eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await API.push.subscribe(subscription.toJSON() as any);
            if (!result.status) return false;
        }

        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const unsubscribePush = async () => {
    if (!('serviceWorker' in navigator || 'PushManager' in window)) {
        console.log('Service workers are not supported or push manager is not supported');
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration(CLIENT_URL);
        if (!registration) {
            console.log('No service worker registration found');
            return false;
        }

        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
            console.log('No push subscription found');
            return false;
        }

        const result = await API.push.unsubscribe({
            endpoint: subscription.endpoint
        });
        if (!result.status) return false;

        await subscription.unsubscribe();
        console.log('Unsubscribed from push notifications');
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};
