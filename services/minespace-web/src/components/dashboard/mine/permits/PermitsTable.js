import React from "react";
import { Table, Typography } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { formatDate } from "@common/utils/helpers";
import moment from "moment";
import { getDropdownPermitStatusOptions } from "@common/selectors/staticContentSelectors";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";
import * as Strings from "@/constants/strings";

const { Text } = Typography;

const propTypes = {
  isLoaded: PropTypes.bool.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  permitStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

const columns = [
  {
    title: "Permit No.",
    dataIndex: "number",
    key: "number",
    sorter: (a, b) => (a.number > b.number ? -1 : 1),
  },
  {
    title: "Permit Status",
    dataIndex: "status",
    key: "status",
    sorter: (a, b) => (a.status > b.status ? -1 : 1),
  },
  {
    title: "Authorization End Date",
    dataIndex: "authorizationEndDate",
    key: "authorizationEndDate",
    sorter: (a, b) => (moment(a.authorizationEndDate) > moment(b.authorizationEndDate) ? -1 : 1),
  },
  {
    title: "First Issued",
    dataIndex: "firstIssued",
    key: "firstIssued",
    sorter: (a, b) => (moment(a.firstIssued) > moment(b.firstIssued) ? -1 : 1),
  },
  {
    title: "Last Amended",
    dataIndex: "lastAmended",
    key: "lastAmended",
    sorter: (a, b) => (moment(a.lastAmended) > moment(b.lastAmended) ? -1 : 1),
    defaultSortOrder: "descend",
  },
];

const renderDocumentLink = (file, text) => (
  <LinkButton key={file.mine_document_guid} onClick={() => downloadFileFromDocumentManager(file)}>
    {text}
  </LinkButton>
);

const expandedColumns = [
  {
    title: "Amendment No.",
    dataIndex: "amendmentNumber",
    key: "amendmentNumber",
    width: 180,
  },
  { title: "Date Issued", dataIndex: "dateIssued", key: "dateIssued" },
  { title: "Description", dataIndex: "description", key: "description" },
  {
    title: "Files",
    dataIndex: "files",
    key: "files",
    render: (text) =>
      (text &&
        text.length > 0 &&
        text.map((file) => (
          <Text>
            {renderDocumentLink(file, file.document_name)}
            <br />
          </Text>
        ))) ||
      Strings.NONE,
  },
];

const transformRowData = (permit, permitStatusOptions) => {
  const latestAmendment = permit.permit_amendments[0];
  const firstAmendment = permit.permit_amendments[permit.permit_amendments.length - 1];
  return {
    key: permit.permit_no || Strings.EMPTY_FIELD,
    number: permit.permit_no || Strings.EMPTY_FIELD,
    status:
      (permit.permit_status_code &&
        permitStatusOptions.find((item) => item.value === permit.permit_status_code).label) ||
      Strings.EMPTY_FIELD,
    authorizationEndDate:
      (latestAmendment && formatDate(latestAmendment.authorization_end_date)) ||
      Strings.EMPTY_FIELD,
    firstIssued: (firstAmendment && formatDate(firstAmendment.issue_date)) || Strings.EMPTY_FIELD,
    lastAmended: (latestAmendment && formatDate(latestAmendment.issue_date)) || Strings.EMPTY_FIELD,
    permit_amendments: permit.permit_amendments,
  };
};

const transformExpandedRowData = (amendment, amendmentNumber) => ({
  key: amendmentNumber,
  amendmentNumber,
  dateIssued: formatDate(amendment.issue_date) || Strings.EMPTY_FIELD,
  description: amendment.description || Strings.EMPTY_FIELD,
  files: amendment.related_documents,
});

export const PermitsTable = (props) => {
  const rowData = props.permits.map((permit) =>
    transformRowData(permit, props.permitStatusOptions)
  );

  const amendmentHistory = (permit) => {
    const expandedRowData = permit.permit_amendments
      ? permit.permit_amendments.map((amendment, index) =>
          transformExpandedRowData(amendment, permit.permit_amendments.length - index)
        )
      : [];
    return (
      <Table
        size="small"
        pagination={false}
        columns={expandedColumns}
        dataSource={expandedRowData}
        locale={{ emptyText: "This permit has no amendment data." }}
      />
    );
  };

  return (
    <Table
      size="small"
      pagination={false}
      loading={!props.isLoaded}
      columns={columns}
      dataSource={rowData}
      expandedRowRender={amendmentHistory}
      expandRowByClick
      locale={{ emptyText: "This mine has no permit data." }}
    />
  );
};

PermitsTable.propTypes = propTypes;

const mapStateToProps = (state) => ({
  permitStatusOptions: getDropdownPermitStatusOptions(state),
});

PermitsTable.propTypes = propTypes;

export default connect(mapStateToProps)(PermitsTable);
