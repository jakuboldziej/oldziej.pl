import AuthUsersTable from '@/components/Admin/Auth/AuthUsersTable';
import CloudFilesTable from '@/components/Admin/Cloud/CloudFilesTable';
import CloudFoldersTable from '@/components/Admin/Cloud/CloudFoldersTable';
import CloudUsersTable from '@/components/Admin/Cloud/CloudUsersTable';
import DartsGamesTable from '@/components/Admin/Darts/DartsGamesTable';
import DartsUsersTable from '@/components/Admin/Darts/DartsUsersTable';
import { Button } from '@/components/ui/shadcn/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/shadcn/pagination';
import { SocketIoContext } from '@/context/Home/SocketIoContext';
import { RotateCcw } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';

function Admin() {
  document.title = "Oldziej | Admin";
  const { onlineFriends } = useContext(SocketIoContext);

  const [currentPage, setCurrentPage] = useState("");
  const [currentTable, setCurrentTable] = useState("users");
  const [refreshingData, setRefreshingData] = useState(false);

  const handlePaginationChange = (data) => {
    const pages = ["auth", "darts", "cloud"];
    const tables = ["users", "games", "files", "folders"];

    if (pages.includes(data)) {
      setCurrentPage(data);
      localStorage.setItem("currentAdminPage", data)
      setCurrentTable("users");
    }
    else if (tables.includes(data)) {
      setCurrentTable(data);
    }
  }

  useEffect(() => {
    const currentAdminPage = localStorage.getItem("currentAdminPage");

    if (currentAdminPage) setCurrentPage(currentAdminPage);
    else setCurrentPage("auth");
  }, []);

  useEffect(() => {
    setRefreshingData(true);
  }, [onlineFriends]);

  const tableProps = {
    refreshingData,
    setRefreshingData
  }

  return (
    <div className='admin relative'>
      <div className='admin-nav flex'>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink onClick={() => handlePaginationChange("auth")} isActive={currentPage === "auth"}>Auth</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink onClick={() => handlePaginationChange("darts")} isActive={currentPage === "darts"}>Darts</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink onClick={() => handlePaginationChange("cloud")} isActive={currentPage === "cloud"}>Cloud</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className='refresh absolute right-8'>
          <Button onClick={() => setRefreshingData(true)} variant="ghost" size="icon" className="justify-center"><RotateCcw /></Button>
        </div>
      </div>

      <div className='section mt-8 flex flex-col gap-8'>
        <div className='pagination'>
          {currentPage === "auth" && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink onClick={() => handlePaginationChange("users")} isActive={currentTable === "users"}>Users</PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          {currentPage === "darts" && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink onClick={() => handlePaginationChange("users")} isActive={currentTable === "users"}>Users</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink onClick={() => handlePaginationChange("games")} isActive={currentTable === "games"}>Games</PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          {currentPage === "cloud" && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink onClick={() => handlePaginationChange("users")} isActive={currentTable === "users"}>Users</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink onClick={() => handlePaginationChange("files")} isActive={currentTable === "files"}>Files</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink onClick={() => handlePaginationChange("folders")} isActive={currentTable === "folders"}>Folders</PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>

        <div className='tables'>
          {currentPage === "auth" && (
            currentTable === "users" && (
              <AuthUsersTable props={tableProps} />
            )
          )}

          {currentPage === "darts" && (
            <>
              {currentTable === "users" && (
                <DartsUsersTable props={tableProps} />
              )}
              {currentTable === "games" && (
                <DartsGamesTable props={tableProps} />
              )}
            </>
          )}

          {currentPage === "cloud" && (
            <>
              {currentTable === "users" && (
                <CloudUsersTable props={tableProps} />
              )}
              {currentTable === "files" && (
                <CloudFilesTable props={tableProps} />
              )}
              {currentTable === "folders" && (
                <CloudFoldersTable props={tableProps} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Admin