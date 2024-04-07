import { getFiles, getFolder, getFolders, getFtpUser, getFtpUsers, putFtpUser } from '@/fetch';
import { createContext, useEffect, useState } from 'react';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

export const FtpContext = createContext();

export const FtpContextProvider = ({ children }) => {
  const currentUser = useAuthUser();

  const [files, setFiles] = useState(() => {
    const storedFiles = localStorage.getItem('files');
    return storedFiles ? JSON.parse(storedFiles) : null;
  });

  const [folders, setFolders] = useState(() => {
    const storedFolders = localStorage.getItem('folders');
    return storedFolders ? JSON.parse(storedFolders) : null;
  })

  const [currentFolder, setCurrentFolder] = useState(() => {
    const storedFolders = localStorage.getItem('folders');
    return storedFolders ? JSON.parse(storedFolders)[0] : null;
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
      foldersR.map((folder, i) => {
        if(i === 0) folder.active = true
        else folder.active = false
      })
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

  const props = {
    files,
    setFiles,
    fetchFiles,
    folders,
    setFolders,
    fetchFolders,
    currentFolder,
    setCurrentFolder
  }

  return (
    <FtpContext.Provider value={props}>
      {children}
    </FtpContext.Provider>
  );
};