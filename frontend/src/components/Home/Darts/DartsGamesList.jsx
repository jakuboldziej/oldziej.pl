import { Link } from "react-router-dom";
import MyTooltip from "@/components/Home/MyComponents/MyTooltip";
import RedDot from "@/assets/images/icons/red_dot.png";
import GreenDot from "@/assets/images/icons/green_dot.png";
import Loading from "../Loading";
import { ensureGameRecord } from '@/lib/recordUtils';

function DartsGamesList({ games, isLoading }) {
  if (isLoading) {
    return <Loading />;
  }

  if (games.length === 0) {
    return <span className="text-lg text-center">No games found</span>;
  }

  const handleActiveGameClick = (game) => {
    const gameWithRecord = ensureGameRecord(game);
    localStorage.setItem('dartsGame', JSON.stringify(gameWithRecord));
  };

  return (
    <>
      {games.map((game) => (
        game.active ?
          <Link key={game._id} to={`/darts/game`} className="element" onClick={() => handleActiveGameClick(game)}>
            <MyTooltip title="Game Active">
              <span className="elementInfo gameActive">
                <img src={game.active ? GreenDot : RedDot} />
              </span>
            </MyTooltip>
            {game.users[0] && <span className="elementInfo">
              <h6>{game.users[0].displayName}</h6>
              <h6>{game.users[0].points}</h6>
            </span>}
            {game.users[1] && <span className="elementInfo">
              <h6>{game.users[1].displayName}</h6>
              <h6>{game.users[1].points}</h6>
            </span>}
            {game.users[2] && <span className="elementInfo">
              <h6>{game.users[2].displayName}</h6>
              <h6>{game.users[2].points}</h6>
            </span>}
            <MyTooltip title="Game mode">
              <span className="elementInfo">
                <img width="25" height="25" src="https://img.icons8.com/office/25/controller.png" alt="controller" />
                <span className="text-sm text-center">{game.gameMode}</span>
              </span>
            </MyTooltip>
            <MyTooltip title="Start Points">
              <span className="elementInfo">
                <img width="25" height="25" src="https://img.icons8.com/ios-filled/25/finish-flag.png" alt="finish-flag" />
                {game.startPoints}
              </span>
            </MyTooltip>
            <MyTooltip title={game.users.map(user => user.displayName).join(', ')}>
              <span className="elementInfo usersCount absolute right-0">
                <img width="25" height="25" src="https://img.icons8.com/pastel-glyph/25/person-male--v3.png" alt="person-male--v3" />
                {game.users.length}
              </span>
            </MyTooltip>
            <MyTooltip title={new Date(game.created_at).toLocaleString()}>
              <span className="timedate">{new Date(game.created_at).toLocaleDateString()}</span>
            </MyTooltip>
          </Link>
          :
          <Link key={game._id} to={`/darts/games/${game.gameCode}`} className="element">
            <MyTooltip title="Game Ended">
              <span className="elementInfo gameActive">
                <img src={game.active ? GreenDot : RedDot} />
              </span>
            </MyTooltip>
            <span className="elementInfo">
              <img width="25" height="25" src="https://img.icons8.com/color/2525/first-place-ribbon.png" alt="first-place-ribbon" />
              {game.podium[1]}
            </span>
            {game.podium[2] && <span className="elementInfo">
              <img width="25" height="25" src="https://img.icons8.com/color/2525/second-place-ribbon.png" alt="first-place-ribbon" />
              {game.podium[2]}
            </span>}
            {game.podium[3] && <span className="elementInfo">
              <img width="25" height="25" src="https://img.icons8.com/color/2525/third-place-ribbon.png" alt="first-place-ribbon" />
              {game.podium[3]}
            </span>}
            <MyTooltip title="Game mode">
              <span className="elementInfo">
                <img width="25" height="25" src="https://img.icons8.com/office/25/controller.png" alt="controller" />
                <span className="text-sm text-center">{game.gameMode}</span>
              </span>
            </MyTooltip>
            <MyTooltip title="Start Points">
              <span className="elementInfo">
                <img width="25" height="25" src="https://img.icons8.com/ios-filled/25/finish-flag.png" alt="finish-flag" />
                {game.startPoints}
              </span>
            </MyTooltip>
            <MyTooltip title={game.users.map(user => user.displayName).join(', ')}>
              <span className="elementInfo usersCount absolute right-1">
                <img width="25" height="25" src="https://img.icons8.com/pastel-glyph/25/person-male--v3.png" alt="person-male--v3" />
                {game.users.length}
              </span>
            </MyTooltip>
            <MyTooltip title={new Date(game.created_at).toLocaleString()}>
              <span className="timedate">{new Date(game.created_at).toLocaleDateString()}</span>
            </MyTooltip>
          </Link>
      ))}
    </>
  );
}

export default DartsGamesList;
