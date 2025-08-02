self.addEventListener('push', (event) => {
    /**
     * @type {PushEvent}
     */
    const data = event.data.json();
    self.registration.showNotification(data.title, data);
});

self.addEventListener('notificationclick', (event) => {
    /**
     * @type {Notification}
     */
    const notification = event.notification;
    const data = notification.data;
    const defaultUrl = self.location.origin + '/app/';

    event.waitUntil(
        self.clients.openWindow(
            'url' in data
                ? data.url.startsWith('/')
                    ? self.location.origin + data.url
                    : data.url
                : defaultUrl
        )
    );

    notification.close();
});
