self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const title = data.title ?? 'TattoCRM';
    const options = {
        body: data.body ?? '',
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'new-booking',
        data: { url: data.url ?? '/booking-requests' },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url ?? '/booking-requests';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(url) && 'focus' in client) {
                    return client.focus();
                }
            }
            return clients.openWindow(url);
        }),
    );
});
