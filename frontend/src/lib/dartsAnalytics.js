const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const getOverthrows = (user) =>
  user?.throws?.overthrows ??
  user?.currentThrows?.overthrows ??
  0;

const throwsAllNull = (turns) =>
  turns?.[1] === null && turns?.[2] === null && turns?.[3] === null;

const extractTurns = (game) => {
  if (!game?.record || game.record.length < 2) return [];

  const turns = [];
  const records = game.record;
  const solo = (game?.users?.length || 0) === 1;

  for (let i = 1; i < records.length; i++) {
    const prevRecord = records[i - 1];
    const currRecord = records[i];

    const prevUsersMap = new Map(prevRecord.users.map((u) => [u._id, u]));

    const prevRound = prevRecord.game.round;

    for (const currUser of currRecord.users) {
      const prevUser = prevUsersMap.get(currUser._id);
      if (!prevUser) continue;

      const player = currUser.displayName;

      const prevPoints = toNumber(prevUser.points);
      const currPoints = toNumber(currUser.points);

      const prevThrows = prevUser.turns || {};
      const currThrows = currUser.turns || {};

      const prevTurn = toNumber(prevUser.currentTurn);
      const currTurn = toNumber(currUser.currentTurn);

      const prevOver = getOverthrows(prevUser);
      const currOver = getOverthrows(currUser);
      const overthrowHappened = currOver > prevOver;

      const playerFinishedNow = prevPoints > 0 && currPoints === 0;

      const soloTurnRolledOver = solo && prevTurn === 3 && currTurn === 1;

      const wasPlayersTurnBefore = prevRecord.game.turn === player;
      const isPlayersTurnNow = currRecord.game.turn === player;
      const turnSwitchedAway = wasPlayersTurnBefore && !isPlayersTurnNow;

      let shouldPushTurn = false;

      if (solo) {
        shouldPushTurn =
          soloTurnRolledOver || playerFinishedNow || overthrowHappened;
      } else {
        shouldPushTurn = turnSwitchedAway || playerFinishedNow;
      }

      if (!shouldPushTurn) continue;

      const currThrowsReset = throwsAllNull(currThrows);

      let throwsSource = currThrows;
      let pointsScoredSource = toNumber(currUser.turnsSum);
      let avgSource = currUser.avgPointsPerTurn;

      if (solo && soloTurnRolledOver && currThrowsReset && !overthrowHappened) {
        throwsSource = prevThrows;
        pointsScoredSource = toNumber(prevUser.turnsSum);
        avgSource = prevUser.avgPointsPerTurn;
      }

      if (!solo && turnSwitchedAway && currThrowsReset && !overthrowHappened) {
        throwsSource = prevThrows;
        pointsScoredSource = toNumber(prevUser.turnsSum);
        avgSource = prevUser.avgPointsPerTurn;
      }

      if (currThrowsReset && overthrowHappened) {
        throwsSource = { 1: "OVER", 2: null, 3: null };
      }

      const throwsArr = [throwsSource?.[1], throwsSource?.[2], throwsSource?.[3]];
      const allNull = throwsArr.every((x) => x === null || x === undefined);

      if (allNull && !overthrowHappened) continue;

      turns.push({
        round: prevRound,
        player,
        throws: throwsArr,
        pointsScored: pointsScoredSource,
        pointsBefore: prevPoints,
        pointsAfter: currPoints,
        remainingPoints: currPoints,
        avg: avgSource,
      });
    }
  }

  return turns;
};

const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

const stdDev = (arr) => {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance = arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
};

