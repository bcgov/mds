import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Tabs, Row, Col, Divider, Icon } from "antd";
import {
  fetchPartyById,
  fetchPartyRelationshipTypes,
  fetchPartyRelationshipsByPartyId,
} from "@/actionCreators/partiesActionCreator";
import { fetchMineBasicInfoList } from "@/actionCreators/mineActionCreator";
import {
  getParties,
  getPartyRelationshipTypes,
  getPartyRelationships,
} from "@/selectors/partiesSelectors";
import { getMineBasicInfoList } from "@/selectors/mineSelectors";
import Loading from "@/components/common/Loading";
import * as router from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import { formatTitleString } from "@/utils/helpers";

/**
 * @class PartyProfile - profile view for personnel/companies
 */

const TabPane = Tabs.TabPane;

const propTypes = {
  fetchPartyById: PropTypes.func.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  fetchPartyRelationshipsByPartyId: PropTypes.func.isRequired,
  fetchMineBasicInfoList: PropTypes.func.isRequired,
  parties: PropTypes.object.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  partyRelationshipTypes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem),
  mineBasicInfoList: PropTypes.array,
  match: PropTypes.object,
};

const defaultProps = {
  partyRelationships: [],
  mineBasicInfoList: [],
};

export class PartyProfile extends Component {
  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchPartyById(id);
    this.props.fetchPartyRelationshipsByPartyId(id).then(() => {
      const mine_guids = new Set(this.props.partyRelationships.map((a) => a.mine_guid));
      this.props.fetchMineBasicInfoList([...mine_guids]);
    });
    this.props.fetchPartyRelationshipTypes();
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
                        <Link to={router.MINE_SUMMARY.dynamicRoute(partyRelationship.mine_guid)}>
                          {this.props.mineBasicInfoList.length > 0 &&
                            this.props.mineBasicInfoList.find(
                              (a) => a.guid === partyRelationship.mine_guid
                            ).mine_detail[0].mine_name}
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
  mineBasicInfoList: getMineBasicInfoList(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPartyById,
      fetchPartyRelationshipTypes,
      fetchPartyRelationshipsByPartyId,
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
