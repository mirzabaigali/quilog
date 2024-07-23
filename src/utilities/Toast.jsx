import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import "./Toast.css"; 

const showToast = (message, type) => {
  let backgroundColor;
  switch (type) {
    case "success":
      backgroundColor = "linear-gradient(to right, #00b09b, #96c93d)";
      break;
    case "error":
      backgroundColor = "linear-gradient(to right, #ff5f6d, #ffc371)";
      break;
    case "warning":
      backgroundColor = "linear-gradient(to right, #f7b733, #fc4a1a)";
      break;
    case "info":
      backgroundColor = "linear-gradient(to right, #56ccf2, #2f80ed)";
      break;
    default:
      backgroundColor = "linear-gradient(to right, #00b09b, #96c93d)";
  }

  Toastify({
    text: message,
    duration: 3000, // 3 seconds
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    backgroundColor,
    className: "toastify-container", // Add custom class
  }).showToast();
};

export default showToast;
