import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import * as Strings from "@/constants/strings";
import { Tabs, Icon, Table } from "antd";
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
import { formatTitleString, formatDate } from "@/utils/helpers";
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

  getPartyRelationshipTitle(partyRelationship) {
    const partyRelationshipType = this.props.partyRelationshipTypes.find(
      ({ value }) => value === partyRelationship.mine_party_appt_type_code
    );
    return (partyRelationshipType && partyRelationshipType.label) || Strings.EMPTY;
  }

  getMineName(mineId) {
    const mine =
      this.props.mineBasicInfoList.length > 0 &&
      this.props.mineBasicInfoList.find(({ guid }) => guid === mineId);
    return (mine && mine.mine_name) || Strings.LOADING;
  }

  render() {
    const columns = [
      {
        title: "Mine Name",
        width: 100,
        dataIndex: "mineName",
        render: (text, record) => (
          <div title="Mine Name">
            <Link to={router.MINE_SUMMARY.dynamicRoute(record.mineGuid, "contacts")}>{text}</Link>
          </div>
        ),
      },
      {
        title: "Role",
        width: 100,
        dataIndex: "role",
        render: (text) => <div title="Role">{text}</div>,
      },
      {
        title: "Dates",
        width: 100,
        dataIndex: "dates",
        render: (text, record) => (
          <div title="Dates">
            {record.startDate} to {record.endDate}
          </div>
        ),
      },
    ];

    const transformRowData = (partyRelationships) =>
      partyRelationships.map((relationship) => ({
        key: relationship.mine_guid,
        mineGuid: relationship.mine_guid,
        emptyField: Strings.EMPTY_FIELD,
        mineName: this.getMineName(relationship.mine_guid),
        role: this.getPartyRelationshipTitle(relationship),
        endDate:
          relationship.end_date === "9999-12-31" ? "Present" : formatDate(relationship.end_date),
        startDate: relationship.start_date ? formatDate(relationship.start_date) : "Unknown",
      }));
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
            <div>
              <div className="inline-flex">
                <div className="padding-right">
                  <Icon type="mail" />
                </div>
                <a href={`mailto:${parties.email}`}>{parties.email}</a>
              </div>
              <div className="inline-flex">
                <div className="padding-right">
                  <Icon type="phone" />
                </div>
                <p>
                  {" "}
                  {parties.phone_no} {parties.phone_ext ? `x${parties.phone_ext}` : ""}
                </p>
              </div>
            </div>
          </div>
          <div className="profile__content">
            <Tabs activeKey="history" size="large" animated={{ inkBar: true, tabPane: false }}>
              <TabPane tab="Past History" key="history">
                <div className="tab__content ">
                  <Table
                    align="center"
                    className="mine-list"
                    pagination={false}
                    columns={columns}
                    dataSource={transformRowData(this.props.partyRelationships)}
                    locale={{ emptyText: "no results" }}
                  />
                </div>
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
