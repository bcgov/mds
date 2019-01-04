import React from "react";
import PropTypes from "prop-types";
import { Icon } from "antd";
import { Link } from "react-router-dom";
import * as router from "@/constants/routes";

const propTypes = {
  partyRelationshipTypeCode: PropTypes.string.isRequired,
  partyRelationshipTypeLabel: PropTypes.string.isRequired,
  mine: PropTypes.object.isRequired,
};

export const InactiveContact = (props) => (
  <div>
    <div className="inline-flex between">
      <div>
        <h3>{props.partyRelationshipTypeLabel}</h3>
        <p>
          <Icon type="clock-circle" />
          &nbsp;&nbsp;None Active
          <br />
          <Link
            to={router.RELATIONSHIP_PROFILE.dynamicRoute(
              props.mine.guid,
              props.partyRelationshipTypeCode
            )}
          >
            View History
          </Link>
        </p>
      </div>
    </div>
  </div>
);

InactiveContact.propTypes = propTypes;

export default InactiveContact;
