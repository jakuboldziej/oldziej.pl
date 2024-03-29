import { getFiles } from '@/fetch';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

export const FilesContext = createContext();

export const FilesContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  const [files, setFiles] = useState(() => {
  const storedFiles = localStorage.getItem('files');
  return storedFiles ? JSON.parse(storedFiles) : null;
  });

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await getFiles(currentUser.displayName);
      const filesR = response.files;
      if (filesR) {
        setFiles(filesR);
        localStorage.setItem('files', JSON.stringify(filesR));
      } else {
        localStorage.setItem('files', null);
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