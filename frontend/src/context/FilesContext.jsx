import { getFiles } from '@/fetch';
import { createContext, useEffect, useState } from 'react';

export const FilesContext = createContext();

export const FilesContextProvider = ({ children }) => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await getFiles();
      if (response) {
        setFiles(response.files);
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