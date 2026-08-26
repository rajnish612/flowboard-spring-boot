import { useEffect, useState } from "react";
import { AuthContext, type User } from "../context/AuthContext";
import { axiosIns } from "../utils/axiosInstance";

// Provides authentication state to the entire React application.
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check whether the user is already authenticated when the app loads.
  useEffect(() => {
    axiosIns
      .get("/api/auth/profile")
      .then(async (response) => {
        if (!response.data) {
          throw new Error("Not authenticated");
        }

        setUser(response.data);
      })
      .catch(() => {
        // User is not authenticated.
        setUser(null);
      })
      .finally(() => {
        // Authentication check is complete.
        setLoading(false);
      });
  }, []);

  // Log the user out by calling the backend logout endpoint.
  const logout = async () => {
    await axiosIns.get("/api/auth/logout");

    // Clear the user from React state.
    setUser(null);
  };

  // Make authentication state and logout function available to child components.
  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
