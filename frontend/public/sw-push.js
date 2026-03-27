self.addEventListener('push', (event) => {
    if (!event.data) return;

    let data;
    try {
        data = event.data.json();
    } catch {
        return;
    }

    const title = data.title ?? 'TattoCRM';
    const options = {
        body: data.body ?? '',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: data.tag ?? 'tattoocrm',
        data: {
            url: typeof data.url === 'string' && data.url.startsWith('/')
                ? data.url
                : '/booking-requests',
        },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const rawUrl = event.notification.data?.url ?? '/booking-requests';
    const url = typeof rawUrl === 'string' && rawUrl.startsWith('/') ? rawUrl : '/booking-requests';

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
