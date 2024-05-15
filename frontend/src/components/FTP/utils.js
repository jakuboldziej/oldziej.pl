import { getFile, getFolder, mongodbApiUrl, putFile, putFolder } from "@/fetch";

// Global

export const calcStorageUsage = (files) => {
  if (!files) return ['0 Bytes', 0];
  let storageBytesSum = 0;
  files.map(file => {
    storageBytesSum += file.length;
  })

  const totalStorageFromGBToBytes = 100 * 1024 * 1024 * 1024;
  const percentage = (storageBytesSum / totalStorageFromGBToBytes) * 100;

  return [formatFileSize(storageBytesSum), percentage.toFixed(2)];
}

export const formatElapsedTime = (elapsedTime) => {
  const minutes = Math.floor(elapsedTime / (1000 * 60));
  const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
  return `${minutes}m ${seconds}s`;
}

// Files

export const handleSameFilename = (file, files) => {
  const lastDotIndex = file.name.lastIndexOf('.');
  const name = file.name.substring(0, lastDotIndex);
  const ext = file.name.substring(lastDotIndex + 1);

  if (files) {
    let fileNames = files.map(file => file.filename);

    if (fileNames.includes(file.name)) {
      let duplicateNumber = 1;
      let newName = `${name} - Copy(${duplicateNumber}).${ext}`;
      while (fileNames.includes(newName)) {
        duplicateNumber++;
        fileNames = fileNames.filter(e => e !== newName);
        newName = `${name} - Copy(${duplicateNumber}).${ext}`;
      }
      file = new File([file], newName, { type: file.type });
    }
  }

  return file;
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${formatted} ${sizes[i]}`;
}

export const handleFileTypes = (files) => {
  const images = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
  const documents = ['pdf', 'docx', 'doc', 'txt', 'odt', 'xls', 'xlsx', 'ppt', 'pptx'];
  const videos = ['mp4', 'mov', 'avi', 'wmv', 'mkv', 'flv', 'webm'];
  const audio = ['mp3', 'wav', 'ogg', 'flac', 'aac'];

  const fileTypes = {
    fileImages: [],
    fileDocuments: [],
    fileVideos: [],
    fileAudios: []
  }

  if (files) {
    files.map((file) => {
      const splitted = file.filename.split(".")
      const ext = splitted[splitted.length - 1]
      if (images.includes(ext)) {
        fileTypes.fileImages.push(file);
      } else if (documents.includes(ext)) {
        fileTypes.fileDocuments.push(file);
      } else if (videos.includes(ext)) {
        fileTypes.fileVideos.push(file);
      } else if (audio.includes(ext)) {
        fileTypes.fileAudios.push(file);
      }
    })
  }

  return fileTypes;
}

export const renderFile = (filename) => {
  window.open(`${mongodbApiUrl}/ftp/files/render/${filename}`);
}

export const downloadFile = (filename) => {
  window.location.href = `${mongodbApiUrl}/ftp/files/download/${filename}`;
}

export const downloadFolder = (filename) => {
  window.location.href = `${mongodbApiUrl}/ftp/files/download/${filename}`;
}

// Folders

export const addFileToFolder = async (folder, file) => {
  folder.files.push(file._id);
  file.folders.push(folder._id);
  await putFolder({ folder: folder });
  await putFile({ file: file });
}

export const deleteFileFromFolder = async (folder, file) => {
  folder.files = folder.files.filter((fileId) => fileId !== file._id);
  file.folders = file.folders.filter((folderId) => folderId !== folder._id);
  await putFolder({ folder: folder });
  await putFile({ file: file });
}

export const addFolderToFolder = async (folder1, folder2) => {
  folder1.folders.push(folder2._id);
  const response = await putFolder({ folder: folder1 });
  return response;
}

export const deleteFolderFromFolder = async (folder1, folder2) => {
  folder1.folders = folder1.folders.filter((folderId) => folderId !== folder2._id);
  await putFolder({ folder: folder1 });
}

export const handleDataShown = async (folder) => {
  const filePromises = folder.files.map(async (fileId) => {
    return await getFile(fileId);
  })
  const ftpFiles = await Promise.all(filePromises);
  ftpFiles.sort((a, b) => {
    return new Date(b.uploadDate) - new Date(a.uploadDate);
  })

  const folderPromises = folder.folders.map(async (folderId) => {
    return await getFolder(folderId);
  })
  const currentFolderFolders = await Promise.all(folderPromises);
  currentFolderFolders && currentFolderFolders.map((folder) => {
    folder.type = "folder"
  });

  const updatedData = [...currentFolderFolders, ...ftpFiles];
  return updatedData.length > 0 ? updatedData : null;
}