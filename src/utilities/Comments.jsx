// src/utilities/Comments.jsx

import React, { useEffect, useState } from "react";
import { db } from "../firebase-client/config";
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import postimg from "../assets/Vector.png";
import "./Comments.css";
import { getAuth } from "firebase/auth";

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({});

  const auth = getAuth();
  const user = auth.currentUser;
  const userInfo =
    sessionStorage.getItem("userData") || localStorage.getItem("userData");
  const userObj = userInfo ? JSON.parse(userInfo) : null;
  // console.log(userObj);

  useEffect(() => {
    const fetchCommentsAndUsers = async () => {
      try {
        const postDoc = await getDoc(doc(db, "blogs", postId));
        const postData = postDoc.data();

        if (postData && postData.comments) {
          // Fetch comments
          const commentDocs = await Promise.all(
            postData.comments.map((commentId) =>
              getDoc(doc(db, "comments", commentId))
            )
          );

          const commentsData = commentDocs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp.toDate(),
          }));

          // Fetch user details for all comments
          const userIds = commentsData.map((comment) => comment.userId);
          const uniqueUserIds = Array.from(new Set(userIds)); // Remove duplicates

          const userPromises = uniqueUserIds.map((userId) =>
            getDoc(doc(db, "users", userId)).then((userDoc) => ({
              id: userId,
              data: userDoc.data(),
            }))
          );

          const usersData = await Promise.all(userPromises);
          const usersMap = usersData.reduce((acc, user) => {
            acc[user.id] = user.data; // Store complete user data
            return acc;
          }, {});

          setUsers(usersMap);

          // Attach user data to comments
          const enrichedComments = commentsData.map((commentData) => ({
            ...commentData,
            user: usersMap[commentData.userId] || {},
          }));

          setComments(enrichedComments);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommentsAndUsers();
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() && user) {
      try {
        const commentId = new Date().getTime().toString();
        const commentRef = doc(db, "comments", commentId);

        // Create the comment document
        await setDoc(commentRef, {
          comment: newComment,
          userId: user.uid, // Use the current user's ID
          timestamp: new Date(),
        });

        // Update the post's comments list
        const postRef = doc(db, "blogs", postId);
        await updateDoc(postRef, {
          comments: arrayUnion(commentId),
        });

        // Update local state
        setComments([
          ...comments,
          {
            comment: newComment,
            userId: user.uid,
            user: {
              name: user.displayName || userObj.name || "Unknown User",
              photo: user.photoURL || userObj.photo,
            },
            timestamp: new Date(),
            id: commentId,
          },
        ]);
        setNewComment("");
      } catch (error) {
        console.error("Failed to submit comment:", error);
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleString(); // Convert to a readable format
  };

  return (
    <div className="comments-section">
      {loading ? (
        <p>Loading comments...</p>
      ) : (
        <>
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div className="mb-4">
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-muted-foreground"
              >
                Add your comment
              </label>
              <div className="flex items-center  rounded-lg overflow-hidden">
                <input
                  type="text"
                  id="comment"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="fs-5 flex-1 p-2 bg-input text-foreground placeholder:text-muted-foreground focus:outline-none"
                  style={{ width: "93rem" }}
                />
                <button className="btn  btn-primary img_btn">
                  <img
                    src={postimg}
                    alt="icon"
                    className="text-light send_btn"
                  />
                </button>
              </div>
            </div>
          </form>

          <ul className="comment-list">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <li key={index} className="comment-item">
                  <div className="comment-header d-flex align-items-center gap-2">
                    <img
                      src={comment?.user?.photo || "https://placehold.co/100"}
                      alt={comment?.user?.name || "User"}
                      className="user-photo img-thumbnail rounded-circle"
                      style={{ width: "5rem", height: "5rem" }}
                    />
                    <h3>
                      <strong>{comment?.user?.name || "Unknown User"}</strong>
                    </h3>
                  </div>
                  <p>{comment?.comment}</p>
                  {comment.timestamp && (
                    <div className="d-flex justify-content-end">
                      <span>({formatTimestamp(comment?.timestamp)})</span>
                    </div>
                  )}
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
