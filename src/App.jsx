import "./App.css";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import { Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import Feed from "./pages/Feed";
import PageNotFound from "./pages/PageNotFound";
import PrivateRoute from "./pages/PrivateRoute";
import CreateaBlog from "./pages/CreateaBlog";
import { useEffect } from "react";
import scrollToTop from "./utilities/ScrollToTop";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import MyBlogs from "./pages/MyBlogs";
function App() {
  useEffect(() => {
    scrollToTop();
  }, []);
  return (
    <>
      <div className="app">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/feed" element={<PrivateRoute element={<Feed />} />} />
          <Route path="/feed/:id" element={<PrivateRoute element={<Feed />} />} />
          <Route
            path="/my-blogs"
            element={<PrivateRoute element={<MyBlogs />} />}
          />
          <Route
            path="/settings"
            element={<PrivateRoute element={<Settings />} />}
          />

          <Route
            path="/createblog"
            element={<PrivateRoute element={<CreateaBlog />} />}
          />
          <Route
            path="/createblog/:blogId"
            element={<PrivateRoute element={<CreateaBlog />} />}
          />
          <Route
            path="/profile"
            element={<PrivateRoute element={<Profile />} />}
          />
          <Route
            path="/profile/:userId"
            element={<PrivateRoute element={<Profile />} />}
          />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
