import {  getFiles, getFolder, getFolders, getFtpUser } from '@/fetch';
import { createContext, useEffect, useState } from 'react';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

export const FtpContext = createContext();

export const FtpContextProvider = ({ children }) => {
  const currentUser = useAuthUser();
  const [currentFolder, setCurrentFolder] = useState(null);

  const [files, setFiles] = useState(() => {
    const storedFiles = localStorage.getItem('files');
    return storedFiles ? JSON.parse(storedFiles) : null;
  });

  const [folders, setFolders] = useState(() => {
    const storedFolders = localStorage.getItem('folders');
    return storedFolders ? JSON.parse(storedFolders) : null;
  })

  const [activeFolders, setActiveFolders] = useState(() => {
    const storedFolders = localStorage.getItem('activeFolders');
    return storedFolders ? JSON.parse(storedFolders) : null;
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

  const fetchFolders = async (user = currentUser) => {
    const foldersR = await getFolders(user.displayName);

    if (foldersR) {
      if (currentUser && !activeFolders) {
        const ftpUser = await getFtpUser(currentUser.displayName);
        const main_folder = await getFolder(ftpUser.main_folder);
        setActiveFolders([main_folder]);
      }
      setFolders(foldersR);
      localStorage.setItem('folders', JSON.stringify(foldersR));
    } else {
      localStorage.setItem('folders', null);
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchFiles();
      fetchFolders();
    }
  }, []);

  useEffect(() => {
    if (activeFolders && activeFolders.length > 0) {
      localStorage.setItem('activeFolders', JSON.stringify(activeFolders));
      setCurrentFolder(activeFolders[activeFolders.length - 1])
    }
  }, [activeFolders]);

  const props = {
    files,
    setFiles,
    fetchFiles,
    folders,
    setFolders,
    fetchFolders,
    activeFolders,
    setActiveFolders,
    currentFolder,
    setCurrentFolder
  }

  return (
    <FtpContext.Provider value={props}>
      {children}
    </FtpContext.Provider>
  );
};