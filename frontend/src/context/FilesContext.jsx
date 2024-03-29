import { getFiles } from '@/fetch';
import { createContext, useEffect, useState } from 'react';

export const FilesContext = createContext();

export const FilesContextProvider = ({ children }) => {
  const [files, setFiles] = useState(() => {
  const storedFiles = localStorage.getItem('files');
  return storedFiles ? JSON.parse(storedFiles) : []
  });

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await getFiles();
      console.log(response);
      if (response.length > 0) {
        setFiles(response.files);
        localStorage.setItem('files', JSON.stringify(response.files));
      } else {
        setFiles([]);
        localStorage.setItem('files', JSON.stringify([]));
      }
    };
    fetchFiles();
  }, []);

  return (
    <FilesContext.Provider value={{ files, setFiles }}>
      {children}
    </FilesContext.Provider>
  );
};