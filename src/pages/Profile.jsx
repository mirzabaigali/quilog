import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import EditProfileModal from "./EditProfile";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebase-client/config";
import { useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import whatsapp from "../assets/ic_baseline-whatsapp.svg";
import insta from "../assets/mdi_instagram.svg";
import linke from "../assets/mdi_linkedin.svg";
import twit from "../assets/iconoir_twitter.svg";
import fb from "../assets/circum_facebook.svg";
import showToast from "../utilities/Toast";
import Loading from "../utilities/Loading";
import "./Profile.css";

const Profile = () => {
  const { userId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postCounts, setPostCounts] = useState({ posts: 0, likes: 0 });
  const navigate = useNavigate();
  const authUser = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const targetUserId = userId || user.uid; // Use route parameter or current user ID
        try {
          const userDoc = await getDoc(doc(db, "users", targetUserId));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            await fetchPostCounts(targetUserId); // Fetch post counts
          } else {
            showToast("No such document!");
            navigate("/");
          }
        } catch (error) {
          showToast(error.message, "error");
          console.error("Error fetching user data:", error);
          navigate("/");
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/");
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [navigate, userId]);

  const fetchPostCounts = async (userId) => {
    try {
      // Fetch posts for the user
      const postsQuery = query(
        collection(db, "blogs"),
        where("userId", "==", userId)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const postIds = postsSnapshot.docs.map((doc) => doc.id);
      console.log("Post IDs:", postIds); // Debug log

      let totalLikes = 0;

      for (const postId of postIds) {
        const postDoc = await getDoc(doc(db, "blogs", postId));
        if (postDoc.exists()) {
          const postData = postDoc.data();
          // If 'likes' is an array, count its length
          if (Array.isArray(postData.likes)) {
            totalLikes += postData.likes.length;
          } else {
            console.warn(`Unexpected 'likes' format for post ID: ${postId}`);
          }
        } else {
          console.warn(`No document found for post ID: ${postId}`);
        }
      }

      setPostCounts({ posts: postIds.length, likes: totalLikes });
    } catch (error) {
      console.error("Error fetching post counts:", error);
      showToast(error.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Loading />
      </div>
    );
  }

  if (!authUser?.uid) {
    navigate("/");
    return null;
  }

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const {
    name,
    email,
    profession,
    phone,
    facebook,
    instagram,
    twitter,
    linkedin,
  } = userData || {};

  return (
    <>
      <Navbar />
      <div className="container border border-1 border-secondary">
        <div className="row d-flex justify-content-center">
          <div className="col-11 p-5">
            <div className="card custom-card">
              <div className="card-header">
                <h3 className="card-title">User Profile</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-sm-3 text-center">
                    <img
                      src={
                        userData?.photoURL ||
                        userData.photo ||
                        "https://openui.fly.dev/openui/128x128.svg?text=👤"
                      }
                      alt="User Profile Picture"
                      className="img-fluid img-thumbnail rounded-circle p-3 mt-1"
                      loading="lazy"
                    />
                  </div>
                  <div className="col-sm-9">
                    <h4 className="card-title">
                      Name : {name || "N/A"}
                      <br />
                      Email : {email || "N/A"}
                    </h4>
                    <p className="card-text">
                      {profession || "No profession Provided"}
                    </p>
                    <div className="row">
                      <div className="col-sm-6">
                        <p className="card-text">
                          Liked Posts: <strong>{postCounts.likes}</strong>
                        </p>
                        <p className="card-text">
                          My Posts: <strong>{postCounts.posts}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-10 px-5 mt-5">
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-foreground">
                        My Social Media Handle
                      </h3>
                      <div className="flex flex-col mt-2">
                        <div className="d-flex gap-3">
                          <img src={whatsapp} alt="whats" loading="lazy" />
                          <p className="text-muted-foreground my-3">
                            +91-{phone || `NA`}
                          </p>
                        </div>
                        <div className="d-flex gap-3">
                          <img src={fb} alt="fb" loading="lazy" />
                          <p className="text-muted-foreground my-3">
                            {facebook || `NA`}
                          </p>
                        </div>
                        <div className="d-flex gap-3">
                          <img src={insta} alt="inst" loading="lazy" />
                          <p className="text-muted-foreground my-3">
                            {instagram || `NA`}
                          </p>
                        </div>
                        <div className="d-flex gap-3">
                          <img src={twit} alt="twit" loading="lazy" />
                          <p className="text-muted-foreground my-3">
                            {twitter || `NA`}
                          </p>
                        </div>
                        <div className="d-flex gap-3">
                          <img src={linke} alt="linke" loading="lazy" />
                          <p className="text-muted-foreground my-3">
                            {linkedin || `NA`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!userId && ( // Only show Edit Profile button if it's the current user
                    <div className="col-12 text-end">
                      <button
                        type="button"
                        className="btn btn-lg btn-outline-primary"
                        onClick={handleShowModal}
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}
                  <EditProfileModal
                    showModal={showModal}
                    handleClose={handleCloseModal}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
