import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { DartsGameContext } from "@/context/Home/DartsGameContext";
import lodash, { uniqueId } from 'lodash';
import { getAuthUser, getDartsUser, getESP32Availability, postDartsGame, postESP32JoinGame } from "@/lib/fetch";
import { Button } from "@/components/ui/shadcn/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/shadcn/drawer";
import { Card, CardContent, CardHeader } from "@/components/ui/shadcn/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/shadcn/select";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import ShowNewToast from "../../MyComponents/ShowNewToast";

import { AuthContext } from "@/context/Home/AuthContext";
import CreateGameDialogs from "./CreateGameDialogs";
import { Lightbulb, LightbulbOff, Loader2Icon, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/shadcn/switch";

function CreateGame({ children, drawerOpen, setDrawerOpen }) {
  const [usersNotPlaying, setUsersNotPlaying] = useState([]);
  const [usersPlaying, setUsersPlaying] = useState([]);
  const [userPodiumsCount, setUserPodiumsCount] = useState([]);
  const [randomizePlayers, setRandomizePlayers] = useState(true);
  const [WLEDon, setWLEDon] = useState(false);
  const [WLEDAvailable, setWLEDAvailable] = useState(false);
  const [twoPlayersGamemode, setTwoPlayersGamemode] = useState(false);
  const [selectGameMode, setSelectGameMode] = useState('X01');
  const [selectStartPoints, setSelectStartPoints] = useState('501');
  const [selectCheckOut, setSelectCheckOut] = useState('Straight Out');
  const [selectSets, setSelectSets] = useState(1);
  const [selectLegs, setSelectLegs] = useState(1);
  const [usersPodium, setUsersPodium] = useState("None");
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState('');
  const [showCustomPoints, setShowCustomPoints] = useState(false);
  const [customStartPoints, setCustomStartPoints] = useState('');
  const [egt, setEgt] = useState(0);
  const [loading, setLoading] = useState(false);

  const { updateGameState } = useContext(DartsGameContext);
  const { currentUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const numbersLegsSets = [];
  for (let i = 1; i <= 6; i++) numbersLegsSets.push(<SelectItem key={i} value={i}>{i}</SelectItem>);

  useEffect(() => {
    const podiumOptions = [];
    if (usersPlaying) {
      for (let i = 1; i <= usersPlaying.length; i++) {
        podiumOptions.push(<SelectItem key={i} value={i}>{i}</SelectItem>);
      }
      setUserPodiumsCount(podiumOptions);
    }
  }, [usersPlaying]);

  useEffect(() => {
    const getData = async () => {
      const fetchDartsUser = await getDartsUser(currentUser.displayName);
      const userFriends = await getUsersFriends();

      const previousSettings = JSON.parse(localStorage.getItem("gameSettings"));

      if (previousSettings) {
        const previousSettingsUsers = previousSettings.users.filter((user) => user.visible === true);
        const previousSettingsUsernames = previousSettingsUsers.map(user => user.displayName);

        const usersWithUser = [fetchDartsUser, ...userFriends];
        const usersNotPlaying = usersWithUser.filter(user => !previousSettingsUsernames.includes(user.displayName));
        const usersPlaying = usersWithUser.filter(user => previousSettingsUsernames.includes(user.displayName));

        setUsersNotPlaying(usersNotPlaying);
        setUsersPlaying(usersPlaying);

        setSelectGameMode(previousSettings.gamemode);
        if (usersPlaying.length > 0) setUsersPodium(1);
        if (['101', '201', '301', '401', '501', '601', '701', '801', '901', '1001'].filter(number => number === previousSettings.startPoints)[0]) {
          setSelectStartPoints(previousSettings.startPoints);
        } else {
          setCustomStartPoints(previousSettings.startPoints);
          setSelectStartPoints(previousSettings.startPoints);
        }
        setSelectCheckOut(previousSettings.checkout);
        setSelectLegs(previousSettings.legs);
        setSelectSets(previousSettings.sets);
      } else {
        setUsersNotPlaying([fetchDartsUser, ...userFriends]);
      }
    }

    const checkWLEDAvailability = async () => {
      const checkState = await getESP32Availability();

      if (checkState.available) {
        setWLEDon(true);
        setWLEDAvailable(true);
      }
      else {
        setWLEDon(false);
        setWLEDAvailable(false);
      }
    }

    if (drawerOpen) {
      getData();
      checkWLEDAvailability();
      if (currentUser.verified === false) ShowNewToast("Verify Email", "Your data won't be saved because you're not verified!");
    }
  }, [drawerOpen]);

  const getUsersFriends = async () => {
    let fetchAuthUser = await getAuthUser(currentUser.displayName);
    const fetchAuthUserFriends = fetchAuthUser.friends.map(async (friendsDisplayName) => {
      const fetchFriendsDartsUser = await getDartsUser(friendsDisplayName);
      return fetchFriendsDartsUser;
    });

    const userFriends = (await Promise.all(fetchAuthUserFriends)).filter((friend) => friend.visible === true);
    return userFriends;
  }

  const handleAddPlayer = (user) => {
    if (twoPlayersGamemode === true && usersPlaying.length === 2) return;
    setUsersPlaying((prev) => [...prev, user]);
    setUsersNotPlaying((prev) => prev.filter((notPlayingUser) => notPlayingUser._id !== user._id));

    if (usersPlaying.length < 1) setUsersPodium(1);
  }

  const handleRemovePlayer = (user) => {
    const updatedUsersPlaying = usersPlaying.filter((notPlayingUser) => notPlayingUser._id !== user._id);
    setUsersPlaying(updatedUsersPlaying);
    if (!user.temporary) setUsersNotPlaying((prev) => [...prev, user]);

    if (updatedUsersPlaying.length === 0) {
      setUsersPodium("None");
    } else {
      if (userPodiumsCount.length !== 0 && usersPodium == userPodiumsCount[userPodiumsCount.length - 1].key) {
        setUsersPodium(Number(userPodiumsCount[userPodiumsCount.length - 2].key))
      }
    }
  }

  const safeCustomStartPoints = customStartPoints && customStartPoints !== "0" ? customStartPoints : null;

  const handleSelectStartPoints = (value) => {
    if (selectStartPoints === value) return;
    const selectedValue = value;

    if (selectedValue === "Custom") {
      setShowCustomPoints(true);
    } else {
      setSelectStartPoints(selectedValue);
      setCustomStartPoints(0);
    }
  }

  const handleGamemodeOptions = () => {
    return selectGameMode;
  }

  const handleCustomStartPoints = (e) => {
    e.preventDefault();

    setShowCustomPoints(false);
    setSelectStartPoints(customStartPoints);
  }

  const handleAddingNewUser = async (e) => {
    e.preventDefault();

    const existingUser = await getDartsUser(newUser);
    if (existingUser && !existingUser.message) return ShowNewToast("Error adding user", "This user exists, you can't add it.");

    const userInList = usersPlaying.find(userPlaying => userPlaying.displayName === newUser);
    if (userInList) return ShowNewToast("Error adding user", "This user is playing.");

    const tempUser = {
      "temporary": true,
      "_id": uniqueId("temp_user_"),
      "displayName": newUser,
      "gamesPlayed": 0,
      "podiums": {
        "firstPlace": 0,
        "secondPlace": 0,
        "thirdPlace": 0
      },
      "overAllPoints": 0,
      "highestEndingAvg": 0,
      "highestTurnPoints": 0,
      "highestCheckout": 0,
      "throws": {
        "normal": 0,
        "doubles": 0,
        "triples": 0,
        "overthrows": 0,
        "doors": 0
      },
    }

    if (usersPlaying.length < 1) setUsersPodium(1);
    setUsersPlaying((prev) => [...prev, tempUser]);
    setNewUser('');
    setShowAddUser(false);
  }

  const handleGameStart = async (training) => {
    setLoading(true);

    try {
      const throwsData = {
        doors: 0,
        doubles: 0,
        triples: 0,
        normal: 0,
        overthrows: 0,
      }

      let updatedUsers = usersPlaying.map((user) => ({
        _id: user._id,
        displayName: user.displayName,
        points: selectStartPoints,
        allGainedPoints: 0,
        turn: false,
        turnsSum: 0,
        currentTurn: 1,
        place: 0,
        turns: {
          1: null,
          2: null,
          3: null
        },
        throws: { ...throwsData },
        currentThrows: { ...throwsData },
        legs: 0,
        sets: 0,
        totalLegsWon: 0,
        avgPointsPerTurn: "0.00",
        highestGameAvg: "0.00",
        highestGameTurnPoints: 0,
        gameCheckout: 0,
        temporary: user.temporary || false
      }));

      if (usersPlaying.length === 0) return ShowNewToast("Game settings", "You have to select users to play");
      if (usersPlaying.length === 1 && training === false) return ShowNewToast("Game settings", "You have to select at least 2 players to play");
      if (randomizePlayers) updatedUsers = updatedUsers.sort(() => Math.random() - 0.5);

      const gameData = {
        created_by: currentUser.displayName,
        created_at: Date.now(),
        users: updatedUsers,
        podiums: usersPodium,
        podium: {
          1: null,
          2: null,
          3: null
        },
        turn: updatedUsers[0].displayName,
        active: true,
        gameMode: selectGameMode,
        startPoints: selectStartPoints,
        checkOut: selectCheckOut,
        sets: selectGameMode === "X01" ? selectSets : 1,
        legs: selectGameMode === "X01" ? selectLegs : 1,
        round: 1,
      }

      updatedUsers[0].turn = true;
      const usersCopy = lodash.cloneDeep(updatedUsers);
      const gameCopy = lodash.pick(gameData, ['round', 'turn']);

      gameData.record = [{
        game: {
          round: gameCopy.round,
          turn: gameCopy.turn
        },
        users: usersCopy
      }];

      gameData.training = training === true;

      const { record, ...gameWithoutRecord } = gameData;
      const game = await postDartsGame(gameWithoutRecord);

      gameData._id = game._id;
      gameData["gameCode"] = game.gameCode;
      updateGameState(gameData);

      if (WLEDon) {
        const res = await postESP32JoinGame(game.gameCode);
        if (res.message) {
          ShowNewToast("ESP32 error", res.message, "error");
          if (res.message.includes("does not match")) {
            ShowNewToast(
              "WLED Stuck?",
              "WLED might be stuck on an old game. Try force resetting from ESP32 settings.",
              "warning"
            );
          }
        }
      }

      navigate("game");

      localStorage.setItem("gameSettings", JSON.stringify({
        users: usersPlaying,
        gamemode: selectGameMode,
        startPoints: selectStartPoints,
        checkout: selectCheckOut,
        sets: selectSets,
        legs: selectLegs,
        training: training
      }));
    } catch (error) {
      console.error(error);
      ShowNewToast("Error starting game", error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleNotPlayingStyle = () => {
    if (twoPlayersGamemode && usersPlaying.length >= 2) {
      return {
        opacity: 0.5,
        cursor: "default"
      }
    }
  }

  useEffect(() => {
    if (selectGameMode === "Reverse X01") {
      if (usersPlaying.length > 2) {
        const first2Players = usersPlaying.slice(0, 2);
        const restPlayers = usersPlaying.slice(2);
        setUsersPlaying(first2Players);
        setUsersNotPlaying((prev) => [...prev, ...restPlayers]);
      }
      setTwoPlayersGamemode(true)
    } else {
      setTwoPlayersGamemode(false)
    };
  }, [selectGameMode]);

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    if (!hasMounted) {
      setHasMounted(true);
      return;
    }

    const estimatedGameTime = () => {
      let minutes = 0;
      let minutesPerStartPoints = 0;
      minutesPerStartPoints += selectStartPoints / 130;

      if (usersPlaying.length > 0) minutes = (minutesPerStartPoints * selectLegs * selectSets) * usersPlaying.length;
      setEgt(minutes.toFixed());
    }

    estimatedGameTime();
    localStorage.setItem("gameSettings", JSON.stringify({
      users: usersPlaying,
      gamemode: selectGameMode,
      startPoints: selectStartPoints,
      checkout: selectCheckOut,
      sets: selectSets,
      legs: selectLegs,
    }));
  }, [usersPlaying, selectCheckOut, selectLegs, selectSets, selectStartPoints, selectGameMode, usersPodium]);

  const dialogProps = {
    customStartPoints,
    setCustomStartPoints,
    selectStartPoints,
    setSelectStartPoints,
    showCustomPoints,
    setShowCustomPoints,
    handleCustomStartPoints,
    showAddUser,
    setShowAddUser,
    newUser,
    setNewUser,
    handleAddingNewUser
  };

  return (
    <>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} modal={true}>
        <DrawerTrigger asChild>
          {children}
        </DrawerTrigger>
        <DrawerContent className="create-game-modal border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DrawerHeader>
            <DrawerTitle className="text-white border-b-2 border-green pb-3">Create New Game</DrawerTitle>
          </DrawerHeader>
          <DrawerDescription className="hidden">Create new game</DrawerDescription>
          <div className="settings !py-3 overflow-y-auto">
            <Card className="usersCard">
              <CardHeader className="text-lg flex flex-row items-center justify-between">
                <span>Add Users</span>
                <Button
                  className="transition-opacity"
                  disabled={selectGameMode.includes("Reverse X01") && usersPlaying.length === 2}
                  variant="outline_white"
                  onClick={() => setShowAddUser(true)}>
                  + Add user
                </Button>
              </CardHeader>
              <hr />
              <CardContent className="card-content p-0">
                <div className="text-xl py-3">Not Playing</div>
                <div className="users">
                  {usersNotPlaying.length > 0 ? usersNotPlaying.map((user) => (
                    <div onClick={() => handleAddPlayer(user)} className="user text-white" style={handleNotPlayingStyle()} key={user._id}>
                      <span>{user.displayName}</span>
                    </div>
                  )) : null}
                </div>
                <div className="text-xl py-3 flex items-center gap-5">Playing
                  <div className="items-top flex space-x-2">
                    <Checkbox id="checkbox" defaultChecked={randomizePlayers} onCheckedChange={() => setRandomizePlayers(prev => !prev)} />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="checkbox"
                        className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Random
                      </label>
                    </div>
                  </div>
                </div>
                <div className="users overflow-y-auto">
                  {usersPlaying?.length > 0 ? usersPlaying.map((user) => (
                    <div onClick={() => handleRemovePlayer(user)} className="user playing flex justify-between" key={user._id}>
                      <span>{user.displayName}</span>
                      {user.temporary && <span><Trash2 /></span>}
                    </div>
                  )) : null}
                </div>
              </CardContent>
            </Card>
            <div className="sticky-top top-0 flex flex-col items-center gap-3 text-white">
              <Button variant="outline_red" className="glow-button-red" disabled={!currentUser.verified || loading} onClick={() => handleGameStart(false)}>
                {loading ? (
                  <span className="flex items-center gap-1"><Loader2Icon className="animate-spin" /> Loading</span>

                ) : (
                  <span>Start</span>
                )}
              </Button>
              <Button variant="outline_green" className="glow-button-green" disabled={loading} onClick={() => handleGameStart(true)}>
                {loading ? (
                  <span className="flex items-center gap-1"><Loader2Icon className="animate-spin" /> Loading</span>

                ) : (
                  <span>Training</span>
                )}
              </Button>
              <span>EGT: {egt}</span>
            </div>
            <Card className="settingsCard">
              <CardHeader className="text-lg flex flex-row justify-between space-y-0">
                <span>Settings</span>
                {WLEDAvailable === true && (
                  <div className="flex m-0 gap-2 items-center">
                    {WLEDon ? <Lightbulb size={25} /> : <LightbulbOff size={25} />}
                    <Switch
                      checked={WLEDon}
                      onCheckedChange={setWLEDon}
                      disabled={!WLEDAvailable}
                    />
                  </div>
                )}
              </CardHeader>
              <hr />
              <CardContent className="card-content">
                <div className="selects">
                  <div className="text-xl">Podium</div>
                  <Select onValueChange={(value) => setUsersPodium(value)} value={usersPodium} modal={false}>
                    <SelectTrigger className="text-white">
                      <SelectValue placeholder="Select Podium" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {usersPlaying?.length > 0 ? userPodiumsCount : <SelectItem value="None" disabled>None</SelectItem>}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className="text-xl">Gamemode</div>
                  <Select onValueChange={(value) => setSelectGameMode(value)} value={selectGameMode} modal={false}>
                    <SelectTrigger className="text-white">
                      <SelectValue placeholder="Select Gamemode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="X01">X01</SelectItem>
                        {/* <SelectItem value="Reverse X01">Reverse X01 (2 Players)</SelectItem> */}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className="text-xl">Start Points</div>
                  <Select
                    onValueChange={handleSelectStartPoints}
                    value={selectStartPoints}
                    modal={false}
                  >
                    <SelectTrigger className="text-white">
                      <SelectValue placeholder="Select Start Points" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="101">101</SelectItem>
                        <SelectItem value="201">201</SelectItem>
                        <SelectItem value="301">301</SelectItem>
                        <SelectItem value="401">401</SelectItem>
                        <SelectItem value="501">501</SelectItem>
                        <SelectItem value="601">601</SelectItem>
                        <SelectItem value="701">701</SelectItem>
                        <SelectItem value="801">801</SelectItem>
                        <SelectItem value="901">901</SelectItem>
                        <SelectItem value="1001">1001</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                        {safeCustomStartPoints && <SelectItem value={safeCustomStartPoints}>{safeCustomStartPoints}</SelectItem>}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {handleGamemodeOptions() === "X01" ? (
                    <>
                      <div className="text-lg">Check-Out</div>
                      <Select onValueChange={(value) => setSelectCheckOut(value)} value={selectCheckOut} modal={false}>
                        <SelectTrigger className="text-white">
                          <SelectValue placeholder="Select Check-Out" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Straight Out">Straight Out</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <div className="text-lg">Legs</div>
                      <Select onValueChange={(value) => setSelectLegs(value)} value={selectLegs} modal={false}>
                        <SelectTrigger className="text-white">
                          <SelectValue placeholder="Select Legs" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {numbersLegsSets}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <div className="text-lg">Sets</div>
                      <Select onValueChange={(value) => setSelectSets(value)} value={selectSets} modal={false}>
                        <SelectTrigger className="text-white">
                          <SelectValue placeholder="Select Sets" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {numbersLegsSets}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    null
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </DrawerContent>
      </Drawer>

      <CreateGameDialogs props={dialogProps} />
    </>
  )
}

export default CreateGame