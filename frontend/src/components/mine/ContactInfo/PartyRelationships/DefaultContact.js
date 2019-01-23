import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { Button, Card } from "antd";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as router from "@/constants/routes";
import * as Permission from "@/constants/permissions";
import { formatTitleString } from "@/utils/helpers";
import { Link } from "react-router-dom";

const propTypes = {
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
  partyRelationshipTitle: PropTypes.string.isRequired,
  partyRelationshipSubTitle: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  openEditPartyRelationshipModal: PropTypes.func.isRequired,
  onSubmitEditPartyRelationship: PropTypes.func.isRequired,
  otherDetails: PropTypes.object,
  isEditable: PropTypes.bool.isRequired,
  compact: PropTypes.bool.isRequired,
};

const defaultProps = {
  partyRelationshipSubTitle: "",
};

export const DefaultContact = (props) => {
  return (
    <Card
      headStyle={{
        background: "#EEEEEE",
        borderTop: "1px solid #CCCCCC",
        borderRight: "1px solid #CCCCCC",
        borderLeft: "1px solid #CCCCCC",
      }}
      bodyStyle={{
        borderBottom: "4px solid #CCCCCC",
        borderRight: "1px solid #CCCCCC",
        borderLeft: "1px solid #CCCCCC",
      }}
      title={
        <div className="inline-flex between wrap">
          <div>
            <h3>{props.partyRelationshipTitle}</h3>
            {props.partyRelationshipSubTitle && <p>{props.partyRelationshipSubTitle}</p>}
          </div>
          {!props.compact && (
            <div className="right">
              <Link
                to={router.RELATIONSHIP_PROFILE.dynamicRoute(
                  props.mine.guid,
                  props.partyRelationship.mine_party_appt_type_code
                )}
              >
                <Button style={{ marginRight: "0" }}>See History</Button>
              </Link>
            </div>
          )}
        </div>
      }
      bordered={false}
    >
      <div>
        <h4>
          <Link
            style={{ fontSize: "1.5rem", fontWeight: "bold" }}
            to={router.PARTY_PROFILE.dynamicRoute(props.partyRelationship.party.party_guid)}
          >
            {formatTitleString(props.partyRelationship.party.name)}
          </Link>
        </h4>
        <br />
        <h6>Email Address</h6>
        <a href={`mailto:${props.partyRelationship.party.email}`}>
          {props.partyRelationship.party.email}
        </a>
        <br />
        <br />
        <h6>Phone Number</h6>
        {props.partyRelationship.party.phone_no}{" "}
        {props.partyRelationship.party.phone_ext
          ? `x${props.partyRelationship.party.phone_ext}`
          : ""}
        {!props.compact && [
          <br />,
          <br />,
          <h6>{props.partyRelationshipTitle} Since</h6>,
          <span>
            {props.partyRelationship.start_date ? props.partyRelationship.start_date : "Unknown"}
          </span>,
        ]}
      </div>
      {props.otherDetails && props.otherDetails}
      <div className="right">
        {props.isEditable && !props.compact && (
          <AuthorizationWrapper permission={Permission.CREATE}>
            <Button
              type="primary"
              onClick={() =>
                props.openEditPartyRelationshipModal(
                  props.partyRelationship,
                  props.onSubmitEditPartyRelationship,
                  props.handleChange,
                  props.mine
                )
              }
            >
              Update
            </Button>
          </AuthorizationWrapper>
        )}
      </div>
    </Card>
  );
};

DefaultContact.propTypes = propTypes;
DefaultContact.defaultProps = defaultProps;

export default DefaultContact;
