import React, { useState } from "react";
import { auth, db } from "../firebase-client/config";
import { doc, updateDoc } from "firebase/firestore";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateEmail,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";

import "./Settings.css"; // Create this CSS file for styling
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import showToast from "../utilities/Toast";

const Settings = () => {
  const user = auth.currentUser;
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(null);
  const navigate = useNavigate();

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (user) {
        const auth = getAuth();

        // Check if email is verified
        if (!user.emailVerified) {
          setError(
            "Please verify your current email address before changing it."
          );
          setLoading(false);
          return;
        }

        // Update profile info
        if (name !== user.displayName) {
          await updateProfile(user, { displayName: name });
        }

        // Update user email
        if (email !== user.email) {
          await updateEmail(user, email);
          await sendEmailVerification(user);
          setSuccess(
            "Profile updated successfully. Please check your new email for a verification link."
          );
        } else {
          // Update Firestore document if email hasn't changed
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { name: name, email: email });
          setSuccess("Profile updated successfully.");
        }
      }
    } catch (err) {
      setError("Failed to update profile. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      showToast("No user is currently logged in.", "error");
      return;
    }

    if (currentPassword === "" || newPassword === "") {
      setError("Please enter current and new passwords.");
      setLoading(false);
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password cannot be the same as the current one.");
      setLoading(false);
      return;
    }

    if (passwordStrength < 6) {
      setError("New password is too weak. Please choose a stronger password.");
      setLoading(false);
      return;
    }

    try {
      const credentials = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credentials);
      await updatePassword(user, newPassword);
      showToast("Password updated successfully!", "success");
      await auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="settings-container">
        <h1>Settings</h1>
        <form onSubmit={handleProfileUpdate} className="settings-form fs-4">
          <h2>Profile Information</h2>
          <div className="form-group1 ">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group1">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="button1" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </button>
          {success && <p className="success-message">{success}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>

        <form onSubmit={handlePasswordChange} className="settings-form fs-4">
          <h2>Change Password</h2>
          <div className="form-group1">
            <label htmlFor="current-password">Current Password</label>
            <input
              type="password"
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group1">
            <label htmlFor="new-password">New Password</label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordStrength(e.target.value);
              }}
              required
            />
          </div>
          <button
            type="submit"
            className="button1 btn btn-primary btn-lg p-3"
            disabled={loading}
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
          {success && <p className="success-message">{success}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </>
  );
};

export default Settings;
