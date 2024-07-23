import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { auth, db } from "../firebase-client/config";
import { doc, updateDoc } from "firebase/firestore";
import showToast from "../utilities/Toast";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  updatePassword,
  updateEmail,
  sendEmailVerification,
} from "firebase/auth";

const EditProfileModal = ({ showModal, handleClose }) => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    linkedin: "",
    instagram: "",
    twitter: "",
    facebook: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  
  const updateEmailAndSendVerification = async (newEmail) => {
    try {
      const user = auth.currentUser;
      await updateEmail(user, newEmail);
      await sendEmailVerification(user);
      showToast(
        "Verification email sent to your new address. Please check your inbox.",
        "info"
      );
      showToast(
        "Please verify your new email address. Once verified, log in again to complete the process.",
        "info"
      );
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    }
  };

  const updatePasswordOnly = async (newPassword) => {
    try {
      const user = auth.currentUser;
      await updatePassword(user, newPassword);
      showToast("Password updated successfully!", "success");
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    }
  };

  const updateProfileInFirestore = async (updateData) => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        await updateDoc(doc(db, "users", userId), updateData);
      }
    } catch (error) {
      showToast(`Error updating profile: ${error.message}`, "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newEmail = userData.email;
    const newPassword = userData.password;

    // Create an object with only defined fields
    const updateData = {
      name: userData.name,
      phone: userData.phone,
      linkedin: userData.linkedin,
      instagram: userData.instagram,
      twitter: userData.twitter,
      facebook: userData.facebook,
      profession: userData.profession,
    };

    // Remove fields with undefined values
    Object.keys(updateData).forEach((key) =>
      updateData[key] === undefined ? delete updateData[key] : {}
    );

    try {
      setLoading(true);

      // Handle email update if a new email is provided
      if (newEmail && newEmail !== auth.currentUser.email) {
        await updateProfileInFirestore(updateData); // Update Firestore with new profile data
        await updateEmailAndSendVerification(newEmail); // Update email and send verification
      } else {
        // If no new email, just update the password if provided
        if (newPassword) {
          await updatePasswordOnly(newPassword);
        } else {
          await updateProfileInFirestore(updateData); // Update Firestore with new profile data
          showToast("Profile updated successfully!", "success");
          await auth.signOut();
          navigate("/login");
        }
      }
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
                className="fs-4"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email. If left blank, the current email will be used."
                value={userData.email}
                onChange={handleChange}
                className="fs-4"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="textarea">
              <Form.Label>Profession</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="profession"
                value={userData.profession}
                onChange={handleChange}
                className="fs-4"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter new password. If left blank, the current password will be used."
                value={userData.password}
                onChange={handleChange}
                className="fs-4"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="phone">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={handleChange}
                className="fs-4"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="linkedin">
              <Form.Label>LinkedIn</Form.Label>
              <Form.Control
                type="text"
                name="linkedin"
                value={userData.linkedin}
                onChange={handleChange}
                className="fs-4"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="instagram">
              <Form.Label>Instagram</Form.Label>
              <Form.Control
                type="text"
                name="instagram"
                value={userData.instagram}
                onChange={handleChange}
                className="fs-4"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="twitter">
              <Form.Label>Twitter</Form.Label>
              <Form.Control
                type="text"
                name="twitter"
                value={userData.twitter}
                onChange={handleChange}
                className="fs-4"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="facebook">
              <Form.Label>Facebook</Form.Label>
              <Form.Control
                type="text"
                name="facebook"
                value={userData.facebook}
                onChange={handleChange}
                className="fs-4"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} className="btn-lg">
            Close
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-lg"
          >
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditProfileModal;
