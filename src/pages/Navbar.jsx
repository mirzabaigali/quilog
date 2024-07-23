import React from "react";
import logo from "../assets/fluent-mdl2_blog.png";
import user from "../assets/mdi_user.svg";
import circle from "../assets/Ellipse 2.svg";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-client/config";
import { doc, getDoc } from "firebase/firestore";
import "./Navbar.css";
const Navbar = () => {
  const navigate = useNavigate();
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  const userDataString =
    sessionStorage.getItem("userData") || localStorage.getItem("userData");
  const userData = userDataString ? JSON.parse(userDataString) : null;

  //handle logout
  const handleLogout = () => {
    auth.signOut().then(() => {
      // remove tokens and user data from session storage
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userData");

      // remove tokens and user data from local storage
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      
      // remove alert shown from session storage and local storage

      sessionStorage.removeItem("alertShown");
      localStorage.removeItem("alertShown");

      navigate("/login");
    });
  };

  

  console.log("============>", userDataString);
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
                Hey, {userData.name || userData}
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
              {/* <img
                src={userData?.photo || user}
                alt="profile"
                className="user"
              /> */}
              {token ? (
                <>
                  <img
                    src={userData?.photo || user}
                    alt="profile"
                    className="user dropdown dropdown-toggle"
                    style={{ cursor: "pointer" }}
                    id="dropdownMenu2"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  />
                  <ul className="dropdown-menu fs-2" aria-labelledby="dropdownMenu2">
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
                      <button className="dropdown-item" type="button">
                        My Blogs
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={handleLogout}
                      >
                        logout
                      </button>
                    </li>
                  </ul>
                </>
              ) : (
                <img
                  src={userData?.photo || user}
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
