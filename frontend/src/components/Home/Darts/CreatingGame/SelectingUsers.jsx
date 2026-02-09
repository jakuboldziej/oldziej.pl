import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Trash2 } from "lucide-react";

function SelectingUsers(props) {
  const {
    mode,
    usersNotPlaying,
    usersPlaying,
    handleAddPlayer,
    handleNotPlayingStyle,
    randomizePlayers,
    setRandomizePlayers,
    handleRemovePlayer
  } = props;

  if (mode === "single") {
    return (
      <div className="selectingUsers">
        <div className="text-xl py-3">Not Playing</div>
        <div className="users max-h-[350px] overflow-y-auto pr-2">
          {usersNotPlaying.length > 0 ? usersNotPlaying.sort((a, b) => a.displayName.localeCompare(b.displayName)).map((user) => (
            <div onClick={() => handleAddPlayer(user)} className="user text-white" style={handleNotPlayingStyle()} key={user._id}>
              <span>{user.displayName}</span>
            </div>
          )) : null}
        </div>
        <div className="text-xl py-3 flex items-center gap-5">
          Playing ({usersPlaying?.length})
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
        <div className="users max-h-[350px] overflow-y-auto pr-2">
          {usersPlaying?.length > 0 ? usersPlaying.map((user) => (
            <div onClick={() => handleRemovePlayer(user)} className="user playing flex justify-between" key={user._id}>
              <span>{user.displayName}</span>
              {user.temporary && <span><Trash2 /></span>}
            </div>
          )) : null}
        </div>
      </div>
    )
  } else if (mode === "double") {

  }
}

export default SelectingUsers
