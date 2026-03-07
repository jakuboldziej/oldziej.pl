import { getDartsGame } from '@/lib/fetch';
import React from 'react';
import { Trophy, Play } from 'lucide-react';
import { ensureGameRecord } from '@/lib/recordUtils';

function MatchCard({ match, navigate }) {
  const isCompleted = match.status === 'completed';
  const isActive = match.status === 'active';

  const handleActiveGameClick = async (e) => {
    e.preventDefault();

    try {
      if (!isActive && !isCompleted) return;

      const fullGame = await getDartsGame(match.gameId);
      const gameWithRecord = ensureGameRecord(fullGame);
      localStorage.setItem('dartsGame', JSON.stringify(gameWithRecord));
      navigate('/darts/game');
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border mb-4 transition-all ${isActive ? 'cursor-pointer  border-green-500 bg-green-500/10 shadow-lg' :
        isCompleted ? 'cursor-pointer border-gray-800 bg-gray-900/40 opacity-70' : 'border-gray-800 bg-gray-900/20'
        }`}
      onClick={(e) => handleActiveGameClick(e)}
    >
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className={`text-sm ${match.winner === match.player1 ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
            {match.player1 || <span className="text-gray-600 italic font-light">TBD</span>}
          </span>
          {match.winner === match.player1 && <Trophy size={14} className="text-yellow-500" />}
        </div>

        <div className="border-t border-gray-800 my-2"></div>

        <div className="flex justify-between items-center">
          <span className={`text-sm ${match.winner === match.player2 ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
            {match.player2 || <span className="text-gray-600 italic font-light">TBD</span>}
          </span>
          {match.winner === match.player2 && <Trophy size={14} className="text-yellow-500" />}
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center">
        <span className="text-[10px] uppercase text-gray-500 px-2 py-0.5 bg-black/40 rounded border border-gray-800">
          {match.status}
        </span>

        {isActive && match.gameCode && (
          <button
            onClick={() => navigate(`/game/${match.gameCode}`)}
            className="flex items-center gap-1 text-[11px] font-black text-green-500 hover:text-green-400"
          >
            <Play size={10} fill="currentColor" /> JOIN
          </button>
        )}
      </div>
    </div>
  );
};

export default MatchCard;