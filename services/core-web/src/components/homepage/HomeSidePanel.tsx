import React from "react";

import { Row, Col, Card, Typography, Divider } from "antd";
import { Link } from "react-router-dom";

const linkWidget = (title, links) => {
  return (
    <Card>
      <Typography.Title level={2}>{title}</Typography.Title>
      {/* key should not be link.title */}
      {links.map((link) => (
        <li key={link.title}>
          <Link to={link.url} target="_blank" rel="noopener noreferrer">
            {link.title}
          </Link>
        </li>
      ))}
    </Card>
  );
};
const ExternalLinksSection = () => {
  const links = [
    {
      title: "Inspections (NRIS)",
      url: "www.google.ca",
    },
    {
      title: "iMapBC",
      url: "www.google.ca",
    },
    {
      title: "Mineral Titles Online (MTO)",
      url: "www.google.ca",
    },
    {
      title: "LAMP",
      url: "www.google.ca",
    },
    {
      title: "Mineral Inventory (MINFILE)",
      url: "www.google.ca",
    },
    {
      title: "EMLI Inspection Mapper",
      url: "www.google.ca",
    },
    {
      title: "EMLI Sharepoint Requests Portal",
      url: "www.google.ca",
    },
    {
      title: "EPIC (EAO)",
      url: "www.google.ca",
    },
    {
      title: "Mines Certification Registry",
      url: "www.google.ca",
    },
    {
      title: "First Nation Consultation System", // Nation or Nations?
      url: "www.google.ca",
    },
  ];
  return linkWidget("External Links", links);
};

const MapsSection = () => {
  const links = [
    {
      title: "Active ESUP",
      url: "www.google.ca",
    },
    {
      title: "Tailings Storage Facility",
      url: "www.google.ca",
    },
  ];
  return linkWidget("Maps", links);
};

const DocumentsSection = () => {
  const links = [
    {
      title: "Health, Safety and Reclamation Code",
      url: "www.google.ca",
    },
    {
      title: "Chief Inspector's Annual Reports",
      url: "www.google.ca",
    },
    {
      title: "Chief Inspector's Directives",
      url: "www.google.ca",
    },
    {
      title: "Mine Emergency Management Plan",
      url: "www.google.ca",
    },
  ];
  return linkWidget("Documents", links);
};

const FeedbackSection = () => {
  return (
    <Card>
      <Typography.Title level={2}>We Need Your Feedback!</Typography.Title>
      <Typography.Paragraph>
        We are always open to feedback for CORE and Minespace to improve your experience. Have you
        encountered a bug that prevents you from working? Get in touch with us.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Contact the <a href="mailto: mds@gov.bc.ca">MDS Team</a>
      </Typography.Paragraph>
    </Card>
  );
};
const HomeSidePanel = () => {
  return (
    <div style={{ border: "1px solid goldenrod", color: "white" }}>
      <ExternalLinksSection />
      <MapsSection />
      <DocumentsSection />
      <FeedbackSection />
    </div>
  );
};

export default HomeSidePanel;
