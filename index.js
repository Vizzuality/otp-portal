// eslint-disable-line global-require

const express = require('express');
const next = require('next');
const orm = require('orm');
const sass = require('node-sass');
const { parse } = require('url');
const auth = require('./routes/auth');

// Load environment variables from .env file if present
require('dotenv').load();

// now-logs allows remote debugging if deploying to now.sh
if (process.env.LOGS_SECRET) {
  require('now-logs')(process.env.LOGS_SECRET);
}

process.on('uncaughtException', (err) => {
  console.info(`Uncaught Exception: ${err}`);
});

process.on('unhandledRejection', (reason, p) => {
  console.info('Unhandled Rejection: Promise:', p, 'Reason:', reason);
});

// Default when run with `npm start` is 'production' and default port is '80'
// `npm run dev` defaults mode to 'development' & port to '3000'
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 80;

// Configure a database to store user profiles and email sign in tokens
// Database connection string for ORM (e.g. MongoDB/Amazon Redshift/SQL DB…)
// By default it uses SQL Lite to create a DB in /tmp/nextjs-starter.db
process.env.DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || 'sqlite:///tmp/nextjs-starter.db';

// Secret used to encrypt session data stored on the server
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'change-me';

const app = next({
  dir: '.',
  dev: (process.env.NODE_ENV === 'development')
});

const handle = app.getRequestHandler();
let server;

app.prepare()
  .then(() => {
    // Get instance of Express server
    server = express();

    // Set it up the database (used to store user info and email sign in tokens)
    return new Promise((resolve, reject) => {
      // Before we can set up authentication routes we need to set up a database
      orm.connect(process.env.DB_CONNECTION_STRING, (err, db) => {
        if (err) {
          return reject(err);
        }

        // Define our user object
        // * If adding a new oauth provider, add a field to store account id
        // * Tokens are single use but don't expire & we don't save verified date
        db.define('user', {
          name: { type: 'text' },
          email: { type: 'text', unique: true },
          token: { type: 'text', unique: true },
          verified: { type: 'boolean', defaultValue: false },
          facebook: { type: 'text' },
          google: { type: 'text' },
          twitter: { type: 'text' }
        });

        // Creates require tables/collections on DB
        // Note: If you add fields to am object this won't do that for you, it
        // only creates tables/collections if they are not there - you still need
        // to handle database schema changes yourself.
        db.sync((error) => {
          if (error) {
            return reject(error);
          }
          return resolve(db);
        });
      });
    });
  })
  .then((db) => {
    // Once DB is available, setup sessions and routes for authentication
    auth.configure({
      app,
      server,
      user: db.models.user,
      secret: process.env.SESSION_SECRET
    });

    // Add route to serve compiled SCSS from /assets/{build id}/index.css
    // Note: This is is only used in production, in development it is inlined
    const sassResult = sass.renderSync({ file: './css/index.scss', outputStyle: 'compressed' });
    server.get('/assets/:id/index.css', (req, res) => {
      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Cache-Control', 'public, max-age=2592000');
      res.setHeader('Expires', new Date(Date.now() + 2592000000).toUTCString());
      res.send(sassResult.css);
    });

    server.get('/operators', (req, res) => {
      const { query } = parse(req.url, true);
      return app.render(req, res, '/operators', Object.assign(req.params, query));
    });

    server.get('/operators/:id', (req, res) => {
      const { query } = parse(req.url, true);
      return app.render(req, res, '/operators-detail', Object.assign(req.params, query));
    });

    server.get('/operators/:id/:tab', (req, res) => {
      const { query } = parse(req.url, true);
      return app.render(req, res, '/operators-detail', Object.assign(req.params, query));
    });

    server.get('/observations', (req, res) => app.render(req, res, '/observations', Object.assign(req.params, req.query)));
    server.get('/observations/:tab', (req, res) => app.render(req, res, '/observations', Object.assign(req.params, req.query)));

    server.get('/about', (req, res) => app.render(req, res, '/about', req.params));

    // HELP
    server.get('/help', (req, res) => app.render(req, res, '/help', req.params));
    server.get('/help/:tab', (req, res) => app.render(req, res, '/help', req.params));

    // Default catch-all handler to allow Next.js to handle all other routes
    server.all('*', (req, res) => handle(req, res));

    // Set vary header (good practice)
    // Note: This overrides any existing 'Vary' header but is okay in this app
    server.use((req, res, next) => {
      res.setHeader('Vary', 'Accept-Encoding');
      next();
    });

    server.listen(process.env.PORT, (err) => {
      if (err) {
        throw err;
      }
      console.log(`> Ready on http://localhost:${process.env.PORT} [${process.env.NODE_ENV}]`);
    });
  })
  .catch((err) => {
    console.error('An error occurred, unable to start the server');
    console.error(err);
  });
