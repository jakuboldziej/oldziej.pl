import { getDartsUsers } from '@/lib/fetch';
import React, { useEffect, useState } from 'react';
import Loading from '../../../Home/Loading';
import DartsUsersTable from './DartsUsersTable';
import DartsUsersDialog from './DartsUsersDialog';

function DartsUsersView({ props }) {
  const { refreshingData, setRefreshingData } = props;

  const [dartsUsers, setDartsUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDartsUsers = async () => {
    try {
      const fetchedDartsUsers = await getDartsUsers();
      setDartsUsers(fetchedDartsUsers);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching', err);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (refreshingData === true || dartsUsers === null) {
      fetchDartsUsers();
      setRefreshingData(false);
    }
  }, [refreshingData, dartsUsers]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <DartsUsersTable dartsUsers={dartsUsers} setDartsUsers={setDartsUsers} />
      )}

      <DartsUsersDialog setDartsUsers={setDartsUsers} />
    </>
  )
}

export default DartsUsersView