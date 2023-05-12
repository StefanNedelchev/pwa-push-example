import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';
import url from 'url';
import { db, insertSubscription, deleteSubscription, selectAllSubscriptions } from './db.js';
import { sendNotification } from './webPush.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: true,
}));
app.use(bodyParser.json());

app.post('/subscribe', (req, res) => {
  insertSubscription(req.body)
    .then(() => res.status(200).send({ message: '✔️ Subscription saved' }))
    .catch((err) => {
      console.log(err);
      res.status(422).send({ message: `Subscription not saved. ${err.message}` });
    });
});

app.post('/send-message', (req, res) => {
  selectAllSubscriptions()
    .then((subs) => {
      Promise.all(subs.map((sub) => (
        sendNotification(sub, req.body.title, req.body.message).catch((err) => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            console.log('Subscription has expired or is no longer valid: ', err.message);
            deleteSubscription(sub.endpoint);
          }
        })
      )));
      res.status(200).send();
    })
    .catch((err) => res.status(422).send({ message: `Subscription not saved. ${err.message}` }))
});

// Serve static files for the web app
const webAppPath = path.join(__dirname, '..', 'public');
app.use('/', express.static(webAppPath));

const port = parseInt(process.env['PORT'], 10) || 8080;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}.`);
});

process.on('SIGTERM', () => {
  db.close((err) => {
    if (err) {
      console.error(err);
    }
  })
});