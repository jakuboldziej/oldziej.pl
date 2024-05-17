import {  getFiles, getFolder, getFolders, getFtpUser } from '@/fetch';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

export const FtpContext = createContext();

export const FtpContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  const [currentFolder, setCurrentFolder] = useState();

  const [files, setFiles] = useState(() => {
    const storedFiles = localStorage.getItem('files');
    return storedFiles ? JSON.parse(storedFiles) : null;
  });

  const [folders, setFolders] = useState(() => {
    const storedFolders = localStorage.getItem('folders');
    return storedFolders ? JSON.parse(storedFolders) : null;
  });

  const [activeFolders, setActiveFolders] = useState([]);

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

  const fetchFolders = async () => {
    const foldersR = await getFolders(currentUser.displayName);

    if (foldersR) {
      setFolders(foldersR);
      localStorage.setItem('folders', JSON.stringify(foldersR));
    } else {
      localStorage.setItem('folders', null);
    }
  }

  const handleActiveFolders = async () => {
    const storedActiveFolders = localStorage.getItem('activeFolders');

    if (storedActiveFolders) {
      const parsedActiveFolders = JSON.parse(storedActiveFolders);
      const getCurrentFolder = await getFolder(parsedActiveFolders[parsedActiveFolders.length - 1]._id);

      setCurrentFolder(getCurrentFolder);
      setActiveFolders(parsedActiveFolders);
    } else {
      const ftpUser = await getFtpUser(currentUser.displayName);
      const mainUserFolder = await getFolder(ftpUser.main_folder);

      const parseFolder = {
        _id: mainUserFolder._id,
        name: mainUserFolder.name
      }
      setCurrentFolder(mainUserFolder);
      setActiveFolders([parseFolder]);
      localStorage.setItem('activeFolders', JSON.stringify([parseFolder]));
    }
  }

  useEffect(() => {
    if (currentUser) {
        handleActiveFolders(),
        fetchFiles(),
        fetchFolders()
    }
  }, [currentUser]);

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
    setCurrentFolder,
  }

  return (
    <FtpContext.Provider value={props}>
      {children}
    </FtpContext.Provider>
  );
};