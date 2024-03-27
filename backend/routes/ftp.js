const express = require("express");
const router = express.Router()
const multer = require("multer")
const { GridFsStorage } = require("multer-gridfs-storage");
const path = require('path');
const crypto = require('crypto');
const { mongoose, Types } = require("mongoose");

const mongoURIFTP = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@188.122.23.154/ftp`
const connFTP = mongoose.createConnection(mongoURIFTP);

let bucket;

connFTP.once('open', () => {
  bucket = new mongoose.mongo.GridFSBucket(connFTP.db, {
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
        const fileInfo = {
          filename: file.originalname,
          bucketName: 'uploads',
          
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

// upload file
router.post('/upload', upload.single('file'), (req, res) => {
  res.json({ file: req.file })
})

// get multiple files
router.get('/files', async (req, res) => {
  try {
    let files = await bucket.find().toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ err: 'No files.' })
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

// delete file
router.delete('/files/:id', async (req, res) => {
  try {
    const objectId = new Types.ObjectId(req.params.id)
    const file = (await bucket.find({ _id: objectId }).toArray())[0];
    if (file) {
      bucket.delete(file._id);
      res.json({ ok: true })
    }
    else {
      res.json({ ok: false })
    };
  } catch (err) {
    res.json({ err: err.message })
  }
})

// get one file
router.get('/files/:filename', async (req, res) => {
  try {
    let file = await bucket.find({ filename: req.params.filename }).toArray();
    if (!file || file.length === 0) {
      return res.status(404).json({ err: 'No file.' })
    }
    res.json({ file })

  } catch (err) {
    res.json({ err: err.message })
  }
})

// render image
router.get('/images/:filename', async (req, res) => {
  try {
    let file = await bucket.find({ filename: req.params.filename }).toArray();
    if (!file || file.length === 0) {
      return res.status(404).json({ err: 'No file.' })
    }

    if (file[0].contentType === 'image/jpeg' || file[0].contentType === 'image/png' || file[0].contentType === 'image/webp') {
      bucket.openDownloadStreamByName(req.params.filename).pipe(res);
    }
  } catch (err) {
    res.json({ err: err.message })
  }
})

module.exports = router