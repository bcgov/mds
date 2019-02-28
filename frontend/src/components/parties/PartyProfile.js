import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import * as Strings from "@/constants/strings";
import { Tabs, Icon, Table } from "antd";
import { uniq } from "lodash";
import {
  fetchPartyById,
  fetchPartyRelationshipTypes,
  fetchPartyRelationships,
} from "@/actionCreators/partiesActionCreator";
import { fetchMineBasicInfoList } from "@/actionCreators/mineActionCreator";
import {
  getParties,
  getPartyRelationships,
  getPartyRelationshipTypeHash,
} from "@/selectors/partiesSelectors";
import { getMineBasicInfoListHash } from "@/selectors/mineSelectors";
import Loading from "@/components/common/Loading";
import * as router from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import { formatTitleString, formatDate } from "@/utils/helpers";
import NullScreen from "@/components/common/NullScreen";

/**
 * @class PartyProfile - profile view for personnel/companies
 */

const { TabPane } = Tabs;

const propTypes = {
  fetchPartyById: PropTypes.func.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  fetchMineBasicInfoList: PropTypes.func.isRequired,
  parties: PropTypes.arrayOf(CustomPropTypes.party).isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  partyRelationshipTypeHash: PropTypes.objectOf(PropTypes.strings),
  mineBasicInfoListHash: PropTypes.objectOf(PropTypes.strings),
  match: CustomPropTypes.match.isRequired,
};

const defaultProps = {
  partyRelationships: [],
  partyRelationshipTypeHash: {},
  mineBasicInfoListHash: {},
};

export class PartyProfile extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchPartyById(id);
    this.props.fetchPartyRelationships({ party_guid: id, relationships: "party" }).then(() => {
      const mine_guids = uniq(this.props.partyRelationships.map(({ mine_guid }) => mine_guid));
      this.props.fetchMineBasicInfoList(mine_guids).then(() => {
        this.props.fetchPartyRelationshipTypes();
        this.setState({ isLoaded: true });
      });
    });
  }

  render() {
    const { id } = this.props.match.params;
    const parties = this.props.parties[id];
    const columns = [
      {
        title: "Mine Name",
        dataIndex: "mineName",
        render: (text, record) => (
          <div title="Mine Name">
            <Link to={router.MINE_SUMMARY.dynamicRoute(record.mineGuid, "contacts")}>{text}</Link>
          </div>
        ),
      },
      {
        title: "Role",
        dataIndex: "role",
        render: (text) => <div title="Role">{text}</div>,
      },
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

    const transformRowData = (partyRelationships) =>
      partyRelationships.map((relationship) => ({
        key: relationship.mine_party_appt_guid,
        mineGuid: relationship.mine_guid,
        mineName: this.props.mineBasicInfoListHash[relationship.mine_guid],
        role: this.props.partyRelationshipTypeHash[relationship.mine_party_appt_type_code],
        endDate:
          relationship.end_date && relationship.end_date !== "9999-12-31"
            ? formatDate(relationship.end_date)
            : "Present",
        startDate: relationship.start_date ? formatDate(relationship.start_date) : "Unknown",
      }));

    if (this.state.isLoaded) {
      return (
        <div className="profile">
          <div className="profile__header">
            <h1>{formatTitleString(parties.name)}</h1>
            <div className="inline-flex">
              <div className="padding-right">
                <Icon type="mail" />
              </div>
              {parties.email !== "Unknown" ? (
                <a href={`mailto:${parties.email}`}>{parties.email}</a>
              ) : (
                <p>{Strings.EMPTY_FIELD}</p>
              )}
            </div>
            <div className="inline-flex">
              <div className="padding-right">
                <Icon type="phone" />
              </div>
              <p>
                {parties.phone_no} {parties.phone_ext ? `x${parties.phone_ext}` : ""}
              </p>
            </div>
          </div>
          <div className="profile__content">
            <Tabs activeKey="history" size="large" animated={{ inkBar: true, tabPane: false }}>
              <TabPane tab="History" key="history">
                <div className="tab__content ">
                  <Table
                    align="left"
                    pagination={false}
                    columns={columns}
                    dataSource={transformRowData(this.props.partyRelationships)}
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
  parties: getParties(state),
  partyRelationshipTypeHash: getPartyRelationshipTypeHash(state),
  partyRelationships: getPartyRelationships(state),
  mineBasicInfoListHash: getMineBasicInfoListHash(state),
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
