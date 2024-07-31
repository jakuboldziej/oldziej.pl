import AuthUsersTable from '@/components/Admin/AuthUsersTable';
import DartsUsersTable from '@/components/Admin/DartsUsersTable';
import { Button } from '@/components/ui/shadcn/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/shadcn/pagination';
import { SocketIoContext } from '@/context/Home/SocketIoContext';
import { RotateCcw } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';

function Admin() {
  document.title = "Oldziej | Admin";
  const { onlineFriends } = useContext(SocketIoContext);

  const [currentPage, setCurrentPage] = useState(() => {
    const storedCurrentPage = localStorage.getItem('currentAdminPage');
    return storedCurrentPage ? JSON.parse(storedCurrentPage) : "auth-users";
  });
  const [refreshingData, setRefreshingData] = useState(false);

  const handlePaginationChange = (page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      localStorage.setItem('currentAdminPage', JSON.stringify(page));
    }
  }

  useEffect(() => {
    setRefreshingData(true);
  }, [onlineFriends]);

  const tableProps = {
    refreshingData,
    setRefreshingData
  }

  return (
    <div className='admin relative'>
      <div className='refresh absolute right-8'>
        <Button onClick={() => setRefreshingData(true)} variant="ghost" size="icon" className="justify-center"><RotateCcw /></Button>
      </div>
      <div className='users flex flex-col gap-5'>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink onClick={() => handlePaginationChange("auth-users")} isActive={currentPage === "auth-users"}>Auth Users</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink onClick={() => handlePaginationChange("darts-users")} isActive={currentPage === "darts-users"}>Darts Users</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink onClick={() => handlePaginationChange("cloud-users")} isActive={currentPage === "cloud-users"}>Cloud Users</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        {currentPage === "auth-users" ? (
          <AuthUsersTable props={tableProps} />
        ) : (
          currentPage === "darts-users" ? (
            <DartsUsersTable props={tableProps} />
          ) : (
            <span className='text-center text-2xl'>No data</span>
          )
        )}
      </div>
    </div>
  )
}

export default Admin