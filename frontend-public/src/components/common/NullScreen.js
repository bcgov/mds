import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import * as routes from "@/constants/routes";

/**
 * @constant NullScreen is a reusable view for when there is no data to display, add more views when required.
 */

const propTypes = {
  type: PropTypes.oneOf(["unauthorized", "no-mines", "404", "reports"]),
};

const defaultProps = {
  type: "unauthorized",
};

const NullScreen = (props) => (
  <div className="null-screen">
    {props.type === "unauthorized" && (
      <div className="no-nav-bar">
        <h3>You do not have permission to access this page</h3>
        <p>
          Contact your system administrator at
          <b> mds@gov.bc.ca</b> to request access
        </p>
        <Link to={routes.HOME.route}>Go Back</Link>
      </div>
    )}
    {props.type === "404" && (
      <div className="no-nav-bar">
        <h1>Uh Oh!</h1>
        <p>
          The page you're looking for can't be found. It may have moved, or it no longer exists.
        </p>
        <p>
          {" "}
          <Link to={routes.HOME.route}>Return to the home page</Link> to get back on track.
        </p>
      </div>
    )}
    {props.type === "no-mines" && (
      <div className="no-nav-bar">
        <h3>You are not authorized to manage information for any mines.</h3>
        <p>
          Please contact your MDS administrator at{" "}
          <a className="underline" href="mailto:MDS@gov.bc.ca">
            MDS@gov.bc.ca
          </a>{" "}
          for assistance.
        </p>
      </div>
    )}
    {props.type === "reports" && (
      <div>
        <h3>No reports found</h3>
      </div>
    )}
  </div>
);

NullScreen.propTypes = propTypes;
NullScreen.defaultProps = defaultProps;

export default NullScreen;
