import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Tabs, Row, Col, Divider, Icon } from "antd";
import {
  fetchPartyById,
  fetchPartyRelationshipTypes,
  fetchPartyRelationships,
} from "@/actionCreators/partiesActionCreator";
import {
  getParties,
  getPartyRelationshipTypes,
  getPartyRelationships,
} from "@/selectors/partiesSelectors";
import Loading from "@/components/common/Loading";
import * as router from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import { formatTitleString } from "@/utils/helpers";

/**
 * @class RelationshipProfile - profile view for party relationship types
 */

const TabPane = Tabs.TabPane;

const propTypes = {
  fetchPartyById: PropTypes.func.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  parties: PropTypes.object.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  partyRelationshipTypes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem),
  match: PropTypes.object,
};

const defaultProps = {
  partyRelationships: [],
};

export class RelationshipProfile extends Component {
  componentDidMount() {
    const { id, typeCode } = this.props.match.params;
    // this.props.fetchPartyById(typeCode);
    this.props.fetchPartyRelationshipTypes();
    this.props.fetchPartyRelationships(id, null, typeCode);
  }

  render() {
    const { typeCode } = this.props.match.params;
    // const parties = this.props.parties[typeCode];
    if (this.props.partyRelationships) {
      return (
        <div className="profile">
          <div className="profile__header">
            <div className="inline-flex between">
              <h1 className="bold" />
            </div>
            <div className="inline-flex between">
              <div className="inline-flex" />
            </div>
          </div>
          <div className="profile__content">
            <Tabs activeKey="history" size="large" animated={{ inkBar: true, tabPane: false }}>
              <TabPane tab="History" key="history">
                <div>
                  <Row type="flex" style={{ textAlign: "center" }}>
                    <Col span={8}>
                      <h2>Mine Name</h2>
                    </Col>
                    <Col span={8}>
                      <h2>Role</h2>
                    </Col>
                    <Col span={8}>
                      <h2>dates</h2>
                    </Col>
                  </Row>
                  <Divider style={{ height: "2px", backgroundColor: "#013366", margin: "0" }} />
                </div>
                {this.props.partyRelationships.map((partyRelationship) => (
                  <div>
                    <Row type="flex" style={{ textAlign: "center" }}>
                      <Col span={8}>
                        <Link to={router.MINE_SUMMARY.dynamicRoute(partyRelationship.mine_guid)}>
                          {partyRelationship.mine_guid}
                        </Link>
                      </Col>
                      <Col span={8}>
                        {this.props.partyRelationshipTypes &&
                          this.props.partyRelationshipTypes.find(
                            (x) => x.value === partyRelationship.mine_party_appt_type_code
                          ).label}
                      </Col>
                      <Col span={8}>
                        <Icon type="clock-circle" />
                        &nbsp;&nbsp;
                        {partyRelationship.start_date === "None"
                          ? "Unknown"
                          : partyRelationship.start_date}{" "}
                        -{" "}
                        {partyRelationship.end_date === "None"
                          ? "Present"
                          : partyRelationship.end_date}
                      </Col>
                    </Row>
                  </div>
                ))}
              </TabPane>
            </Tabs>
          </div>
        </div>
      );
    }
    return <Loading />;
  }
}

/* {parties.mgr_appointment.map((history, i) => {
  const expiry =
    history.expiry_date === "9999-12-31" ? "PRESENT" : history.expiry_date;
  return (
    <div key={i}>
      <Row type="flex" style={{ textAlign: "center" }}>
        <Col span={8}>
          <Link to={router.MINE_SUMMARY.dynamicRoute(history.mine_guid)}>
            {history.mine_name}
          </Link>
        </Col>
        <Col span={8}>Mine Manager</Col>
        <Col span={8}>
          {history.effective_date} - {expiry}
        </Col>
      </Row>
    </div>
  );
})} */

const mapStateToProps = (state) => ({
  parties: getParties(state),
  partyRelationshipTypes: getPartyRelationshipTypes(state),
  partyRelationships: getPartyRelationships(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPartyById,
      fetchPartyRelationshipTypes,
      fetchPartyRelationships,
    },
    dispatch
  );

RelationshipProfile.propTypes = propTypes;
RelationshipProfile.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RelationshipProfile);
