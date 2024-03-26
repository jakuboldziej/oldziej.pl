const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const express = require("express")
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const { GridFsStorage } = require("multer-gridfs-storage");
const multer = require("multer")
const Grid = require("gridfs-stream")
const methodOverride = require("method-override")
const crypto = require('crypto');
const { ObjectID } = require('mongodb');

const app = express()

app.use(express.static(path.join(__dirname, '../frontend', 'dist')));

app.use(bodyParser.json());
app.use(methodOverride('_method'))

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "upgrade-insecure-requests");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
  next();
});

const mongoURIDarts = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@188.122.23.154/darts`
const mongoURIFTP = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@188.122.23.154/ftp`

mongoose.connect(mongoURIDarts)
const db = mongoose.connection
db.on('error', (err) => console.log(err))
db.once('open', () => {
  console.log('Connected Database')
})

const connFTP = mongoose.createConnection(mongoURIFTP, {});

connFTP.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(connFTP.db, {
    bucketName: "uploads"
  })
})

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURIFTP,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

app.post('/api/ftp/upload', upload.single('file'), (req, res) => {
  res.json({ file: req.file })
  console.log(req.file);
})

// get multiple
app.get('/api/ftp/files', async (req, res) => {
  try {
    let files = await gfs.find().toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({err: 'No files.'})
    } else {
      files.map(file => {
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      })
      res.json({ files })
    }
  } catch (err) {
    res.json({ err: err.message })
  }
})

// get one
// app.get('/api/ftp/files/:filename', async (req, res) => {
//   try {
//     let file = await gfs.find({filename: req.params.filename}).toArray();
//     if (!file || file.length === 0) {
//       return res.status(404).json({err: 'No file.'})
//     }
//     res.json({ file })
//   } catch (err) {
//     res.json({ err: err.message })
//   }
// })

// render on site
app.get('/api/ftp/files/:filename', async (req, res) => {
  try {
    let file = await gfs.find({filename: req.params.filename}).toArray();
    if (!file || file.length === 0) {
      return res.status(404).json({err: 'No file.'})
    }

    if(file[0].contentType === 'image/jpeg' || file[0].contentType === 'image/png' || file[0].contentType === 'image/webp') {
      gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    }
  } catch (err) {
    res.json({ err: err.message })
  }
})

// delete file by id
app.delete('/api/ftp/files/:_id', async (req, res) => {
  try {
    console.log(req.params._id);
    gfs.delete(ObjectId(req.params._id))
  } catch (err) {
    res.json({ err: err.message })
  }
})

app.use(express.json())

const dartsRouter = require('./routes/darts')
app.use('/api/darts', dartsRouter)

const usersRouter = require('./routes/users');
const { ObjectId } = require('mongodb');
app.use('/api/users', usersRouter)

// const ftpRouter = require('./routes/ftp')
// app.use('/api/ftp', ftpRouter)

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
});

app.listen(3000, () => console.log('Server Started on port 3000'))

exports.upload = upload;
