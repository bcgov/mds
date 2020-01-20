import React from "react";
import { Divider, Button, Icon } from "antd";

import QuestionSidebar from "@/components/common/QuestionsSidebar";

import { USER_GUIDE, TAILINGS_DOCUMENT } from "@/constants/assets";

export const LandingPage = () => (
  <div>
    <div>
      <h1 className="landing-page-title">Welcome to MineSpace, an online portal for mines in BC</h1>
      <p>
        The Mines Digital Service (MDS) is a digital product being iteratively developed and
        designed to hold mine-related data that is user-friendly, trustworthy and reliable. The
        product will eventually replace the existing internal Mine Management System used by the
        Ministry and be used to surface information to the BC Mine Information website. The MDS
        project was started in July 2018 to help inspectors manage the mines they work with by
        replacing existing legacy systems and adding new functionality.
      </p>
      <br />
      <p>
        MineSpace is a piece of the Mines Digital Services Product that provides a link between the
        mine proponent and the Ministry. It is the online portal through which mines can interact
        with the Ministry by submitting reports and information as required by the Health, Safety,
        and Reclamation Code. MineSpace will enable mines to check the status of their reporting
        requirements and see the documentation that they have submitted to the Ministry for review.
        The portal is live and is expanding throughout 2019.
      </p>
    </div>
    <Divider className="gov-blue" style={{ height: "2px" }} />
    <div className="inline-flex block-tablet">
      <div className="flex-3">
        <h1 className="medium-margin-bot">Reporting templates</h1>
        <p>
          The Ministry is developing online templates to facilitate the submission of compliance
          information for Health and Safety, Geotechnical, Reclamation, and Geoscience. These
          templates will address Ministry requirements for Variance Applications, Incident
          Reporting, and the Tailings Storage Facility (TSF) Registry.
        </p>
        <br />
        <h2 className="medium-margin-bot">Tailings storage facilities and dams registry</h2>
        <p>
          Register of Tailings Storage Facilities and Dams (HSRC, 2016. 10.4.3). The registry should
          contain all tailings and water retaining structures on site, regardless of whether they
          are classified as dams or if they are currently operating or dormant structures.
        </p>
        <br />
        <p>
          <a href={TAILINGS_DOCUMENT}>
            <Icon type="download" /> Register of Tailings Storage Facilities and Dams (XLSM, 1.0 MB)
          </a>
          <br />
          <a href={USER_GUIDE}>
            <Icon type="download" /> User Guide - Register of Tailings Storage Facilities and Dams
            (PDF, 0.6 MB)
          </a>
        </p>
        <br />
        <p>
          <strong>
            Please submit completed registry spreadsheets to{" "}
            <a mailto="PERMRECL@gov.bc.ca">PERMRECL@gov.bc.ca</a>. You may also submit them via
            MineSpace if you participated in the 2019 Pilot Project.
          </strong>
        </p>

        <h1 className="large-margin-top medium-margin-bot">2019 pilot project</h1>
        <p>
          In March 2019, 6 mines were asked to participate in a pilot project to demonstrate how
          document submission would work in MineSpace. The pilot focused on the 2018 TSF annual
          reporting period and asked mines to submit required TSF reports through the MineSpace
          portal. During the pilot, an additional 26 mines were recruited by word of mouth and chose
          to participate. Following the pilot project, feedback from the participating mines showed
          that document submission through MineSpace was a success. It resulted in a total of 32
          mines voluntarily logging into MineSpace and submitting 120 required TSF reports. The
          submitted TSF reports were then instantly made available for Ministry staff to review -
          making it easier for both mines and Ministry staff to track document submission status.
        </p>
        <h1 className="large-margin-top medium-margin-bot">
          Prepare for next year&apos;s submission period
        </h1>
        <p>
          The pilot represents an initial step in mines interacting with Ministry through an online
          portal. We will require all mines to submit their required reporting through MineSpace
          starting in 2020, including variance requests, dangerous occurrence reports, and
          compliance information. To use this system you will need to get a business BCeID, and
          verify your existing credentials if you have not already already done so. This process can
          take time and it is best to begin as soon as possible.
        </p>
      </div>
      <div className="flex-1">
        <div className="sidebar-block">
          <div className="sidebar-block-title">
            <h2 className="side-bar-title">Do you have a BCeID?</h2>
          </div>
          <div className="sidebar-block-content">
            <p>
              In order to submit information through MineSpace, you will need to register for a
              Business BCeID. This process can take several weeks, so ensure you allow plenty of
              time before end of year reporting deadlines.
            </p>
            <br />
            <p>
              You will need to add employees and delegates who will be using the system to your
              Business BCeID account.
            </p>
            <div className="sidebar-button">
              <a
                href="https://www.bceid.ca/register/business/getting_started/getting_started.aspx"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button type="primary" size="large" block>
                  Get a BCeID
                </Button>
              </a>
            </div>
          </div>
        </div>
        <QuestionSidebar />
      </div>
    </div>
  </div>
);

export default LandingPage;
