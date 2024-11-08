import { getFiles, getFolder, getFolders, getFtpUser } from '@/lib/fetch';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

export const FtpContext = createContext();

export const FtpContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  const [currentFolder, setCurrentFolder] = useState();

  const [files, setFiles] = useState(null);

  const [folders, setFolders] = useState();

  const [activeFolders, setActiveFolders] = useState([]);

  const fetchFiles = async () => {
    const response = await getFiles(currentUser.displayName);
    const filesR = response.files;

    if (filesR) {
      const sortedFiles = filesR.slice().sort((a, b) => {
        const firstData = new Date(a.uploadDate);
        const secondData = new Date(b.uploadDate);
        return secondData - firstData;
      });

      setFiles(sortedFiles);
      return sortedFiles;
    } else {
    }
  }

  const fetchFolders = async () => {
    const foldersR = await getFolders(currentUser.displayName);

    if (foldersR) {
      setFolders(foldersR);
    } else {
    }
  }

  const handleActiveFolders = async () => {
    const storedActiveFolders = JSON.parse(localStorage.getItem("cloudSettings")).activeFolders;
    if (storedActiveFolders) {
      setActiveFolders(storedActiveFolders);

    } else {
      const ftpUser = await getFtpUser(currentUser.displayName);
      const mainUserFolder = await getFolder(ftpUser.main_folder);

      const parseFolder = {
        _id: mainUserFolder._id,
        name: mainUserFolder.name
      }
      setActiveFolders([parseFolder]);
      localStorage.setItem('cloudSettings', JSON.stringify({ 'activeFolders': [parseFolder] }));
    }
  }

  const firstFetch = async () => {
    await fetchFolders();
    await fetchFiles();
    handleActiveFolders();
  }

  useEffect(() => {
    if (currentUser) firstFetch();
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