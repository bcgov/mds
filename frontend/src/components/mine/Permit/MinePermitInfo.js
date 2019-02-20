import React from "react";
import { Table } from "antd";
import NullScreen from "@/components/common/NullScreen";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getPartyRelationships } from "@/selectors/partiesSelectors";
/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
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
    render: (text) => <div title="Permit No.">{text}</div>,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (text) => <div title="Status">{text}</div>,
  },
  {
    title: "Permittee",
    dataIndex: "permittee",
    key: "permittee",
    render: (text) => <div title="Permittee">{text}</div>,
  },
  {
    title: "Authorization End Date",
    dataIndex: "authorizationEndDate",
    key: "authorizationEndDate",
    render: (text) => <div title="Authorization End Date">{text}</div>,
  },

  {
    title: "First Issued",
    dataIndex: "firstIssued",
    key: "firstIssued",
    render: (text) => <div title="First Issued">{text}</div>,
  },
  {
    title: "Last Amended",
    dataIndex: "lastAmended",
    key: "lastAmended",
    render: (text) => <div title="Last Amended">{text}</div>,
  },
];

const childColumns = [
  {
    title: "",
    dataIndex: "amendmentNumber",
    key: "amendmentNumber",
    render: (text) => <div title="Number">{text}</div>,
  },
  {
    title: "Received Date",
    dataIndex: "ReceivedDate",
    key: "ReceivedDate",
    render: (text) => <div title="Received Date">{text}</div>,
  },
  {
    title: "Issue Date",
    dataIndex: "IssueDate",
    key: "IssueDate",
    render: (text) => <div title="Issue Date">{text}</div>,
  },
  {
    title: "Authorization End Date",
    dataIndex: "AuthorizationEndDate",
    key: "AuthorizationEndDate",
    render: (text) => <div title="Authorization End Date">{text}</div>,
  },
];

const getPermittees = (partyRelationships, permit) =>
  partyRelationships
    .filter(({ related_guid }) => permit.permit_guid === related_guid)
    .sort((order1, order2) => {
      const date1 = Date.parse(order1.due_date) || 0;
      const date2 = Date.parse(order2.due_date) || 0;
      return date1 === date2 ? order1.order_no - order2.order_no : date1 - date2;
    });

const getPermitteeName = (permittees) =>
  permittees[0] ? permittees[0].party.party_name : Strings.EMPTY_FIELD;

const transformRowData = (permit, partyRelationships) => {
  const latestAmendment = permit.amendments[0];
  const firstAmendment = permit.amendments[permit.amendments.length - 1];

  const permittees = getPermittees(partyRelationships, permit);
  const permitteeName =
    partyRelationships.length === 0 ? Strings.LOADING : getPermitteeName(permittees);

  return {
    key: permit.permit_guid,
    lastAmended:
      (latestAmendment && latestAmendment.issue_date && formatDate(latestAmendment.issue_date)) ||
      Strings.EMPTY_FIELD,
    permitNo: permit.permit_no || Strings.EMPTY_FIELD,
    firstIssued:
      (firstAmendment && firstAmendment.issue_date && formatDate(firstAmendment.issue_date)) ||
      Strings.EMPTY_FIELD,
    permittee: permitteeName,
    authorizationEndDate:
      latestAmendment && latestAmendment.authorization_end_date
        ? formatDate(latestAmendment.authorization_end_date)
        : Strings.EMPTY_FIELD,
    amendments: permit.amendments,
    status: permit.permit_status_code,
  };
};

const transformChildRowData = (amendment, record, amendmentNumber) => ({
  amendmentNumber,
  receivedDate: amendment.received_date || Strings.EMPTY_FIELD,
  issueDate: amendment.issue_date || Strings.EMPTY_FIELD,
  authorizationEndDate: amendment.authorization_end_date || Strings.EMPTY_FIELD,
  description: Strings.EMPTY_FIELD,
});

export const MinePermitInfo = (props) => {
  const amendmentHistory = (record) => {
    const childRowData = record.amendments.map((amendment, index) =>
      transformChildRowData(amendment, record, record.amendments.length - index)
    );
    return (
      <Table align="left" pagination={false} columns={childColumns} dataSource={childRowData} />
    );
  };
  const rowData = props.mine.mine_permit
    .filter((permit) => permit.permit_no.toUpperCase().charAt(1) !== "X")
    .map((permit) => transformRowData(permit, props.partyRelationships))
    .concat(
      props.mine.mine_permit
        .filter((permit) => permit.permit_no.toUpperCase().charAt(1) === "X")
        .map((permit) => transformRowData(permit, props.partyRelationships))
    );

  return (
    <Table
      className="nested-table"
      align="left"
      pagination={false}
      columns={columns}
      dataSource={rowData}
      expandedRowRender={amendmentHistory}
      locale={{ emptyText: <NullScreen type="permit" /> }}
    />
  );
};

const mapStateToProps = (state) => ({
  partyRelationships: getPartyRelationships(state),
});

MinePermitInfo.propTypes = propTypes;
MinePermitInfo.defaultProps = defaultProps;

export default connect(mapStateToProps)(MinePermitInfo);
