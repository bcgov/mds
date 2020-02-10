import React from "react";
import PropTypes from "prop-types";
import { Alert, Row, Col, Typography } from "antd";
import { WARNING } from "@/constants/assets";

const { Text } = Typography;

const propTypes = {
  type: PropTypes.oneOf(["IE", "test", "mobile"]).isRequired,
  onClose: PropTypes.func.isRequired,
};

const testWarningData = {
  message: "This is the Core test site",
  description:
    "Features and layout could differ from the live production site and data entered in this system will not be saved.",
};

const mobileWarningData = {
  message: "You are using a mobile device",
  description: "The application may not work as intended in a mobile environment.",
};

const ieWarningData = {
  message: "Internet Explorer is not supported",
  description: (
    <span>
      The application may not work as intended. Please use a supported browser (
      <a href="https://www.google.com/chrome" target="_blank" rel="noopener noreferrer">
        Chrome
      </a>
      ,&nbsp;
      <a href="https://www.mozilla.org/en-US/firefox/new" target="_blank" rel="noopener noreferrer">
        Firefox
      </a>
      , or&nbsp;
      <a href="https://support.apple.com/en-ca/safari" target="_blank" rel="noopener noreferrer">
        Safari
      </a>
      ).
    </span>
  ),
};

const WarningBanner = (props) => {
  let warningData;
  switch (props.type) {
    case "test":
      warningData = testWarningData;
      break;
    case "mobile":
      warningData = mobileWarningData;
      break;
    case "IE":
      warningData = ieWarningData;
      break;
  }

  return (
    warningData && (
      <Row>
        <Col>
          <Alert
            className="warning-banner"
            message={<Text strong>{warningData.message}</Text>}
            description={<Text>{warningData.description}</Text>}
            type="warning"
            closable
            onClose={props.onClose}
            showIcon
            icon={<img src={WARNING} alt="Warning" />}
          />
        </Col>
      </Row>
    )
  );
};

WarningBanner.propTypes = propTypes;

export default WarningBanner;
