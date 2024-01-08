/* eslint-disable react/prop-types */
import { Table } from 'react-bootstrap'
import MyTooltip from '../myTooltip'

function UserDataTable({ game }) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Player</th>
          <th>Points</th>
          <th>Throws</th>
          <th><MyTooltip title="Your highest Round Points Thrown">HRP</MyTooltip></th>
          <th><MyTooltip title="Your average of points in the set">AVG</MyTooltip></th>
          <th>Legs</th>
          <th>Sets</th>
          <th><MyTooltip title="Throws: Normal, Doubles, Triples, Doors">N/D/T/D</MyTooltip></th>
        </tr>
      </thead>
      <tbody>
        {game.users.map(user => (
          <tr key={user.uid} style={user.turn ? {borderLeft: '1px solid #E00000'} : null}>
            <td>{user.displayName}</td>
            <td>{game.startPoints - user.points}</td>
            <td>{Object.values(user.throws).reduce((acc, val) => acc + val, 0)}</td>
            <td>{user.highestRoundPoints}</td>
            <td>{user.avgPointsPerThrow}</td>
            <td>{user.legs}</td>
            <td>{user.sets}</td>
            <td>{`${user.throws['normal']}/${user.throws['doubles']}/${user.throws['triples']}/${user.throws['doors']}`}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default UserDataTable