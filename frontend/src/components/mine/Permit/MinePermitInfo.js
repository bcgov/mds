import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Table } from "antd";
import NullScreen from "@/components/common/NullScreen";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import { fetchPartyRelationships } from "@/actionCreators/partiesActionCreator";
import { getPartyRelationships } from "@/selectors/partiesSelectors";
/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
};

const defaultProps = {
  partyRelationships: [],
};

const columns = [
  {
    title: "Permit No.",
    dataIndex: "permitNo",
    key: "permitNo",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "Permittee",
    dataIndex: "permittee",
    key: "permittee",
  },
  {
    title: "Authorization End Date",
    dataIndex: "authorizationEndDate",
    key: "authorizationEndDate",
  },

  {
    title: "First Issued",
    dataIndex: "firstIssued",
    key: "firstIssued",
  },
  {
    title: "Last Amended",
    dataIndex: "lastAmended",
    key: "lastAmended",
  },
];

const childColumns = [
  { title: "Permit No.", dataIndex: "permitNo", key: "childPermitNo" },
  { title: "Date", dataIndex: "Date", key: "Date" },
  { title: "Permittee", dataIndex: "permittee", key: "childPermittee" },
  { title: "Description", dataIndex: "description", key: "description" },
];

export class MinePermitInfo extends Component {
  componentWillMount() {
    this.props.fetchPartyRelationships(this.props.mine.id, null, "PMT");
  }
  /* 
  componentDidUpdate(prevProps) {
    if (prevProps.partyRelationships !== this.props.partyRelationships) {
      this.props.fetchPartyRelationships(this.props.mine.id, null, "MMG");
    }
  } */

  groupPermits = (permits) =>
    permits.reduce((acc, permit) => {
      acc[permit.permit_no] = acc[permit.permit_no] || [];
      acc[permit.permit_no].push(permit);
      return acc;
    }, {});

  transformRowData = (permits) => {
    const latest = permits[0];
    const first = permits[permits.length - 1];
    let permitteeName = "Loading...";
    let permittees = [];
    if (this.props.partyRelationships.length > 0) {
      permittees = this.props.partyRelationships
        .filter((x) => x.related_guid === latest.permit_guid)
        .sort((pr1, pr2) => {
          if (!(Date.parse(pr1.due_date) === Date.parse(pr2.due_date)))
            return Date.parse(pr1.due_date) > Date.parse(pr2.due_date) ? 1 : -1;
          return pr1.exp_document_name > pr2.exp_document_name ? 1 : -1;
        });
      permitteeName = permittees[0] ? permittees[0].party.party_name : Strings.EMPTY_FIELD;
    }
    return {
      key: latest.permit_guid,
      lastAmended: formatDate(latest.issue_date),
      permitNo: latest.permit_no || Strings.EMPTY_FIELD,
      firstIssued: formatDate(first.issue_date) || Strings.EMPTY_FIELD,
      permittee: permitteeName,
      authorizationEndDate: latest.expiry_date
        ? formatDate(latest.expiry_date)
        : Strings.EMPTY_FIELD,
      permittees,
      status: Strings.EMPTY_FIELD,
    };
  };

  transformChildRowData = (permittee, record) => ({
    key: record.key,
    permitNo: record.permitNo,
    Date: permittee.start_date,
    permittee: permittee.party.name,
    description: Strings.EMPTY_FIELD,
  });

  render() {
    const groupedPermits = Object.values(this.groupPermits(this.props.mine.mine_permit));
    const amendmentHistory = (record) => {
      const childRowData = record.permittees.map((permittee) =>
        this.transformChildRowData(permittee, record)
      );
      return (
        <Table align="center" pagination={false} columns={childColumns} dataSource={childRowData} />
      );
    };
    const rowData = groupedPermits.map(this.transformRowData);

    return (
      <Table
        className="nested-table"
        align="center"
        pagination={false}
        columns={columns}
        dataSource={rowData}
        expandedRowRender={amendmentHistory}
        locale={{ emptyText: <NullScreen type="permit" /> }}
      />
    );
  }
}
const mapStateToProps = (state) => ({
  partyRelationships: getPartyRelationships(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPartyRelationships,
    },
    dispatch
  );

MinePermitInfo.propTypes = propTypes;
MinePermitInfo.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MinePermitInfo);
