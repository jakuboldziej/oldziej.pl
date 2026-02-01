import AuthUsersTable from '@/components/Admin/Auth/AuthUsersTable';
import CloudFilesTable from '@/components/Admin/Cloud/CloudFilesTable';
import CloudFoldersTable from '@/components/Admin/Cloud/CloudFoldersTable';
import CloudUsersTable from '@/components/Admin/Cloud/CloudUsersTable';
import DartsGamesTable from '@/components/Admin/Darts/DartsGamesTable';
import { DartsUsersContextProvider } from '@/components/Admin/Darts/DartsUsers/DartsUsersContext';
import DartsUsersView from '@/components/Admin/Darts/DartsUsers/DartsUsersView';
import { Button } from '@/components/ui/shadcn/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/shadcn/pagination';
import { SocketIoContext } from '@/context/Home/SocketIoContext';
import { RotateCcw } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import Esp32WLedDarts from '../ESP32/Esp32WLedDarts';
import Esp32DoorSensor from '../ESP32/Esp32DoorSensor';
import { getDartsGames, getDartsUsers, patchDartsUser } from '@/lib/fetch';
import ShowNewToast from '@/components/Home/MyComponents/ShowNewToast';

function Admin() {
  document.title = "Oldziej | Admin";
  const { onlineFriends } = useContext(SocketIoContext);

  const [currentPage, setCurrentPage] = useState("");
  const [currentTable, setCurrentTable] = useState("users");
  const [refreshingData, setRefreshingData] = useState(false);
  const [currentSubPage, setCurrentSubPage] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const handlePaginationChange = (parsedPage) => {
    const pages = ["auth", "darts", "cloud", "esp32"];
    const subpages = ["led-darts", "door-sensor"];
    const tables = ["users", "games", "files", "folders"];

    if (pages.includes(parsedPage)) {
      setCurrentPage(parsedPage);
      localStorage.setItem("currentAdminPage", parsedPage)
      setCurrentTable("users");
    } else if (tables.includes(parsedPage)) {
      setCurrentTable(parsedPage);
    } else if (subpages.includes(parsedPage)) {
      setCurrentSubPage(parsedPage);
    }
  }

  useEffect(() => {
    const currentAdminPage = localStorage.getItem("currentAdminPage");

    if (currentAdminPage) setCurrentPage(currentAdminPage);
    else setCurrentPage("auth");
  }, []);

  const syncAllData = async () => {
    setIsSyncing(true);
    try {
      const dartsUsers = await getDartsUsers();
      let successCount = 0;
      let errorCount = 0;

      ShowNewToast("Syncing all users", `Starting sync for ${dartsUsers.length} users...`);

      for (const user of dartsUsers) {
        try {
          const userGames = await getDartsGames(user.displayName, null, false);

          const gamesPlayed = userGames.length;
          let highestCheckout = 0;
          let highestEndingAvg = 0;
          let highestTurnPoints = 0;
          let overAllPoints = 0;
          let podiums = {
            firstPlace: 0,
            secondPlace: 0,
            thirdPlace: 0
          };
          let throws = {
            doors: 0,
            doubles: 0,
            triples: 0,
            normal: 0,
            overthrows: 0
          };

          if (userGames.length > 0) {
            userGames.forEach((game) => {
              const foundUser = game.users.find((usr) => usr.displayName === user.displayName);

              if (foundUser) {
                if (foundUser.gameCheckout && foundUser.gameCheckout > highestCheckout) highestCheckout = foundUser.gameCheckout;
                if (foundUser.highestGameAvg && foundUser.highestGameAvg > highestEndingAvg) highestEndingAvg = foundUser.highestGameAvg;
                if (foundUser.highestGameTurnPoints && foundUser.highestGameTurnPoints > highestTurnPoints) highestTurnPoints = foundUser.highestGameTurnPoints;
                if (foundUser.allGainedPoints) overAllPoints += foundUser.allGainedPoints;

                if (game.podium && game.podium[1] === foundUser.displayName) podiums.firstPlace += 1;
                if (game.podium && game.podium[2] === foundUser.displayName) podiums.secondPlace += 1;
                if (game.podium && game.podium[3] === foundUser.displayName) podiums.thirdPlace += 1;

                if (foundUser.throws) {
                  if (foundUser.throws.doors) throws.doors += foundUser.throws.doors;
                  if (foundUser.throws.doubles) throws.doubles += foundUser.throws.doubles;
                  if (foundUser.throws.triples) throws.triples += foundUser.throws.triples;
                  if (foundUser.throws.normal) throws.normal += foundUser.throws.normal;
                  if (foundUser.throws.overthrows) throws.overthrows += foundUser.throws.overthrows;
                }
              }
            });
          }

          await patchDartsUser({
            displayName: user.displayName,
            gamesPlayed,
            highestCheckout,
            highestEndingAvg,
            highestTurnPoints,
            overAllPoints,
            podiums,
            throws,
          });

          successCount++;
        } catch (err) {
          console.error(`Error syncing user ${user.displayName}:`, err);
          errorCount++;
        }
      }

      ShowNewToast("Sync completed", `Successfully synced ${successCount} users. ${errorCount > 0 ? `Failed: ${errorCount}` : ''}`);

      setRefreshingData(true);
    } catch (err) {
      console.error('Error syncing all users:', err);
      ShowNewToast("Sync failed", "Failed to sync users data.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!onlineFriends || onlineFriends.length === 0) return;
    setRefreshingData(true);
  }, [onlineFriends]);

  const componentProps = {
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
            <PaginationItem>
              <PaginationLink onClick={() => handlePaginationChange("esp32")} isActive={currentPage === "esp32"}>ESP32</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className='refresh absolute right-2 md:right-8'>
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
          {currentPage === "esp32" && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink onClick={() => handlePaginationChange("led-darts")} isActive={currentSubPage === "led-darts"}>WLED Darts</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink onClick={() => handlePaginationChange("door-sensor")} isActive={currentSubPage === "door-sensor"}>Door sensor</PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>

        <div className='tables'>
          {currentPage === "auth" && (
            currentTable === "users" && (
              <AuthUsersTable props={componentProps} />
            )
          )}

          {currentPage === "darts" && (
            <>
              {currentTable === "users" && (
                <DartsUsersContextProvider>
                  <div className="flex gap-2 flex-col items-end">
                    <Button 
                      onClick={() => syncAllData()} 
                      variant="outline_blue" 
                      className="justify-center"
                      disabled={isSyncing}
                    >
                      {isSyncing ? "Syncing..." : "Sync all data"}
                    </Button>
                    <DartsUsersView props={componentProps} />
                  </div>
                </DartsUsersContextProvider>
              )}
              {currentTable === "games" && (
                <DartsGamesTable props={componentProps} />
              )}
            </>
          )}

          {currentPage === "cloud" && (
            <>
              {currentTable === "users" && (
                <CloudUsersTable props={componentProps} />
              )}
              {currentTable === "files" && (
                <CloudFilesTable props={componentProps} />
              )}
              {currentTable === "folders" && (
                <CloudFoldersTable props={componentProps} />
              )}
            </>
          )}
        </div>

        <div className='esp32'>
          {currentPage === "esp32" && (
            <>
              {currentSubPage === "led-darts" && (
                <Esp32WLedDarts {...componentProps} />
              )}
              {currentSubPage === "door-sensor" && (
                <Esp32DoorSensor {...componentProps} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Admin