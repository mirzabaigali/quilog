import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getAuth } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import showToast from "../utilities/Toast";
import { db } from "../firebase-client/config";

const EditProfileModal = ({ showModal, handleClose }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    profession: "",
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

  const auth = getAuth();

  const updateProfileInFirestore = async (updateData) => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        // Remove keys with empty values
        const filteredData = Object.fromEntries(
          Object.entries(updateData).filter(([key, value]) => value !== "")
        );
        await updateDoc(doc(db, "users", userId), filteredData);
      }
    } catch (error) {
      showToast(`Error updating profile: ${error.message}`, "error");
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const user = auth.currentUser;

      if (userData) {
        await updateProfileInFirestore(userData); // Function to handle profile update
      }

      showToast("Profile updated successfully!", "success");

      // Reset form data and close modal
      setUserData({
        name: "",
        email: "",
        password: "",
        phone: "",
        linkedin: "",
        instagram: "",
        twitter: "",
        facebook: "",
        profession: "",
      });
      handleClose();
      navigate("/");
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
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
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="profession">
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
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="btn-lg"
          >
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} className="btn-lg">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProfileModal;
