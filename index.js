/* eslint-disable no-console */
require('dotenv').load();

const express = require('express');
const session = require('express-session');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const request = require('request-promise');
const localeMiddleware = require('express-locale');
const bodyParser = require('body-parser');
const next = require('next');
const { parse } = require('url');

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
  dev: process.env.NODE_ENV === 'development',
});

const handle = app.getRequestHandler();
const server = express();

// configure Express
server.use(cookieParser());
server.use(
  localeMiddleware({
    priority: ['query', 'cookie', 'default'],
    default: 'en-GB',
    cookie: { name: 'language' },
    query: { name: 'language' },
  })
);
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(
  cookieSession({
    name: 'session',
    keys: [process.env.SECRET || 'keyboard cat'],
  })
);
server.use(
  session({
    secret: process.env.SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  })
);

app
  .prepare()
  .then(() => {
    // COUNTRIES
    server.get('/countries', (req, res) => {
      const { query } = parse(req.url, true);
      return app.render(
        req,
        res,
        '/countries',
        Object.assign(req.params, query)
      );
    });

    server.get('/countries/:id', (req, res) => {
      const { query } = parse(req.url, true);
      return app.render(
        req,
        res,
        '/countries-detail',
        Object.assign(req.params, query)
      );
    });

    server.get('/countries/:id/:tab', (req, res) => {
      const { query } = parse(req.url, true);
      return app.render(
        req,
        res,
        '/countries-detail',
        Object.assign(req.params, query)
      );
    });

    // OPERATORS
    server.get('/operators', (req, res) => {
      const { query } = parse(req.url, true);
      return app.render(
        req,
        res,
        '/operators',
        Object.assign(req.params, query)
      );
    });

    server.get('/operators/new', (req, res) =>
      app.render(
        req,
        res,
        '/operators/new',
        Object.assign(req.params, req.query)
      )
    );

    server.get('/operators/database', (req, res) =>
      app.render(
        req,
        res,
        '/operators/database',
        Object.assign(req.params, req.query)
      )
    );

    server.get('/operators/edit', (req, res) => {
      if (req.session.user) {
        return app.render(
          req,
          res,
          '/operators/edit',
          Object.assign(req.params, req.query)
        );
      }
      return res.redirect('/');
    });

    server.get('/operators/:id', (req, res) => {
      const { query } = parse(req.url, true);
      return app.render(
        req,
        res,
        '/operators/detail',
        Object.assign(req.params, query)
      );
    });

    server.get('/operators/:id/:tab', (req, res) => {
      const { query } = parse(req.url, true);
      return app.render(
        req,
        res,
        '/operators/detail',
        Object.assign(req.params, query)
      );
    });

    // OBSERVATIONS
    server.get('/observations', (req, res) =>
      app.render(
        req,
        res,
        '/observations',
        Object.assign(req.params, req.query)
      )
    );
    server.get('/observations/:tab', (req, res) =>
      app.render(
        req,
        res,
        '/observations',
        Object.assign(req.params, req.query)
      )
    );

    server.get('/about', (req, res) =>
      app.render(req, res, '/about', Object.assign(req.params, req.query))
    );

    // HELP
    server.get('/help', (req, res) =>
      app.render(req, res, '/help', Object.assign(req.params, req.query))
    );
    server.get('/help/:tab', (req, res) =>
      app.render(req, res, '/help', Object.assign(req.params, req.query))
    );

    // SIGNUP
    server.get('/signup', (req, res) =>
      app.render(req, res, '/signup', Object.assign(req.params, req.query))
    );

    // NEWSLETTER
    server.get('/newsletter', (req, res) =>
      app.render(req, res, '/newsletter', Object.assign(req.params, req.query))
    );

    // LOGIN
    server.post('/login', (req, res) => {
      request({
        url: `${process.env.OTP_API}/login`,
        headers: {
          'OTP-API-KEY': process.env.OTP_API_KEY,
        },
        body: req.body,
        method: 'POST',
        json: true,
      })
        .then((data) => {
          req.session.user = data;
          res.json(data);
        })
        .catch(() => {
          res.status(401).send('Something went wrong!!. User unauthorized.');
        });
    });

    server.get('/logout', (req, res) => {
      req.session = null;
      res.json({});
    });

    server.use(
      '/static',
      express.static(`${__dirname}/static`, {
        maxAge: '365d',
      })
    );

    server.get(/^\/_next\/static\/(fonts|images)\//, (_, res, nextHandler) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      nextHandler();
    });

    // Default catch-all handler to allow Next.js to handle all other routes
    server.all('*', (req, res) => handle(req, res));

    // Set vary header (good practice)
    // Note: This overrides any existing 'Vary' header but is okay in this app
    server.use((req, res, _next) => {
      res.setHeader('Vary', 'Accept-Encoding');
      _next();
    });

    server.listen(process.env.PORT, (err) => {
      if (err) {
        throw err;
      }
      console.log(
        `> Ready on http://localhost:${process.env.PORT} [${process.env.NODE_ENV}]`
      );
    });
  })
  .catch((err) => {
    console.error('An error occurred, unable to start the server');
    console.error(err);
  });
