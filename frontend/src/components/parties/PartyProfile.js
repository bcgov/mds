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
import { fetchMineBasicInfoList } from "@/actionCreators/mineActionCreator";
import {
  getParties,
  getPartyRelationshipTypesList,
  getPartyRelationships,
} from "@/selectors/partiesSelectors";
import { getMineBasicInfoList } from "@/selectors/mineSelectors";
import Loading from "@/components/common/Loading";
import * as router from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import { formatTitleString } from "@/utils/helpers";
import * as String from "@/constants/strings";
import { uniq } from "lodash";

/**
 * @class PartyProfile - profile view for personnel/companies
 */

const TabPane = Tabs.TabPane;

const propTypes = {
  fetchPartyById: PropTypes.func.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  fetchMineBasicInfoList: PropTypes.func.isRequired,
  parties: PropTypes.arrayOf(CustomPropTypes.party).isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  partyRelationshipTypes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem),
  mineBasicInfoList: PropTypes.arrayOf(CustomPropTypes.mine),
  match: PropTypes.object,
};

const defaultProps = {
  partyRelationships: [],
  partyRelationshipTypes: [],
  mineBasicInfoList: [],
};

export class PartyProfile extends Component {
  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchPartyById(id);
    this.props.fetchPartyRelationships({ party_guid: id }).then(() => {
      const mine_guids = uniq(this.props.partyRelationships.map(({ mine_guid }) => mine_guid));
      this.props.fetchMineBasicInfoList([...mine_guids]);
    });
    this.props.fetchPartyRelationshipTypes();
  }

  getPartyRelationshipTypeLabel(partyRelationship) {
    const partyRelationshipType = this.props.partyRelationshipTypes.find(
      ({ value }) => value === partyRelationship.mine_party_appt_type_code
    );
    return (partyRelationshipType && partyRelationshipType.label) || String.EMPTY;
  }

  getMineName(mineId) {
    const mine =
      this.props.mineBasicInfoList.length > 0 &&
      this.props.mineBasicInfoList.find(({ guid }) => guid === mineId);
    return (mine && mine.mine_name) || String.LOADING;
  }

  render() {
    const { id } = this.props.match.params;
    const parties = this.props.parties[id];

    const isLoaded =
      this.props.partyRelationshipTypes.length > 0 &&
      (this.props.partyRelationships.length > 0 && parties);

    if (isLoaded) {
      return (
        <div className="profile">
          <div className="profile__header">
            <div className="inline-flex between">
              <h1 className="bold">{formatTitleString(parties.name)}</h1>
            </div>
            <div className="inline-flex between">
              <div className="inline-flex">
                <p>
                  <Icon type="mail" />
                  &nbsp;&nbsp;
                  <a href={`mailto:${parties.email}`}>{parties.email}</a>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <br />
                  <Icon type="phone" />
                  &nbsp;&nbsp;
                  {parties.phone_no} {parties.phone_ext ? `x${parties.phone_ext}` : ""}
                </p>
              </div>
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
                        <Link
                          to={router.MINE_SUMMARY.dynamicRoute(
                            partyRelationship.mine_guid,
                            "contact-information"
                          )}
                        >
                          {this.getMineName(partyRelationship.mine_guid)}
                        </Link>
                      </Col>
                      <Col span={8}>{this.getPartyRelationshipTypeLabel(partyRelationship)}</Col>
                      <Col span={8}>
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
  parties: getParties(state),
  partyRelationshipTypes: getPartyRelationshipTypesList(state),
  partyRelationships: getPartyRelationships(state),
  mineBasicInfoList: getMineBasicInfoList(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPartyById,
      fetchPartyRelationshipTypes,
      fetchPartyRelationships,
      fetchMineBasicInfoList,
    },
    dispatch
  );

PartyProfile.propTypes = propTypes;
PartyProfile.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PartyProfile);
