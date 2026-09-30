const APPLICATION_SERVER_KEY = '<public-vapid-key>';
const API_PORT = 8080;
const SUBSCRIPTION_POLL_MS = 1000;
const NOTIFICATION_CLICK_MESSAGE = 'notification-clicked';

const swInfoEl = document.getElementById('sw_info');
const subInfoEl = document.getElementById('sub_info');
const btnSubEl = document.getElementById('btn_sub');

function setSwInfo(type, text) {
  swInfoEl.className = `alert ${type}`;
  swInfoEl.textContent = text;
}

function setSubInfo(text) {
  subInfoEl.textContent = text;
}

function setSubButtonDisabled(isDisabled) {
  if (isDisabled) {
    btnSubEl.setAttribute('disabled', 'disabled');
  } else {
    btnSubEl.removeAttribute('disabled');
  }
}

function handleDeniedNotifications() {
  setSubInfo('🔕 Notifications have been disabled!');
  setSubButtonDisabled(true);
}

function isNotificationDenied() {
  return window.Notification.permission === 'denied';
}

async function hasSubscription() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    setSubInfo('✅ You are already subscribed to notifications!');
    return true;
  }

  return false;
}

async function pollSubscriptionStatus() {
  const registration = await navigator.serviceWorker.ready;

  setInterval(async () => {
    // Keep UI in sync if the user removes a subscription elsewhere.
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      return;
    }

    setSubInfo('');

    if (isNotificationDenied()) {
      handleDeniedNotifications();
      return;
    }

    setSubButtonDisabled(false);
  }, SUBSCRIPTION_POLL_MS);
}

function handleServiceWorkerMessage(event) {
  if (!event.data || event.data.message !== NOTIFICATION_CLICK_MESSAGE) {
    // Ignore missing or unknown messages
    return;
  }

  setSubInfo('🖱️ The notification was clicked!');
  setTimeout(() => {
    setSubInfo('');
  }, 5000);
}

async function requestPermission() {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported!');
  }

  if (window.Notification.permission === 'default') {
    // Prompt only when the user hasn't decided yet.
    return window.Notification.requestPermission();
  }

  return window.Notification.permission;
}

async function subscribeToNotifications() {
  const permission = await requestPermission();
  if (permission === 'denied') {
    handleDeniedNotifications();
    return;
  }

  if (await hasSubscription()) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const pushSubscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: APPLICATION_SERVER_KEY,
  });

  // Persist the subscription so the backend can send push messages later.
  const response = await fetch(`http://localhost:${API_PORT}/subscribe`, {
    method: 'POST',
    body: JSON.stringify(pushSubscription.toJSON()),
    headers: {
      'content-type': 'application/json',
    },
  });

  const { message } = await response.json();
  setSubInfo(message);
}

function initServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    setSwInfo('error', '📵 Service Worker is not supported by your browser 🙁');
    return;
  }

  setSwInfo('info', '⚙️ Registering service worker...');

  if (isNotificationDenied()) {
    handleDeniedNotifications();
  } else {
    // Update UI early if a subscription already exists.
    hasSubscription();
  }

  pollSubscriptionStatus();

  navigator.serviceWorker.register('sw.js').then(() => {
    setSwInfo('success', 'Service Worker has been registered successfully 🙂');
    // Listen for service worker messages (e.g., notification click events).
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
  });
}

// Entry point; assumes the DOM is available (script loaded with defer or at end of body).
initServiceWorker();
