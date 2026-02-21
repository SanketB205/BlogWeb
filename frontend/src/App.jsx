import './App.css'
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { UserContextProvider } from "./context/UserContext";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";
import EditPost from "./pages/EditPost";
import ProfilePage from "./pages/ProfilePage";
import TrendingPage from "./pages/TrendingPage";

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/edit/:id" element={<EditPost />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/trending" element={<TrendingPage />} />
        </Route>
      </Routes>
    </UserContextProvider>
  )
}

export default App
