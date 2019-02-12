import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { TENURE, NO_MINE, MINER_TWO, PERMIT, GROUP_MINERS, COMPUTER_404 } from "@/constants/assets";
import * as String from "@/constants/strings";
import * as route from "@/constants/routes";

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
    "no-results",
    "unauthorized",
    "view-mine-manager",
    "contacts",
    "unauthorized-page",
    "404",
  ]),
};

const defaultProps = {
  type: "generic",
};

const NullScreen = (props) => (
  <div className="null-screen">
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
    {props.type === "tenure" && (
      <div>
        <img alt="mine_img" src={TENURE} />
        <h3>{String.NO_DATA}</h3>
        <p>{String.ADD_TENURE}</p>
      </div>
    )}
    {props.type === "permit" && (
      <div>
        <img alt="mine_img" src={PERMIT} />
        <h3>{String.NO_PERMIT}</h3>
      </div>
    )}
    {props.type === "no-results" && (
      <div>
        <img alt="mine_img" src={NO_MINE} />
        <h3>{String.NO_RESULTS}</h3>
      </div>
    )}
    {props.type === "unauthorized" && (
      <div className="no-nav-bar">
        <img alt="mine_img" src={NO_MINE} />
        <h3>{String.UNAUTHORIZED}</h3>
        <p>{String.CONTACT_ADMIN}</p>
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
    {props.type === "404" && (
      <div className="no-nav-bar">
        <img alt="mine_img" src={COMPUTER_404} />
        <h1>Uh Oh!</h1>
        <p>
          We can't seem to find the page you're looking for. It may have moved, or no longer exists.
        </p>
        <p>
          {" "}
          <Link to={route.MINE_DASHBOARD.route}>Return to the home page</Link> to get back on track.
        </p>
      </div>
    )}
  </div>
);

NullScreen.propTypes = propTypes;
NullScreen.defaultProps = defaultProps;

export default NullScreen;
