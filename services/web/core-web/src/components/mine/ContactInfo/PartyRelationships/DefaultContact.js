import React from "react";
import PropTypes from "prop-types";
import { Button, Card } from "antd";
import { Link } from "react-router-dom";
import { formatTitleString, formatDate } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as router from "@/constants/routes";
import * as Permission from "@/constants/permissions";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
  partyRelationshipTitle: PropTypes.string.isRequired,
  partyRelationshipSubTitle: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  openEditPartyRelationshipModal: PropTypes.func.isRequired,
  onSubmitEditPartyRelationship: PropTypes.func.isRequired,
  otherDetails: PropTypes.objectOf(PropTypes.any).isRequired,
  isEditable: PropTypes.bool.isRequired,
  editPermission: PropTypes.string,
  compact: PropTypes.bool.isRequired,
};

const defaultProps = {
  partyRelationshipSubTitle: "",
  editPermission: Permission.EDIT_PARTIES,
};

export const DefaultContact = (props) => (
  <Card
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
                props.mine.mine_guid,
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
      {props.partyRelationship.party.email && props.partyRelationship.party.email !== "Unknown" ? (
        <a href={`mailto:${props.partyRelationship.party.email}`}>
          {props.partyRelationship.party.email}
        </a>
      ) : (
        <span>{Strings.EMPTY_FIELD}</span>
      )}
      <br />
      <br />
      <h6>Phone Number</h6>
      {props.partyRelationship.party.phone_no}{" "}
      {props.partyRelationship.party.phone_ext ? `x${props.partyRelationship.party.phone_ext}` : ""}
      {!props.compact && [
        <br />,
        <br />,
        <h6>{props.partyRelationshipTitle} Since</h6>,
        <span>
          {formatDate(props.partyRelationship.start_date) || "Unknown"}
          {props.partyRelationship.mine_party_appt_type_code === "MMG" &&
            props.partyRelationship.documents.length > 0 && (
              <span>
                {" "}
                -{" "}
                <LinkButton
                  key={props.partyRelationship.documents[0].mine_document_guid}
                  onClick={() =>
                    downloadFileFromDocumentManager(props.partyRelationship.documents[0])
                  }
                >
                  Appointment Letter
                </LinkButton>
              </span>
            )}
        </span>,
      ]}
    </div>
    {props.otherDetails}
    <div className="right">
      {props.isEditable && !props.compact && (
        <AuthorizationWrapper
          permission={props.editPermission}
          isMajorMine={props.mine.major_mine_ind}
        >
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

DefaultContact.propTypes = propTypes;
DefaultContact.defaultProps = defaultProps;

export default DefaultContact;
