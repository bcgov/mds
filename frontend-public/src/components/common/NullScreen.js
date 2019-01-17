import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import * as routes from "@/constants/routes";

/**
 * @constant NullScreen is a reusable view for when there is no data to display, add more views when required.
 */

const propTypes = {
  type: PropTypes.oneOf(["unauthorized"]),
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
  </div>
);

NullScreen.propTypes = propTypes;
NullScreen.defaultProps = defaultProps;

export default NullScreen;
