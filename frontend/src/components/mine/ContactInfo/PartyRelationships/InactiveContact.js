import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon, Card, Row, Col, Button } from "antd";
import * as router from "@/constants/routes";
import { Redirect } from "react-router";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  partyRelationshipTypeCode: PropTypes.string.isRequired,
  partyRelationshipTypeLabel: PropTypes.string.isRequired,
  mine: CustomPropTypes.mine.isRequired,
};

export class InactiveContact extends Component {
  state = {
    redirectToProfile: false,
  };

  render() {
    if (this.state.redirectToProfile) {
      return (
        <Redirect
          to={router.RELATIONSHIP_PROFILE.dynamicRoute(
            this.props.mine.guid,
            this.props.partyRelationshipTypeCode
          )}
          push
        />
      );
    }

    return (
      <Card
        bordered={false}
        bodyStyle={{
          borderTop: "1px solid #CCCCCC",
          borderBottom: "4px solid #CCCCCC",
          borderRight: "1px solid #CCCCCC",
          borderLeft: "1px solid #CCCCCC",
          background: "#EEEEEE",
        }}
      >
        <div className="inline-flex between wrap">
          <div>
            <h3>{this.props.partyRelationshipTypeLabel}</h3>
            <p>
              <Icon type="clock-circle" />
              &nbsp;&nbsp;None Active
            </p>
          </div>
          <div className="right">
            <Button
              style={{ marginRight: "0" }}
              onClick={() => {
                this.setState({ redirectToProfile: true });
              }}
            >
              See History
            </Button>
          </div>
        </div>
      </Card>
    );
  }
}

InactiveContact.propTypes = propTypes;

export default InactiveContact;
