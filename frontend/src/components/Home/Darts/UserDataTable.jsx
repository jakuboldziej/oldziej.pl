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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Player</TableHead>
          <TableHead>Points</TableHead>
          <TableHead>Throws</TableHead>
          <TableHead><MyTooltip title="Your Highest Round Points thrown"><span>HRP</span></MyTooltip></TableHead>
          <TableHead><MyTooltip title="Your Highest Average of points in a leg"><span>HAVG</span></MyTooltip></TableHead>
          <TableHead>Legs</TableHead>
          <TableHead>Sets</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user._id} style={dynamicUserStyle(user)}>
            <TableCell>{user.displayName}</TableCell>
            <TableCell>{game.startPoints - user.points}</TableCell>
            <TableCell>{displayUserThrows(user)}</TableCell>
            <TableCell>{user.highestGameTurnPoints}</TableCell>
            <TableCell>{user.highestGameAvg}</TableCell>
            <TableCell>{user.legs}</TableCell>
            <TableCell>{user.sets}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default UserDataTable