export const analyzeUserGames = (games, dartUser) => {
  if (!games || games.length === 0) return null;

  const analytics = {
    recentForm: {
      last5Games: [],
      avgLast5: 0,
      trend: 0
    },
    efficiency: {
      pointsPerDart: 0,
      dartsPerPoint: 0,
      accuracy: 0,
      wastedDarts: 0
    },
    consistency: {
      stdDev: 0,
      bestGameAvg: 0,
      worstGameAvg: Infinity,
      avgDifference: 0
    },
    checkoutStats: {
      totalCheckouts: 0,
      avgCheckout: 0,
      checkoutRate: 0
    },
    performanceByGameMode: {},
    winRate: 0,
    totalGames: games.length
  };

  const totalDarts = dartUser.throws.normal + dartUser.throws.doubles + dartUser.throws.triples + dartUser.throws.doors;
  if (totalDarts > 0) {
    analytics.efficiency.pointsPerDart = (dartUser.overAllPoints / totalDarts).toFixed(2);
    analytics.efficiency.dartsPerPoint = (totalDarts / dartUser.overAllPoints).toFixed(2);
    const wastedDarts = dartUser.throws.doors + (dartUser.throws.overthrows || 0);
    analytics.efficiency.accuracy = (((totalDarts - wastedDarts) / totalDarts) * 100).toFixed(1);
    analytics.efficiency.wastedDarts = wastedDarts;
  }

  const recentGames = games.slice(0, Math.min(5, games.length));
  const gameAverages = [];
  let totalCheckouts = 0;
  let totalCheckoutPoints = 0;
  let gamesWon = 0;

  games.forEach(game => {
    const user = game.users?.find(u => u.displayName === dartUser.displayName);
    if (!user) return;

    const avgPoints = parseFloat(user.avgPointsPerTurn) || 0;
    gameAverages.push(avgPoints);

    if (user.gameCheckout > 0) {
      totalCheckouts++;
      totalCheckoutPoints += user.gameCheckout;
    }

    if (user.place === 1) {
      gamesWon++;
    }

    const mode = game.gameMode || 'X01';
    if (!analytics.performanceByGameMode[mode]) {
      analytics.performanceByGameMode[mode] = {
        games: 0,
        totalAvg: 0,
        avgAvg: 0,
        wins: 0
      };
    }
    analytics.performanceByGameMode[mode].games++;
    analytics.performanceByGameMode[mode].totalAvg += avgPoints;
    if (user.place === 1) {
      analytics.performanceByGameMode[mode].wins++;
    }
  });

  Object.keys(analytics.performanceByGameMode).forEach(mode => {
    const modeStats = analytics.performanceByGameMode[mode];
    modeStats.avgAvg = (modeStats.totalAvg / modeStats.games).toFixed(2);
    modeStats.winRate = ((modeStats.wins / modeStats.games) * 100).toFixed(1);
  });

  if (recentGames.length > 0) {
    recentGames.forEach(game => {
      const user = game.users?.find(u => u.displayName === dartUser.displayName);
      if (user) {
        analytics.recentForm.last5Games.push({
          gameCode: game.gameCode,
          avg: user.avgPointsPerTurn,
          place: user.place,
          active: game.active
        });
      }
    });

    const recentAvgs = analytics.recentForm.last5Games.map(g => parseFloat(g.avg) || 0);
    analytics.recentForm.avgLast5 = (recentAvgs.reduce((a, b) => a + b, 0) / recentAvgs.length).toFixed(2);

    if (recentAvgs.length >= 4) {
      const mid = Math.floor(recentAvgs.length / 2);
      const firstHalfAvg = recentAvgs.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
      const secondHalfAvg = recentAvgs.slice(mid).reduce((a, b) => a + b, 0) / (recentAvgs.length - mid);
      analytics.recentForm.trend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100).toFixed(1);
    }
  }

  if (gameAverages.length > 0) {
    const mean = gameAverages.reduce((a, b) => a + b, 0) / gameAverages.length;
    const variance = gameAverages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / gameAverages.length;
    analytics.consistency.stdDev = Math.sqrt(variance).toFixed(2);
    analytics.consistency.bestGameAvg = Math.max(...gameAverages).toFixed(2);
    analytics.consistency.worstGameAvg = Math.min(...gameAverages).toFixed(2);
    analytics.consistency.avgDifference = (analytics.consistency.bestGameAvg - analytics.consistency.worstGameAvg).toFixed(2);
  }

  analytics.checkoutStats.totalCheckouts = totalCheckouts;
  analytics.checkoutStats.avgCheckout = totalCheckouts > 0 ? (totalCheckoutPoints / totalCheckouts).toFixed(2) : 0;
  analytics.checkoutStats.checkoutRate = (totalCheckouts / games.length).toFixed(2);

  analytics.winRate = ((gamesWon / games.length) * 100).toFixed(1);

  return analytics;
};

export const getPerformanceTrend = (games, dartUser) => {
  if (!games || games.length < 3) return null;

  const trendData = games.slice().reverse().map(game => {
    const user = game.users?.find(u => u.displayName === dartUser.displayName);
    if (!user) return null;

    return {
      gameCode: game.gameCode,
      date: game.created_at,
      avg: parseFloat(user.avgPointsPerTurn) || 0,
      points: user.allGainedPoints,
      place: user.place
    };
  }).filter(d => d !== null);

  return trendData;
};

export const compareWithBest = (dartUser) => {
  if (!dartUser) return null;

  const totalDarts = dartUser.throws.normal + dartUser.throws.doubles + dartUser.throws.triples + dartUser.throws.doors;
  const currentAvgPerDart = totalDarts > 0 ? dartUser.overAllPoints / totalDarts : 0;
  
  return {
    avgPerDart: {
      current: currentAvgPerDart.toFixed(2),
      best: (dartUser.highestEndingAvg || 0),
      difference: (dartUser.highestEndingAvg - currentAvgPerDart).toFixed(2)
    },
    turnPoints: {
      current: currentAvgPerDart * 3,
      best: dartUser.highestTurnPoints || 0
    }
  };
};
