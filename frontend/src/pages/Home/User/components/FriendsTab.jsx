import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";

function FriendsTab({ friends, isOwnProfile }) {
  if (friends.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-10 text-center text-gray-400">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{isOwnProfile ? "You haven't" : "This user hasn't"} added any friends yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {friends.map((friend) => (
        <Link key={friend.displayName} to={`/user/${friend.displayName}`}>
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>{friend.displayName}</span>
                {friend.online && (
                  <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                )}
              </CardTitle>
              {friend.verified && (
                <Badge className="bg-blue-600 w-fit">Verified</Badge>
              )}
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default FriendsTab;
