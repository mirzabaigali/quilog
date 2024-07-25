//
// src/pages/Feed.jsx

import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import like from "../assets/mdi-like.svg";
import comment from "../assets/iconamoon-comment-bold.svg";
import share from "../assets/material-symbols-share.svg";
import { db } from "../firebase-client/config";
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
import Comments from "../utilities/Comments"; // Import Comments component
import "./Feed.css";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleTabClick = async (postId, tab) => {
    if (tab === "home") {
      const post = posts.find((p) => p.id === postId);
      const usersWhoLiked = await fetchUsersWhoLiked(post.likes);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, activeTab: tab, usersWhoLiked } : post
        )
      );
    } else if (tab === "profile") {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, activeTab: tab } : post
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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollection = collection(db, "blogs");
        const postsSnapshot = await getDocs(postsCollection);
        const postsList = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          likes: doc.data().likes || [],
          comments: doc.data().comments || [], // Initialize comments as an empty array
          activeTab: "",
          usersWhoLiked: [],
        }));
        postsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(postsList);
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

  const fetchUsersWhoLiked = async (likes) => {
    const users = await Promise.all(
      likes.map(async (userId) => {
        const userDoc = await getDoc(doc(db, "users", userId));
        return userDoc.exists() ? { ...userDoc.data(), id: userId } : null;
      })
    );
    return users.filter((user) => user !== null);
  };

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
                      <strong className="fs-3 text-capitalize">
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
                              {user.username} ({user.email})
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
                        <div>
                          <img src={whatsapp} alt="whats" loading="lazy" />
                        </div>
                        <div>
                          <img src={fb} alt="fb" loading="lazy" />
                        </div>
                        <div>
                          <img src={insta} alt="inst" loading="lazy" />
                        </div>
                        <div>
                          <img src={twit} alt="twit" loading="lazy" />
                        </div>
                        <div>
                          <img src={linke} alt="linke" loading="lazy" />
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
