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
const authenticateUser = require("../middleware/auth");

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
        const userId = req.query.userId;
        const fileInfo = {
          filename: file.originalname,
          bucketName: 'uploads',
          metadata: {
            ownerId: userId,
            originalFileName: file.originalname
          },
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage, limits: { fileSize: 1000000000 } });

// merging Files
const mergeFtpFile = async (ftpFile) => {
  const file = (await bucket.find({ _id: new Types.ObjectId(ftpFile.fileId) }).toArray())[0];

  if (!file) console.error('Error fetching file');

  const updatedFile = {
    ...ftpFile._doc,
    uploadDate: file.uploadDate,
    filename: file.filename,
    length: file.length,
    metadata: file.metadata
  }

  return updatedFile;
}

const mergeFtpFiles = async (ftpFiles) => {
  const updatedFiles = await Promise.all(
    ftpFiles.map(async (file) => {
      const ftpFileQ = (await bucket.find({ _id: new Types.ObjectId(file.fileId) }).toArray())[0];
      if (ftpFileQ) {
        return {
          ...file._doc,
          uploadDate: ftpFileQ.uploadDate,
          filename: ftpFileQ.filename,
          length: ftpFileQ.length,
          metadata: ftpFileQ.metadata
        };
      }
      return file;
    })
  );

  return updatedFiles;
};

const getFtpUser = async (req, res, next) => {
  let user;
  try {
    const { displayName } = req.params;
    user = await FtpUser.findOne({ displayName });
    if (user == null) return res.status(404);
  } catch (err) {
    return res.json({ message: err.message })
  }
  res.user = user;
  next();
}

// Files

// upload file
router.post('/upload', authenticateUser, upload.single('file'), (req, res) => {
  res.json({ file: req.file })
})

