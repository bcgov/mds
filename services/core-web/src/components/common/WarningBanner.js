import React from "react";
import PropTypes from "prop-types";
import { Alert } from "antd";
import { WARNING } from "@/constants/assets";

const propTypes = {
  type: PropTypes.oneOf(["IE", "test", "mobile"]).isRequired,
  onClose: PropTypes.func.isRequired,
};

const renderIEBanner = () => (
  <div className="inline-flex flex-center">
    <img src={WARNING} alt="warning" className="padding-large--right" />
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

const renderTestBanner = () => (
  <div className="inline-flex flex-center">
    <img src={WARNING} alt="warning" className="padding-large--right" />
    <div>
      <h2>WARNING: This is the Core test Site</h2>
      <p>
        Features and layout will be constantly changing and will differ from the live production
        site.{" "}
      </p>
      <p>Data entered in this system will not be saved.</p>
    </div>
  </div>
);

const renderMobileWarningBanner = () => (
  <div className="inline-flex flex-center">
    <img src={WARNING} alt="warning" className="padding-large--right" />
    <div>
      <h2>You are currently using a mobile device to access this content.</h2>
      <p> Be aware that the system may not work as expected in a mobile environment.</p>
    </div>
  </div>
);

const WarningBanner = (props) => (
  <div>
    {props.type === "IE" && (
      <Alert
        style={{ backgroundColor: "#F3CD65" }}
        message={renderIEBanner()}
        type="warning"
        closable
        onClose={props.onClose}
      />
    )}
    {props.type === "test" && (
      <Alert style={{ backgroundColor: "#F3CD65" }} message={renderTestBanner()} type="warning" />
    )}
    {props.type === "mobile" && (
      <Alert
        style={{ backgroundColor: "#F3CD65" }}
        message={renderMobileWarningBanner()}
        type="warning"
        closable
        onClose={props.onClose}
      />
    )}
  </div>
);

WarningBanner.propTypes = propTypes;
export default WarningBanner;
