import React from "react";
import Navbar from "./Navbar";

const PageNotFound = () => {
  return (
    <>
      <Navbar />
      <div className="container d-flex flex-column" style={{marginTop:"15rem"}}>
        <div className="row">
          <div className="col-12 text-capitalize text-center ">
            <h1 style={{fontSize:"6rem"}}>Page Not Found</h1>
            <p className="display-5">Sorry, the page you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageNotFound;
