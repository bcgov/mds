import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Tabs, Row, Col, Divider, Icon } from "antd";
import {
  fetchPartyRelationshipTypes,
  fetchPartyRelationships,
} from "@/actionCreators/partiesActionCreator";
import { fetchMineRecordById } from "@/actionCreators/mineActionCreator";
import { getPartyRelationshipTypesList, getPartyRelationships } from "@/selectors/partiesSelectors";
import { getMines } from "@/selectors/mineSelectors";
import Loading from "@/components/common/Loading";
import * as router from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import * as String from "@/constants/strings";

/**
 * @class RelationshipProfile - profile view for party relationship types
 */

const { TabPane } = Tabs;

const propTypes = {
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  partyRelationshipTypes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem),
  match: PropTypes.objectOf(PropTypes.any),
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
};

const defaultProps = {
  partyRelationships: [],
  partyRelationshipTypes: [],
  match: {},
};

const mapPermitGuidToNumber = (permits) =>
  permits.reduce((acc, { permit_guid, permit_no }) => {
    acc[permit_guid] = permit_no;
    return acc;
  }, {});

export class RelationshipProfile extends Component {
  state = {
    permitsMapping: {},
  };

  componentDidMount() {
    const { id, typeCode } = this.props.match.params;
    this.props.fetchPartyRelationshipTypes();
    this.props.fetchPartyRelationships({ mine_guid: id, types: typeCode });

    const mine = this.props.mines[id];
    if (!mine) {
      this.props.fetchMineRecordById(id);
    }
  }

  componentWillReceiveProps() {
    const { id } = this.props.match.params;
    const mine = this.props.mines[id];
    // Update permit mapping when new permits are received
    // Otherwise, use existing mapping
    if (mine && Object.keys(this.state.permitsMapping).length < mine.mine_permit.length) {
      this.setState({ permitsMapping: mapPermitGuidToNumber(mine.mine_permit) });
    }
  }

  getpartyRelationshipTitle(partyRelationship) {
    const partyRelationshipType = this.props.partyRelationshipTypes.find(
      ({ value }) => value === partyRelationship.mine_party_appt_type_code
    );
    return (partyRelationshipType && partyRelationshipType.label) || String.EMPTY;
  }

  render() {
    const { id } = this.props.match.params;
    const mine = this.props.mines[id];
    const [{ mine_party_appt_type_code }] = this.props.partyRelationships;
    const isPermittee = mine_party_appt_type_code === "PMT";
    const columnCount = 3 + (isPermittee ? 1 : 0);
    // 24 is the total span from Ant Design
    const width = 24 / columnCount;

    const isLoaded =
      this.props.partyRelationshipTypes.length > 0 &&
      this.props.partyRelationships.length > 0 &&
      mine;

    if (isLoaded) {
      return (
        <div className="profile">
          <div className="profile__header">
            <div className="inline-flex between">
              <h1 className="bold">
                {this.getpartyRelationshipTitle(this.props.partyRelationships[0])} History
              </h1>
            </div>
            <div className="inline-flex between">
              <div className="inline-flex">
                <p>
                  <Link to={router.MINE_SUMMARY.dynamicRoute(mine.guid, "contact-information")}>
                    {mine && mine.mine_name}
                  </Link>
                </p>
              </div>
            </div>
          </div>
          <div className="profile__content">
            <Tabs activeKey="history" size="large" animated={{ inkBar: true, tabPane: false }}>
              <TabPane tab="History" key="history">
                <div>
                  <Row type="flex" style={{ textAlign: "center" }}>
                    <Col span={width}>
                      <h2>Contact</h2>
                    </Col>
                    <Col span={width}>
                      <h2>Role</h2>
                    </Col>
                    {isPermittee && (
                      <Col span={width}>
                        <h2>Permit No.</h2>
                      </Col>
                    )}
                    <Col span={width}>
                      <h2>Dates</h2>
                    </Col>
                  </Row>
                  <Divider style={{ height: "2px", backgroundColor: "#013366", margin: "0" }} />
                </div>
                {this.props.partyRelationships.map((partyRelationship) => (
                  <div key={partyRelationship.related_guid}>
                    <Row type="flex" style={{ textAlign: "center" }}>
                      <Col span={width}>
                        <Link
                          to={router.PARTY_PROFILE.dynamicRoute(partyRelationship.party.party_guid)}
                        >
                          {partyRelationship.party.name}
                        </Link>
                      </Col>
                      <Col span={width}>{this.getpartyRelationshipTitle(partyRelationship)}</Col>
                      {isPermittee && (
                        <Col span={width}>
                          {this.state.permitsMapping[partyRelationship.related_guid]}
                        </Col>
                      )}
                      <Col span={width}>
                        <Icon type="clock-circle" />
                        &nbsp;&nbsp;
                        {partyRelationship.start_date || "Unknown"} -{" "}
                        {partyRelationship.end_date || "Present"}
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
const mapStateToProps = (state) => ({
  mines: getMines(state),
  partyRelationshipTypes: getPartyRelationshipTypesList(state),
  partyRelationships: getPartyRelationships(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
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
