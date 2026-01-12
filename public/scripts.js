const applicationServerKey = '<public-vapid-key>';
const apiPort = 8080;
const swInfoEl = document.getElementById('sw_info');
const subInfoEl = document.getElementById('sub_info');

if ('serviceWorker' in window.navigator) {
  swInfoEl.className = 'alert info';
  swInfoEl.textContent = 'Registering service worker...';

  // Check if the notifications are denied by the user and update the UI
  if (window.Notification.permission === 'denied') {
    subInfoEl.textContent = '❌ Notifications have been disabled!';
  }

  window.navigator.serviceWorker.register('sw.js').then(() => {
    swInfoEl.className = 'alert success';
    swInfoEl.textContent = 'Service Worker has been registered successfully 🙂';

    navigator.serviceWorker.addEventListener('message', (event) => {
      // listen for notification click message from the service worker and update the UI
      if (event.data.message === 'notification-clicked') {
        subInfoEl.textContent = '🖱️ The notification was clicked! 🖱️';
        setTimeout(() => { subInfoEl.textContent = ''; }, 5000);
      }
    });
  });
} else {
  swInfoEl.className = 'alert error';
  swInfoEl.textContent = 'Servie Worker is not supported by your browser 🙁';
}

async function requestPermission() {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported!');;
  }

  return window.Notification.permission === 'default'
    ? await window.Notification.requestPermission()
    : window.Notification.permission;
}

async function subscribeToNotifications() {
  if ((await requestPermission()) === 'denied') {
    subInfoEl.textContent = '❌ Notifications have been disabled!';
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const pushSubscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  const response = await fetch(`http://localhost:${apiPort}/subscribe`, {
    method: 'POST',
    body: JSON.stringify(pushSubscription.toJSON()),
    headers: {
      'content-type': 'application/json',
    },
  });
  subInfoEl.textContent = (await response.json()).message;
}
