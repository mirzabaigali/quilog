import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase-client/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import "./MyBlogs.css";
import Navbar from "./Navbar";
import Comments from "../utilities/Comments";
import LikeButton from "../utilities/Like";
import whatsapp from "../assets/ic_baseline-whatsapp.svg";
import insta from "../assets/mdi_instagram.svg";
import linke from "../assets/mdi_linkedin.svg";
import twit from "../assets/iconoir_twitter.svg";
import fb from "../assets/circum_facebook.svg";
import comment from "../assets/iconamoon-comment-bold.svg";
import share from "../assets/material-symbols-share.svg";

const MyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserBlogs = async () => {
      setLoading(true);
      setError("");

      try {
        const user = auth.currentUser;

        if (!user) {
          console.error("No user logged in.");
          setError("No user logged in.");
          setLoading(false);
          return;
        }

        const userId = user.uid;
        console.log("User ID:", userId);

        // Correct field name 'userId'
        const q = query(collection(db, "blogs"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        console.log("Query Snapshot:", querySnapshot);

        if (querySnapshot.empty) {
          console.log("No matching documents.");
        }

        const blogsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Blogs List:", blogsList);

        setBlogs(blogsList);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to fetch blogs. " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBlogs();
  }, []);

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
          <h1>My Blogs</h1>
          <p>
            View and manage your blogs. Click on "View" or "Edit" to access the
            full content and update your posts. To delete a blog, click on the
            "Delete" button in the action column.
            <br />
            <br />
            <Link to="/createblog" className="btn-write">
              Write a New Blog
            </Link>
          </p>
        </div>

        <div
          className="row justify-content-center p-3 border border-1 border-secondary"
          style={{ minHeight: "70vh" }}
        >
          {/* <div className="myblogs-container"> */}
          <h2>My Blogs</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="error-message">{error}</p>}
          {blogs.length === 0 && !loading && <p>No blogs found.</p>}
          {blogs.map((blog) => {
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
            } = blog;
            return (
              <div key={blog.id} className="blog-card">
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
                          // onClick={() => handleProfileClick(item.userId)}
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
                          // onClick={() => handleTabClick(id, "home")}
                        >
                          <div className="pb-3">
                            <span className="fs-3">
                              <LikeButton
                                postId={id}
                                likes={likes}
                                //   onLikeUpdate={handleLikeUpdate}
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
                          // onClick={() => handleTabClick(id, "profile")}
                        >
                          <img
                            src={comment}
                            alt="comment"
                            className="img-fluid pb-3"
                          />
                          <span className="fs-3">{comments?.length}</span>
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
                          // onClick={() => handleTabClick(id, "contact")}
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
                          <div
                          // onClick={() => handleShareClick(id)}
                          >
                            <img src={whatsapp} alt="whatsapp" loading="lazy" />
                          </div>
                          <div>
                            <img src={fb} alt="facebook" loading="lazy" />
                          </div>
                          <div>
                            <img src={insta} alt="instagram" loading="lazy" />
                          </div>
                          <div>
                            <img src={twit} alt="twitter" loading="lazy" />
                          </div>
                          <div>
                            <img src={linke} alt="linkedin" loading="lazy" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="container d-flex justify-content-between fs-2">
                  <p>
                    <Link to={`/feed/${blog.id}`} className="btn-view">
                      View
                    </Link>
                  </p>
                  <p>
                    <Link to={`/createblog/${blog.id}`} className="btn-edit">
                      Edit
                    </Link>
                  </p>
                </div>
              </div>
            );
          })}
          <div class="container mt-5 mb-5">
            <div
              class="alert alert-info alert-dismissible fade show"
              role="alert"
            >
              <h4 class="alert-heading">Important Notice</h4>
              <p class="mb-3">
                <strong>Note:</strong> This is a demo version and real-time
                updates are not supported in this environment.
              </p>
              <p class="mb-3">
                If you encounter any issues or need further assistance, feel
                free to ask.
              </p>
              <hr />
              <p class="mb-0">
                <strong>Enjoy your blogging!</strong>
              </p>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}
    </>
  );
};

export default MyBlogs;
