import React from "react";
import { Table, Button } from "antd";
import NullScreen from "@/components/common/NullScreen";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Strings from "@/constants/strings";
import * as Permission from "@/constants/permissions";
import { getDropdownApplicationStatusOptions } from "@/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { EDIT_OUTLINE } from "@/constants/assets";

/**
 * @class  MinePermitTable - displays a table of permits and permit amendments
 */

const propTypes = {
  applications: PropTypes.arrayOf(PropTypes.object),
  applicationStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  major_mine_ind: PropTypes.bool.isRequired,
  openEditApplicationModal: PropTypes.func.isRequired,
};

const defaultProps = {
  partyRelationships: [],
};

const columns = [
  {
    title: "Application No.",
    dataIndex: "applicationNo",
    key: "applicationNo",
    render: (text) => <div title="Application No.">{text}</div>,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (text, record) => (
      <div title="Status">
        {record.applicationStatusOptions.find((item) => item.value === text).label}
      </div>
    ),
  },
  {
    title: "Received Date",
    dataIndex: "receivedDate",
    key: "receivedDate",
    render: (text) => <div title="Received Date">{text}</div>,
  },

  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    render: (text) => (
      <div title="Description" style={{ maxWidth: "800px" }}>
        {text}
      </div>
    ),
  },
  {
    title: "",
    dataIndex: "applicationEdit",
    key: "applicationEdit",
    align: "right",
    render: (text, record) => (
      <AuthorizationWrapper inTesting>
        <AuthorizationWrapper permission={Permission.CREATE} isMajorMine={text.major_mine_ind}>
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
      </AuthorizationWrapper>
    ),
  },
];
const transformRowData = (
  application,
  major_mine_ind,
  applicationStatusOptions,
  openEditApplicationModal
) => {
  return {
    key: application.permit_guid,
    applicationNo: application.application_no || Strings.EMPTY_FIELD,
    status: application.application_status_code || Strings.EMPTY_FIELD,
    receivedDate: application.received_date || Strings.EMPTY_FIELD,
    description: application.description || Strings.EMPTY_FIELD,
    applicationEdit: {
      application,
      major_mine_ind,
    },
    applicationStatusOptions,
    openEditApplicationModal,
  };
};

export const MineApplicationTable = (props) => {
  const rowData = props.applications.map((application) =>
    transformRowData(
      application,
      props.major_mine_ind,
      props.applicationStatusOptions,
      props.openEditApplicationModal
    )
  );

  return (
    <Table
      className="nested-table"
      rowClassName={() => "table-row-align-middle"}
      align="left"
      pagination={false}
      columns={columns}
      dataSource={rowData}
      locale={{ emptyText: <NullScreen type="permit" /> }}
    />
  );
};

const mapStateToProps = (state) => ({
  applicationStatusOptions: getDropdownApplicationStatusOptions(state),
});

MineApplicationTable.propTypes = propTypes;
MineApplicationTable.defaultProps = defaultProps;

export default connect(mapStateToProps)(MineApplicationTable);
