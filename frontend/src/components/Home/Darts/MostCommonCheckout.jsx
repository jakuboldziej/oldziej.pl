import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { Target, TrendingUp } from "lucide-react";
import { checkoutCombinations } from "./game logic/userUtils";
import MyTooltip from "../MyComponents/MyTooltip";

function MostCommonCheckout({ users, game, compact = false, showForUser = null }) {
  const usersToShow = showForUser ? [users.find(u => u._id === showForUser || u.displayName === showForUser)] : users;

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
      <div className="flex flex-col gap-1.5 w-full">
        {usersWithCheckouts.map((user, idx) => {
          const checkoutOptions = checkoutCombinations[user.points];
          const primaryCheckout = checkoutOptions[0];
          const colorClass = getCheckoutColor(user.points);

          return (
            <div key={idx} className="flex items-center justify-between gap-1.5 text-white bg-gray-800 px-1.5 py-1.5 rounded border border-gray-700">
              <div className="flex items-center gap-1 min-w-0 flex-shrink">
                <Target className={colorClass.split(' ')[0]} size={14} />
                <span className="text-[10px] font-semibold truncate max-w-[60px]">{user.displayName}</span>
                <Badge variant="outline" className={`${colorClass} text-[9px] px-1 py-0 leading-tight`}>
                  {user.points}
                </Badge>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {primaryCheckout.combo.map((dart, i) => (
                  <span key={i} className="flex items-center">
                    {i > 0 && <span className="text-gray-500 mx-0.5 text-xs">→</span>}
                    <Badge variant="secondary" className="text-[9px] font-mono px-1 py-0 leading-tight">
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
                  <Badge variant="outline" className={`${colorClass} text-sm sm:text-lg px-2 sm:px-3 py-0.5 sm:py-1 flex-shrink-0`}>
                    {user.points}
                  </Badge>
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
