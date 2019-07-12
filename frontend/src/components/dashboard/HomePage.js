/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import SearchBar from "@/components/search/SearchBar";
import { BACKGROUND } from "@/constants/assets";

const propTypes = {
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
};

export class HomePage extends Component {
  render() {
    return (
      <div className="background" style={{ backgroundImage: `url(${BACKGROUND})` }}>
        <div className="search-container">
          <div className="center">
            <h1>Welcome!</h1>
            <p>To begin, please search or clicks the links below.</p>
            <br />
          </div>
          <SearchBar containerId="homePage" />
          <a href="mailto: mds@gov.bc.ca">Have questions?</a>
        </div>
        <div className="inline-flex justify-center">
          <div className="link-card">
            <ul>
              <li className="uppercase violet">External Links</li>
              <li>
                <p>
                  <a
                    href="https://a100.gov.bc.ca/int/cvis/nris/nris.html?fromRoleSelect=true#/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    NRIS
                  </a>
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="https://www2.gov.bc.ca/gov/content/data/geographic-data-services/web-based-mapping/imapbc"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    IMAP
                  </a>
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/mineral-titles/mineral-placer-titles/mineraltitlesonline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    MTO
                  </a>
                </p>
              </li>
              <li>
                <p>
                  <a href="https://mines.nrs.gov.bc.ca/" target="_blank" rel="noopener noreferrer">
                    MMTI
                  </a>
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="https://gww.nrs.gov.bc.ca/empr/mines-and-mineral-resources-division/mds-employee-info-resource-hub"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    EMPR Intranet
                  </a>
                </p>
              </li>
            </ul>
          </div>
          <div className="link-card">
            <ul>
              <li className="uppercase violet">Documents</li>
              <li>
                <p>
                  <a
                    href="https://a100.gov.bc.ca/int/cvis/nris/nris.html?fromRoleSelect=true#/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chief Inspectors Annual Report
                  </a>
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/further-information/reports-publications/chief-inspector-s-annual-reports"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ci Directives
                  </a>
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/mineral-titles/mineral-placer-titles/mineraltitlesonline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    HSRC
                  </a>
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="https://a100.gov.bc.ca/int/cvis/nris/nris.html?fromRoleSelect=true#/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Training Materials
                  </a>
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

HomePage.propTypes = propTypes;

export default HomePage;
