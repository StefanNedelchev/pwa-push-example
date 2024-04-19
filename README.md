# PWA Push Example

Welcome to my repo which aims to provide you the basics for creating a valid Progressive Web App (PWA) with implemented push notifications using the [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API). As of iOS 16.4 you can have this feature on Apple devices as well so it's safe to say that right now every modern browser supports Push Notifications.

## Project structure

The project consists of a small Node JS server which uses [Express](https://expressjs.com/) to provide some basic back-end that we need and serves the front-end web page.

### Back-end

The bac-kend is located in the `/api` directory and it's a Node JS application that uses 3 main libraries for the purpose of our example:
- [Express](https://expressjs.com/) framework for creating API with a few end points and serving the application
- [web-push](https://github.com/web-push-libs/web-push) for pushing notifications
- [SQLite3 for Node](https://github.com/TryGhost/node-sqlite3) for creating a small local database to save user subscriptions. These subscriptions are necessary to push notifications using the web-push library.

File structure:
- `app.js` - the main file of the Node app which registers the routes and bootstraps the server app.
- `db.js` - this module encapsulates the sqlite database functionality by initializing the database connection and providing some methods for executing the operations we need.
- `webPush.js` - this module encapsulates the web push logic and exports a function for pushing a notification.


### Front-end

The front-end is a simple web page and it's located in the `/public` directory. It doesn't use any JS frameworks or any 3rd party libraries. The file structure is as follows:
- `index.html` - the entry point of the web app. It contains basic HTML body with a button for subscribing to push notifications, and a few elements for state indication.
- `styles.css` - stylesheet wieh a few styles for our elements
- `scripts.js` - the client-side JavaScript code which is used by the web page
- `sw.js` - the [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) which will be registered an installed by the browser. It's necessary for PWA applications and its main purpose for this project is to handle push notifications.
- `manifes.webmanifes` - basic web manifest file which is necessary for each PWA. It includes properties like app name, theme colors and paths to icons.
- `/assets` - a folder that includes all static assets (in this case we have icons and a splash screen for iOS)

## Installation and usage

### Project setup

1. First you need to have Node JS installed on your system (v18 or higher). If you don't have any just visit [the official website](https://nodejs.org/en) and download the LTS version. During installation make sure you select the option to install the `NPM` package manager too.

2. Open the project directory with your IDE or the command-line and run `npm install` to install all the packages needed by the Node server.

3. Now you need to add your environment variables. Create an `.env` file in the root directory and copy the content from `.env.example`. If you prefer a different port than `8080` just change the variable in the `.env` file. The other 2 variables are for the VAPID keys which are the next thing you need:

    - You need a pair of VAPID keys which are necessary for the push service to identify your application. The keys need to follow specific requirements and have to be unique so the best (and easiset) way to generate them is by using the **web-push** library that we already have. Run the pre-defined NPM script `npm run vapid-keys` and you'll see the generated keys in your console output.
    - Copy the private key and assign it to the `VAPID_PRIVATE_KEY` env variable. Keep in mind that this key should be kept secred so avoid exposing it publicly.
    - Copy the public key and assign it to the `VAPID_PUBLIC_KEY` env variable.
    - While keeping the public key in the clipboard open the client-side script (`/public/scripts.js`) and assign the key as a string to the `applicationServerKey` constant which is at the very top of the file (basically replace the `<public-vapid-key>` placeholder).
    - The `apiPort` constant below is for the port of the server so the web app can send the subscribe request. Set the correct port there.

4. You are good to go!

Run the application by executing the command `npm run start`. It will serve the Node server on the local host and you should see something similar in the console output:

```shell
Server is running on http://localhost:8080.
```

Open this URL in your browser and you should see the following page:

![image](https://github.com/StefanNedelchev/pwa-push-example/assets/15238282/5e171124-605c-46ff-83da-dada08658ff7)

*NOTE: if for some reason the service worker is not registered successfully you'll see an error message instead*

To subscribe for push notifications you have to click on the button and give notification permissions to the app by clicking "allow" on the pop-up that would appear.

![image](https://github.com/StefanNedelchev/pwa-push-example/assets/15238282/526ec4ae-bad8-4f30-9f42-ecf04da6a633)

### Pushing a notification

To push a notification you need to send a POST request to the **/send-message** end point of our API. You can use the `test-push.http` script from the root directory which serves as an example. You can use it with a REST client like Postman or [the REST Client extension for VSCode](https://marketplace.visualstudio.com/items?itemName=humao.rest-client). You can modify the port and the body of the request to suite your needs. After sending a request all subscribers should receive a push notification. The service worker also handles clicking on the notification and you'll see small label appear on the UI.

## Further reading

Check out this detailed guide - https://web.dev/push-notifications-overview/
