import React, { Component } from "react";
import PropTypes from "prop-types";
import SearchBar from "@/components/search/SearchBar";
import { BACKGROUND, HSRC_PDF } from "@/constants/assets";
import { fetchMetabaseDashboard } from "@/actionCreators/reportingActionCreator";

const propTypes = {
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
};

export class HomePage extends Component {
  state = { graph_urls: [] };

  async componentDidMount() {
    const graph_urls = await Promise.all([
      fetchMetabaseDashboard("164"),
      fetchMetabaseDashboard("165"),
    ]);
    this.setState({ graph_urls });
  }

  render() {
    const iframeUrlOne = `${this.state.graph_urls[0]}#bordered=true&titled=false`;
    const iframeUrlTwo = `${this.state.graph_urls[1]}#bordered=true&titled=false`;
    return (
      <div className="background" style={{ backgroundImage: `url(${BACKGROUND})` }}>
        <div className="search-container">
          <div className="center">
            <h1>Welcome!</h1>
            <p>To begin, please search or click the links below</p>
            <br />
          </div>
          <SearchBar />
          <br />
          <a href="mailto: mds@gov.bc.ca">Have questions?</a>
        </div>
        {this.state.graph_urls.length === 2 && (
          <div className="inline-flex justify-center block-mobile">
            <div className="metabase-card">
              <iframe title="metabaseDashboard" src={iframeUrlOne} width="390" height="300" />
            </div>
            <div className="metabase-card">
              <iframe title="metabaseDashboard" src={iframeUrlTwo} width="390" height="300" />
            </div>
          </div>
        )}
        <div className="inline-flex justify-center block-mobile">
          <div className="link-card">
            <ul>
              <li className="uppercase violet">External Links</li>
              <li>
                <p>
                  <a
                    href="https://a100.gov.bc.ca/int/cvis/nris/nris.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Inspections (NRIS)
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
                    iMapBC
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
                    Mineral Titles Online (MTO)
                  </a>
                </p>
              </li>
              <li>
                <p>
                  <a href="https://mines.nrs.gov.bc.ca/" target="_blank" rel="noopener noreferrer">
                    Public Transparency Website (MMTI)
                  </a>
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="https://gww.nrs.gov.bc.ca/empr/mines-and-mineral-resources/inspector-mines-training"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Inspector of Mines Training
                  </a>
                </p>
              </li>
              <li>
                <p>
                  <a href="https://minfile.gov.bc.ca/" target="_blank" rel="noopener noreferrer">
                    Mineral Inventory (MINFILE)
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
                    Project Information & Resources
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
                  <a href={HSRC_PDF} target="_blank" rel="noopener noreferrer">
                    Health, Safety and Reclamation Code
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
                    Chief Inspectors Annual Report
                  </a>
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/further-information/directives-alerts-incident-information/chief-inspector-directives"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chief Inspectors Directives
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
