import { getFile, mongodbApiUrl } from "@/fetch";

export const handleSameFilename = async (file, files) => {
  const lastDotIndex = file.name.lastIndexOf('.');
  const name = file.name.substring(0, lastDotIndex);
  const ext = file.name.substring(lastDotIndex + 1);

  if (files) {
    let fileNames = files.map(file => file.metadata.originalFileName);

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
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${formatted} ${sizes[i]}`;
}

export const formatElapsedTime = (elapsedTime) => {
  const minutes = Math.floor(elapsedTime / (1000 * 60));
  const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
  return `${minutes}m ${seconds}s`;
};

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

export const renderFile = (originalFileName) => {
  window.open(`${mongodbApiUrl}/ftp/files/render/${originalFileName}`);
}

export const downloadFile = async (originalFileName) => {
  window.location.href = `${mongodbApiUrl}/ftp/files/download/${originalFileName}`
}