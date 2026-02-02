import MyTooltip from '../MyComponents/MyTooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { totalThrows } from './utils/userUtils';

function UserDataTable({ users, game }) {
  const displayUserThrows = (user) => {
    if (!user || !user.currentThrows) {
      return <span>0</span>;
    }

    const throws = user.currentThrows;
    return (
      <MyTooltip title={`N: ${throws['normal'] || 0} | Dou: ${throws['doubles'] || 0} | T: ${throws['triples'] || 0} | Doo: ${throws['doors'] || 0} | O: ${throws['overthrows'] || 0}`}>
        <span>
          {totalThrows(user)}
        </span>
      </MyTooltip>
    )
  }

  const dynamicUserStyle = (user) => {
    let style = {};
    if (user?.turn) {
      style = { ...style, borderLeft: '1px solid #E00000' };
    }
    if (game?.userWon === user?.displayName) {
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
            {game?.legs > 0 || game?.sets > 0 && (
              <TableHead className="whitespace-nowrap"><MyTooltip title="Your Highest Average of points in a leg"><span>HAVG</span></MyTooltip></TableHead>
            )}
            <TableHead className="whitespace-nowrap">Legs</TableHead>
            <TableHead className="whitespace-nowrap">Sets</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map(user => (
            <TableRow key={user._id} style={dynamicUserStyle(user)}>
              <TableCell className="whitespace-nowrap">{user?.displayName || 'Unknown'}</TableCell>
              <TableCell className="whitespace-nowrap">{user?.points ?? 0}</TableCell>
              <TableCell className="whitespace-nowrap">{displayUserThrows(user)}</TableCell>
              <TableCell className="whitespace-nowrap">{user?.highestGameTurnPoints ?? 0}</TableCell>
              <TableCell className="whitespace-nowrap">{user?.avgPointsPerTurn ?? '0.00'}</TableCell>
              {game?.legs > 0 || game?.sets > 0 && (
                <TableCell className="whitespace-nowrap">{user?.highestGameAvg ?? '0.00'}</TableCell>
              )}
              <TableCell className="whitespace-nowrap">{user?.legs ?? 0}</TableCell>
              <TableCell className="whitespace-nowrap">{user?.sets ?? 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default UserDataTable