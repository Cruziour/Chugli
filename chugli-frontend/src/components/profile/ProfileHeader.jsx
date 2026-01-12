import { memo } from "react";
import { RefreshCw, Mail, Shield, CheckCircle } from "lucide-react";
import Avatar from "@/components/common/Avatar";
import Button from "@/components/common/Button";
import { Skeleton } from "@/components/common/Loader";

const ProfileHeader = memo(({ user, isLoading, onRefresh }) => {
  if (isLoading && !user) {
    return <ProfileHeaderSkeleton />;
  }

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
      {/* Banner */}
      <div className="h-32 bg-linear-to-r from-primary-600 via-primary-500 to-cyan-500 relative">
        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 
                   backdrop-blur-sm rounded-lg transition-colors"
        >
          <RefreshCw
            className={`w-5 h-5 text-white ${isLoading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Profile Info */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="absolute -top-12 left-6">
          <div className="relative">
            <Avatar
              username={user?.username}
              size="xl"
              className="ring-4 ring-dark-800"
            />
            {/* Verified Badge */}
            {user?.isVerified && (
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full 
                            flex items-center justify-center ring-4 ring-dark-800"
              >
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="pt-14">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {user?.username}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-dark-400">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{user?.email}</span>
              </div>
            </div>

            {/* Verification Status */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
              ${
                user?.isVerified
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }`}
            >
              <Shield className="w-4 h-4" />
              {user?.isVerified ? "Verified" : "Not Verified"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Skeleton for loading state
const ProfileHeaderSkeleton = () => (
  <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
    <div className="h-32 bg-dark-700 animate-pulse" />
    <div className="relative px-6 pb-6">
      <div className="absolute -top-12 left-6">
        <div className="w-24 h-24 bg-dark-600 rounded-full animate-pulse ring-4 ring-dark-800" />
      </div>
      <div className="pt-14 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  </div>
);

ProfileHeader.displayName = "ProfileHeader";

export default ProfileHeader;
