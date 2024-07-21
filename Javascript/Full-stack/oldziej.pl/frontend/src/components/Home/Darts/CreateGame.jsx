import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { DartsGameContext } from "@/context/DartsGameContext";
import lodash from 'lodash';
import { getDartsUsers, postDartsGame } from "@/fetch";
import { Button } from "@/components/ui/shadcn/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/shadcn/drawer";
import { Card, CardContent, CardHeader } from "@/components/ui/shadcn/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/shadcn/select";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import ShowNewToast from "../MyComponents/ShowNewToast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/shadcn/dialog";
import { Label } from "@/components/ui/shadcn/label";
import { Input } from "@/components/ui/shadcn/input";
import { AuthContext } from "@/context/AuthContext";

function CreateGame({ children, drawerOpen, setDrawerOpen }) {
  const [usersNotPlaying, setUsersNotPlaying] = useState([]);
  const [usersPlaying, setUsersPlaying] = useState([]);
  const [userPodiumsCount, setUserPodiumsCount] = useState([]);
  const [randomizePlayers, setRandomizePlayers] = useState(true);
  const [selectGameMode, setSelectGameMode] = useState('X01');
  const [selectStartPoints, setSelectStartPoints] = useState('501');
  const [selectCheckOut, setSelectCheckOut] = useState('Straight Out');
  const [selectSets, setSelectSets] = useState(1);
  const [selectLegs, setSelectLegs] = useState(1);
  const [usersPodium, setUsersPodium] = useState("None");
  const [showCustomPoints, setShowCustomPoints] = useState(false);
  const [customStartPoints, setCustomStartPoints] = useState('');
  const [egt, setEgt] = useState(0);

  const { setGame } = useContext(DartsGameContext);
  const { currentUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const numbersLegsSets = [];
  for (let i = 1; i <= 21; i++) numbersLegsSets.push(<SelectItem key={i} value={i}>{i}</SelectItem>);

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
    // get previous settings
    const previousSettings = JSON.parse(localStorage.getItem("gameSettings"));
    if (previousSettings) {
      setUsersPlaying(previousSettings.users)
      setSelectGameMode(previousSettings.gamemode)
      if (['101', '201', '301', '401', '501', '601', '701', '801', '901', '1001'].filter(number => number === previousSettings.startPoints)[0]) {
        setSelectStartPoints(previousSettings.startPoints);
      } else {
        setCustomStartPoints(previousSettings.startPoints);
        setSelectStartPoints(previousSettings.startPoints);
      }
      setSelectCheckOut(previousSettings.checkout);
      setSelectLegs(previousSettings.legs);
      setSelectSets(previousSettings.sets);
    }

    const getUsers = async () => {
      try {
        const usersFetch = await getDartsUsers();
        if (previousSettings) {
          const usersNotInPreviousSettings = usersFetch.filter((userFetch) => !previousSettings.users.some((userSetting) => userSetting._id === userFetch._id));
          setUsersNotPlaying(usersNotInPreviousSettings);
          setUsersPodium(1);
        } else {
          setUsersNotPlaying(usersFetch);
        }
      } catch (error) {
        console.error("Error getting users: ", error);
      }
    };

    getUsers();
  }, [drawerOpen]);

  const handleSelect = (user, action) => {
    const updatedUsersPlaying = action === 'add'
      ? [...usersPlaying, user]
      : usersPlaying.filter((playingUser) => playingUser._id !== user._id);

    const updatedUsersNotPlaying = action === 'add'
      ? usersNotPlaying.filter((notPlayingUser) => notPlayingUser._id !== user._id)
      : [...usersNotPlaying, user];

    setUsersPlaying(updatedUsersPlaying);
    setUsersNotPlaying(updatedUsersNotPlaying);

    if (action === 'del') {
      if (updatedUsersPlaying.length === 0) {
        setUsersPodium("None");
      } else {
        if (userPodiumsCount.length !== 0 && usersPodium == userPodiumsCount[userPodiumsCount.length - 1].key) {
          setUsersPodium(Number(userPodiumsCount[userPodiumsCount.length - 2].key))
        }
      }
    } else if (action === 'add' && usersPodium === "None") {
      setUsersPodium(1);
    }
  };

  const handleSelectStartPoints = (value) => {
    const selectedValue = value;

    if (selectedValue === "Custom") {
      setShowCustomPoints(true);
    } else {
      setSelectStartPoints(selectedValue);
      setCustomStartPoints(0);
    }
  };

  const handleCustomStartPoints = () => {
    setShowCustomPoints(false);
    setSelectStartPoints(customStartPoints);
  }

  const handleGameStart = async (training) => {
    let updatedUsers = usersPlaying.map((user) => ({
      ...user,
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
      throws: {
        doors: 0,
        doubles: 0,
        triples: 0,
        normal: 0,
        overthrows: 0,
      },
      legs: 0,
      sets: 0,
      avgPointsPerTurn: 0,
      highestTurnPoints: 0,
    }));
    if (usersPlaying.length === 0) return ShowNewToast("Game settings", "You have to select users to play");
    if (randomizePlayers) updatedUsers = updatedUsers.sort(() => Math.random() - 0.5);
    const gameData = {
      created_at: Date.now(),
      created_by: currentUser.displayName,
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
      sets: selectSets,
      legs: selectLegs,
      round: 1,
    }
    updatedUsers[0].turn = true;
    const currentUserCopy = lodash.cloneDeep(updatedUsers[0]);
    const gameCopy = lodash.pick(gameData, ['round', 'turn']);
    gameData.record = [{
      game: {
        round: gameCopy.round,
        turn: gameCopy.turn
      },
      user: currentUserCopy
    }];
    if (training === true) {
      gameData.training = true;
      setGame(gameData);
    } else {
      const { record, ...gameWithoutRecord } = gameData;
      const game = await postDartsGame(gameWithoutRecord);
      setGame({
        _id: game._id,
        ...gameData,
      });
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
    }))
  }

  useEffect(() => {
    const estimatedGameTime = () => {
      let minutes = 0;
      let minutesPerStartPoints = 0;
      minutesPerStartPoints += selectStartPoints / 75;

      if (usersPlaying.length > 0) minutes = (minutesPerStartPoints * selectLegs * selectSets) * usersPlaying.length;
      setEgt(minutes.toFixed());
    }

    estimatedGameTime();
  }, [usersPlaying, selectCheckOut, selectLegs, selectSets, selectStartPoints, selectGameMode, usersPodium]);

  return (
    <>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <DrawerTrigger asChild>
          {children}
        </DrawerTrigger>
        <DrawerContent className="create-game-modal border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <DrawerHeader>
            <DrawerTitle className="text-white border-b-2 border-[#00B524] pb-3">Create New Game</DrawerTitle>
          </DrawerHeader>
          <div className="settings pt-3 overflow-y-auto">
            <Card className="usersCard">
              <CardHeader className="text-lg">
                Add Users
              </CardHeader>
              <hr />
              <CardContent className="card-content p-0">
                <div className="users">
                  <div className="text-xl py-3">Not Playing</div>
                  {usersNotPlaying.length > 0 ? usersNotPlaying.map((user) => (
                    <div onClick={() => handleSelect(user, 'add')} className="user" style={{ color: 'white' }} key={user._id}>
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
                <div className="users pt-3">
                  {usersPlaying?.length > 0 ? usersPlaying.map((user) => (
                    <div onClick={() => handleSelect(user, 'del')} className="user playing" key={user._id}>
                      <span>{user.displayName}</span>
                    </div>
                  )) : null}
                </div>
              </CardContent>
            </Card>
            <div className="sticky top-0 flex flex-col items-center gap-3 text-white">
              <Button variant="outline_red" className="glow-button-red" onClick={() => handleGameStart(false)}>Start</Button>
              <Button variant="outline_green" className="glow-button-green" onClick={() => handleGameStart(true)}>Training</Button>
              <span>EGT: {egt}</span>
            </div>
            <Card className="settingsCard">
              <CardHeader>
                Settings
              </CardHeader>
              <hr />
              <CardContent className="card-content">
                <div className="selects">
                  <div className="text-lg">Podium</div>
                  <Select onValueChange={(value) => setUsersPodium(value)} value={usersPodium}>
                    <SelectTrigger className="text-white">
                      <SelectValue placeholder="Select Podium" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {usersPlaying?.length > 0 ? userPodiumsCount : <SelectItem value="None" disabled>None</SelectItem>}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className="text-lg">Gamemode</div>
                  <Select onValueChange={(value) => setSelectGameMode(value)} value={selectGameMode}>
                    <SelectTrigger className="text-white">
                      <SelectValue placeholder="Select Gamemode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="X01">X01</SelectItem>
                        <SelectItem value="Cricket">Cricket</SelectItem>
                        <SelectItem value="Around the Clock">Around the Clock</SelectItem>
                        <SelectItem value="Shanghai">Shanghai</SelectItem>
                        <SelectItem value="Elimination">Elimination</SelectItem>
                        <SelectItem value="Highscore">Highscore</SelectItem>
                        <SelectItem value="Killer">Killer</SelectItem>
                        <SelectItem value="Splitscore">Splitscore</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className="text-lg">Start Points</div>
                  <Select onValueChange={(value) => handleSelectStartPoints(value)} value={selectStartPoints}>
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
                        {customStartPoints !== '' && customStartPoints !== '0' &&
                          <SelectItem value={customStartPoints}>{customStartPoints}</SelectItem>
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className="text-lg">Check-Out</div>
                  <Select onValueChange={(value) => setSelectCheckOut(value)} value={selectCheckOut}>
                    <SelectTrigger className="text-white">
                      <SelectValue placeholder="Select Check-Out" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Straight Out">Straight Out</SelectItem>
                        <SelectItem value="Double Out">Double Out</SelectItem>
                        <SelectItem value="Triple Out">Triple Out</SelectItem>
                        <SelectItem value="Master Out">Master Out</SelectItem>
                        <SelectItem value="Splitscore">Splitscore</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className="text-lg">Sets</div>
                  <Select onValueChange={(value) => setSelectSets(value)} value={selectSets}>
                    <SelectTrigger className="text-white">
                      <SelectValue placeholder="Select Sets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {numbersLegsSets}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className="text-lg">Legs</div>
                  <Select onValueChange={(value) => setSelectLegs(value)} value={selectLegs}>
                    <SelectTrigger className="text-white">
                      <SelectValue placeholder="Select Legs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {numbersLegsSets}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={showCustomPoints}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-center text-2xl'>Set Custom Points</DialogTitle>
          </DialogHeader>
          <div className='text-white'>
            <Label htmlFor="points">
              Points
            </Label>
            <Input
              id="points"
              type="number"
              min={1}
              max={10000}
              onChange={(e) => setCustomStartPoints(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCustomPoints(false)} type="submit" variant="secondary">
              Close
            </Button>
            <Button onClick={handleCustomStartPoints} type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateGame