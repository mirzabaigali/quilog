//check
// src/pages/Feed.jsx

import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import like from "../assets/mdi-like.svg";
import comment from "../assets/iconamoon-comment-bold.svg";
import share from "../assets/material-symbols-share.svg";
import { auth, db } from "../firebase-client/config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import showToast from "../utilities/Toast";
import Loading from "../utilities/Loading";
import whatsapp from "../assets/ic_baseline-whatsapp.svg";
import insta from "../assets/mdi_instagram.svg";
import linke from "../assets/mdi_linkedin.svg";
import twit from "../assets/iconoir_twitter.svg";
import fb from "../assets/circum_facebook.svg";
import LikeButton from "../utilities/Like";
import Comments from "../utilities/Comments";
import html2canvas from "html2canvas";
import { useNavigate, useParams } from "react-router-dom";
import "./Feed.css";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [singlePost, setSinglePost] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // Handle click for tab
  const handleTabClick = async (postId, tab) => {
    if (tab === "home") {
      const post = posts.find((p) => p.id === postId);
      const usersWhoLiked = await fetchUsersWhoLiked(post.likes);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, activeTab: tab, usersWhoLiked } : post
        )
      );
    } else {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, activeTab: tab } : post
        )
      );
    }
  };

  // Fetch blogs
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollection = collection(db, "blogs");
        const postsSnapshot = await getDocs(postsCollection);
        const postsList = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          likes: doc.data().likes || [],
          comments: doc.data().comments || [],
          activeTab: "",
          usersWhoLiked: [],
        }));
        postsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(postsList);

        // If there is an ID in the URL, set singlePost to that post
        if (id) {
          const post = postsList.find((p) => p.id === id);
          if (post) {
            setSinglePost(post);
          } else {
            showToast(
              "Post not found.",
              "The requested post does not exist.",
              "error"
            );
          }
        }
      } catch (error) {
        showToast(
          error.message,
          "Failed to fetch posts. Please try again later.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Fetch users who liked the post
  const fetchUsersWhoLiked = async (likes) => {
    const users = await Promise.all(
      likes.map(async (userId) => {
        const userDoc = await getDoc(doc(db, "users", userId));
        return userDoc.exists() ? { ...userDoc.data(), id: userId } : null;
      })
    );
    return users.filter((user) => user !== null);
  };

  // Handle like count update
  const handleLikeUpdate = async (postId, userId, liked) => {
    const updatedPosts = posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            likes: liked
              ? [...post.likes, userId]
              : post.likes.filter((id) => id !== userId),
          }
        : post
    );
    setPosts(updatedPosts);

    const postRef = doc(db, "blogs", postId);
    await updateDoc(postRef, {
      likes: updatedPosts.find((post) => post.id === postId).likes,
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Share function
  const handleShareClick = (postId) => {
    const element = document.querySelector(`#post-${postId}`);
    if (element) {
      html2canvas(element, { scale: 2 })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = imgData;
          link.download = `post-${postId}.png`;
          link.click();
        })
        .catch((error) => {
          console.error("Error capturing screenshot:", error);
        });
    } else {
      console.error("Element not found for post ID:", postId);
    }
  };

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // Render a single post if ID is present, otherwise render the feed
  if (id && singlePost) {
    const {
      author,
      blogTitle,
      category,
      content,
      createdAt,
      id,
      images,
      tags,
      userName,
      activeTab,
      likes,
      comments,
      usersWhoLiked = [],
    } = singlePost;

    return (
      <div className="container">
        <Navbar />
        <div
          className="row justify-content-center p-3 border border-1 border-secondary"
          style={{ minHeight: "70vh" }}
        >
          <div className="col-md-11 card p-3">
            <div className="d-md-flex justify-content-between align-items-center">
              <div className="col d-flex gap-3 align-items-center">
                <img
                  src={images}
                  alt="placeholder"
                  style={{
                    width: "5rem",
                    height: "5rem",
                    borderRadius: "50px",
                  }}
                  className="img-thumbnail"
                />
                <strong
                  className="fs-3 text-capitalize"
                  onClick={() => handleProfileClick(singlePost.userId)}
                  style={{ cursor: "pointer" }}
                >
                  {userName}
                </strong>
              </div>
              <div className="col d-flex justify-content-end pt-2 pb-sm-2 gap-3 text-end">
                <p>Posted on: </p> <p>{formatDate(createdAt)}</p>
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="text-primary text-capitalize">
                Blog Title: {blogTitle}
              </p>
            </div>
            <div className="text-center">
              <p className="text-secondary">{content}</p>
            </div>
            <div className="row d-flex justify-content-between align-items-center">
              <div className="col p-3 d-flex align-items-baseline gap-2">
                <p> Author: </p> <p className="text-capitalize">{author}</p>
              </div>
              <div className="col text-end">
                <p className="text-capitalize">{tags}</p>
              </div>
            </div>

            {/* Tab Navigation and Content */}
            <ul className="nav mb-3" id={`pills-tab-${id}`} role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "home" ? "active" : ""}`}
                  id={`pills-home-tab-${id}`}
                  data-bs-toggle="pill"
                  type="button"
                  role="tab"
                  aria-controls={`pills-home-${id}`}
                  aria-selected={activeTab === "home"}
                  onClick={() => handleTabClick(id, "home")}
                >
                  <div className="pb-3">
                    <span className="fs-3">
                      <LikeButton
                        postId={id}
                        likes={likes}
                        onLikeUpdate={handleLikeUpdate}
                      />
                    </span>
                  </div>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${
                    activeTab === "profile" ? "active" : ""
                  }`}
                  id={`pills-profile-tab-${id}`}
                  data-bs-toggle="pill"
                  type="button"
                  role="tab"
                  aria-controls={`pills-profile-${id}`}
                  aria-selected={activeTab === "profile"}
                  onClick={() => handleTabClick(id, "profile")}
                >
                  <img src={comment} alt="comment" className="img-fluid pb-3" />
                  <span className="fs-3">{comments.length}</span>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${
                    activeTab === "contact" ? "active" : ""
                  }`}
                  id={`pills-contact-tab-${id}`}
                  data-bs-toggle="pill"
                  type="button"
                  role="tab"
                  aria-controls={`pills-contact-${id}`}
                  aria-selected={activeTab === "contact"}
                  onClick={() => handleTabClick(id, "contact")}
                >
                  <div className="pb-2">
                    <img src={share} alt="share" className="img-fluid p-2" />
                  </div>
                </button>
              </li>
              <li className="nav-item ms-auto">
                <p className="fs-3">{category}</p>
              </li>
            </ul>
            <div className="tab-content" id={`pills-tabContent-${id}`}>
              <div
                className={`tab-pane fade ${
                  activeTab === "home" ? "show active" : ""
                }`}
                id={`pills-home-${id}`}
                role="tabpanel"
                aria-labelledby={`pills-home-tab-${id}`}
              >
                <ul>
                  <h5>Users Who Liked This Post:</h5>
                  {usersWhoLiked.length > 0 ? (
                    usersWhoLiked.map((user) => (
                      <li key={user.id}>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={user?.photo || "https://placehold.co/100"}
                            alt={user?.name || "User"}
                            className="user-photo img-thumbnail rounded-circle"
                            style={{ width: "5rem", height: "5rem" }}
                          />
                          <h3>
                            <strong>{user?.name || "Unknown User"}</strong>
                          </h3>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p>No likes yet.</p>
                  )}
                </ul>
              </div>
              <div
                className={`tab-pane fade ${
                  activeTab === "profile" ? "show active" : ""
                }`}
                id={`pills-profile-${id}`}
                role="tabpanel"
                aria-labelledby={`pills-profile-tab-${id}`}
              >
                <Comments postId={id} />
              </div>
              <div
                className={`tab-pane fade ${
                  activeTab === "contact" ? "show active" : ""
                }`}
                id={`pills-contact-${id}`}
                role="tabpanel"
                aria-labelledby={`pills-contact-tab-${id}`}
              >
                <div className="d-flex justify-content-between">
                  <div onClick={() => handleShareClick(id)}>
                    <img src={whatsapp} alt="whatsapp" loading="lazy" />
                  </div>
                  <div onClick={() => handleShareClick(id)}>
                    <img src={fb} alt="facebook" loading="lazy" />
                  </div>
                  <div onClick={() => handleShareClick(id)}>
                    <img src={insta} alt="instagram" loading="lazy" />
                  </div>
                  <div onClick={() => handleShareClick(id)}>
                    <img src={twit} alt="twitter" loading="lazy" />
                  </div>
                  <div onClick={() => handleShareClick(id)}>
                    <img src={linke} alt="linkedin" loading="lazy" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="feed-header">
          <h1>Feed</h1>
          <p>
            Discover new posts from your friends, influencers, and communities.
          </p>
        </div>

        <div
          className="row justify-content-center p-3 border border-1 border-secondary"
          style={{ minHeight: "70vh" }}
        >
          <div className="d-flex align-items-center">
            {loading && <Loading />}
          </div>
          {!loading && posts.length === 0 && (
            <div className="text-center">
              <p>No posts available. Check back later!</p>
            </div>
          )}
          {posts.map((item) => {
            const {
              author,
              blogTitle,
              category,
              content,
              createdAt,
              id,
              images,
              tags,
              userName,
              activeTab,
              likes,
              comments, // Retrieve comments
              usersWhoLiked = [],
            } = item;
            return (
              <div
                key={id}
                id={`post-${id}`} // Ensure the post element has an ID
                className="col-md-12 d-flex justify-content-center p-3"
              >
                <div className="col-md-11 card p-3">
                  <div className="d-md-flex justify-content-between align-items-center">
                    <div className="col d-flex gap-3 align-items-center">
                      <img
                        src={images}
                        alt="placeholder"
                        style={{
                          width: "5rem",
                          height: "5rem",
                          borderRadius: "50px",
                        }}
                        className="img-thumbnail"
                      />
                      <strong
                        className="fs-3 text-capitalize"
                        onClick={() => handleProfileClick(item.userId)}
                        style={{ cursor: "pointer" }}
                      >
                        {userName}
                      </strong>
                    </div>
                    <div className="col d-flex justify-content-end pt-2 pb-sm-2 gap-3 text-end">
                      <p>Posted on: </p> <p>{formatDate(createdAt)}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-primary text-capitalize">
                      Blog Title: {blogTitle}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-secondary">{content}</p>
                  </div>
                  <div className="row d-flex justify-content-between align-items-center">
                    <div className="col p-3 d-flex align-items-baseline gap-2">
                      <p> Author: </p>{" "}
                      <p className="text-capitalize">{author}</p>
                    </div>
                    <div className="col text-end">
                      <p className="text-capitalize">{tags}</p>
                    </div>
                  </div>

                  {/* Tab Navigation and Content */}
                  <ul
                    className="nav mb-3"
                    id={`pills-tab-${id}`}
                    role="tablist"
                  >
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link ${
                          activeTab === "home" ? "active" : ""
                        }`}
                        id={`pills-home-tab-${id}`}
                        data-bs-toggle="pill"
                        type="button"
                        role="tab"
                        aria-controls={`pills-home-${id}`}
                        aria-selected={activeTab === "home"}
                        onClick={() => handleTabClick(id, "home")}
                      >
                        <div className="pb-3">
                          <span className="fs-3">
                            <LikeButton
                              postId={id}
                              likes={likes}
                              onLikeUpdate={handleLikeUpdate}
                            />
                          </span>
                        </div>
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link ${
                          activeTab === "profile" ? "active" : ""
                        }`}
                        id={`pills-profile-tab-${id}`}
                        data-bs-toggle="pill"
                        type="button"
                        role="tab"
                        aria-controls={`pills-profile-${id}`}
                        aria-selected={activeTab === "profile"}
                        onClick={() => handleTabClick(id, "profile")}
                      >
                        <img
                          src={comment}
                          alt="comment"
                          className="img-fluid pb-3"
                        />
                        <span className="fs-3">{comments.length}</span>
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link ${
                          activeTab === "contact" ? "active" : ""
                        }`}
                        id={`pills-contact-tab-${id}`}
                        data-bs-toggle="pill"
                        type="button"
                        role="tab"
                        aria-controls={`pills-contact-${id}`}
                        aria-selected={activeTab === "contact"}
                        onClick={() => handleTabClick(id, "contact")}
                      >
                        <div className="pb-2">
                          <img
                            src={share}
                            alt="share"
                            className="img-fluid p-2"
                          />
                        </div>
                      </button>
                    </li>
                    <li className="nav-item ms-auto">
                      <p className="fs-3">{category}</p>
                    </li>
                  </ul>
                  <div className="tab-content" id={`pills-tabContent-${id}`}>
                    <div
                      className={`tab-pane fade ${
                        activeTab === "home" ? "show active" : ""
                      }`}
                      id={`pills-home-${id}`}
                      role="tabpanel"
                      aria-labelledby={`pills-home-tab-${id}`}
                    >
                      <ul>
                        <h5>Users Who Liked This Post:</h5>
                        {usersWhoLiked.length > 0 ? (
                          usersWhoLiked.map((user) => (
                            <li key={user.id}>
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  src={
                                    user?.photo || "https://placehold.co/100"
                                  }
                                  alt={user?.name || "User"}
                                  className="user-photo img-thumbnail rounded-circle"
                                  style={{ width: "5rem", height: "5rem" }}
                                />
                                <h3>
                                  <strong>
                                    {user?.name || "Unknown User"}
                                  </strong>
                                </h3>
                              </div>
                            </li>
                          ))
                        ) : (
                          <p>No likes yet.</p>
                        )}
                      </ul>
                    </div>
                    <div
                      className={`tab-pane fade ${
                        activeTab === "profile" ? "show active" : ""
                      }`}
                      id={`pills-profile-${id}`}
                      role="tabpanel"
                      aria-labelledby={`pills-profile-tab-${id}`}
                    >
                      <Comments postId={id} />
                    </div>
                    <div
                      className={`tab-pane fade ${
                        activeTab === "contact" ? "show active" : ""
                      }`}
                      id={`pills-contact-${id}`}
                      role="tabpanel"
                      aria-labelledby={`pills-contact-tab-${id}`}
                    >
                      <div className="d-flex justify-content-between">
                        <div onClick={() => handleShareClick(id)}>
                          <img src={whatsapp} alt="whatsapp" loading="lazy" />
                        </div>
                        <div onClick={() => handleShareClick(id)}>
                          <img src={fb} alt="facebook" loading="lazy" />
                        </div>
                        <div onClick={() => handleShareClick(id)}>
                          <img src={insta} alt="instagram" loading="lazy" />
                        </div>
                        <div onClick={() => handleShareClick(id)}>
                          <img src={twit} alt="twitter" loading="lazy" />
                        </div>
                        <div onClick={() => handleShareClick(id)}>
                          <img src={linke} alt="linkedin" loading="lazy" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Feed;
