import AuthUsersTable from '@/components/Admin/AuthUsersTable';
import DartsUsersTable from '@/components/Admin/DartsUsersTable';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/shadcn/pagination';
import React, { useState } from 'react';

function Admin() {
  const [currentPage, setCurrentPage] = useState(() => {
    const storedCurrentPage = localStorage.getItem('currentAdminPage');
    return storedCurrentPage ? JSON.parse(storedCurrentPage) : "auth-users";
  });

  const handlePaginationChange = (page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      localStorage.setItem('currentAdminPage', JSON.stringify(page));
    }
  }

  return (
    <div className='admin'>
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
          <AuthUsersTable />
        ) : (
          currentPage === "darts-users" ? (
            <DartsUsersTable />
          ) : (
            <span className='text-center text-2xl'>No data</span>
          )
        )}
      </div>
    </div>
  )
}

export default Admin