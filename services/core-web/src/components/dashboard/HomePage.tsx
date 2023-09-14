import React, { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { fetchMetabaseDashboard } from "@common/actionCreators/reportingActionCreator";
import ReactIframeResizer from "react-iframe-resizer-super";
import { PageTracker } from "@common/utils/trackers";
import SearchBar from "@/components/search/SearchBar";
import { BACKGROUND, HSRC_PDF, MEMP_PDF } from "@/constants/assets";

const iframeResizerOptions = { checkOrigin: false };

const HomePage = () => {
  const [graph_urls, setGraphUrls] = useState([]);

  useEffect(() => {
    (async () => {
      const newGraphUrls = await Promise.all([
        fetchMetabaseDashboard("164"),
        fetchMetabaseDashboard("165"),
      ]);
      setGraphUrls(newGraphUrls);
    })();
  }, []);

  const xs = 22;
  const sm = 20;
  const md = 10;
  const lg = 8;
  const xl = 6;
  const hGutter = 32;
  const vGutter = 32;
  const iframeUrlOne = `${graph_urls[0]}#bordered=true&titled=false`;
  const iframeUrlTwo = `${graph_urls[1]}#bordered=true&titled=false`;
  return (
    <div className="background" style={{ backgroundImage: `url(${BACKGROUND})` }}>
      <PageTracker title="Home Page" />
      <Row justify="center" gutter={[hGutter, vGutter]}>
        <Col xs={xs} sm={sm} md={md * 2} lg={lg * 2} xl={xl * 2}>
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
        </Col>
      </Row>
      {graph_urls.length === 2 && (
        <Row justify="center" gutter={[hGutter, vGutter]}>
          <Col xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
            <div className="metabase-card">
              <ReactIframeResizer src={iframeUrlOne} iframeResizerOptions={iframeResizerOptions} />
            </div>
          </Col>
          <Col xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
            <div className="metabase-card">
              <ReactIframeResizer src={iframeUrlTwo} iframeResizerOptions={iframeResizerOptions} />
            </div>
          </Col>
        </Row>
      )}
      <Row justify="center" gutter={[hGutter, vGutter]}>
        <Col xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
          <div className="link-card">
            <ul>
              <li>External Links</li>
              <li>
                <a
                  href="https://a100.gov.bc.ca/int/cvis/nris/nris.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Inspections (NRIS)
                </a>
              </li>
              <li>
                <a
                  href="https://www2.gov.bc.ca/gov/content/data/geographic-data-services/web-based-mapping/imapbc"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  iMapBC
                </a>
              </li>
              <li>
                <a
                  href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/mineral-titles/mineral-placer-titles/mineraltitlesonline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mineral Titles Online (MTO)
                </a>
              </li>
              <li>
                <a href="https://mines.nrs.gov.bc.ca/" target="_blank" rel="noopener noreferrer">
                  Public Transparency Website (MMTI)
                </a>
              </li>
              <li>
                <a
                  href="https://gww.nrs.gov.bc.ca/empr/mines-and-mineral-resources/inspector-mines-training"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LAMP
                </a>
              </li>
              <li>
                <a href="https://minfile.gov.bc.ca/" target="_blank" rel="noopener noreferrer">
                  Mineral Inventory (MINFILE)
                </a>
              </li>
              <li>
                <a
                  href="https://governmentofbc.maps.arcgis.com/apps/webappviewer/index.html?id=f024193c07a04a28b678170e1e2046f6"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Not set up to use this? Contact the GIS team."
                >
                  EMLI Inspection Mapper
                </a>
              </li>
              <li>
                {/* TODO: Change this to be the correct URL, if and when they change EMPR to EMLI */}
                <a
                  href="https://nrm.sp.gov.bc.ca/sites/EMPR/mtb/_layouts/15/start.aspx#/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  EMLI Sharepoint Requests Portal
                </a>
              </li>
              <li>
                <a href="https://projects.eao.gov.bc.ca/" target="_blank" rel="noopener noreferrer">
                  EPIC (EAO)
                </a>
              </li>
              <li>
                <a
                  href="https://mines.qp.gov.bc.ca/mines/app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mines Certification Registry
                </a>
              </li>
            </ul>
          </div>
        </Col>
        <Col xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
          <div className="link-card">
            <ul>
              <li>Documents</li>
              <li>
                <a href={HSRC_PDF} target="_blank" rel="noopener noreferrer">
                  Health, Safety and Reclamation Code
                </a>
              </li>
              <li>
                <a
                  href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/further-information/reports-publications/chief-inspector-s-annual-reports"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chief Inspector&apos;s Annual Reports
                </a>
              </li>
              <li>
                <a
                  href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/further-information/directives-alerts-incident-information/chief-inspector-directives"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chief Inspector&apos;s Directives
                </a>
              </li>
              <li>
                <a href={MEMP_PDF} target="_blank" rel="noopener noreferrer">
                  Mine Emergency Management Plan (MEMP)
                </a>
              </li>
            </ul>
          </div>
        </Col>
      </Row>
      <br />
    </div>
  );
};

export default HomePage;
