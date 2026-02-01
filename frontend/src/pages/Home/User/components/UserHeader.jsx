import CopyTextButton from "@/components/Home/CopyTextButton";
import MyTooltip from "@/components/Home/MyComponents/MyTooltip";
import { Badge } from "@/components/ui/shadcn/badge";
import { Copy } from "lucide-react";

function UserHeader({ user, isOwnProfile }) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-4xl font-bold">{user.displayName}</h1>
          {user.verified && (
            <Badge className="bg-blue-600">Verified</Badge>
          )}
          {user.online && (
            <Badge className="bg-green-600">Online</Badge>
          )}
          {user.role === "admin" && (
            <Badge className="bg-purple-600">Admin</Badge>
          )}
        </div>
        <div className='flex gap-1'>
          <p className="text-gray-400">Friends Code: {user.friendsCode}</p>
          <CopyTextButton textToCopy={user.friendsCode} toastTitle="Code copied" toastDesc="Code copied to clipboard">
            <MyTooltip title="Copy code to clipboard">
              <Copy height={15} />
            </MyTooltip>
          </CopyTextButton>
        </div>
        {isOwnProfile && (
          <p className="text-gray-400 text-sm mt-1">{user.email}</p>
        )}
      </div>
    </div>
  );
}

export default UserHeader;
