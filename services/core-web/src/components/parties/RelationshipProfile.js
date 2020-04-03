import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import moment from "moment";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Tabs, Table } from "antd";
import { isEmpty } from "lodash";
import { fetchPartyRelationships } from "@common/actionCreators/partiesActionCreator";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { getPermits } from "@common/reducers/permitReducer";
import { getPartyRelationships } from "@common/selectors/partiesSelectors";
import { getPartyRelationshipTypesList } from "@common/selectors/staticContentSelectors";

import { getMines } from "@common/selectors/mineSelectors";
import { formatDate } from "@common/utils/helpers";
import * as String from "@common/constants/strings";
import Loading from "@/components/common/Loading";
import * as router from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import NullScreen from "@/components/common/NullScreen";

/**
 * @class RelationshipProfile - profile view for party relationship types
 */

const { TabPane } = Tabs;

const propTypes = {
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  partyRelationshipTypes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem),
  match: PropTypes.objectOf(PropTypes.any),
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  minePermits: PropTypes.arrayOf(CustomPropTypes.permits).isRequired,
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

const mapTSFGuidToName = (tailings) =>
  tailings.reduce(
    (acc, { mine_tailings_storage_facility_guid, mine_tailings_storage_facility_name }) => {
      acc[mine_tailings_storage_facility_guid] = mine_tailings_storage_facility_name;
      return acc;
    },
    {}
  );

const getPartyRelationshipTitle = (partyRelationshipTypes, typeCode) => {
  const partyRelationshipType = partyRelationshipTypes.find(({ value }) => value === typeCode);
  return (partyRelationshipType && partyRelationshipType.label) || String.EMPTY;
};

export class RelationshipProfile extends Component {
  state = {
    partyRelationshipTitle: "",
    permitsMapping: {},
    TSFMapping: {},
  };

  componentDidMount() {
    const { id, typeCode } = this.props.match.params;
    const mine = this.props.mines[id];

    // Fetch any props not provided
    if (this.props.partyRelationships.length === 0) {
      this.props.fetchPartyRelationships({
        mine_guid: id,
        types: typeCode,
        relationships: "party",
      });
    }
    if (!mine) {
      this.props.fetchMineRecordById(id);
      this.props.fetchPermits(id);
    }

    // Set state if props received before/during mount
    this.updateState();
  }

  componentWillReceiveProps() {
    this.updateState();
  }

  updateState() {
    const { id, typeCode } = this.props.match.params;
    const mine = this.props.mines[id];
    // Update permit mapping when new permits are received
    // Otherwise, use existing mapping
    if (mine && Object.keys(this.state.permitsMapping).length < this.props.minePermits.length) {
      this.setState({ permitsMapping: mapPermitGuidToNumber(this.props.minePermits) });
    }

    if (
      mine &&
      Object.keys(this.state.TSFMapping).length < mine.mine_tailings_storage_facilities.length
    ) {
      this.setState({ TSFMapping: mapTSFGuidToName(mine.mine_tailings_storage_facilities) });
    }

    // Update relationships mapping when relationships are received
    // Otherwise, use existing mapping
    if (!isEmpty(this.props.partyRelationshipTypes) && isEmpty(this.state.partyRelationshipTitle)) {
      this.setState({
        partyRelationshipTitle: getPartyRelationshipTitle(
          this.props.partyRelationshipTypes,
          typeCode
        ),
      });
    }
  }

  render() {
    const { id, typeCode } = this.props.match.params;
    const isPermittee = typeCode === "PMT";
    const isEOR = typeCode === "EOR";
    const mine = this.props.mines[id];
    const permitColumn = isPermittee
      ? [
          {
            title: "Permit",
            dataIndex: "permit",
            render: (text) => <div title="Permit">{text}</div>,
          },
        ]
      : [];
    const EORColumn = isEOR
      ? [
          {
            title: "Tailings Storage Facility",
            dataIndex: "tailingsStorageFacility",
            render: (text) => <div title="Tailings Storage Facility">{text}</div>,
          },
        ]
      : [];
    const columns = [
      {
        title: "Contact",
        dataIndex: "contact",
        render: (text, record) => (
          <div title="Contact">
            <Link to={router.PARTY_PROFILE.dynamicRoute(record.partyGuid)}>{text}</Link>
          </div>
        ),
      },
      {
        title: "Role",
        dataIndex: "role",
        render: (text) => <div title="Role">{text}</div>,
      },
      ...permitColumn,
      ...EORColumn,
      {
        title: "Dates",
        dataIndex: "dates",
        render: (text, record) => (
          <div title="Dates">
            {record.startDate} - {record.endDate}
          </div>
        ),
      },
    ];

    const transformRowData = (historyRelationships) =>
      historyRelationships.map((relationship) => ({
        key: relationship.mine_party_appt_guid,
        contact: relationship.party.name,
        partyGuid: relationship.party.party_guid,
        role: this.state.partyRelationshipTitle,
        permit: this.state.permitsMapping[relationship.related_guid],
        tailingsStorageFacility: this.state.TSFMapping[relationship.related_guid],
        endDate: formatDate(relationship.end_date) || "Present",
        startDate: formatDate(relationship.start_date) || "Unknown",
      }));

    const isLoaded =
      this.props.partyRelationshipTypes.length > 0 &&
      this.props.partyRelationships.length > 0 &&
      mine;

    const filteredRelationships = this.props.partyRelationships
      .sort((a, b) =>
        moment(a.start_date, "YYYY-MM-DD") >= moment(b.start_date, "YYYY-MM-DD") ? -1 : 1
      )
      .filter(({ mine_party_appt_type_code }) => mine_party_appt_type_code === typeCode);

    if (isLoaded) {
      return (
        <div className="profile">
          <div className="profile__header">
            <div className="inline-flex between">
              <h1 className="bold">{this.state.partyRelationshipTitle} History</h1>
            </div>
            <div className="inline-flex between">
              <div className="inline-flex">
                <p>
                  <Link to={router.MINE_SUMMARY.dynamicRoute(mine.mine_guid, "contacts")}>
                    {mine && mine.mine_name}
                  </Link>
                </p>
              </div>
            </div>
          </div>
          <div className="profile__content">
            <Tabs
              className="center-tabs"
              activeKey="history"
              size="large"
              animated={{ inkBar: true, tabPane: false }}
            >
              <TabPane tab="History" key="history">
                <div className="tab__content">
                  <Table
                    align="left"
                    pagination={false}
                    columns={columns}
                    dataSource={transformRowData(filteredRelationships)}
                    locale={{ emptyText: <NullScreen type="no-results" /> }}
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
  mines: getMines(state),
  partyRelationshipTypes: getPartyRelationshipTypesList(state),
  partyRelationships: getPartyRelationships(state),
  minePermits: getPermits(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
      fetchPermits,
      fetchPartyRelationships,
    },
    dispatch
  );

RelationshipProfile.propTypes = propTypes;
RelationshipProfile.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(RelationshipProfile);
