import React from "react";
import { Table, Button } from "antd";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import NullScreen from "@/components/common/NullScreen";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Strings from "@/constants/strings";
import * as Permission from "@/constants/permissions";
import { getDropdownApplicationStatusOptions } from "@/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";
import { formatDate, getTableHeaders } from "@/utils/helpers";
import { EDIT_OUTLINE } from "@/constants/assets";
import TableLoadingWrapper from "@/components/common/wrappers/TableLoadingWrapper";

/**
 * @class  MineApplicationTable - displays a table of applicationsfor a mine.
 */

const propTypes = {
  applications: PropTypes.arrayOf(CustomPropTypes.application),
  applicationStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  isMajorMine: PropTypes.bool.isRequired,
  openEditApplicationModal: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

const defaultProps = {
  applications: [],
};

const columns = [
  {
    title: "Application No.",
    dataIndex: "applicationNo",
    key: "applicationNo",
    width: 150,
    render: (text) => <div title="Application No.">{text}</div>,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 150,
    render: (text, record) => {
      const status = record.applicationStatusOptions.find((item) => item.value === text);
      return <div title="Status">{status && status.label}</div>;
    },
  },
  {
    title: "Received Date",
    dataIndex: "receivedDate",
    key: "receivedDate",
    width: 150,
    render: (text) => <div title="Received Date">{text}</div>,
  },

  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    width: 150,
    render: (text) => (
      <div title="Description">
        <p className="wrapped-text" style={{ maxWidth: "800px" }}>
          {text}
        </p>
      </div>
    ),
  },
  {
    title: "",
    dataIndex: "applicationEdit",
    key: "applicationEdit",
    align: "right",
    width: 150,
    render: (text, record) => (
      <AuthorizationWrapper permission={Permission.EDIT_PERMITS} isMajorMine={text.isMajorMine}>
        <Button
          className="permit-table-button"
          type="ghost"
          onClick={(event) => record.openEditApplicationModal(event, text.application)}
        >
          <div>
            <img className="padding-small--right icon-svg-filter" src={EDIT_OUTLINE} alt="Edit" />
          </div>
        </Button>
      </AuthorizationWrapper>
    ),
  },
];
const transformRowData = (
  application,
  major_mine_ind,
  applicationStatusOptions,
  openEditApplicationModal
) => ({
  key: application.permit_guid,
  applicationNo: application.application_no || Strings.EMPTY_FIELD,
  status: application.application_status_code || Strings.EMPTY_FIELD,
  receivedDate: formatDate(application.received_date) || Strings.EMPTY_FIELD,
  description: application.description || Strings.EMPTY_FIELD,
  applicationEdit: {
    application,
    major_mine_ind,
  },
  applicationStatusOptions,
  openEditApplicationModal,
});

export const MineApplicationTable = (props) => {
  const rowData = props.applications.map((application) =>
    transformRowData(
      application,
      props.isMajorMine,
      props.applicationStatusOptions,
      props.openEditApplicationModal
    )
  );

  return (
    <TableLoadingWrapper condition={props.isLoaded} tableHeaders={getTableHeaders(columns)}>
      <Table
        className="nested-table"
        rowClassName="fade-in"
        align="left"
        pagination={false}
        columns={columns}
        dataSource={rowData}
        locale={{ emptyText: <NullScreen type="applications" /> }}
      />
    </TableLoadingWrapper>
  );
};

const mapStateToProps = (state) => ({
  applicationStatusOptions: getDropdownApplicationStatusOptions(state),
});

MineApplicationTable.propTypes = propTypes;
MineApplicationTable.defaultProps = defaultProps;

export default connect(mapStateToProps)(MineApplicationTable);
