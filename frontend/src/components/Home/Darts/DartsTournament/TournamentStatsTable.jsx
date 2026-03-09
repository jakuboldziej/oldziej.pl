import { Grip } from "lucide-react";

const TournamentStatsTable = ({ stats }) => (
  <div className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden mt-12">
    <div className="p-4 border-b border-gray-800 bg-gray-900/60">
      <h3 className="text-lg font-bold text-green-500 uppercase tracking-wider flex items-center gap-2">
        <Grip size={18} /> Tournament Statistics
      </h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-black/40 text-gray-500">
          <tr>
            <th className="px-6 py-3">Rank</th>
            <th className="px-6 py-3">Player</th>
            <th className="px-6 py-3 text-center">Wins</th>
            <th className="px-6 py-3 text-center">Played</th>
            <th className="px-6 py-3 text-center text-green-400">Best Checkout</th>
            <th className="px-6 py-3 text-center text-blue-400">Best Avg</th>
            <th className="px-6 py-3 text-center">Win Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {stats.map((p, i) => (
            <tr key={p.player} className="hover:bg-green-500/5 transition-colors">
              <td className="px-6 py-4 font-mono text-gray-500">{i + 1}</td>
              <td className="px-6 py-4 font-bold text-gray-100">{p.player}</td>
              <td className="px-6 py-4 text-center">{p.wins}</td>
              <td className="px-6 py-4 text-center text-gray-400">{p.matchesPlayed}</td>
              <td className="px-6 py-4 text-center font-bold text-green-500">
                {p.highestCheckout > 0 ? p.highestCheckout : '-'}
              </td>
              <td className="px-6 py-4 text-center font-bold text-blue-400">
                {parseFloat(p.highestAvg).toFixed(2)}
              </td>
              <td className="px-6 py-4 text-center">
                {p.matchesPlayed > 0
                  ? ((p.wins / p.matchesPlayed) * 100).toFixed(1) + '%'
                  : '0%'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default TournamentStatsTable;