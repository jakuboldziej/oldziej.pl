const bcrypt = require("bcrypt");

const helmet = require("helmet");
const xssClean = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

require('dotenv').config()

require('events').EventEmitter.defaultMaxListeners = 20;

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
const ngrokDomain = process.env.NGROK_DOMAIN;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())

const allowedOrigins = [
  domain,
  portfolioDomain,
  previewDomain,
  ...gamesDomains,
  ngrokDomain
].filter(Boolean);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: true,
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: false,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "no-referrer" },
  xssFilter: true,
}));

app.set('trust proxy', true);

app.use(xssClean());
app.use(mongoSanitize());

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS, PATCH, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, ngrok-skip-browser-warning");
  next();
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin === "https://admin.socket.io") {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
  allowEIO3: true,
  transports: ['polling', 'websocket'],
});

const mongoURIDarts = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/darts`;
const dartsConn = mongoose.createConnection(mongoURIDarts);
const mongoURIFTP = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/ftp`;
const ftpConn = mongoose.createConnection(mongoURIFTP);
const mongoURIChores = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/chores`;
const choresConn = mongoose.createConnection(mongoURIChores);
const mongoURIESP32 = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/esp32`;
const esp32Conn = mongoose.createConnection(mongoURIESP32);

dartsConn.on('error', (err) => logger.error(`MongoDB (Darts) connection error: ${err}`));
dartsConn.once('open', () => logger.info('Connected to Darts Database'));
ftpConn.on('error', (err) => logger.error(`MongoDB (FTP) connection error: ${err}`));
ftpConn.once('open', () => logger.info('Connected to Ftp Database'));
choresConn.on('error', (err) => logger.error(`MongoDB (Chores) connection error: ${err}`));
choresConn.once('open', () => {
  logger.info('Connected to Chores Database');

  const cronService = require('./services/cronService');
  cronService.startAllJobs();
});
esp32Conn.on('error', (err) => logger.error(`MongoDB (ESP32) connection error: ${err}`));
esp32Conn.once('open', () => logger.info('Connected to ESP32 Database'));

module.exports = { dartsConn, ftpConn, mongoURIFTP, choresConn, esp32Conn, io };

require("./socket.io/listeners");

const dartsRouter = require('./routes/darts')
app.use('/api/darts', dartsRouter);

const usersRouter = require('./routes/auth');
app.use('/api/auth', usersRouter);

const ftpRouter = require('./routes/ftp');
app.use('/api/ftp', ftpRouter);

const choresRouter = require('./routes/chores');
app.use('/api/chores', choresRouter);

const choresUsersRouter = require('./routes/choresUser');
app.use('/api/choresUsers', choresUsersRouter);

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

app.get('/api/health', async (req, res) => {
  res.status(200).json("Server alive");
});

server.listen(
  3000, () => {
    logger.info("Server started on port 3000");
  }
);