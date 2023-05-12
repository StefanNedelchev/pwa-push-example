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
    ? window.Notification.requestPermission()
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
    applicationServerKey: 'BI0qT1Mf0sL1YwZ5UkwpuFOvwFBqpXjWxNBkrEIjWpM9Y3ThsSXaQ8Bj7ICc0tFNZ-1F2oT2d7nyt-RS2rr_LIQ',
  });

  const response = await fetch('http://localhost:8080/subscribe', {
    method: 'POST',
    body: JSON.stringify(pushSubscription),
    headers: {
      'content-type': 'application/json',
    },
  });
  subInfoEl.textContent = (await response.json()).message;
}
