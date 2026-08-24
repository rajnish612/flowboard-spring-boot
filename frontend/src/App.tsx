import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./components/workspace/Home";
import Boards from "./components/workspace/sections/Boards";
import Board from "./components/board/Board";
import Login from "./components/Login";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route path="oauth-success" element={<Login />} />
        <Route path="home" element={<Home />}>
          <Route path="boards" element={<Boards/>} />
        </Route>
        <Route path="board/:boardId" element={<Board />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
