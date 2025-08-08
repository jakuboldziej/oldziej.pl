const bcrypt = require("bcrypt");

const helmet = require("helmet");
const xssClean = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

require('dotenv').config()

require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react']
});

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const { createServer } = require('http')
const { Server } = require("socket.io")
const { instrument } = require("@socket.io/admin-ui");
const { logger } = require("./middleware/logging");

const environment = process.env.NODE_ENV || 'production';
const domain = environment === "production" ? process.env.DOMAIN : process.env.DOMAIN_LOCAL;
const portfolioDomain = environment === "production" ? process.env.PORTFOLIO_DOMAIN : process.env.PORTFOLIO_DOMAIN_LOCAL;
const previewDomain = process.env.PREVIEW_DOMAIN;
const gamesDomains = [process.env.LOCALHOST_GAMES_DOMAIN, process.env.GAMES_DOMAIN];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())

const allowedOrigins = [
  domain,
  portfolioDomain,
  previewDomain,
  ...gamesDomains
];

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", ...allowedOrigins],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: true,
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));

app.set('trust proxy', '127.0.0.1');

app.use(xssClean());
app.use(mongoSanitize());

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS, PATCH, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  next();
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      ...allowedOrigins,
      "https://admin.socket.io",
    ],
    credentials: true,
  },
  allowEIO3: true,
  transports: ['websocket', 'polling'],
});

const mongoURIDarts = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/darts`
const dartsConn = mongoose.createConnection(mongoURIDarts);
const mongoURIFTP = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/ftp`
const ftpConn = mongoose.createConnection(mongoURIFTP);
const mongoURIChores = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/chores`
const choresConn = mongoose.createConnection(mongoURIChores)

dartsConn.on('error', (err) => logger.error(`MongoDB (Darts) connection error: ${err}`));
dartsConn.once('open', () => logger.info('Connected to Darts Database'));
ftpConn.on('error', (err) => logger.error(`MongoDB (FTP) connection error: ${err}`));
ftpConn.once('open', () => logger.info('Connected to Ftp Database'));
choresConn.on('error', (err) => logger.error(`MongoDB (Chores) connection error: ${err}`));
choresConn.once('open', () => logger.info('Connected to Chores Database'));

module.exports = { dartsConn, ftpConn, mongoURIFTP, choresConn, io };

require("./socket.io/listeners");

const dartsRouter = require('./routes/darts')
app.use('/api/darts', dartsRouter);

const usersRouter = require('./routes/auth');
app.use('/api/auth', usersRouter);

const ftpRouter = require('./routes/ftp');
app.use('/api/ftp', ftpRouter);

const choresRouter = require('./routes/chore');
app.use('/api/chore', choresRouter);

const emailsRouter = require('./routes/emails');
app.use('/api/emails', emailsRouter);

const esp32Router = require('./routes/esp32');
app.use('/api/esp32', esp32Router);

// Admin UI

bcrypt.hash(process.env.ADMIN_UI_PASSWORD, 10).then((hashedPassword) => {
  instrument(io, {
    auth: {
      type: 'basic',
      username: "admin",
      password: hashedPassword
    },
    // mode: environment
    mode: "development"
  });
});

logger.info("Using environment - ", environment)

app.get('/health', async (req, res) => {
  res.status(200).json("Server alive");
});

server.listen(
  3000, () => {
    logger.info("Server started on port 3000");
  }
);