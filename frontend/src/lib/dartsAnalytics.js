export const analyzeGameRecords = (game) => {
  if (!game?.record || game.record.length < 2) return null;

  const records = game.record;
  const userStats = {};

  game.users.forEach(user => {
    userStats[user.displayName] = {
      turnHistory: [],
      pointsPerRound: [],
      avgPerRound: [],
      consistency: 0,
      bestTurn: 0,
      worstTurn: Infinity,
      totalTurns: 0,
      progressionRate: 0
    };
  });

  for (let i = 1; i < records.length; i++) {
    const prevRecord = records[i - 1];
    const currRecord = records[i];
    const isLastRecord = i === records.length - 1;

    currRecord.users.forEach((currUser, idx) => {
      const prevUser = prevRecord.users[idx];
      const stats = userStats[currUser.displayName];

      if (!stats) return;

      const turnSwitchedAway = prevUser.turn && !currUser.turn;
      const gameEndedOnThisTurn = isLastRecord && currUser.turn && currUser.currentTurn === 3;

      if ((turnSwitchedAway || gameEndedOnThisTurn) && currUser.turns) {
        const pointsGained = typeof currUser.turnsSum === 'string' ? parseInt(currUser.turnsSum) : currUser.turnsSum;

        if (pointsGained > 0) {
          stats.turnHistory.push({
            round: currRecord.game.round,
            points: pointsGained,
            throws: currUser.turns,
            remainingPoints: currUser.points
          });

          stats.totalTurns++;

          if (pointsGained > stats.bestTurn) stats.bestTurn = pointsGained;
          if (pointsGained < stats.worstTurn) stats.worstTurn = pointsGained;

          stats.pointsPerRound.push(pointsGained);
          stats.avgPerRound.push(parseFloat(currUser.avgPointsPerTurn));
        }
      }
    });
  }

  Object.keys(userStats).forEach(userName => {
    const stats = userStats[userName];
    if (stats.pointsPerRound.length > 1) {
      const mean = stats.pointsPerRound.reduce((a, b) => a + b, 0) / stats.pointsPerRound.length;
      const variance = stats.pointsPerRound.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / stats.pointsPerRound.length;
      stats.consistency = Math.sqrt(variance).toFixed(2);

      if (stats.avgPerRound.length > 2) {
        const firstHalf = stats.avgPerRound.slice(0, Math.floor(stats.avgPerRound.length / 2));
        const secondHalf = stats.avgPerRound.slice(Math.floor(stats.avgPerRound.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        stats.progressionRate = ((secondAvg - firstAvg) / firstAvg * 100).toFixed(1);
      }
    }

    if (stats.worstTurn === Infinity) stats.worstTurn = 0;
  });

  return userStats;
};

export const compareUsers = (game) => {
  if (!game?.users || game.users.length !== 2) return null;

  const [user1, user2] = game.users;

  return {
    pointsAdvantage: Math.abs(user1.allGainedPoints - user2.allGainedPoints),
    leader: user1.allGainedPoints > user2.allGainedPoints ? user1.displayName : user2.displayName,
    avgAdvantage: Math.abs(parseFloat(user1.avgPointsPerTurn) - parseFloat(user2.avgPointsPerTurn)).toFixed(2),
    avgLeader: parseFloat(user1.avgPointsPerTurn) > parseFloat(user2.avgPointsPerTurn) ? user1.displayName : user2.displayName,
    throwsCompare: {
      [user1.displayName]: user1.throws.normal + user1.throws.doubles + user1.throws.triples + user1.throws.doors,
      [user2.displayName]: user2.throws.normal + user2.throws.doubles + user2.throws.triples + user2.throws.doors
    }
  };
};

export const generateTimeline = (game) => {
  if (!game?.record || game.record.length < 2) return [];

  const timeline = [];

  for (let i = 1; i < game.record.length; i++) {
    const prevRecord = game.record[i - 1];
    const currRecord = game.record[i];
    const isLastRecord = i === game.record.length - 1;

    currRecord.users.forEach((currUser) => {
      const prevUser = prevRecord.users.find(u => u._id === currUser._id);

      const turnSwitchedAway = prevUser.turn && !currUser.turn;

      const prevPoints = Number(prevUser.points);
      const currPoints = Number(currUser.points);

      const playerFinishedNow = prevPoints > 0 && currPoints === 0;
      const gameEndedOnThisTurn = isLastRecord && playerFinishedNow;

      if ((turnSwitchedAway || gameEndedOnThisTurn) && currUser.turns) {
        const hasThrows =
          currUser.turns[1] !== null ||
          currUser.turns[2] !== null ||
          currUser.turns[3] !== null;

        if (hasThrows) {
          timeline.push({
            round: currRecord.game.round,
            player: currUser.displayName,
            throws: [currUser.turns[1], currUser.turns[2], currUser.turns[3]],
            pointsScored: Number(currUser.turnsSum),
            pointsBefore: prevPoints,
            pointsAfter: currPoints,
            avg: currUser.avgPointsPerTurn,
          });
        }
      }
    });

  }

  return timeline;
};

export const calculateEfficiency = (user) => {
  const totalDarts = user.throws.normal + user.throws.doubles + user.throws.triples + user.throws.doors;

  if (totalDarts === 0) return {
    pointsPerDart: 0,
    dartsPerPoint: 0,
    accuracy: 0,
    wastedDarts: 0
  };

  const pointsPerDart = (user.allGainedPoints / totalDarts).toFixed(2);
  const dartsPerPoint = (totalDarts / user.allGainedPoints).toFixed(2);
  const wastedDarts = user.throws.doors + user.throws.overthrows;
  const accuracy = (((totalDarts - wastedDarts) / totalDarts) * 100).toFixed(1);

  return {
    pointsPerDart: parseFloat(pointsPerDart),
    dartsPerPoint: parseFloat(dartsPerPoint),
    accuracy: parseFloat(accuracy),
    wastedDarts
  };
};

export const getScoringBreakdown = (user) => {
  const { throws } = user;
  const total = throws.normal + throws.doubles + throws.triples + throws.doors;

  if (total === 0) return null;

  return {
    normal: { count: throws.normal, percentage: ((throws.normal / total) * 100).toFixed(1) },
    doubles: { count: throws.doubles, percentage: ((throws.doubles / total) * 100).toFixed(1) },
    triples: { count: throws.triples, percentage: ((throws.triples / total) * 100).toFixed(1) },
    doors: { count: throws.doors, percentage: ((throws.doors / total) * 100).toFixed(1) }
  };
};
