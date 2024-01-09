import React from "react";

import { Typography } from "antd";
import { HSRC_PDF, MEMP_PDF } from "@/constants/assets";

const linkWidget = (title, links) => {
  return (
    <div className="home-bordered-content">
      <Typography.Title level={4}>{title}</Typography.Title>
      {links.map((link) => (
        <div key={link.title}>
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            {link.title}
          </a>
        </div>
      ))}
    </div>
  );
};
const ExternalLinksSection = () => {
  const links = [
    {
      title: "Inspections (NRIS)",
      url: "https://a100.gov.bc.ca/int/cvis/nris/nris.html",
    },
    {
      title: "iMapBC",
      url:
        "https://www2.gov.bc.ca/gov/content/data/geographic-data-services/web-based-mapping/imapbc",
    },
    {
      title: "Mineral Titles Online (MTO)",
      url:
        "https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/mineral-titles/mineral-placer-titles/mineraltitlesonline",
    },
    {
      title: "LAMP",
      url: "https://gww.nrs.gov.bc.ca/empr/mines-and-mineral-resources/inspector-mines-training",
    },
    {
      title: "Mineral Inventory (MINFILE)",
      url: "https://minfile.gov.bc.ca/",
    },
    {
      title: "EMLI Inspection Mapper",
      url:
        "https://governmentofbc.maps.arcgis.com/apps/webappviewer/index.html?id=f024193c07a04a28b678170e1e2046f6",
    },
    {
      title: "Mining GIS Request Portal",
      url:
        "https://bcgov.sharepoint.com/sites/EMLI-MINESGIS/SitePages/Mining-GIS-Requests-Portal-Home.aspx",
    },
    {
      title: "EPIC (EAO)",
      url: "https://projects.eao.gov.bc.ca/",
    },
    {
      title: "Mines Certification Registry",
      url: "https://mines.qp.gov.bc.ca/mines/app",
    },
    {
      title: "First Nation Consultation System",
      url: "https://apps.nrs.gov.bc.ca/int/fncs",
    },
    {
      title: "Regional Mines Public Engagement Tool Portal",
      url: "http://www.gov.bc.ca/minesengagement",
    },
  ];
  return linkWidget("External Links", links);
};

const MapsSection = () => {
  const links = [
    {
      title: "Active ESUP",
      url:
        "https://metabase-4c2ba9-prod.apps.silver.devops.gov.bc.ca/question/2569-active-explosives-permits-in-bc-map",
    },
    {
      title: "Tailings Storage Facility",
      url: "https://metabase-4c2ba9-prod.apps.silver.devops.gov.bc.ca/question/2610-mine-tsf-map",
    },
  ];
  return linkWidget("Maps", links);
};

const DocumentsSection = () => {
  const links = [
    {
      title: "Health, Safety and Reclamation Code",
      url: HSRC_PDF,
    },
    {
      title: "Chief Inspector's Annual Reports",
      url:
        "https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/further-information/reports-publications/chief-inspector-s-annual-reports",
    },
    {
      title: "Chief Inspector's Directives",
      url:
        "https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/further-information/directives-alerts-incident-information/chief-inspector-directives",
    },
    {
      title: "Mine Emergency Management Plan",
      url: MEMP_PDF,
    },
  ];
  return linkWidget("Documents", links);
};

const FeedbackSection = () => {
  return (
    <div className="home-bordered-content">
      <Typography.Title level={4}>We Need Your Feedback!</Typography.Title>
      <Typography.Paragraph>
        We are always open to feedback for CORE and Minespace to improve your experience. Have you
        encountered a bug that prevents you from working? Get in touch with us.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Contact the <a href="mailto: mds@gov.bc.ca">MDS Team</a>
      </Typography.Paragraph>
    </div>
  );
};
const HomeSidePanel = () => {
  return (
    <div id="home-side-panel-container">
      <ExternalLinksSection />
      <MapsSection />
      <DocumentsSection />
      <FeedbackSection />
    </div>
  );
};

export default HomeSidePanel;
