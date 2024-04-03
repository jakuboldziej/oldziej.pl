import { getFiles } from '@/fetch';
import { createContext, useEffect, useState } from 'react';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

export const FilesContext = createContext();

export const FilesContextProvider = ({ children }) => {
  const currentUser = useAuthUser();

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
    currentUser && fetchFiles();
  }, []);

  return (
    <FilesContext.Provider value={{ files, setFiles }}>
      {children}
    </FilesContext.Provider>
  );
};