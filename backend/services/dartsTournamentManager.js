const DartsTournament = require('../models/darts/dartsTournament');
const { logger } = require('../middleware/logging');
const DartsGame = require('../models/darts/dartsGame');
const { generateUniqueGameCode } = require('../routes/darts');

class DartsTournamentManager {

  _getNextPowerOfTwo(num) {
    return Math.pow(2, Math.ceil(Math.log2(num)));
  }

  async generateBracket(tournamentId) {
    try {
      const tournament = await DartsTournament.findById(tournamentId).populate('participants');
      if (!tournament) throw new Error("DartsTournament not found");

      const players = tournament.participants.sort(() => Math.random() - 0.5);
      const numPlayers = players.length;
      const bracketSize = this._getNextPowerOfTwo(numPlayers);
      const byes = bracketSize - numPlayers;

      const totalRounds = Math.log2(bracketSize);
      let matches = [];

      for (let round = 1; round <= totalRounds; round++) {
        const matchesInRound = bracketSize / Math.pow(2, round);
        for (let matchIndex = 0; matchIndex < matchesInRound; matchIndex++) {
          matches.push({
            round,
            matchIndex,
            player1: null,
            player2: null,
            status: 'pending'
          });
        }
      }

      let playerIndex = 0;
      const round1Matches = matches.filter(m => m.round === 1);

      for (let i = 0; i < round1Matches.length; i++) {
        if (playerIndex < players.length) {
          round1Matches[i].player1 = players[playerIndex]._id;
          playerIndex++;
        }

        if (playerIndex < players.length && i >= byes) {
          round1Matches[i].player2 = players[playerIndex]._id;
          round1Matches[i].status = 'active';
          playerIndex++;
        } else if (round1Matches[i].player1) {
          round1Matches[i].status = 'completed';
          round1Matches[i].winner = round1Matches[i].player1;
        }
      }

      tournament.matches = matches;
      tournament.status = 'in_progress';
      await tournament.save();

      for (const match of round1Matches) {
        if (match.status === 'completed' && match.winner) {
          await this._pushWinnerToNextRound(tournament, match);
        }
      }

      return tournament;

    } catch (error) {
      logger.error("Error generating bracket", { error: error.message });
      throw error;
    }
  }

  async advanceTournamentBracket(tournamentId, matchId, winnerDisplayName, io) {
    try {
      const tournament = await DartsTournament.findById(tournamentId).populate('participants');
      if (!tournament) throw new Error("DartsTournament not found");

      const match = tournament.matches.id(matchId);
      if (!match) throw new Error("Match not found");

      const winner = tournament.participants.find(p => p.displayName === winnerDisplayName);
      if (!winner) throw new Error("Winner not found in participants");

      match.winner = winner._id;
      match.status = 'completed';

      await this._pushWinnerToNextRound(tournament, match);

      if (io) {
        io.to(`tournament-${tournament._id}`).emit("tournamentUpdated", tournament);
      }

    } catch (error) {
      logger.error("Error advancing bracket", { error: error.message });
      throw error;
    }
  }

  async _pushWinnerToNextRound(tournament, currentMatch) {
    const nextRound = currentMatch.round + 1;
    const nextMatchIndex = Math.floor(currentMatch.matchIndex / 2);

    const nextMatch = tournament.matches.find(
      m => m.round === nextRound && m.matchIndex === nextMatchIndex
    );

    if (nextMatch) {
      if (currentMatch.matchIndex % 2 === 0) {
        nextMatch.player1 = currentMatch.winner;
      } else {
        nextMatch.player2 = currentMatch.winner;
      }

      if (nextMatch.player1 && nextMatch.player2) {
        nextMatch.status = 'active';
        const newGame = await this._initializeGameForMatch(tournament, nextMatch);
        nextMatch.gameCode = newGame.gameCode;
      }

      await tournament.save();
    } else {
      tournament.status = 'completed';
      await tournament.save();
      logger.info(`DartsTournament ${tournament._id} completed! Winner: ${currentMatch.winner}`);
    }
  }
  async _initializeGameForMatch(tournament, match) {
    const p1 = await DartsUser.findById(match.player1);
    const p2 = await DartsUser.findById(match.player2);

    const gameUsers = [p1, p2].map((user, index) => ({
      _id: user._id,
      displayName: user.displayName,
      points: tournament.settings.startPoints,
      turn: index === 0,
      currentTurn: 1,
      turns: { 1: null, 2: null, 3: null },
      throws: { doors: 0, doubles: 0, triples: 0, normal: 0, overthrows: 0 },
      currentThrows: { doors: 0, doubles: 0, triples: 0, normal: 0, overthrows: 0 },
      place: 0,
      legs: 0,
      sets: 0,
      avgPointsPerTurn: "0.00"
    }));

    const newGame = new DartsGame({
      gameCode: generateUniqueGameCode(),
      gameMode: tournament.settings.gameMode,
      startPoints: tournament.settings.startPoints,
      checkOut: tournament.settings.checkOut,
      legs: tournament.settings.legs,
      sets: tournament.settings.sets,
      users: gameUsers,
      turn: p1.displayName,
      round: 1,
      active: true,
      tournamentId: tournament._id,
      tournamentMatchId: match._id
    });

    return await newGame.save();
  }
}

module.exports = new DartsTournamentManager();