import MyTooltip from '../MyComponents/MyTooltip'

function UserDataTable({ users, game }) {
  const displayUserThrows = (user) => {
    return (
      <MyTooltip title={`N: ${user.throws['normal']} | D: ${user.throws['doubles']} | T: ${user.throws['triples']} | D: ${user.throws['doors']} | O: ${user.throws['overthrows']}`}>
        {Object.values(user.throws).reduce((acc, val) => acc + val, 0)}
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
    <Table responsive="sm">
      <thead>
        <tr>
          <th>Player</th>
          <th>Points</th>
          <th>Throws</th>
          <th><MyTooltip title="Your highest Round Points Thrown">HRP</MyTooltip></th>
          <th><MyTooltip title="Your average of points in the set">AVG</MyTooltip></th>
          <th>Legs</th>
          <th>Sets</th>
        </tr>
      </thead>
      <tbody>
        {users && users.map(user => (
          <tr key={user._id} style={dynamicUserStyle(user)}>
            <td>{user.displayName}</td>
            <td>{game.startPoints - user.points}</td>
            <td>{displayUserThrows(user)}</td>
            <td>{user.highestRoundPoints}</td>
            <td>{user.avgPointsPerThrow}</td>
            <td>{user.legs}</td>
            <td>{user.sets}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default UserDataTable