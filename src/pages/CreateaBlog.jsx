import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import scrollToTop from "../utilities/ScrollToTop";
import showToast from "../utilities/Toast";
import { debounce } from "lodash";
import {
  db,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  collection,
  setDoc,
  doc,
} from "../firebase-client/config";
import { getAuth } from "firebase/auth";
import "./CreateaBlog.css";
import { json } from "react-router-dom";

const CreateaBlog = () => {
  const auth = getAuth();
  const showToastDebounced = debounce(showToast, 300);
  const [loading, setLoading] = useState(false);
  const [contentLength, setContentLength] = useState(0);
  const [formData, setFormData] = useState({
    blog: "",
    content: "",
    images: [],
    videos: [],
    author: "",
    tags: "",
    publishDates: "",
    category: "",
  });

  useEffect(() => {
    scrollToTop();
    const savedDraft = sessionStorage.getItem("blogDraft");
    // console.log("==========>", savedDraft);

    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
      showToastDebounced("Draft loaded successfully!", "info");
    }
  }, []);
  useEffect(() => {
    setContentLength(formData.content.length);
  }, [formData.content]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files : value,
    }));
  };

  const handleFileUpload = async (files, folder) => {
    const fileUrls = [];
    for (const file of files) {
      const fileRef = ref(storage, `${folder}/${file.name}`);
      const uploadTask = uploadBytes(fileRef, file);

      // Track upload progress
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // Update a progress bar or display progress percentage
          console.log("Upload Progress:", progress);
        },
        (error) => {
          console.error("Error uploading file:", error.message);
          showToast(`Error uploading file: ${error.message}`, "error");
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((url) => {
              fileUrls.push(url);
            })
            .catch((error) => {
              console.error("Error getting download URL:", error.message);
              showToast(
                `Error getting download URL: ${error.message}`,
                "error"
              );
            });
        }
      );
    }
    return fileUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.blog || !formData.content || !formData.category) {
      showToast("Blog Title, Content and Category are required!", "warning");
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      showToast("User not authenticated. Please log in.", "error");
      return;
    }
    try {
      setLoading(true);

      // Handle file uploads
      const imageUrls =
        formData.images.length > 0
          ? await handleFileUpload(formData.images, "images")
          : [];
      const videoUrls =
        formData.videos.length > 0
          ? await handleFileUpload(formData.videos, "videos")
          : [];

      //user name
      const storedUser =
        sessionStorage.getItem("userData") || localStorage.getItem("userData");
      const name = JSON.parse(storedUser).name;

      //photo
      const photo = auth?.currentUser?.photoURL;

      // Store blog post in Firestore
      await setDoc(doc(collection(db, "blogs"), Date.now().toString()), {
        blogTitle: formData.blog,
        content: formData.content,
        images: photo || "https://placehold.co/100",
        videos: videoUrls,
        author: formData.author || user.displayName || "Anonymous",
        tags: formData.tags,
        publishDates: formData.publishDates,
        category: formData.category,
        createdAt: new Date().toISOString(),
        userId: user.uid,
        userName: name,
      });

      showToast("Blog published successfully!", "success");
      setFormData({
        blog: "",
        content: "",
        images: [],
        videos: [],
        author: "",
        tags: "",
        publishDates: "",
        category: "",
      });
      sessionStorage.removeItem("blogDraft");
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };
  const handleSaveDraft = (e) => {
    e.preventDefault();
    if (!formData.blog || !formData.content || !formData.category) {
      showToast("Blog Title, Content and Category are required!", "warning");
      return;
    }
    sessionStorage.setItem("blogDraft", JSON.stringify(formData));
    showToast("Draft saved successfully!", "success");
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1>Create a Blog</h1>
            <p className="mb-5">
              Start writing your blog with Quilog. It's easy, fast, and secure.
            </p>
          </div>
          <div className="col-md-8">
            <div>
              <label htmlFor="blog">Blog Title* :</label>
              <input
                type="text"
                name="blog"
                id="blog"
                className="form-control custom-inputs fs-5"
                placeholder="Enter Blog Title"
                value={formData.blog}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="content">Blog Content* :</label>
              <div className="text-end">{contentLength}/500</div>
              <textarea
                id="content"
                name="content"
                className="form-control custom-inputs fs-5"
                rows="10"
                cols="50"
                placeholder="Write your blog post here"
                value={formData.content}
                onChange={handleChange}
                maxLength="500"
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="images">Upload Images</label>
              <input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                className="form-control custom-inputs fs-5"
                multiple
                onChange={handleChange}
                disabled
              />
            </div>
            <div>
              <label htmlFor="videos">Upload Videos</label>
              <input
                type="file"
                id="videos"
                name="videos"
                accept="video/*"
                className="form-control custom-inputs fs-5"
                multiple
                onChange={handleChange}
                disabled
              />
            </div>
          </div>
          <div className="col-md-4">
            <div>
              <label htmlFor="author">Author Name :</label>
              <input
                type="text"
                name="author"
                id="author"
                className="form-control custom-inputs fs-5"
                placeholder="Enter author name"
                value={formData.author}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="tags">Tags</label>
              <input
                type="text"
                name="tags"
                id="tags"
                className="form-control custom-inputs fs-5"
                placeholder="Enter tags separated by comma"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="publishDates">Publish Dates :</label>
              <input
                type="date"
                name="publishDates"
                id="publishDates"
                className="form-control custom-inputs fs-5"
                value={formData.publishDates}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="category">Category*</label>
              <select
                id="category"
                name="category"
                className="form-control custom-inputs fs-5"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                <option value="IT">IT</option>
                <option value="Technology">Technology</option>
                <option value="Sports">Sports</option>
                <option value="Business">Business</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Travel">Travel</option>
                <option value="Food">Food</option>
                <option value="Fashion">Fashion</option>
                <option value="News">News</option>
                <option value="Science">Science</option>
                <option value="Politics">Politics</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="col-md-12 d-flex justify-content-center gap-3 mb-5">
            <div>
              <button
                type="button"
                className="btn btn-success btn-lg fs-5"
                onClick={handleSaveDraft}
              >
                Save Draft
              </button>
            </div>
            <div>
              <button
                type="submit"
                className="btn btn-info btn-lg fs-5"
                onClick={handleSubmit}
                disabled={loading}
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateaBlog;
