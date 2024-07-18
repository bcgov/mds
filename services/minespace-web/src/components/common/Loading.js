/**
 * @constant Loading is a full page loading spinner
 */
import React from "react";
import { LOADER } from "@/constants/assets";

const Loading = () => {
  return (
    <div id="loading-screen">
      <div className="loader">
        <img src={LOADER} alt="Loading" />
      </div>
    </div>
  );
};

export default Loading;
