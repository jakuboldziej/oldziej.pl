const DartsTournament = require('../models/darts/dartsTournament');
const { logger } = require('../middleware/logging');
const DartsGame = require('../models/darts/dartsGame');
const DartsUser = require('../models/darts/dartsUser');
const DartsTournamentMatch = require('../models/darts/dartsTournamentMatch');
const { generateUniqueDartsCode, generateTempUserId, getInitialUsersGameState } = require('../lib/dartsUtils');

class DartsTournamentManager {
  _getNextPowerOfTwo(num) {
    return Math.pow(2, Math.ceil(Math.log2(num)));
  }

  async generateBracket(tournamentId) {
    try {
      const tournament = await DartsTournament.findById(tournamentId);
      if (!tournament) throw new Error("DartsTournament not found");

      const players = tournament.participants.sort(() => Math.random() - 0.5);
      const numPlayers = players.length;
      const bracketSize = this._getNextPowerOfTwo(numPlayers);
      const byes = bracketSize - numPlayers;

      const totalRounds = Math.log2(bracketSize);
      let matchDocs = [];

      for (let round = 1; round <= totalRounds; round++) {
        const matchesInRound = bracketSize / Math.pow(2, round);
        for (let matchIndex = 0; matchIndex < matchesInRound; matchIndex++) {
          const newMatch = new DartsTournamentMatch({
            round,
            matchIndex,
            player1: null,
            player2: null,
            status: 'pending'
          });
          matchDocs.push(newMatch);
        }
      }

      let playerIndex = 0;
      const round1Matches = matchDocs.filter(m => m.round === 1);

      for (let i = 0; i < round1Matches.length; i++) {
        if (playerIndex < players.length) {
          round1Matches[i].player1 = players[playerIndex];
          playerIndex++;
        }

        if (playerIndex < players.length && i >= byes) {
          round1Matches[i].player2 = players[playerIndex];
          round1Matches[i].status = 'active';
          playerIndex++;


          const newGame = await this._initializeGameForMatch(tournament, round1Matches[i]);
          round1Matches[i].gameId = newGame._id;

        } else if (round1Matches[i].player1) {
          round1Matches[i].status = 'completed';
          round1Matches[i].winner = round1Matches[i].player1;
        }
      }

      const savedMatches = await DartsTournamentMatch.insertMany(matchDocs);

      tournament.matches = savedMatches.map(m => m._id);
      tournament.status = 'in_progress';
      await tournament.save();

      for (const match of savedMatches.filter(m => m.round === 1)) {
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

  async generateFFAMatches(tournamentId) {
    try {
      const tournament = await DartsTournament.findById(tournamentId);
      if (!tournament) throw new Error("DartsTournament not found");

      const players = tournament.participants;
      const pairings = [];

      for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
          pairings.push([players[i], players[j]]);
        }
      }

      const shuffledPairings = pairings.sort(() => Math.random() - 0.5);

      const matchDocs = [];

      for (let i = 0; i < shuffledPairings.length; i++) {
        const [playerA, playerB] = shuffledPairings[i];

        const p1Starts = Math.random() > 0.5;

        const newMatch = new DartsTournamentMatch({
          round: 1,
          matchIndex: i,
          player1: p1Starts ? playerA : playerB,
          player2: p1Starts ? playerB : playerA,
          status: 'active'
        });

        const newGame = await this._initializeGameForMatch(tournament, newMatch);
        newMatch.gameId = newGame._id;

        matchDocs.push(newMatch);
      }

      const savedMatches = await DartsTournamentMatch.insertMany(matchDocs);

      tournament.matches = savedMatches.map(m => m._id);
      tournament.status = 'in_progress';
      tournament.standings = tournament.participants.map(p => ({
        player: p,
        wins: 0,
        matchesPlayed: 0
      }));

      await tournament.save();
      return tournament;
    } catch (error) {
      logger.error("Error generating FFA matches", { error: error.message });
      throw error;
    }
  }

  async advanceTournamentBracket(tournamentId, matchId, winnerDisplayName, io) {
    try {
      const tournament = await DartsTournament.findById(tournamentId);

      if (!tournament) throw new Error("DartsTournament not found");

      const match = await DartsTournamentMatch.findById(matchId);
      if (!match) throw new Error("Match not found");

      match.winner = winnerDisplayName;
      match.status = 'completed';
      await match.save();

      const game = await DartsGame.findById(match.gameId);
      if (!game) throw new Error("Game not found");

      if (tournament.settings.type === 'bracket') {
        await this._pushWinnerToNextRound(tournament, match);
      } else if (tournament.settings.type === 'ffa') {
        await this._updateFFAStandings(tournament, match);
        await this._processFFAMatchCompletion(tournament);
      }

      const updatedTournament = await DartsTournament.findById(tournamentId).populate({
        path: 'matches',
        populate: { path: 'gameId' }
      });

      if (io) {
        io.to(`tournament-spectator-${updatedTournament.tournamentCode}`).emit(
          "tournamentUpdated",
          updatedTournament
        );
        io.to(`game-${game.gameCode}`).emit(
          "tournamentUpdated",
          updatedTournament
        );
      }
    } catch (error) {
      logger.error("Error advancing tournament", { error: error.message });
      throw error;
    }
  }

  async revertTournamentMatch(tournamentId, matchId) {
    try {
      const tournament = await DartsTournament
        .findById(tournamentId)
        .populate({
          path: 'matches',
          populate: { path: 'gameId' }
        })

      if (!tournament) throw new Error("Tournament not found");

      const match = tournament.matches.find(
        m => m._id.toString() === matchId.toString()
      );

      if (!match) throw new Error("Match not found");

      const winner = match.winner;

      match.winner = null;
      match.status = "active";

      await match.save();

      if (tournament.settings.type === "bracket") {
        await this._revertBracketWinner(tournament, match, winner);
      }

      if (tournament.settings.type === "ffa") {
        await this._revertFFAStandings(tournament, match, winner);
      }

      await tournament.save();

      return tournament;

    } catch (error) {
      logger.error("Error reverting tournament match", { error: error.message });
      throw error;
    }
  }

  async _pushWinnerToNextRound(tournament, currentMatch) {
    const currentRound = currentMatch.round;
    const nextRound = currentRound + 1;
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

      await nextMatch.save();

      const allCurrentRoundFinished = tournament.matches
        .filter(m => m.round === currentRound)
        .every(m => m.status === 'completed');

      if (allCurrentRoundFinished) {
        const nextRoundMatches = tournament.matches.filter(m => m.round === nextRound);

        for (const match of nextRoundMatches) {
          if (match.player1 && match.player2 && match.status === 'pending') {
            match.status = 'active';
            const newGame = await this._initializeGameForMatch(tournament, match);
            match.gameId = newGame._id;
            await match.save();
          }
          else if (match.player1 && !match.player2 && match.status === 'pending') {
          }
        }
      }
    } else {
      if (tournament.status !== 'completed') {
        tournament.status = 'completed';
        await tournament.save();
      }
    }
  }

