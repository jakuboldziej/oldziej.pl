import MyTooltip from '../MyComponents/MyTooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { totalThrows } from './game logic/userUtils';

function UserDataTable({ users, game }) {
  const displayUserThrows = (user) => {
    return (
      <MyTooltip title={`N: ${user.currentThrows['normal']} | Dou: ${user.currentThrows['doubles']} | T: ${user.currentThrows['triples']} | Doo: ${user.currentThrows['doors']} | O: ${user.currentThrows['overthrows']}`}>
        <span>
          {totalThrows(user)}
        </span>
      </MyTooltip>
    )
  }

  const dynamicUserStyle = (user) => {
    let style = {};
    if (user.turn) {
      style = { ...style, borderLeft: '1px solid #E00000' };
    }
    if (game.userWon === user.displayName) {
      style = { ...style, color: 'gold' };
    }
    return style;
  }
  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Player</TableHead>
            <TableHead className="whitespace-nowrap">Points</TableHead>
            <TableHead className="whitespace-nowrap">Throws</TableHead>
            <TableHead className="whitespace-nowrap"><MyTooltip title="Your Highest Round Points thrown"><span>HRP</span></MyTooltip></TableHead>
            <TableHead className="whitespace-nowrap"><MyTooltip title="Your Average of points in a current leg"><span>AVG</span></MyTooltip></TableHead>
            <TableHead className="whitespace-nowrap"><MyTooltip title="Your Highest Average of points in a leg"><span>HAVG</span></MyTooltip></TableHead>
            <TableHead className="whitespace-nowrap">Legs</TableHead>
            <TableHead className="whitespace-nowrap">Sets</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user._id} style={dynamicUserStyle(user)}>
              <TableCell className="whitespace-nowrap">{user.displayName}</TableCell>
              <TableCell className="whitespace-nowrap">{user.points}</TableCell>
              <TableCell className="whitespace-nowrap">{displayUserThrows(user)}</TableCell>
              <TableCell className="whitespace-nowrap">{user.highestGameTurnPoints}</TableCell>
              <TableCell className="whitespace-nowrap">{user.avgPointsPerTurn}</TableCell>
              <TableCell className="whitespace-nowrap">{user.highestGameAvg}</TableCell>
              <TableCell className="whitespace-nowrap">{user.legs}</TableCell>
              <TableCell className="whitespace-nowrap">{user.sets}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default UserDataTable