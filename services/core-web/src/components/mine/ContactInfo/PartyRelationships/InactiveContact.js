import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon, Card, Button } from "antd";
import { Redirect } from "react-router-dom";
import * as router from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  partyRelationshipTypeCode: PropTypes.string.isRequired,
  partyRelationshipTitle: PropTypes.string.isRequired,
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
            this.props.mine.mine_guid,
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
            <h3>{this.props.partyRelationshipTitle}</h3>
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
