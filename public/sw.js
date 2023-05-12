self.addEventListener('install', () => {
  console.log('Service worker is installing');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('Service worker has been activated!');
});

self.addEventListener('fetch', () => {
});

async function matchClient(urlToOpen) {
  const windowClients = await clients.matchAll({ type: 'window' });
  return windowClients.find((windowClient) => windowClient.url.startsWith(urlToOpen));
}

async function focusOrOpenWindow() {
  const urlToOpen = self.location.origin;
  const matchingClient = await matchClient(urlToOpen);
  // Focus on opened window/tab or open new one
  return matchingClient
    ? matchingClient.focus()
    : clients.openWindow(urlToOpen);
}

self.addEventListener('push', (event) => {
  const pushData = event.data.json();
  event.waitUntil(
    self.registration.showNotification(pushData.title, {
      body: pushData.body,
      icon: pushData.icon,
      tag: 'web-push',
      data: pushData,
    }),
  );
});

self.addEventListener('notificationclick', (e) => {
  // Close the notification popup
  e.notification.close();
  // Get all the Window clients
  e.waitUntil(
    focusOrOpenWindow().then((windowClient) => {
      // Notify the client about the notification click with a message
      windowClient.postMessage({ message: 'notification-clicked' })
    }),
  );
});
