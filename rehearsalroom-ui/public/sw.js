// Rehearsal Room Service Worker — handles background push notifications

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Rehearsal Room', body: event.data.text() };
  }

  const title = data.title || 'Rehearsal Room';
  const options = {
    body: data.body || '',
    icon: data.icon || '/rehearsalroom-logo.png',
    badge: '/rehearsalroom-logo.png',
    vibrate: [200, 100, 200],
    data: { url: self.registration.scope },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
