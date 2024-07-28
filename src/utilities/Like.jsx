import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase-client/config";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import likeIcon from "../assets/mdi-like.svg";
import "./Like.css";

const LikeButton = ({ postId, likes = [], onLikeUpdate }) => {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      setLiked(likes.includes(userId));
    }
  }, [likes]);

  const handleLike = async () => {
    if (loading) return;
    const user = auth.currentUser;
    if (!user) {
      console.error("No user is currently logged in.");
      return;
    }
    const userId = user.uid;
    const postRef = doc(db, "blogs", postId);
    setLoading(true);
    try {
      if (liked) {
        await updateDoc(postRef, { likes: arrayRemove(userId) });
        onLikeUpdate(postId, userId, false);
      } else {
        await updateDoc(postRef, { likes: arrayUnion(userId) });
        onLikeUpdate(postId, userId, true);
      }
      setLiked(!liked);
    } catch (error) {
      console.error("Failed to update like:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={handleLike} className="d-flex gap-1 cursor-pointer">
      <img
        src={likeIcon}
        alt={liked ? "Liked" : "Like"}
        className={`img-fluid ${liked ? "liked" : ""}`}
      />
      <span>{likes.length}</span>
    </div>
  );
};

export default LikeButton;
