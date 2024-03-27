const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const express = require("express")
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const app = express()

app.use(express.static(path.join(__dirname, '../frontend', 'dist')));



app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "upgrade-insecure-requests");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
  next();
});

const mongoURIDarts = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@188.122.23.154/darts`

mongoose.connect(mongoURIDarts)
const db = mongoose.connection
db.on('error', (err) => console.log(err))
db.once('open', () => {
  console.log('Connected Database')
})

app.use(express.json())

const dartsRouter = require('./routes/darts')
app.use('/api/darts', dartsRouter)

const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter)

const ftpRouter = require('./routes/ftp')
app.use('/api/ftp', ftpRouter)

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
});

app.listen(3000, () => console.log('Server Started on port 3000'))
