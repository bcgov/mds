import React from "react";
import { Layout, Row, Col } from "antd";
import PropTypes from "prop-types";
import * as Strings from "@/constants/strings";

const propTypes = {
  xs: PropTypes.number.isRequired,
  lg: PropTypes.number.isRequired,
  xl: PropTypes.number.isRequired,
  xxl: PropTypes.number.isRequired,
};

export const Footer = (props) => (
  <Layout.Footer>
    <Row type="flex" justify="center" align="middle" style={{ height: "100%" }}>
      <Col xs={props.xs} lg={props.lg} xl={props.xl} xxl={props.xxl}>
        <Row className="footer-content" type="flex" justify="center" align="middle">
          <Col xs={24} lg={4}>
            <a className="footer-link" href="/">
              Home
            </a>
          </Col>
          <Col xs={24} lg={4}>
            <a
              className="footer-link"
              href="https://www2.gov.bc.ca/gov/content/home/disclaimer"
              target="_blank"
              rel="noopener noreferrer"
            >
              Disclaimer
            </a>
          </Col>
          <Col xs={24} lg={4}>
            <a
              className="footer-link"
              href="https://www2.gov.bc.ca/gov/content/home/copyright"
              target="_blank"
              rel="noopener noreferrer"
            >
              Copyright
            </a>
          </Col>
          <Col xs={24} lg={4}>
            <a
              className="footer-link"
              href="https://www2.gov.bc.ca/gov/content/home/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy
            </a>
          </Col>
          <Col xs={24} lg={4}>
            <a
              className="footer-link"
              href="https://www2.gov.bc.ca/gov/content/home/accessibility"
              target="_blank"
              rel="noopener noreferrer"
            >
              Accessibility
            </a>
          </Col>
          <Col xs={24} lg={4}>
            <a className="footer-link" href={`mailto:${Strings.MDS_EMAIL}`}>
              Contact Us
            </a>
          </Col>
        </Row>
      </Col>
    </Row>
  </Layout.Footer>
);

Footer.propTypes = propTypes;

export default Footer;
