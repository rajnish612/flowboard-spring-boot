import { BrowserRouter, Routes, Route } from "react-router";
import Boards from "./components/workspace/contents/Boards";
import Board from "./components/board/Board";
import Login from "./components/Login";
import { AuthProvider } from "./providers/AuthProvider";
import Dashboard from "./components/workspace/Dashboard";
import { ProtectedRoute } from "./wrappers/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Login page route */}
          <Route path="/" element={<Login />} />
          <Route path="login" element={<Login />} />
          {/* redirect route after successful login */}
          <Route path="oauth-success" element={<Login />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                {" "}
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route path="boards/:workspaceId" element={<Boards />} />
          </Route>
          <Route path="board/:boardId" element={<Board />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
