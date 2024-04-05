const express = require("express");
const router = express.Router()
const multer = require("multer")
const { GridFsStorage } = require("multer-gridfs-storage");
const crypto = require('crypto');
const { mongoose, Types } = require("mongoose");
const { mongoURIFTP, ftpConn } = require("../server");
const FtpUser = require("../models/ftpUser");
const FtpFile = require("../models/ftpFile");
const FtpFolder = require("../models/ftpFolder");

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

// get ftpFiles
const mergeFtpFile = async (file) => {
  const ftpFileQ = await FtpFile.findOne({ fileId: file._id });
  file.favorite = ftpFileQ.favorite;
  file.lastModified = ftpFileQ.lastModified;
  return file;
}
// merging Files
const mergeFtpFiles = async (files) => {
  const ftpFiles = await FtpFile.find();

  files.map(file => {
    const ftpFileQ = ftpFiles.find(f => f.fileId === file._id.toString())
    if (ftpFileQ) {
      file.favorite = ftpFileQ.favorite;
      file.lastModified = ftpFileQ.lastModified;
    }
  })
  return files;
}

// Files

// upload file
router.post('/upload', upload.single('file'), (req, res) => {
  res.json({ file: req.file })
})

// create fileObject
router.post('/files', async (req, res) => {
  const newFtpFile = new FtpFile({
    fileId: req.body.fileId,
    owner: req.body.owner,
    favorite: req.body.favorite,
    lastModified: req.body.lastModified,
    folders: req.body.folders
  });

  try {
    const newFile = await newFtpFile.save()
    let file = (await bucket.find({ _id: new Types.ObjectId(newFile.fileId) }).toArray())[0];
    file = await mergeFtpFile(file);
    res.json({ file: file })
  } catch (err) {
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
      return res.json({ files: null })
    } else {
      files = await mergeFtpFiles(files);
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

    const updateFile = req.body.data.file;
    await FtpFile.updateOne({ fileId: req.params.id }, {
      favorite: updateFile.favorite
    })

    if (newName) {
      const lastDotIndex = newName.lastIndexOf('.');
      const name = newName.substring(0, lastDotIndex);
      const ext = newName.substring(lastDotIndex + 1);
      await bucket.rename(objectId, `${name}.${ext}`);
      updateFile.filename = `${name}.${ext}`;
    }

    res.json({ file: updateFile });
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
      await FtpFile.deleteOne({ fileId: req.params.id })
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
    let file = (await bucket.find({ filename: req.params.filename }).toArray())[0];
    file = await mergeFtpFile(file);

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
    if (!file || file.length === 0) return res.redirect('https://home.oldziej.pl/ftp');

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

// Folders

// get folders
router.get('/folders', async (req, res) => {
  try {
    let filter = {};
    if (req.query.user) filter["owner"] = req.query.user;
    if (req.query.folderName) filter["name"] = req.query.folderName;
    let folders = await FtpFolder.find(filter);

    if (!folders || folders.length === 0) {
      return res.json({ folders: null })
    } else {
      res.json({ folders })
    }
  } catch (err) {
    res.json({ err: err.message })
  }
})

// create folder
router.post('/folders', async (req, res) => {
  const ftpFolder = new FtpFolder({
    name: req.body.name,
    owner: req.body.owner,
  });
  try {
    const newFtpFolder = await ftpFolder.save(); 

    res.json({ folder: newFtpFolder })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Users
router.get('/users', async (req, res) => {
  try {
    const users = await FtpUser.find()
    res.json(users)
  } catch (err) {
    res.json({ message: err.message })
  }
})

router.post('/users', async (req, res) => {
  const user = new FtpUser({
    displayName: req.body.displayName,
    email: req.body.email
  })
  try {
    const newUser = await user.save()
    res.json(newUser)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.get('/users/:displayname', async (req, res) => {
  try {
    const users = await FtpUser.find({ displayName: req.params.displayname })
    res.json(users)
  } catch (err) {
    res.json({ message: err.message })
  }
})

module.exports = router