import { useAuth } from '@/hooks/useAuth';

export function UserInfo() {
  const { user, isLoading, error, isLoggedIn, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!isLoggedIn) return <div>Please log in</div>;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center gap-4">
        {user?.profilePic && (
          <img src={user.profilePic} alt={user.name} className="w-12 h-12 rounded-full" />
        )}
        <div>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
          <p className="text-sm">
            Role: <span className="font-medium">{user?.role}</span>
          </p>
          <p className="text-sm">
            Major: <span className="font-medium">{user?.major}</span>
          </p>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => logout()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
