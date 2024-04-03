import { getFiles } from '@/fetch';
import { createContext, useEffect, useState } from 'react';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'

export const FilesContext = createContext();

export const FilesContextProvider = ({ children }) => {
  const currentUser = useAuthUser();
  const isAuthenticated = useIsAuthenticated();

  const [files, setFiles] = useState(() => {
  const storedFiles = localStorage.getItem('files');
  return storedFiles ? JSON.parse(storedFiles) : null;
  });

  const fetchFiles = async () => {
    console.log(currentUser, isAuthenticated);
    const response = await getFiles(currentUser.displayName);
    const filesR = response.files;
    if (filesR) {
      setFiles(filesR);
      localStorage.setItem('files', JSON.stringify(filesR));
    } else {
      localStorage.setItem('files', null);
    }
  };

  useEffect(() => {
    currentUser && fetchFiles();
  }, [currentUser]);

  return (
    <FilesContext.Provider value={{ files, setFiles, fetchFiles }}>
      {children}
    </FilesContext.Provider>
  );
};