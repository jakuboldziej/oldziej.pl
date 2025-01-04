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

  res.setHeader("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  next();
});

const mongoURIDarts = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@192.168.1.109/darts`
const dartsConn = mongoose.createConnection(mongoURIDarts);
const mongoURIFTP = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@192.168.1.109/ftp`
const ftpConn = mongoose.createConnection(mongoURIFTP);

dartsConn.on('error', (err) => console.error('MongoDB (Darts) connection error:', err));
dartsConn.once('open', () => console.log('Connected to Darts Database'));
ftpConn.once('open', () => console.log('Connected to Ftp Database'));

module.exports = { dartsConn, ftpConn, mongoURIFTP };

const dartsRouter = require('./routes/darts')
app.use('/api/darts', dartsRouter);

const usersRouter = require('./routes/auth');
app.use('/api/auth', usersRouter);

const ftpRouter = require('./routes/ftp');
app.use('/api/ftp', ftpRouter);

const emailsRouter = require('./routes/emails');
app.use('/api/emails', emailsRouter);

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

app.locals.io = io;

const { addingOnlineUser, scheduleUserOffline } = require('./socket.io/listeners');

io.on('connection', (socket) => {
  // Listeners

  // Admin Listeners

  socket.on("verifyEmailAdmin", (data) => {
    const verifyData = JSON.parse(data);

    io.emit("verifyEmail", JSON.stringify({
      userDisplayName: verifyData.userDisplayName,
      verified: verifyData.verified
    }));
  });

  // Live game

  socket.on("joinLiveGamePreview", (data) => {
    const joinData = JSON.parse(data);

    socket.join(`game-${joinData.gameCode}`);
  });

  socket.on("leaveLiveGamePreview", (data) => {
    const leaveData = JSON.parse(data);

    socket.leave(`game-${leaveData.gameCode}`);
  });

  socket.on("joinLiveGameFromQrCode", (data) => {
    const joinData = JSON.parse(data);

    io.to(joinData.socketId).emit("joinLiveGameFromQrCodeClient", JSON.stringify(sendData));
  });

  socket.on("updateLiveGamePreview", (data) => {
    const gameData = JSON.parse(data);

    io.to(`game-${gameData.gameCode}`).emit("updateLiveGamePreviewClient", JSON.stringify(gameData));
  });

  // Live game preview events

  socket.on("playAgainButtonServer", (data) => {
    const playAgainData = JSON.parse(data);
    const oldGameCode = playAgainData.oldGameCode;
    const newGame = playAgainData.newGame;

    io.to(`game-${oldGameCode}`).emit("playAgainButtonClient", JSON.stringify(newGame));
    io.sockets.in(`game-${oldGameCode}`).socketsLeave(`game-${oldGameCode}`);
  });

  socket.on("userOverthrow", (data) => {
    const { userDisplayName, gameCode } = JSON.parse(data);

    io.to(`game-${gameCode}`).emit("userOverthrowClient", userDisplayName);
  });

  socket.on("hostDisconnectedFromGame", (data) => {
    const { gameCode } = JSON.parse(data);

    io.to(`game-${gameCode}`).emit("hostDisconnectedFromGameClient", true);
    io.sockets.in(`game-${gameCode}`).socketsLeave(`game-${gameCode}`);
  });

  socket.on("ESP32_CONTROL_LED_SERVER", (data) => {
    io.emit("ESP32_CONTROL_LED", data);
  });

  socket.on("ESP32_CHECK_LED_SERVER", () => {
    io.emit("ESP32_CHECK_LED");
  });

  socket.on("ESP32_LED_STATUS_SERVER", (data) => {
    io.emit("ESP32_LED_STATUS", data);
  });

  // Mobile App Inputs

  socket.on("externalKeyboardInput", (data) => {
    const { gameCode, input } = JSON.parse(data);

    io.to(`game-${gameCode}`).emit("externalKeyboardInputClient", JSON.stringify(input));
  });

  socket.on("externalKeyboardPlayAgain", (data) => {
    const { gameCode } = JSON.parse(data);

    io.to(`game-${gameCode}`).emit("externalKeyboardPlayAgainClient", JSON.stringify(gameCode));
  });

  // Handling Online Users
  socket.on("addingOnlineUser", (data) => {
    addingOnlineUser(data, socket.id, io);
  });

  socket.on('disconnect', () => {
    scheduleUserOffline(socket.id, io);
  });

  socket.on('connection_error', (err) => {
    console.log(err)
  });
});

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