import { getFile } from "@/fetch";

export const handleSameFilename = async (file, files) => {
  const exists = await getFile(file.name);
  if (exists) {
    const splitted = file.name.split('.');
    const name = splitted[0];
    const ext = splitted[splitted.length - 1];

    let fileNames = files.map(file => file.filename);
    let duplicateNumber = 1;
    let newName = `${name} - Copy(${duplicateNumber}).${ext}`;
    while (fileNames.includes(newName)) {
      duplicateNumber++;
      fileNames = fileNames.filter(e => e !== newName)
      newName = `${name} - Copy(${duplicateNumber}).${ext}`;
    }
    file.name.substring(file.name.lastIndexOf('.'));
    file = new File([file], newName, { type: file.type });
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

export const formatElapsedTime = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const formattedTime = `${minutes}m ${seconds % 60}s`;
  return formattedTime;
}

export const handleCountFileTypes = (files) => {
  const images = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
  const documents = ['pdf', 'docx', 'doc', 'txt', 'odt', 'xls', 'xlsx', 'ppt', 'pptx'];
  const videos = ['mp4', 'mov', 'avi', 'wmv', 'mkv', 'flv', 'webm'];
  const audio = ['mp3', 'wav', 'ogg', 'flac', 'aac'];
  
  const fileTypes = {
    fileImages: 0,
    fileDocuments: 0,
    fileVideos: 0,
    fileAudios: 0
  }

  files.map((file) => {
    const splitted = file.filename.split(".")
    const ext = splitted[splitted.length - 1]
    if(images.includes(ext)) {
      fileTypes.fileImages += 1;
    } else if (documents.includes(ext)) {
      fileTypes.fileDocuments += 1;
    } else if (videos.includes(ext)) {
      fileTypes.fileVideos += 1;
    } else if (audio.includes(ext)) {
      fileTypes.fileAudios += 1;
    }
  })
  return fileTypes;
}

export const calcStorageUsage = (files) => {

}