  async _processFFAMatchCompletion(tournament) {
    const freshTournament = await DartsTournament
      .findById(tournament._id)
      .populate({
        path: "matches",
        select: "status player1 player2 winner"
      });

    const allFinished = freshTournament.matches.every(m => m.status === 'completed');

    if (!allFinished) return;

    const sorted = [...tournament.standings].sort((a, b) => b.wins - a.wins);

    const topScore = sorted[0].wins;

    const tiedPlayers = sorted.filter(p => p.wins === topScore);

    if (tiedPlayers.length === 1) {
      tournament.status = 'completed';
      await tournament.save();

      logger.info(`Winner: ${tiedPlayers[0].player}`);
      return;
    }

    await this._createTieBreakerMatch(tournament, tiedPlayers.map(p => p.player));
  }

  async _updateFFAStandings(tournament, match) {
    const p1 = tournament.standings.find(s => s.player === match.player1);
    const p2 = tournament.standings.find(s => s.player === match.player2);

    if (p1) p1.matchesPlayed += 1;
    if (p2) p2.matchesPlayed += 1;

    const winner = tournament.standings.find(s => s.player === match.winner);
    if (winner) winner.wins += 1;

    await tournament.save();
  }

  async _createTieBreakerMatch(tournament, players) {
    if (players.length !== 2) { logger.warn("More than 2 players tied. Only first two used."); }

    const tieMatch = new DartsTournamentMatch({
      round: 999,
      matchIndex: tournament.matches.length,
      player1: players[0],
      player2: players[1],
      status: "active"
    });

    const newGame = await this._initializeGameForMatch(tournament, tieMatch);
    tieMatch.gameId = newGame._id;

    await tieMatch.save();

    tournament.matches.push(tieMatch._id);
    await tournament.save();
  }

  async _revertBracketWinner(tournament, match, winner) {
    const nextRound = match.round + 1;
    const nextMatchIndex = Math.floor(match.matchIndex / 2);

    const nextMatch = tournament.matches.find(
      m => m.round === nextRound && m.matchIndex === nextMatchIndex
    );

    if (!nextMatch) return;

    if (nextMatch.player1 === winner) nextMatch.player1 = null;
    if (nextMatch.player2 === winner) nextMatch.player2 = null;

    if (nextMatch.gameId) {
      await DartsGame.deleteOne({ _id: nextMatch.gameId });
      nextMatch.gameId = null;
    }

    nextMatch.status = "pending";
    nextMatch.winner = null;

    await nextMatch.save();
  }

  async _revertFFAStandings(tournament, match, winner) {
    const p1 = tournament.standings.find(s => s.player === match.player1);
    const p2 = tournament.standings.find(s => s.player === match.player2);

    if (p1) p1.matchesPlayed -= 1;
    if (p2) p2.matchesPlayed -= 1;

    const winPlayer = tournament.standings.find(s => s.player === winner);
    if (winPlayer) winPlayer.wins -= 1;

    await tournament.save();
  }

  async _initializeGameForMatch(tournament, match) {
    let p1 = await DartsUser.findOne({ displayName: match.player1 });
    let p2 = await DartsUser.findOne({ displayName: match.player2 });

    if (!p1) p1 = { displayName: match.player1 || "Player 1", _id: generateTempUserId() };
    if (!p2) p2 = { displayName: match.player2 || "Player 2", _id: generateTempUserId() };

    const gameUsers = getInitialUsersGameState([p1, p2], tournament.settings.startPoints, false);

    const newGame = new DartsGame({
      gameCode: await generateUniqueDartsCode(),
      gameMode: tournament.settings.gameMode,
      startPoints: tournament.settings.startPoints,
      checkOut: tournament.settings.checkOut,
      legs: tournament.settings.legs,
      sets: tournament.settings.sets,
      created_by: tournament.admin,
      podiums: 1,
      users: gameUsers,
      legStarterIndex: 0,
      record: [],
      turn: gameUsers[0].displayName,
      round: 1,
      active: true,
      tournamentId: tournament._id,
      tournamentMatchId: match._id
    });

    return await newGame.save();
  }
}

module.exports = new DartsTournamentManager();