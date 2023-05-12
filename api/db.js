import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('subs-db.db', (err) => {
  if (err) {
    console.error('DB not initialized.', err);
    return;
  }

  db.run(`CREATE TABLE IF NOT EXISTS PUSH_SUBS (
    endpoint TEXT NOT NULL PRIMARY KEY,
    expirationTime DOUBLE NULL,
    p256dh VARCHAR(128) NOT NULL,
    auth VARCHAR(32) NOT NULL)`);
});

function getAllSubscriptions() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM PUSH_SUBS', (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const subscriptions = rows.map((row) => ({
        endpoint: row.endpoint,
        expirationTime: row.expirationTime,
        keys: { p256dh: row.p256dh, auth: row.auth },
      }));
      resolve(subscriptions);
    });
  });
}

function saveSubscription(sub) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO PUSH_SUBS VALUES(:1, :2, :3, :4)
        ON CONFLICT(endpoint) DO UPDATE SET expirationTime=:2, p256dh=:3, auth=:4`,
      [sub.endpoint, sub.expirationTime, sub.keys.p256dh, sub.keys.auth],
      (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      },
    );
  });
}

function deleteSubscription(endpoint) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM PUSH_SUBS WHERE endpoint = ?', endpoint, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

export {
  db, getAllSubscriptions as selectAllSubscriptions, saveSubscription as insertSubscription, deleteSubscription,
};
