import MyTooltip from '../MyComponents/MyTooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { totalThrows } from './utils';

function UserDataTable({ users, game }) {
  const displayUserThrows = (user) => {
    return (
      <MyTooltip title={`N: ${user.throws['normal']} | Dou: ${user.throws['doubles']} | T: ${user.throws['triples']} | Doo: ${user.throws['doors']} | O: ${user.throws['overthrows']}`}>
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
    if (user.points === 0) {
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
          <TableHead><MyTooltip title="Your highest Round Points Thrown"><span>HRP</span></MyTooltip></TableHead>
          <TableHead><MyTooltip title="Your average of points in the set"><span>AVG</span></MyTooltip></TableHead>
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
            <TableCell>{user.highestTurnPoints}</TableCell>
            <TableCell>{user.avgPointsPerTurn}</TableCell>
            <TableCell>{user.legs}</TableCell>
            <TableCell>{user.sets}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default UserDataTable