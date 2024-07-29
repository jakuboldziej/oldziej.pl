const dotenv = require('dotenv');
const path = require('path');

require('dotenv').config()

const express = require("express")
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const { createServer } = require('http')
const { Server } = require("socket.io")

const environment = process.env.NODE_ENV || 'production';

app.use(express.static(path.join(__dirname, '../frontend', 'dist')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "upgrade-insecure-requests");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
  next();
});

const mongoURIDarts = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@188.122.23.154/darts`
const dartsConn = mongoose.createConnection(mongoURIDarts);
const mongoURIFTP = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@188.122.23.154/ftp`
const ftpConn = mongoose.createConnection(mongoURIFTP);

dartsConn.on('error', (err) => console.error('MongoDB (Darts) connection error:', err));
dartsConn.once('open', () => console.log('Connected to Darts Database'));
ftpConn.once('open', () => console.log('Connected to Ftp Database'));

module.exports = { dartsConn, ftpConn, mongoURIFTP };

app.use(express.json())

const dartsRouter = require('./routes/darts')
app.use('/api/darts', dartsRouter)

const usersRouter = require('./routes/auth');
app.use('/api/auth', usersRouter)

const ftpRouter = require('./routes/ftp');
app.use('/api/ftp', ftpRouter)

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
});

const domain = environment === "production" ? process.env.SOCKETIO_CORS_DOMAIN : process.env.SOCKETIO_CORS_DOMAIN_LOCAL;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: domain
  }
});

app.locals.io = io;

const { addingOnlineUser, removeUserOnDisconnect } = require('./socket.io/listeners');

io.on('connection', (socket) => {
  console.log("New connection", socket.id);
  // Listeners 

  // Handling Online Users

  socket.on("addingOnlineUser", (data) => {
    const onlineUsersData = addingOnlineUser(data);
    io.emit('onlineUsersListener', JSON.stringify({
      updatedOnlineUsers: onlineUsersData.onlineUsers,
      updatedUser: onlineUsersData.updatedUser,
      isUserOnline: true
    }));
  });

  socket.on('disconnect', () => {
    const onlineUsersData = removeUserOnDisconnect(socket.id)
    io.emit('onlineUsersListener', JSON.stringify({
      updatedOnlineUsers: onlineUsersData.onlineUsers,
      updatedUser: onlineUsersData.updatedUser,
      isUserOnline: false
    }));
  });
});

server.listen(3000, () => console.log('Server started on port 3000'))