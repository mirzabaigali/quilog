// src/utilities/Comments.jsx

import React, { useEffect, useState } from "react";
import { db } from "../firebase-client/config";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import postimg from "../assets/Vector.png";
import "./Comments.css";

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const postDoc = await getDoc(doc(db, "blogs", postId));
        const postData = postDoc.data();
        if (postData && postData.comments) {
          const commentsData = await Promise.all(
            postData.comments.map(async (commentId) => {
              const commentDoc = await getDoc(doc(db, "comments", commentId));
              return commentDoc.exists()
                ? { ...commentDoc.data(), id: commentId }
                : null;
            })
          );
          setComments(commentsData.filter((comment) => comment !== null));
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      try {
        // Create a new comment in Firestore
        const commentRef = doc(db, "comments", new Date().getTime().toString());
        await updateDoc(commentRef, {
          text: newComment,
          userEmail: "user@example.com", // Replace with actual user email from context or auth
          createdAt: new Date().toISOString(),
        });

        // Update the post's comments list
        const postRef = doc(db, "blogs", postId);
        await updateDoc(postRef, {
          comments: arrayUnion(commentRef.id),
        });

        // Update local state
        setComments([
          ...comments,
          {
            text: newComment,
            userEmail: "user@example.com",
            id: commentRef.id,
          },
        ]);
        setNewComment("");
      } catch (error) {
        console.error("Failed to submit comment:", error);
      }
    }
  };

  return (
    <div classNameName="comments-section">
      {loading ? (
        <p>Loading comments...</p>
      ) : (
        <>
          <form onSubmit={handleCommentSubmit} classNameName="comment-form">
            <div className="mb-4">
              <label
                for="comment"
                className="block text-sm font-medium text-muted-foreground"
              >
                Add your comment
              </label>
              <div className="flex items-center  rounded-lg overflow-hidden">
                <input
                  type="text"
                  id="comment"
                  placeholder="Write a comment..."
                  className="fs-5 flex-1 p-2 bg-input text-foreground placeholder:text-muted-foreground focus:outline-none"
                  style={{ width: "93rem" }}
                />
                <button
                  className="btn  btn-primary img_btn"
                >
                  <img
                    src={postimg}
                    alt="icon"
                    className="text-light send_btn"
                  />
                </button>
              </div>
            </div>
          </form>

          <ul classNameName="comment-list">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <li key={comment.id}>
                  <p>
                    <strong>{comment.userEmail}:</strong> {comment.text}
                  </p>
                </li>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default Comments;
