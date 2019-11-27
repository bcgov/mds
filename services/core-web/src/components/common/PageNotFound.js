import React from "react";
import { Link } from "react-router-dom";
import { COMPUTER_404 } from "@/constants/assets";
import * as route from "@/constants/routes";

const PageNotFound = () => (
  <div className="null-screen">
    <div className="no-nav-bar">
      <img alt="mine_img" src={COMPUTER_404} />
      <h1>Uh Oh!</h1>
      <p>The page you’re looking for can’t be found. It may have moved, or it no longer exists.</p>
      <p>
        <Link to={route.MINE_HOME_PAGE.route}>Return to the home page</Link> to get back on track.
      </p>
    </div>
  </div>
);

export default PageNotFound;
