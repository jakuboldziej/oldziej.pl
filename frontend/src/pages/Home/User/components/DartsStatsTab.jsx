import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Trophy, Target } from "lucide-react";

function DartsStatsTab({ dartsUser }) {
  if (!dartsUser) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-10 text-center text-gray-400">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No darts statistics available for this user yet.</p>
        </CardContent>
      </Card>
    );
  }

  const totalThrows = 
    dartsUser.throws.normal + 
    dartsUser.throws.doubles + 
    dartsUser.throws.triples + 
    dartsUser.throws.doors;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Podium Finishes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">🥇 First Place</span>
              <span className="text-2xl font-bold text-yellow-400">{dartsUser.podiums.firstPlace}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">🥈 Second Place</span>
              <span className="text-2xl font-bold text-gray-300">{dartsUser.podiums.secondPlace}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">🥉 Third Place</span>
              <span className="text-2xl font-bold text-orange-400">{dartsUser.podiums.thirdPlace}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5" />
              Personal Bests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Highest Avg</span>
              <span className="text-2xl font-bold text-green-400">{dartsUser.highestEndingAvg.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Highest Turn</span>
              <span className="text-2xl font-bold text-blue-400">{dartsUser.highestTurnPoints}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Highest Checkout</span>
              <span className="text-2xl font-bold text-purple-400">{dartsUser.highestCheckout}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Throw Statistics</CardTitle>
          <CardDescription>Total throws: {totalThrows}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{dartsUser.throws.normal}</div>
              <div className="text-sm text-gray-400">Normal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{dartsUser.throws.doubles}</div>
              <div className="text-sm text-gray-400">Doubles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{dartsUser.throws.triples}</div>
              <div className="text-sm text-gray-400">Triples</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{dartsUser.throws.doors}</div>
              <div className="text-sm text-gray-400">Doors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{dartsUser.throws.overthrows}</div>
              <div className="text-sm text-gray-400">Overthrows</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Overall Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Points Scored</span>
              <span className="text-white font-semibold">{dartsUser.overAllPoints.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Average Points per Game</span>
              <span className="text-white font-semibold">
                {dartsUser.gamesPlayed > 0 ? (dartsUser.overAllPoints / dartsUser.gamesPlayed).toFixed(0) : 0}
              </span>
            </div>
            {totalThrows > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Double Rate</span>
                  <span className="text-white font-semibold">
                    {((dartsUser.throws.doubles / totalThrows) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Triple Rate</span>
                  <span className="text-white font-semibold">
                    {((dartsUser.throws.triples / totalThrows) * 100).toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DartsStatsTab;
