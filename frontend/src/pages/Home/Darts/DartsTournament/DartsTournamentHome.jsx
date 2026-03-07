import { getDartsTournament } from '@/lib/fetch';
import { socket } from '@/lib/socketio';
import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Shield } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/shadcn/button';
import { AuthContext } from '@/context/Home/AuthContext';
import MatchCard from '@/components/Admin/Darts/DartsTournament/MatchCard';

function DartsTournamentHome() {
  const { currentUser } = useContext(AuthContext);

  const { tournamentCode } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = tournament?.admin === currentUser?.displayName;

  const isFFA = tournament?.settings?.type === "ffa";
  const isBracket = tournament?.settings?.type === "bracket";

  const standings = useMemo(() => {
    if (!isFFA || !matches.length) return [];

    const stats = {};

    tournament.participants.forEach(p => {
      stats[p] = {
        player: p,
        wins: 0,
        matchesPlayed: 0
      };
    });

    matches.forEach(m => {
      if (m.status === "completed") {
        if (stats[m.player1]) stats[m.player1].matchesPlayed++;
        if (stats[m.player2]) stats[m.player2].matchesPlayed++;

        if (m.winner && stats[m.winner]) {
          stats[m.winner].wins++;
        }
      }
    });

    return Object.values(stats)
      .map(p => ({
        ...p,
        winRate: p.matchesPlayed
          ? ((p.wins / p.matchesPlayed) * 100).toFixed(1)
          : 0
      }))
      .sort((a, b) => b.wins - a.wins);

  }, [matches, tournament, isFFA]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedTournament = await getDartsTournament(tournamentCode);
        if (fetchedTournament.message) throw new Error(fetchedTournament.message);

        setTournament(fetchedTournament);
        setMatches(fetchedTournament.matches);

        socket.emit("joinTournamentControl", fetchedTournament.tournamentCode);

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    socket.on("tournamentUpdated", (updatedData) => {
      setTournament(updatedData);
      setMatches(updatedData.matches);
    });

    return () => {
      socket.emit("leaveTournamentControl", tournamentCode);
      socket.off("tournamentUpdated");
    };
  }, [tournamentCode]);

  const rounds = useMemo(() => {
    const grouped = matches.reduce((acc, match) => {
      const r = match.round || 1;
      if (!acc[r]) acc[r] = [];
      acc[r].push(match);
      return acc;
    }, {});
    return Object.keys(grouped).sort().map(r => grouped[r]);
  }, [matches]);

  const myActiveMatch = currentUser && matches.find(m =>
    m.status === 'active' &&
    (m.player1 === currentUser.displayName || m.player2 === currentUser.displayName)
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 justify-center items-center h-screen text-white">
        <span className="text-2xl">Loading game...</span>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex flex-col gap-5 justify-center items-center h-screen text-white">
        <span className="text-4xl text-center">Tournament doesn't exist.</span>
        <Link className={`${buttonVariants({ variant: "outline_red" })} glow-button-red`} state={{ createNewTournament: true }} to="/darts">Create New One</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8">
      <header className="mb-10 border-b border-green-900 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-green-500 tracking-tighter uppercase mb-2 neon-text">
            {tournament.name}
          </h1>
          <div className="flex gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Shield size={14} /> Admin: {tournament.admin}</span>
            <span className="flex items-center gap-1"><Users size={14} /> Participants: {tournament.participants?.length}</span>
            <span className={`px-2 py-0.5 rounded text-xs uppercase ${tournament.status === 'in_progress' ? 'bg-green-900 text-green-300' : 'bg-gray-800'}`}>
              {tournament.status}
            </span>
          </div>
        </div>
        <div className="text-right hidden md:block text-gray-500 text-xs">
          Tournament Code: <span className="text-green-700 font-mono">{tournamentCode}</span>
        </div>
      </header>

      {myActiveMatch && (
        <div className="mb-8 p-4 bg-green-600/20 border border-green-500 rounded-lg flex justify-between items-center animate-pulse">
          <div className='flex flex-col gap-3'>
            <h3 className="text-green-400 font-bold uppercase italic">Your match is live!</h3>
            <p className="text-sm">You are playing against {myActiveMatch.player1 === currentUser.displayName ? myActiveMatch.player2 : myActiveMatch.player1}</p>
            <Button className="w-fit" onClick={() => navigate('/darts/game')}>Join game</Button>
          </div>
          <button
            onClick={() => navigate(`/game/${myActiveMatch.gameId?.gameCode}`)}
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-6 rounded transition-all"
          >
            JOIN NOW
          </button>
        </div>
      )}

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 overflow-x-auto pb-6">

          {isBracket && (
            <div className="flex gap-12 min-w-[800px]">
              {rounds.map((roundMatches, roundIdx) => (
                <div key={roundIdx} className="flex-1 flex flex-col justify-around gap-4">
                  <h4 className="text-center text-xs font-bold text-gray-600 uppercase mb-4 tracking-widest">
                    Round {roundIdx + 1}
                  </h4>

                  {roundMatches
                    .sort((a, b) => a.matchIndex - b.matchIndex)
                    .map((match, mIdx) => (
                      <MatchCard key={mIdx} match={match} navigate={navigate} />
                    ))}
                </div>
              ))}
            </div>
          )}

          {isFFA && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {matches
                .sort((a, b) => a.matchIndex - b.matchIndex)
                .map((match, mIdx) => (
                  <MatchCard key={mIdx} match={match} navigate={navigate} />
                ))}
            </div>
          )}

        </div>

        <aside className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl">
            <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2">
              <Users size={16} className="text-green-500" /> Participants
            </h3>
            <div className="space-y-2">
              {tournament.participants?.map((p, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded bg-gray-800/30 text-sm">
                  <span>{p}</span>
                  {p === tournament.admin && <Shield size={12} className="text-yellow-500" title="Admin" />}
                </div>
              ))}
            </div>
          </div>

          {tournament.status === "completed" && isFFA && standings[0] && (
            <div className="mb-6 p-4 border border-yellow-600 bg-yellow-900/20 rounded-lg text-center">
              <h2 className="text-xl font-bold text-yellow-400">
                🏆 Winner: {standings[0].player}
              </h2>
              <p className="text-sm text-gray-400">
                {standings[0].wins} wins
              </p>
            </div>
          )}

          {isFFA && standings.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl">
              <h3 className="text-sm font-bold uppercase mb-4 text-green-400">
                Leaderboard
              </h3>

              <table className="w-full text-sm">
                <thead className="text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="text-left">Player</th>
                    <th>W</th>
                    <th>P</th>
                    <th>%</th>
                  </tr>
                </thead>

                <tbody>
                  {standings.map((p, i) => (
                    <tr
                      key={p.player}
                      className={`border-t border-gray-800 ${i === 0 ? "text-green-400 font-bold" : ""
                        }`}
                    >
                      <td>{p.player}</td>
                      <td className="text-center">{p.wins}</td>
                      <td className="text-center">{p.matchesPlayed}</td>
                      <td className="text-center">{p.winRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isAdmin && (
            <div className="bg-red-950/20 border border-red-900 p-4 rounded-xl">
              <h3 className="text-sm font-bold uppercase mb-4 text-red-500 flex items-center gap-2">
                <Shield size={16} /> Admin Panel
              </h3>
              <div className="flex flex-col gap-2">
                <button className="w-full text-left p-2 hover:bg-red-900/40 text-xs rounded border border-red-900/50 transition-colors">
                  Pause Tournament
                </button>
                <button className="w-full text-left p-2 hover:bg-red-900/40 text-xs rounded border border-red-900/50 transition-colors">
                  Reset Current Round
                </button>
              </div>
            </div>
          )}

          {tournament.status === "completed" && (
            <div className="w-full flex justify-center">
              <Link className={`${buttonVariants({ variant: "outline_green" })} glow-button-green`} to="/darts">Back to Darts</Link>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}



export default DartsTournamentHome;