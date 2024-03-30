const express = require("express");
const router = express.Router()
const multer = require("multer")
const { GridFsStorage } = require("multer-gridfs-storage");
const path = require('path');
const crypto = require('crypto');
const { mongoose, Types } = require("mongoose");
const ftpUser = require("../models/ftpUser");
const { mongoURIFTP, ftpConn } = require("../server");
const ftpFile = require("../models/ftpFile");

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
        const userDisplayName = req.query.userDisplayName;
        const fileInfo = {
          filename: file.originalname,
          bucketName: 'uploads',
          metadata: {
            owner: userDisplayName,
            originalFileName: file.originalname
          },
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage, limits: { fileSize: 1000000000 } });

// Files

// upload file
router.post('/upload', upload.single('file'), (req, res) => {
  res.json({ file: req.file})
})

// create fileObject
router.post('/files', async (req, res) => {
  const file = new ftpFile({
    fileId: req.body.fileId,
    owner: req.body.owner,
  });

  try { 
    const newFile = await file.save()
    res.json(newFile)
  } catch (err){
    res.status(400).json({ message: err.message })
  }
})

// get multiple files
router.get('/files', async (req, res) => {
  try {
    let filter = {};
    if (req.query.user) filter["metadata.owner"] = req.query.user;
    let files = await bucket.find(filter).toArray();
    if (!files || files.length === 0) {
      return res.json({ files: null } )
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

// update file
router.put('/files/:id', async (req, res) => {
  try {
    const objectId = new Types.ObjectId(req.params.id);
    const newName = req.body.newFileName;

    const lastDotIndex = newName.lastIndexOf('.');
    const name = newName.substring(0, lastDotIndex);
    const ext = newName.substring(lastDotIndex + 1);
    await bucket.rename(objectId, `${name}.${ext}`);

    res.json({ updatedFileName: `${name}.${ext}` });
  } catch (err) {
    res.json({ err: err.message });
  }
});

// delete file
router.delete('/files/:id', async (req, res) => {
  try {
    const objectId = new Types.ObjectId(req.params.id)
    const file = (await bucket.find({ _id: objectId }).toArray())[0];

    if (file) {
      bucket.delete(file._id);
      await ftpFile.deleteOne({ fileId: req.params.id })
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

// render file
router.get('/files/render/:filename', async (req, res) => {
  try {
    let file = (await bucket.find({ filename: req.params.filename }).toArray())[0];
    if (!file || file.length === 0) return res.status(404).json({ err: 'No file.' });

    const stream = bucket.openDownloadStreamByName(file.filename);
    stream.pipe(res);
  } catch (err) {
    res.json({ err: err.message })
  }
})

// download file
router.get('/files/download/:filename', async (req, res) => {
  try {
    let file = (await bucket.find({ filename: req.params.filename }).toArray())[0];
    if (!file || file.length === 0) return res.status(404).json({ err: 'No file.' });

    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', 'attachment; filename="' + req.params.filename + '"');

    const stream = bucket.openDownloadStreamByName(file.filename);
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

router.post('/users', async (req, res) => {
  const user = new ftpUser({
    displayName: req.body.displayName,
    email: req.body.email
  })
  try { 
    const newUser = await user.save()
    res.json(newUser)
  } catch (err){
    res.status(400).json({ message: err.message })
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

module.exports = router