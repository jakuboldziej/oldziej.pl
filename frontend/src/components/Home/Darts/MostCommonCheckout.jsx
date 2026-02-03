import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { Target, TrendingUp } from "lucide-react";
import { checkoutCombinations } from "./utils/userUtils";
import MyTooltip from "../MyComponents/MyTooltip";

function MostCommonCheckout({ users, game, compact = false, showForUser = null }) {
  if (game.checkOut !== "Double Out" && game.checkOut !== "Straight Out" && game.checkOut !== "Any Out") {
    return null;
  }

  let usersToShow = users;

  if (showForUser) {
    usersToShow = [users.find(u => u._id === showForUser || u.displayName === showForUser)];
  } else {
    const currentUserIndex = users.findIndex(u => u.turn);
    if (currentUserIndex !== -1 && users.length > 1) {
      const nextUserIndex = (currentUserIndex + 1) % users.length;
      usersToShow = [users[currentUserIndex], users[nextUserIndex]];
    }
  }

  const usersWithCheckouts = usersToShow?.filter(user => {
    const points = user?.points;
    return points >= 2 && points <= 170 && checkoutCombinations[points];
  }) || [];

  if (usersWithCheckouts.length === 0) {
    return null;
  }

  const formatDart = (dart) => {
    if (dart.startsWith('T')) return `T${dart.slice(1)}`;
    if (dart.startsWith('D')) {
      if (dart === 'D25') return 'Bull';
      return `D${dart.slice(1)}`;
    }
    return dart;
  };

  const getCheckoutColor = (points) => {
    if (points >= 100) return 'text-red-400 border-red-400';
    if (points >= 70) return 'text-orange-400 border-orange-400';
    if (points >= 40) return 'text-yellow-400 border-yellow-400';
    return 'text-green-400 border-green-400';
  };

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 w-full">
        {usersWithCheckouts.map((user, idx) => {
          const checkoutOptions = checkoutCombinations[user.points];
          const primaryCheckout = checkoutOptions[0];
          const colorClass = getCheckoutColor(user.points);

          return (
            <div key={idx} className="w-2/3 flex items-center justify-between gap-2 text-white bg-gray-800 px-3 py-2 rounded border border-gray-700">
              <div className="flex items-center gap-2 min-w-0 flex-shrink">
                <Target className={colorClass.split(' ')[0]} size={18} />
                <span className="text-xs sm:text-sm font-semibold truncate max-w-[80px]">{user.displayName}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {primaryCheckout.combo.map((dart, i) => (
                  <span key={i} className="flex items-center">
                    {i > 0 && <span className="text-gray-500 mx-1 text-xs sm:text-sm">→</span>}
                    <Badge variant="secondary" className="text-xs sm:text-sm font-mono px-2 py-0.5">
                      {formatDart(dart)}
                    </Badge>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Target className="text-green-500" size={18} />
          Checkout Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-3 sm:space-y-4">
          {usersWithCheckouts.map((user, idx) => {
            const checkoutOptions = checkoutCombinations[user.points];
            const colorClass = getCheckoutColor(user.points);

            return (
              <div key={idx} className="bg-gray-900 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-700">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-base sm:text-lg font-bold text-white truncate">{user.displayName}</span>
                    {user.turn && (
                      <MyTooltip title="Current turn">
                        <TrendingUp className="text-green-500" size={14} />
                      </MyTooltip>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {checkoutOptions.map((option, optIdx) => (
                    <div key={optIdx} className="bg-gray-800 rounded-md p-2 sm:p-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          {option.combo.map((dart, dartIdx) => (
                            <span key={dartIdx} className="flex items-center">
                              {dartIdx > 0 && <span className="text-gray-500 mx-1 sm:mx-2 text-base sm:text-xl">→</span>}
                              <Badge
                                variant="secondary"
                                className={`text-xs sm:text-base font-mono px-2 sm:px-3 py-0.5 sm:py-1 ${dartIdx === option.combo.length - 1 ? 'bg-green-900 text-green-300' : ''}`}
                              >
                                {formatDart(dart)}
                              </Badge>
                            </span>
                          ))}
                        </div>
                        {checkoutOptions.length > 1 && (
                          <Badge variant="outline" className="text-[10px] sm:text-xs">
                            Option {optIdx + 1}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 pt-2 text-[10px] sm:text-xs text-gray-400">
                  <span className="truncate">Last double must be hit</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {checkoutOptions.length} {checkoutOptions.length === 1 ? 'way' : 'ways'} to checkout
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default MostCommonCheckout;
