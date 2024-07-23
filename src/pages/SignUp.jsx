import React, { useEffect, useState } from "react";
import logo from "../assets/fluent-mdl2_blog.png";
import mainLogo from "../assets/signuplogo.png";
import google from "../assets/devicon_google.svg";
import { useNavigate } from "react-router-dom";
import { auth, db, googleProvider } from "../firebase-client/config";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import showToast from "../utilities/Toast";
import "./SignUp.css";
import Loading from "../utilities/Loading";
import scrollToTop from "../utilities/ScrollToTop";
const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { name, email, password } = formData;
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password || !name) {
        showToast("Please fill all fields", "warning");
        return;
      }
      if (password.length < 6) {
        showToast("Password should be at least 6 characters long", "warning");
        return;
      }
      if (!/^\S+@\S+\.\S+$/i.test(email)) {
        showToast("Please enter a valid email address", "warning");
        return;
      }
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          name: name,
          email: email,
        });
        showToast("Account created successfully!", "success");
        navigate("/login");
        setFormData({ name: "", email: "", password: "" });
      } else {
        throw new Error("User not authenticated.");
      }
    } catch (error) {
      // console.error("Error:", error.code, error.message, error);
      showToast(`${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };
  // google provideer
  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);

      // Extract the user from the result
      const user = result.user;

      // Store the token and user data in sessionStorage
      sessionStorage.setItem("token", user.accessToken);
      sessionStorage.setItem(
        "userData",
        JSON.stringify({
          name: user.displayName || "No Name",
          email: user.email,
          photo: user.photoURL || null,
        })
      );
      console.log("-------------------->", result);

      if (user) {
        // Optionally, save user info to Firestore
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName || "No Name",
          email: user.email,
          photo: user.photoURL,
        });

        showToast(`Welcome back, ${user.displayName || "User"}`, "success");
        navigate("/"); // Redirect after successful sign-up
      }
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
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
      <div className="container">
        <div className="row form-wrapper">
          <div className="col-md-6 form-block mt-5 mb-5">
            <p className="create-acc">Create an account</p>
            <h1 className="create-text">Let’s blog it with Quilog</h1>
            <form
              action=""
              className="d-flex flex-column justify-content-sm-start "
            >
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Name"
                className="input-border-bottom"
                value={name}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                className="input-border-bottom"
                value={email}
                onChange={handleChange}
              />
              <input
                className="input-border-bottom"
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={handleChange}
              />
              <div className="text-center mb-5">
                <button
                  className={loading ? "btn-wrapper load-ani" : "btn-wrapper"}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? <Loading /> : "Create account"}
                  {/* Create account */}
                </button>
              </div>
              <div className="text-center mb-5">
                <button
                  className="btn-wrapper"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                >
                  <img src={google} alt="Google" className="img-fluid mx-2" />
                  Sign up with google
                </button>
              </div>
              <div className="text-center">
                <p className="already">
                  Already have account?{" "}
                  <span className="log" onClick={() => navigate("/login")}>
                    Login
                  </span>{" "}
                </p>
              </div>
            </form>
          </div>
          <div className="col-md-6 img-block mt-5 mb-5 order-first order-md-0">
            <p className="mainLogo-text offset-1 ">Let’s Blog it</p>
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

export default SignUp;
