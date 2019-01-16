import React from "react";
import { Divider } from "antd";

import { AuthenticationGuard } from "../HOC/AuthenticationGuard";
import { SidebarBlock } from "./SidebarBlock";

const sidebarBlockOneContent =
  "In order to submit information through MineSpace, you will need to register for a Business BCeID. This process can take several weeks, so ensure you allow plenty of time before end of year reporting deadlines. You will need to add employees and delegates who will be using the system to your Business BCeID account.";

export const LandingPage = () => (
  <div className="content">
    <div>
      <h1 className="title"> Welcome to MineSpace, an online portal for BC mines</h1>
      <p>
        The Mines Digital Service (MDS) is a digital product being iteratively developed and
        designed to hold mine related data that is user-friendly, trustworthy and reliable. The
        product will eventually replace the existing internal Mine Management System used by the
        Ministry and be used to surface information to the{" "}
        <a href="http://mines.nrs.gov.bc.ca/" target="_blank" rel="noopener noreferrer">
          BC Mine Information website
        </a>
        . The MDS project was started in July to help inspectors manage the mines they work with by
        replacing existing legacy systems and adding new functionality.
      </p>
      <br />
      <p>
        MineSpace is a pilot project as a part of the MDS digital product. MineSpace will be the
        portal through which mines can interact with the Ministry. In time, Mines will be able to
        submit documentation to the Ministry, as well as check the status of reporting requirements,
        and documentation that they have submitted to the ministry for review. The pilot project
        will run in the spring of 2019 with full integration in early 2020.
      </p>
    </div>
    <Divider />
    <div className="medium-margin-bot">
      <SidebarBlock
        title="Do you have a Business BceID?"
        content={sidebarBlockOneContent}
        hasButton="True"
        buttonText="Get a BCeID"
      />
      <h1 className="large-margin-bot">Participate in the pilot project</h1>
      <h2 className="medium-margin-bot">Requirements</h2>
      <p>You can participate if you:</p>
      <ul className="indent-list-padding">
        <li>are a BC mine with a tailings storage facility</li>
        <li>will be submitting code-required reports for 2018</li>
        <li>have a valid Business BCeID for your company</li>
        <li> contact the MDS team at mds@gov.bc.ca</li>
      </ul>
    </div>
    <div className="medium-margin-bot">
      <h2 className="medium-margin-bot">Steps</h2>
      <ol className="list-padding-left">
        <li>
          If you have a valid Business BCeID, add all of the employees and delegates who will be
          accessing the system to your account.
        </li>
        <li>
          Send an email to mds@gov.bc.ca with the following information:
          <ul className="embeded-list-padding">
            <li>name of each employee or delegate you have added</li>
            <li>BCeID email address of each employee or delegate</li>
            <li>
              name and number of the mine(s) for which the employee or delegate will be submitting
              info
            </li>
          </ul>
        </li>
        <li>
          Wait for an email confirming that your employees/delegates have been added to MineSpace.
        </li>
        <li>Log in to the system.</li>
        <li>If you require a tutorial on how to use the system, watch this video.</li>
        <li>
          If you run into any issues before or during the submission process, please contact us.
        </li>
      </ol>
    </div>
    <div>
      <h1 className="large-margin-top medium-margin-bot">
        Prepare for next year’s submission period
      </h1>
      <p>
        The pilot represents an initial step in mines interacting with Ministry through an online
        portal. We will require all mines to submit their required reporting through MineSpace
        starting in 2020, including variance requests, dangerous occurrence reports, and compliance
        information. To use this system you will need to get a business BCeID, and verify your
        existing credentials if you have not already already done so. This process can take time and
        it is best to begin ahead of time.
      </p>
    </div>
  </div>
);

export default AuthenticationGuard(LandingPage);
