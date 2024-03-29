const express = require("express");
const router = express.Router()
const multer = require("multer")
const { GridFsStorage } = require("multer-gridfs-storage");
const path = require('path');
const crypto = require('crypto');
const { mongoose, Types } = require("mongoose");
const ftpUser = require("../models/ftpUser");
const { mongoURIFTP, ftpConn } = require("../server");

let bucket;

ftpConn.once('open', () => {
  bucket = new mongoose.mongo.GridFSBucket(ftpConn.db, {
    bucketName: "uploads"
  })
});

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
        const originalFilename = file.originalname;
        console.log(file);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
          metadata: {
            owner: req.body.userId,
            originalFilename: originalFilename
          },
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

// Files

// upload file
router.post('/upload', upload.single('file'), (req, res) => {
  res.json({ file: req.file })
})

// get multiple files
router.get('/files', async (req, res) => {
  try {
    let files = await bucket.find().toArray();
    if (!files || files.length === 0) {
      return res.json([])
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
router.get('/files/:originalFilename', async (req, res) => {
  try {
    let file = await bucket.find({ 'metadata.originalFilename': req.params.originalFilename }).toArray();
    if (!file || file.length === 0) {
      return res.status(404).json({ err: 'No file.' })
    }
    res.json({ file })

  } catch (err) {
    res.json({ err: err.message })
  }
})

// render file
router.get('/files/render/:filename', async (req, res) => {
  try {
    let file = await bucket.find({ filename: req.params.filename }).toArray();
    if (!file || file.length === 0) return res.status(404).json({ err: 'No file.' });

    const stream = bucket.openDownloadStreamByName(req.params.filename);
    stream.pipe(res);
  } catch (err) {
    res.json({ err: err.message })
  }
})

// download file
router.get('/files/download/:filename', async (req, res) => {
  try {
    let file = await bucket.find({ filename: req.params.filename }).toArray();
    if (!file || file.length === 0) return res.status(404).json({ err: 'No file.' });

    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', 'attachment; filename="' + req.params.filename + '"');

    const stream = bucket.openDownloadStreamByName(req.params.filename);
    stream.pipe(res);
  } catch (err) {
    res.json({ err: err.message })
  }
})

// Users
router.get('/users', async (req, res) => {
  try {
    const users = await ftpUser.find()
    res.json(users)
  } catch (err) {
    res.json({ message: err.message })
  }
})

router.get('/users/:displayname', async (req, res) => {
  try {
    const users = await ftpUser.find({displayName: req.params.displayname })
    res.json(users)
  } catch (err) {
    res.json({ message: err.message })
  }
})

router.post('/users', async (req, res) => {
  const ftpUserQ = new ftpUser({
    displayName: req.body.displayName,
    email: req.body.email
  })
  try { 
    const newFtpUser = await ftpUserQ.save()
    res.json(newFtpUser)
  } catch (err){
    res.status(400).json({ message: err.message })
  }
})

module.exports = router