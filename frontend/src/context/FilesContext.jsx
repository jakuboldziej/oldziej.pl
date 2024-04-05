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

  const fetchFiles = async (user = currentUser) => {
    const response = await getFiles(user.displayName);
    const filesR = response.files;
    if (filesR) {
      setFiles(filesR);
      localStorage.setItem('files', JSON.stringify(filesR));
    } else {
      localStorage.setItem('files', null);
    }
  };

  useEffect(() => {
    if(currentUser) fetchFiles();
  }, []);

  return (
    <FilesContext.Provider value={{ files, setFiles, fetchFiles }}>
      {children}
    </FilesContext.Provider>
  );
};