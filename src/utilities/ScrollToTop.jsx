const scrollToTop = () => {
    console.log("scrollToTop called");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  
  export default scrollToTop;
  