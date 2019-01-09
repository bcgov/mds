import React, { Component } from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import ConditionalButton from "@/components/common/ConditionalButton";
import { Button, Icon, Card } from "antd";
import * as router from "@/constants/routes";
import { formatTitleString } from "@/utils/helpers";
import { Redirect } from "react-router";

const propTypes = {
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
  partyRelationshipTypeLabel: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  openEditPartyRelationshipModal: PropTypes.func.isRequired,
  onSubmitEditPartyRelationship: PropTypes.func.isRequired,
  otherDetails: PropTypes.object,
  isEditable: PropTypes.bool.isRequired,
};

// <ConditionalButton
//   handleAction={() =>
//     props.openEditPartyRelationshipModal(
//       props.partyRelationship,
//       props.onSubmitEditPartyRelationship,
//       props.handleChange,
//       props.mine
//     )}
//   string={<img className="padding-small" style={{ padding: "5px" }} alt="Edit" src={BRAND_PENCIL} />}
//   type="primary"
//   ghost
// />
// <ConditionalButton
//   type="primary"
//   ghost
//   popConfirm={{
//     placement: "topLeft",
//     title: `Are you sure you want to delete this ${props.partyRelationshipTypeLabel}?`,
//     onConfirm: (event) =>
//       props.removePartyRelationship(event, props.partyRelationship.mine_party_appt_guid),
//     okText: "Delete",
//     cancelText: "Cancel"
//   }}
//   string={<Icon type="minus-circle" theme="outlined" />}
// />

export class DefaultContact extends Component {
  state = {
    redirectToRelationshipProfile: false,
    redirectToPartyProfile: false,
  };

  render() {
    if (this.state.redirectToRelationshipProfile === true) {
      return (
        <Redirect
          to={router.RELATIONSHIP_PROFILE.dynamicRoute(
            this.props.mine.guid,
            this.props.partyRelationship.mine_party_appt_type_code
          )}
        />
      );
    }
    if (this.state.redirectToPartyProfile === true) {
      return (
        <Redirect
          to={router.PARTY_PROFILE.dynamicRoute(this.props.partyRelationship.party.party_guid)}
        />
      );
    }

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
              <h3>{this.props.partyRelationshipTypeLabel}</h3>
              <p>
                <Icon type="clock-circle" />
                &nbsp;&nbsp;
                {this.props.partyRelationship.start_date
                  ? this.props.partyRelationship.start_date
                  : "Unknown"}{" "}
                -{" "}
                {this.props.partyRelationship.end_date
                  ? this.props.partyRelationship.end_date
                  : "Present"}
                <br />
              </p>
            </div>
            <div className="right">
              <Button
                style={{ marginRight: "0" }}
                onClick={() => {
                  this.setState({ redirectToRelationshipProfile: true });
                }}
              >
                See History
              </Button>
            </div>
          </div>
        }
        bordered={false}
      >
        <div className="inline-flex between wrap">
          <div>
            <h5>{formatTitleString(this.props.partyRelationship.party.name)}</h5>
            <p>
              <Icon type="mail" />
              &nbsp;&nbsp;
              <a href={`mailto:${this.props.partyRelationship.party.email}`}>
                {this.props.partyRelationship.party.email}
              </a>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <br />
              <Icon type="phone" />
              &nbsp;&nbsp;
              {this.props.partyRelationship.party.phone_no}{" "}
              {this.props.partyRelationship.party.phone_ext
                ? `x${this.props.partyRelationship.party.phone_ext}`
                : ""}
              <br />
            </p>
          </div>
          <div className="right" style={{ flexGrow: "3" }}>
            <Button
              style={{ marginRight: "0", marginLeft: "0", marginBottom: "0" }}
              onClick={() => {
                this.setState({ redirectToPartyProfile: true });
              }}
            >
              View Profile
            </Button>{" "}
            {this.props.isEditable && [
              <br />,
              <ConditionalButton
                handleAction={() =>
                  this.props.openEditPartyRelationshipModal(
                    this.props.partyRelationship,
                    this.props.onSubmitEditPartyRelationship,
                    this.props.handleChange,
                    this.props.mine
                  )
                }
                string="Update"
                type="primary"
              />,
              // <Button
              //   // style={{ marginRight: "0", marginLeft: "0", marginBottom: "0" }}
              //   // key={`${this.props.partyRelationship.mine_party_appt_guid}_edit`}
              //   // type="primary"
              //   // onClick={() =>
              //   //   this.props.openEditPartyRelationshipModal(
              //   //     this.props.partyRelationship,
              //   //     this.props.onSubmitEditPartyRelationship,
              //   //     this.props.handleChange,
              //   //     this.props.mine
              //   //   )
              //   // }
              // >
              //   Update
              // </Button>,
            ]}
          </div>
          {this.props.otherDetails}
        </div>
      </Card>
    );
  }
}

DefaultContact.propTypes = propTypes;

export default DefaultContact;
