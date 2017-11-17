require('dotenv').load();

const express = require('express');
const session = require('express-session');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const localeMiddleware = require('express-locale');
const bodyParser = require('body-parser');
const next = require('next');

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

// Secret used to encrypt session data stored on the server
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'change-me';

const app = next({
  dir: '.',
  dev: (process.env.NODE_ENV === 'development')
});

const handle = app.getRequestHandler();
const server = express();

// configure Express
server.use(localeMiddleware());
server.use(cookieParser());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRET || 'keyboard cat']
}));
server.use(session({
  secret: process.env.SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.prepare()
  .then(() => {
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
