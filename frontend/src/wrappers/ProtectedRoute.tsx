import { Navigate } from "react-router";
import { useAuth } from "../hooks/UseAuth";

// Protects routes that require an authenticated user.
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Wait for the authentication check to finish.
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect unauthenticated users to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected page for authenticated users.
  return children;
}
