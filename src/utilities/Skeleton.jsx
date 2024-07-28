import React from "react";
import "./Skeleton.css";

const Skeleton = ({ width, height }) => {
  return <div className="skeleton" style={{ width, height }}></div>;
};

export default Skeleton;
