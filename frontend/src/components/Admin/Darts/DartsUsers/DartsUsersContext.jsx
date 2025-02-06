import { createContext, useState } from 'react';

export const DartsUsersContext = createContext();

export const DartsUsersContextProvider = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState("");
  const [modalDesc, setModalDesc] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const props = {
    selectedUser,
    setSelectedUser,
    modalType,
    setModalType,
    modalDesc,
    setModalDesc,
    dialogOpen,
    setDialogOpen
  };

  return (
    <DartsUsersContext.Provider value={props}>
      {children}
    </DartsUsersContext.Provider>
  );
};