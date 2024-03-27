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

export function formatElapsedTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const formattedTime = `${minutes}m ${seconds % 60}s`;
  return formattedTime;
}