// create fileObject
router.post('/files', authenticateUser, async (req, res) => {
  const newFtpFile = new FtpFile({
    fileId: req.body.fileId,
    ownerId: req.body.ownerId,
    favorite: req.body.favorite,
    lastModified: req.body.lastModified,
    folders: req.body.folders
  });
  await newFtpFile.save();

  try {
    const ftpFile = await FtpFile.findOne({ _id: newFtpFile._id });
    const mergedFile = await mergeFtpFile(ftpFile);
    res.json({ file: mergedFile });
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// get multiple files
router.get('/files', authenticateUser, async (req, res) => {
  try {
    let filter = {};
    if (req.query.userId) filter.ownerId = req.query.userId;
    const ftpFiles = await FtpFile.find(filter);

    if (!ftpFiles || ftpFiles.length === 0) {
      return res.json({ files: [] })
    } else {
      const mergedFiles = await mergeFtpFiles(ftpFiles);
      res.json({ files: mergedFiles })
    }
  } catch (err) {
    res.json({ err: err.message })
  }
})

// get one file
router.get('/files/:id', authenticateUser, async (req, res) => {
  try {
    const ftpFile = await FtpFile.findOne({ _id: req.params.id });

    const mergedFile = await mergeFtpFile(ftpFile);

    if (!mergedFile || mergedFile.length === 0) {
      return res.status(404).json({ err: 'No file.' })
    }

    res.json({ file: mergedFile })
  } catch (err) {
    res.json({ err: err.message })
  }
})

// update file
router.put('/files/:id', authenticateUser, async (req, res) => {
  try {
    const newName = req.body.newFileName;

    const updateFile = req.body.data.file;
    const updatedFtpFile = await FtpFile.findOneAndUpdate({ _id: req.params.id }, {
      favorite: updateFile.favorite,
      folders: updateFile.folders
    })

    const objectId = new Types.ObjectId(updatedFtpFile.fileId);

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
router.delete('/files/:id', authenticateUser, async (req, res) => {
  try {
    const ftpFile = await FtpFile.findOne({ _id: req.params.id });

    const file = (await bucket.find({ _id: new Types.ObjectId(ftpFile.fileId) }).toArray())[0];

    if (file) {
      bucket.delete(file._id);
      await FtpFile.findOneAndDelete({ _id: req.params.id })

      res.json({ ok: true })
    }
    else {
      res.json({ ok: false })
    };

  } catch (err) {
    res.json({ err: err.message })
  }
})

// render file
router.get('/files/render/:filename', authenticateUser, async (req, res) => {
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
router.get('/files/download/:filename', authenticateUser, async (req, res) => {
  try {
    let file = (await bucket.find({ filename: req.params.filename }).toArray())[0];
    if (!file || file.length === 0) return res.status(404).json({ err: 'No file.' });

    res.set('Content-Type', file.contentType);

    const encodedFilename = encodeURIComponent(req.params.filename);
    res.set('Content-Disposition', `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`);

    const stream = bucket.openDownloadStreamByName(file.filename);
    stream.pipe(res);
  } catch (err) {
    res.json({ err: err.message })
  }
})

// Folders

// get folders
router.get('/folders', authenticateUser, async (req, res) => {
  try {
    let filter = {};
    if (req.query.userId) filter["ownerId"] = req.query.userId;
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

// get one folder
router.get('/folders/:id', authenticateUser, async (req, res) => {
  try {
    let folder = await FtpFolder.findOne({ _id: req.params.id });

    if (!folder || folder.length === 0) {
      return res.json({ folder: null })
    } else {
      res.json({ folder })
    }
  } catch (err) {
    res.json({ err: err.message })
  }
})

// create folder
router.post('/folders', authenticateUser, async (req, res) => {
  const ftpFolder = new FtpFolder({
    name: req.body.name,
    ownerId: req.body.ownerId,
  });
  try {
    const newFtpFolder = await ftpFolder.save();

    res.json({ folder: newFtpFolder })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// update folder
router.put('/folders/:id', authenticateUser, async (req, res) => {
  try {
    const updateFolder = req.body.data.folder;
    await FtpFolder.updateOne({ _id: req.params.id }, {
      name: updateFolder.name,
      shared: updateFolder.shared,
      files: updateFolder.files,
      folders: updateFolder.folders,
      favorite: updateFolder.favorite
    })

    res.json({ folder: updateFolder });
  } catch (err) {
    res.json({ err: err.message });
  }
});

// delete folder
router.delete('/folders/:id', authenticateUser, async (req, res) => {
  try {
    const fetchedFolder = await FtpFolder.findOneAndDelete({ _id: req.params.id });

    fetchedFolder.files.map(async (fileId) => {
      let fetchedFile = await FtpFile.findOne({ fileId: fileId });

      fetchedFile.folders = fetchedFile.folders.filter((folderId) => folderId !== req.params.id);

      if (fetchedFile.folders.length === 0) {
        const objectId = new Types.ObjectId(fetchedFile.fileId);
        const file = (await bucket.find({ _id: objectId }).toArray())[0];

        if (file) {
          bucket.delete(file._id);
          await FtpFile.findOneAndDelete({ fileId: fetchedFile.fileId })
        }
      }
      else {
        await FtpFile.findOneAndUpdate({ fileId: fileId }, {
          folders: fetchedFile.folders
        });
      }
    })

    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
})

// Users
router.get('/users', authenticateUser, async (req, res) => {
  try {
    const users = await FtpUser.find()
    res.json(users)
  } catch (err) {
    res.json({ message: err.message })
  }
})

router.post('/users', authenticateUser, async (req, res) => {
  const user = new FtpUser({
    displayName: req.body.displayName,
    email: req.body.email,
    main_folder: req.body.main_folder
  })
  try {
    const newUser = await user.save()
    res.json(newUser)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
});

router.get('/users/:identifier', authenticateUser, async (req, res) => {
  try {
    const identifier = req.params.identifier;
    if (Types.ObjectId.isValid(identifier)) {
      const ftpUser = await FtpUser.findOne({ _id: identifier });
      res.json(ftpUser);
    } else {
      const ftpUser = await FtpUser.findOne({ displayName: identifier });
      res.json(ftpUser);
    }
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.delete('/users/:displayName', authenticateUser, async (req, res) => {
  try {
    const response = await FtpUser.findOneAndDelete({ displayName: req.params.displayName });

    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/users/:displayName", authenticateUser, getFtpUser, async (req, res) => {
  try {
    const updatedUser = await FtpUser.findByIdAndUpdate(
      res.user._id,
      req.body,
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    return res.json({ message: err.message });
  }
});

// Statistics

router.get('/statistics/filesCreated', async (req, res) => {
  try {
    const allFiles = await bucket.find().toArray();
    res.json(allFiles.length);
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.get('/statistics/filesCreated/:userId', async (req, res) => {
  try {
    const userFilesCount = await FtpFile.countDocuments({ ownerId: req.params.userId });

    res.json(userFilesCount);
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.get('/statistics/foldersCreated', async (req, res) => {
  try {
    const folders = await FtpFolder.find({ name: { $ne: "Cloud drive" } });
    res.json(folders.length)
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.get('/statistics/foldersCreated/:userId', async (req, res) => {
  try {
    const userFoldersCount = await FtpFolder.countDocuments({ ownerId: req.params.userId });

    res.json(userFoldersCount);
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.get('/statistics/storageUsed/', async (req, res) => {
  try {
    const filesCollection = ftpConn.db.collection('uploads.files');

    const aggregateTotalStorage = await filesCollection.aggregate([
      { $group: { _id: null, totalStorage: { $sum: '$length' } } }
    ]).toArray();

    res.json(aggregateTotalStorage[0].totalStorage);
  } catch (err) {
    res.json({ err: err.message })
  }
});

module.exports = router