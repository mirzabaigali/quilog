import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import mainLogo1 from "../assets/signuplogo.png";
import eye from "../assets/circum_read.svg";
import plus from "../assets/ic-baseline-plus.svg";
import { Link, useNavigate } from "react-router-dom";
import "./Main.css";
import scrollToTop from "../utilities/ScrollToTop";
const Main = () => {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  const handleCreate = () => {
    navigate("/createblog");
  };

  useEffect(() => {
    scrollToTop();
    const alertShownSession = sessionStorage.getItem("alertShown");
    const alertShownLocal = localStorage.getItem("alertShown");

    if (!alertShownSession && !alertShownLocal && token) {
      setShowAlert(true);
      sessionStorage.setItem("alertShown", "true");
      localStorage.setItem("alertShown", "true");
    }
  }, [token]);

  return (
    <>
      <Navbar />
      <div className="container">
        {showAlert && (
          <div
            className="alert alert-info alert-dismissible fade show mt-2"
            role="alert"
          >
            <p>
              Please update your{" "}
              <Link to="/profile" className="alert-link">
                profile
              </Link>{" "}
              to add your social media handles and connect with your followers.
              This will help you stay informed about their latest posts and
              engage with them. If you have already updated your profile, please
              ignore this message.
            </p>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
              onClick={() => setShowAlert(false)}
            ></button>
          </div>
        )}
        <div className="main-wrapper">
          <div className="main-content ">
            <p className="main-text">
              "The secret to getting ahead is getting started."
            </p>
          </div>
          <div className="row readbtncontent">
            <div className="col-6  d-flex flex-column justify-content-center align-items-center">
              {token && (
                <button className="readBtn mb-5" onClick={handleCreate}>
                  <img src={plus} alt="eye" className="img-fluid eye" />
                  Create Blog
                </button>
              )}
              <button className="readBtn" onClick={() => navigate("/feed")}>
                <img src={eye} alt="eye" className="img-fluid eye" />
                Read Blog
              </button>
            </div>
            <div className="col-6 ">
              <img src={mainLogo1} alt="logo" className="img-fluid" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Main;
