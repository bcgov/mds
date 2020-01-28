import React from "react";
import { Link } from "react-router-dom";
import { COMPUTER_404 } from "@/constants/assets";
import * as route from "@/constants/routes";

const PageNotFound = () => (
  <div className="null-screen">
    <div className="no-nav-bar">
      <img src={COMPUTER_404} alt="Page Not Found (Error 404)" />
      <h1>Uh Oh!</h1>
      <p>
        The page you&#39;re looking for can&#39;t be found. It may have moved, or it no longer
        exists.
      </p>
      <p>
        Return to the <Link to={route.HOME_PAGE.route}>home page</Link> to get back on track.
      </p>
    </div>
  </div>
);

export default PageNotFound;
