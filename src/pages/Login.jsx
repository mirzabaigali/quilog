import React, { useEffect, useState } from "react";
import logo from "../assets/fluent-mdl2_blog.png";
import mainLogo from "../assets/signuplogo.png";
import { useNavigate } from "react-router-dom";
import showToast from "../utilities/Toast";
import { auth, db } from "../firebase-client/config";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Loading from "../utilities/Loading";
import "./SignUp.css";
import "./Login.css";
import scrollToTop from "../utilities/ScrollToTop";
const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      showToast("Please fill all fields", "warning");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      if (rememberMe) {
        localStorage.setItem("token", user.accessToken);
      } else {
        sessionStorage.setItem("token", user.accessToken);
      }
      // sessionStorage.setItem("token", user.accessToken);
      const userDoc = await getDoc(doc(db, "users", user.uid));
      console.log(userDoc);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (rememberMe) {
          localStorage.setItem("userData", JSON.stringify(userData));
        } else {
          sessionStorage.setItem("userData", JSON.stringify(userData));
        }
        // sessionStorage.setItem("userData", JSON.stringify(userData.name));
        showToast(`Welcome back, ${userData.name}!`, "success");
        navigate("/");
      } else {
        showToast("No user data found", "error");
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // password reset
  const handlePasswordReset = async () => {
    const { email } = formData;
    if (!email) {
      showToast("Please enter your email", "warning");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showToast("Password reset email sent! Check your inbox.", "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollToTop();
  }, []);

  return (
    <>
      <div className="container logo-wrapper" onClick={() => navigate("/")}>
        <img src={logo} alt="logo" className="img-fluid logo" />
        <span className="logo-text">Quilog</span>
      </div>
      <div className="container p-4" style={{padding:"10px"}}>
        <div className="row form-wrapper">
          <div className="col-md-6 form-block mt-5 mb-5">
            <p className="create-acc">Welcome</p>
            <h1 className="create-text">Login to your account</h1>
            <form
              action=""
              className="d-flex flex-column justify-content-sm-start "
            >
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter email or phone number"
                className="input-border-bottom"
                value={formData.email}
                onChange={handleChange}
              />
              <input
                className="input-border-bottom"
                type="password"
                name="password"
                id="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
              />
              <div className="text-center mb-5">
                <button
                  className="btn-wrapper"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {/* Login */}
                  {loading ? <Loading /> : "Login"}
                </button>
              </div>
              <div className="d-flex justify-content-center">
                <div className="form-group form-check remember">
                  <div>
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                    />
                    <label
                      className="form-check-label rem-text"
                      htmlFor="rememberMe"
                    >
                      Remember Me
                    </label>
                  </div>
                  <p
                    className=" rem-text mt-3 mt-sm-0"
                    onClick={handlePasswordReset}
                  >
                    Forget Password?
                  </p>
                </div>
              </div>

              <div className="text-center mt-5">
                <p className="already">
                  Don’t have an account?{" "}
                  <span className="log" onClick={() => navigate("/signup")}>
                    Sign up
                  </span>{" "}
                </p>
              </div>
            </form>
          </div>
          <div className="col-md-6 img-block mt-5 mb-5 order-first order-md-0">
            {/* <div className="col-md-6 img-block mt-5 mb-5 d-md-block d-sm-none d-none"> */}
            <p className="mainLogo-text offset-1">Let’s Blog it</p>
            <img
              src={mainLogo}
              alt="logo"
              className="img-fluid mainImg d-md-block d-sm-none d-none"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
