import React from "react";

export const FooterContent = () => (
  <div className="footer">
    <div className="footer-info-ul">
      <ul>
        <li>
          <a className="footer-link" href="/">
            Home
          </a>
        </li>
        <li>
          <a
            className="footer-link"
            href="https://www2.gov.bc.ca/gov/content/home/disclaimer"
            target="_blank"
            rel="noopener noreferrer"
          >
            Disclaimer
          </a>
        </li>
        <li>
          <a
            className="footer-link"
            href="https://www2.gov.bc.ca/gov/content/home/copyright"
            target="_blank"
            rel="noopener noreferrer"
          >
            Copyright
          </a>
        </li>
        <li>
          <a
            className="footer-link"
            href="https://www2.gov.bc.ca/gov/content/home/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy
          </a>
        </li>
        <li>
          <a
            className="footer-link"
            href="https://www2.gov.bc.ca/gov/content/home/accessibility"
            target="_blank"
            rel="noopener noreferrer"
          >
            Accessibility
          </a>
        </li>
        <li>
          <a className="footer-link" href="mailto:MDS@gov.bc.ca">
            Contact Us
          </a>
        </li>
      </ul>
    </div>
  </div>
);

export default FooterContent;
