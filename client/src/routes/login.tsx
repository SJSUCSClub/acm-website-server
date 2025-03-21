import { createFileRoute } from '@tanstack/react-router';
import SignIn from '../pages/LogIn';

export const Route = createFileRoute('/login')({
  component: SignIn,
});

function LoginRouteComponent() {
  const { isLoggedIn, isLoading } = useAuth();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setAuthenticated(isLoggedIn);
    }
  }, [isLoggedIn, isLoading]);

  if (isLoading || authenticated === null) {
    return null;
  }

  if (authenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <SignIn />;
}
