//start
import React, { useEffect, useState } from "react";
import logo from "../assets/fluent-mdl2_blog.png";
import user from "../assets/mdi_user.svg";
import circle from "../assets/Ellipse 2.svg";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-client/config";
import { doc, getDoc } from "firebase/firestore";
import "./Navbar.css";
import Skeleton from "../utilities/Skeleton";

const Navbar = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const userAuth = auth?.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        try {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserInfo(data);
          } else {
            console.error("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, [auth?.currentUser?.displayName]);

  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  const userDataString =
    sessionStorage.getItem("userData") || localStorage.getItem("userData");

  const userData = userDataString ? JSON.parse(userDataString) : null;

  const handleLogout = () => {
    auth.signOut().then(() => {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userData");
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      sessionStorage.removeItem("alertShown");
      localStorage.removeItem("alertShown");
      navigate("/login");
    });
  };

  return (
    <div className="container-fluid border-cust">
      <div className="container">
        <nav className="navbar">
          <Link to="/" className="navbar-brand">
            <img src={logo} alt="logo" className="img-fluid logo" />
            <span className="logo-text">Quilog</span>
          </Link>
          <div className="d-flex align-items-center gap-2">
            {token ? (
              <span
                className="mainLoginSign"
                onClick={() => navigate("/profile")}
              >
                {loading ? (
                  <Skeleton width="100px" height="20px" />
                ) : (
                  `Hey, ${userInfo?.name || userData?.name}`
                )}
              </span>
            ) : (
              <span
                className="mainLoginSign"
                onClick={() => navigate("/login")}
              >
                login or Signup
              </span>
            )}
            <div className="image-container">
              <img src={circle} alt="circle" className="circle" />
              {token ? (
                <>
                  <img
                    src={userAuth?.photoURL || userInfo?.photo || user}
                    alt="user image"
                    className="user dropdown dropdown-toggle"
                    style={{ cursor: "pointer" }}
                    id="dropdownMenu2"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  />
                  <ul
                    className="dropdown-menu fs-2"
                    aria-labelledby="dropdownMenu2"
                  >
                    <li>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={() => navigate("/profile")}
                      >
                        My Profile
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={() => navigate("/my-blogs")}
                      >
                        My Blogs
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={() => navigate("/settings")}
                      >
                        Settings
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </>
              ) : (
                <img
                  src={userInfo?.photo || user}
                  alt="profile"
                  className="user1"
                />
              )}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