export const analyzeGameRecords = (game) => {
  if (!game?.record || game.record.length < 2) return null;

  const turns = extractTurns(game);

  const userStats = {};
  for (const user of game.users) {
    userStats[user.displayName] = {
      turnHistory: [],
      pointsPerRound: [],
      avgPerRound: [],
      consistency: 0,
      bestTurn: 0,
      worstTurn: Infinity,
      totalTurns: 0,
      progressionRate: 0,
    };
  }

  for (const t of turns) {
    const stats = userStats[t.player];
    if (!stats) continue;

    const pointsGained = toNumber(t.pointsScored);

    if (pointsGained < 0) continue;

    stats.turnHistory.push({
      round: t.round,
      points: pointsGained,
      throws: { 1: t.throws[0], 2: t.throws[1], 3: t.throws[2] },
      remainingPoints: t.remainingPoints,
      avg: t.avg,
      pointsBefore: t.pointsBefore,
      pointsAfter: t.pointsAfter,
    });

    stats.totalTurns++;

    const isOver = t.throws?.includes("OVER");

    if (!isOver) {
      if (pointsGained > stats.bestTurn) stats.bestTurn = pointsGained;
      if (pointsGained < stats.worstTurn) stats.worstTurn = pointsGained;
    }

    stats.pointsPerRound.push(pointsGained);

    const avgNum = Number(t.avg);
    if (!Number.isNaN(avgNum)) stats.avgPerRound.push(avgNum);
  }

  for (const userName of Object.keys(userStats)) {
    const stats = userStats[userName];

    if (stats.pointsPerRound.length > 1) {
      stats.consistency = Number(stdDev(stats.pointsPerRound).toFixed(2));

      if (stats.avgPerRound.length > 2) {
        const mid = Math.floor(stats.avgPerRound.length / 2);

        const firstHalf = stats.avgPerRound.slice(0, mid);
        const secondHalf = stats.avgPerRound.slice(mid);

        const firstAvg = mean(firstHalf);
        const secondAvg = mean(secondHalf);

        stats.progressionRate = Number(
          (((secondAvg - firstAvg) / firstAvg) * 100).toFixed(1)
        );
      }
    }

    if (stats.worstTurn === Infinity) stats.worstTurn = 0;
  }

  return userStats;
};

export const generateTimeline = (game) => {
  return extractTurns(game).map((t) => ({
    round: t.round,
    player: t.player,
    throws: t.throws,
    pointsScored: t.pointsScored,
    pointsBefore: t.pointsBefore,
    pointsAfter: t.pointsAfter,
    avg: t.avg,
  }));
};

export const compareUsers = (game) => {
  if (!game?.users || game.users.length !== 2) return null;

  const [user1, user2] = game.users;

  const u1Avg = Number(user1.avgPointsPerTurn) || 0;
  const u2Avg = Number(user2.avgPointsPerTurn) || 0;

  const u1Throws =
    (user1.throws?.normal || 0) +
    (user1.throws?.doubles || 0) +
    (user1.throws?.triples || 0) +
    (user1.throws?.doors || 0);

  const u2Throws =
    (user2.throws?.normal || 0) +
    (user2.throws?.doubles || 0) +
    (user2.throws?.triples || 0) +
    (user2.throws?.doors || 0);

  return {
    pointsAdvantage: Math.abs(user1.allGainedPoints - user2.allGainedPoints),
    leader:
      user1.allGainedPoints > user2.allGainedPoints
        ? user1.displayName
        : user2.displayName,
    avgAdvantage: Math.abs(u1Avg - u2Avg).toFixed(2),
    avgLeader: u1Avg > u2Avg ? user1.displayName : user2.displayName,
    throwsCompare: {
      [user1.displayName]: u1Throws,
      [user2.displayName]: u2Throws,
    },
  };
};

export const calculateEfficiency = (user) => {
  const throws = user?.throws || {};
  const totalDarts =
    (throws.normal || 0) +
    (throws.doubles || 0) +
    (throws.triples || 0) +
    (throws.doors || 0);

  if (totalDarts === 0) {
    return {
      pointsPerDart: 0,
      dartsPerPoint: 0,
      accuracy: 0,
      wastedDarts: 0,
    };
  }

  const gained = toNumber(user?.allGainedPoints);
  const wastedDarts = (throws.doors || 0) + (throws.overthrows || 0);

  const pointsPerDart = gained > 0 ? gained / totalDarts : 0;
  const dartsPerPoint = gained > 0 ? totalDarts / gained : 0;

  const accuracy = ((totalDarts - wastedDarts) / totalDarts) * 100;

  return {
    pointsPerDart: Number(pointsPerDart.toFixed(2)),
    dartsPerPoint: Number(dartsPerPoint.toFixed(2)),
    accuracy: Number(accuracy.toFixed(1)),
    wastedDarts,
  };
};

export const getScoringBreakdown = (user) => {
  const throws = user?.throws || {};

  const normal = throws.normal || 0;
  const doubles = throws.doubles || 0;
  const triples = throws.triples || 0;
  const doors = throws.doors || 0;

  const total = normal + doubles + triples + doors;
  if (total === 0) return null;

  return {
    normal: { count: normal, percentage: ((normal / total) * 100).toFixed(1) },
    doubles: {
      count: doubles,
      percentage: ((doubles / total) * 100).toFixed(1),
    },
    triples: {
      count: triples,
      percentage: ((triples / total) * 100).toFixed(1),
    },
    doors: { count: doors, percentage: ((doors / total) * 100).toFixed(1) },
  };
};
