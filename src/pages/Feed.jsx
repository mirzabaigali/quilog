import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import like from "../assets/mdi-like.svg";
import comment from "../assets/iconamoon-comment-bold.svg";
import share from "../assets/material-symbols-share.svg";
import { db } from "../firebase-client/config";
import { collection, getDocs } from "firebase/firestore";
import showToast from "../utilities/Toast";
import Loading from "../utilities/Loading";
const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollection = collection(db, "blogs");
        const postsSnapshot = await getDocs(postsCollection);
        const postsList = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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
              publishDates,
              tags,
              userName,
            } = item;
            return (
              <div
                key={id}
                className="col-md-12  d-flex justify-content-center p-3"
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
                      <p>Posted on: </p> <p>{formatDate(createdAt)} </p>
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
                    <div className="col p-3 d-flex  align-items-baseline gap-2">
                      <p> Author: </p>{" "}
                      <p className="text-capitalize">{author}</p>
                    </div>
                    <div className="col text-end">
                      <p className="text-capitalize">{tags}</p>
                    </div>
                    <div></div>
                  </div>

                  <div className="social-icons  d-flex justify-content-between align-items-center px-3 mt-3">
                    <div className=" d-flex justify-content-between align-items-center  gap-3">
                      <div className="d-flex align-baseline">
                        <img src={like} alt="like" className="img-fluid" />
                        <span className="fs-4">10</span>
                      </div>
                      <div className="d-flex align-baseline">
                        <img
                          src={comment}
                          alt="comment"
                          className="img-fluid"
                        />
                        <span className="fs-4">10</span>
                      </div>
                      <div>
                        <img src={share} alt="share" className="img-fluid" />
                      </div>
                    </div>
                    <div>
                      <p>{category}</p>
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
