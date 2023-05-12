import webPush from 'web-push';

const vapidKeys = {
  publicKey: 'BI0qT1Mf0sL1YwZ5UkwpuFOvwFBqpXjWxNBkrEIjWpM9Y3ThsSXaQ8Bj7ICc0tFNZ-1F2oT2d7nyt-RS2rr_LIQ',
  privateKey: '5BlFTZfiru97DrHREnOAaPLGn5ZeyHPUgwoZ9yJTKdk',
};
webPush.setVapidDetails('mailto:example@yourdomain.org', vapidKeys.publicKey, vapidKeys.privateKey);

export function sendNotification(sub, title, body) {
  const notification = {
    title,
    body,
    icon: `https://icon-library.com/images/doge-icon/doge-icon-21.jpg`,
  };

  return webPush.sendNotification(sub, JSON.stringify(notification));
}
