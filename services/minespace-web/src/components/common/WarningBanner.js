import React from "react";
import PropTypes from "prop-types";
import { Alert } from "antd";
import { WARNING } from "@/constants/assets";

const propTypes = {
  type: PropTypes.oneOf(["IE", "mobile"]),
  onClose: PropTypes.func.isRequired,
};

const defaultProps = {
  type: "",
};

const renderIEBanner = () => (
  <div className="inline-flex flex-center">
    <img src={WARNING} alt="warning" className="large-padding-right" />
    <div>
      <h2>Internet Explorer is not a supported browser.</h2>
      <p>If you continue with this browser the application may not work as intended.</p>
      <p>
        Please use a supported browser:
        <a href="https://www.google.com/chrome" target="_blank" rel="noopener noreferrer">
          {" "}
          Chrome,
        </a>
        <a
          href="https://www.mozilla.org/en-US/firefox/new"
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}
          Firefox,
        </a>
        <a href="https://support.apple.com/en-ca/safari" target="_blank" rel="noopener noreferrer">
          {" "}
          Safari{" "}
        </a>
      </p>
    </div>
  </div>
);

const WarningBanner = (props) =>
  (props.type === "IE" && (
    <Alert message={renderIEBanner()} type="warning" banner closable onClose={props.onClose} />
  )) ||
  (props.type === "mobile" && (
    <Alert
      message="You are currently using a mobile device to access this content. Be aware that the system may not work as expected in a mobile environment."
      type="warning"
      banner
      closable
      onClose={props.onClose}
    />
  ));

WarningBanner.propTypes = propTypes;
WarningBanner.defaultProps = defaultProps;

export default WarningBanner;
