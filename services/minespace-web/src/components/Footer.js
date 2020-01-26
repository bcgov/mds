import React from "react";
import { Layout } from "antd";
import * as Strings from "@/constants/strings";

export const Footer = () => (
  <Layout.Footer>
    <div className="footer-content">
      <a className="footer-link" href="/">
        Home
      </a>
      <a
        className="footer-link"
        href="https://www2.gov.bc.ca/gov/content/home/disclaimer"
        target="_blank"
        rel="noopener noreferrer"
      >
        Disclaimer
      </a>
      <a
        className="footer-link"
        href="https://www2.gov.bc.ca/gov/content/home/copyright"
        target="_blank"
        rel="noopener noreferrer"
      >
        Copyright
      </a>
      <a
        className="footer-link"
        href="https://www2.gov.bc.ca/gov/content/home/privacy"
        target="_blank"
        rel="noopener noreferrer"
      >
        Privacy
      </a>
      <a
        className="footer-link"
        href="https://www2.gov.bc.ca/gov/content/home/accessibility"
        target="_blank"
        rel="noopener noreferrer"
      >
        Accessibility
      </a>
      <a className="footer-link" href={`mailto:${Strings.MDS_EMAIL}`}>
        Contact Us
      </a>
    </div>
  </Layout.Footer>
);

export default Footer;
