const bcrypt = require("bcrypt");

const helmet = require("helmet");
const xssClean = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

require('dotenv').config()

require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react']
});

const express = require("express")
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const { createServer } = require('http')
const { Server } = require("socket.io")
const { instrument } = require("@socket.io/admin-ui");

const environment = process.env.NODE_ENV || 'production';
const domain = environment === "production" ? process.env.DOMAIN : process.env.DOMAIN_LOCAL;
const portfolioDomain = environment === "production" ? process.env.PORTFOLIO_DOMAIN : process.env.PORTFOLIO_DOMAIN_LOCAL;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())

const allowedOrigins = [domain, portfolioDomain];

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

app.use(xssClean());
app.use(mongoSanitize());

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  next();
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      domain,
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

dartsConn.on('error', (err) => console.error('MongoDB (Darts) connection error:', err));
dartsConn.once('open', () => console.log('Connected to Darts Database'));
ftpConn.once('open', () => console.log('Connected to Ftp Database'));

module.exports = { dartsConn, ftpConn, mongoURIFTP, io };

require("./socket.io/listeners");

const dartsRouter = require('./routes/darts')
app.use('/api/darts', dartsRouter);

const usersRouter = require('./routes/auth');
app.use('/api/auth', usersRouter);

const ftpRouter = require('./routes/ftp');
app.use('/api/ftp', ftpRouter);

const emailsRouter = require('./routes/emails');
app.use('/api/emails', emailsRouter);

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

console.log("Using environment - ", environment)

server.listen(3000, () => console.log('Server started on port 3000'));