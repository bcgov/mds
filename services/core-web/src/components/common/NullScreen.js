import React from "react";
import PropTypes from "prop-types";
import * as String from "@common/constants/strings";
import { NO_MINE, MINER_TWO, PERMIT, GROUP_MINERS } from "@/constants/assets";

/**
 * @constant NullScreen is a reusable view for when there is no data to display, add more views when required.
 */

const propTypes = {
  type: PropTypes.oneOf([
    "dashboard",
    "generic",
    "manager",
    "manager-small",
    "tenure",
    "permit",
    "variance-applications",
    "approved-variances",
    "variance",
    "no-results",
    "compliance",
    "unauthorized",
    "view-mine-manager",
    "contacts",
    "unauthorized-page",
    "subscription",
    "incidents",
    "reports",
    "applications",
    "notice-of-work",
    "next-stage",
    "documents",
    "now-equipment",
    "now-contacts",
    "add-now-activity",
    "securities",
  ]),
  message: PropTypes.string,
};

const defaultProps = {
  type: "generic",
  message: "",
};

const NullScreen = (props) => (
  <div className="null-screen fade-in">
    {props.type === "dashboard" && (
      <div>
        <img alt="mine_img" src={NO_MINE} />
        <h3>{String.NO_DATA}</h3>
        <p>{String.TRY_AGAIN}</p>
      </div>
    )}
    {props.type === "generic" && (
      <div>
        <img alt="mine_img" src={NO_MINE} />
        <h3>{String.NO_DATA}</h3>
      </div>
    )}
    {props.type === "manager" && (
      <div className="null-screen--inline">
        <img alt="mine_img" src={MINER_TWO} />
        <h3>{String.NO_MINE_MANAGER}</h3>
      </div>
    )}
    {props.type === "manager-small" && (
      <div>
        <img alt="min_img" src={MINER_TWO} />
        <h3>{String.NO_DATA}</h3>
        <p>{String.ADD_PARTY}</p>
      </div>
    )}
    {props.type === "permit" && (
      <div>
        <img alt="mine_img" src={PERMIT} />
        <h3>{String.NO_PERMIT}</h3>
      </div>
    )}
    {props.type === "compliance" && (
      <div>
        <img alt="mine_img" src={PERMIT} />
        <h3>{String.NO_NRIS_INSPECTIONS}</h3>
      </div>
    )}
    {props.type === "approved-variances" && (
      <div>
        <img alt="mine_img" src={PERMIT} />
        <h3>{String.NO_APPROVED_VARIANCE}</h3>
      </div>
    )}
    {props.type === "variance-applications" && (
      <div>
        <img alt="mine_img" src={PERMIT} />
        <h3>{String.NO_VARIANCE_APPLICATIONS}</h3>
      </div>
    )}
    {props.type === "applications" && (
      <div>
        <img alt="mine_img" src={PERMIT} />
        <h3>{String.NO_APPLICATION}</h3>
      </div>
    )}
    {props.type === "notice-of-work" && (
      <div>
        <img alt="mine_img" src={PERMIT} />
        <h3>There are no notice of work applications</h3>
      </div>
    )}
    {props.type === "no-results" && (
      <div>
        <img alt="mine_img" src={NO_MINE} />
        <h3>{String.NO_RESULTS}</h3>
      </div>
    )}
    {props.type === "subscription" && (
      <div>
        <img alt="mine_img" src={NO_MINE} />
        <h3>You are not subscribed to any mines</h3>
      </div>
    )}
    {props.type === "unauthorized" && (
      <div className="no-nav-bar">
        <img alt="mine_img" src={NO_MINE} />
        <h3>{String.UNAUTHORIZED}</h3>
        <p>{String.CONTACT_ADMIN}</p>
      </div>
    )}
    {props.type === "next-stage" && (
      <div className="no-nav-bar">
        <img alt="mine_img" src={NO_MINE} />
        <h3>Content is unavailable until the application reaches this stage</h3>
      </div>
    )}
    {props.type === "now-equipment" && (
      <div>
        <img alt="mine_img" src={NO_MINE} />
        <h3>No equipment associated with this Notice of Work</h3>
      </div>
    )}
    {props.type === "unauthorized-page" && (
      <div className="no-nav-bar">
        <img alt="mine_img" src={NO_MINE} />
        <h3>{String.UNAUTHORIZED_PAGE}</h3>
      </div>
    )}
    {props.type === "view-mine-manager" && (
      <div className="center">
        <img alt="mine_img" src={GROUP_MINERS} />
        <p>{String.NO_PREV_MINE_MANAGER}</p>
      </div>
    )}
    {props.type === "contacts" && (
      <div>
        <img alt="mine_img" src={MINER_TWO} />
        <h3>No contacts found</h3>
        <p>Create a contact using the menu above</p>
      </div>
    )}
    {props.type === "now-contacts" && (
      <div>
        <img alt="mine_img" src={GROUP_MINERS} />
        <h3>No contacts associated with this Notice of Work</h3>
      </div>
    )}
    {props.type === "add-now-activity" && (
      <div>
        <p>
          This application does not contain any information on <i>{props.message}</i>.
          <br />
          Enable edit mode to add this Activity.
        </p>
      </div>
    )}
    {props.type === "incidents" && (
      <div>
        <img alt="mine_img" src={PERMIT} />
        <h3>No incidents found</h3>
      </div>
    )}
    {props.type === "reports" && (
      <div>
        <img alt="mine_img" src={PERMIT} />
        <h3>No reports found</h3>
      </div>
    )}
    {props.type === "documents" && (
      <div>
        <img alt="mine_img" src={PERMIT} />
        <h3>No documents found</h3>
      </div>
    )}
    {props.type === "securities" && (
      <div>
        <img alt="mine_img" src={PERMIT} />
        <h3>{String.NO_SECURITIES}</h3>
      </div>
    )}
  </div>
);

NullScreen.propTypes = propTypes;
NullScreen.defaultProps = defaultProps;

export default NullScreen;
