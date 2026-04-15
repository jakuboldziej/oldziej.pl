import { getFiles, getFolder, getFolders, getFtpUser } from '@/lib/fetch';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

export const FtpContext = createContext();

export const FtpContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  const [currentFolder, setCurrentFolder] = useState();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolders, setActiveFolders] = useState([]);

  const [loadingData, setLoadingData] = useState({
    files: true,
    folders: true
  });
  const [refreshData, setRefreshData] = useState(false);

  const fetchFiles = async (pFtpUser) => {
    const filesR = await getFiles(pFtpUser._id);

    if (filesR) {
      const sortedFiles = filesR.slice().sort((a, b) => {
        const firstData = new Date(a.uploadDate);
        const secondData = new Date(b.uploadDate);
        return secondData - firstData;
      });

      setFiles(sortedFiles);
      return sortedFiles;
    } else {
      setFiles(filesR);
    }
  }

  const fetchFolders = async (pFtpUser) => {
    const foldersR = await getFolders(pFtpUser._id);
    setFolders(foldersR);
  }

  const handleActiveFolders = async () => {
    const storedActiveFolders = JSON.parse(localStorage.getItem("cloudSettings"))?.activeFolders;

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
    const fetchedFtpUser = await getFtpUser(currentUser.displayName);

    await fetchFolders(fetchedFtpUser);
    await fetchFiles(fetchedFtpUser);
    handleActiveFolders();
  }

  useEffect(() => {
    if (currentUser) firstFetch();
  }, [currentUser]);

  useEffect(() => {
    if (refreshData) {
      firstFetch();
      setRefreshData(false);
    }
  }, [refreshData]);

  useEffect(() => {
    if (files) {
      setLoadingData((prev) => ({ ...prev, files: false }));
    } else setLoadingData((prev) => ({ ...prev, files: true }));
  }, [files]);

  useEffect(() => {
    if (folders) {
      if (!folders) setLoadingData((prev) => ({ ...prev, folders: true }));
      else setLoadingData((prev) => ({ ...prev, folders: false }));
    } else setLoadingData((prev) => ({ ...prev, folders: false }));
  }, [folders]);

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
    loadingData,
    setRefreshData
  }

  return (
    <FtpContext.Provider value={props}>
      {children}
    </FtpContext.Provider>
  );
};