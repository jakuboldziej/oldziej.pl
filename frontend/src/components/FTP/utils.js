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