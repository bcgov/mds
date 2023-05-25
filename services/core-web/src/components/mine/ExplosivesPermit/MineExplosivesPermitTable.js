import React, { Component } from "react";
import { Badge, Tooltip, Table, Button, Menu, Popconfirm, Dropdown } from "antd";
import { withRouter } from "react-router-dom";
import { WarningOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { formatDate, dateSorter } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import CoreTable from "@/components/common/CoreTable";
import {
  getExplosivesPermitBadgeStatusType,
  getExplosivesPermitClosedBadgeStatusType,
} from "@/constants/theme";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import DocumentLink from "@/components/common/DocumentLink";
import { EDIT_OUTLINE_VIOLET, EDIT, CARAT, TRASHCAN } from "@/constants/assets";

import { CoreTooltip } from "@/components/common/CoreTooltip";

/**
 * @class MineExplosivesPermitTable - list of mine explosives storage and use permits
 */
const propTypes = {
  data: PropTypes.arrayOf(CustomPropTypes.explosivesPermit),
  isLoaded: PropTypes.bool.isRequired,
  onExpand: PropTypes.func.isRequired,
  expandedRowKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleOpenExplosivesPermitDecisionModal: PropTypes.func.isRequired,
  handleOpenExplosivesPermitStatusModal: PropTypes.func.isRequired,
  handleDeleteExplosivesPermit: PropTypes.func.isRequired,
  isPermitTab: PropTypes.bool,
  explosivesPermitDocumentTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  explosivesPermitStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  handleOpenAddExplosivesPermitModal: PropTypes.func.isRequired,
  handleOpenViewMagazineModal: PropTypes.func.isRequired,
  handleOpenExplosivesPermitCloseModal: PropTypes.func.isRequired,
};

const defaultProps = {
  data: [],
  isPermitTab: false,
};

const transformRowData = (permits) => {
  return permits.map((permit) => {
    return {
      ...permit,
      key: permit.explosives_permit_guid,
      documents: permit.documents,
      isExpired: permit.expiry_date && Date.parse(permit.expiry_date) < new Date(),
    };
  });
};

const hideColumn = (condition) => (condition ? "column-hide" : "");

export class MineExplosivesPermitTable extends Component {
  columns = () => [
    {
      title: "Permit #",
      dataIndex: "permit_number",
      sortField: "permit_number",
      render: (text) => (
        <div title="Permit #" className={hideColumn(!this.props.isPermitTab)}>
          {text}
        </div>
      ),
      sorter: false,
      className: hideColumn(!this.props.isPermitTab),
    },
    {
      title: "Application #",
      dataIndex: "application_number",
      sortField: "application_number",
      render: (text) => (
        <div title="Application #" className={hideColumn(this.props.isPermitTab)}>
          {text}
        </div>
      ),
      sorter: false,
      className: hideColumn(this.props.isPermitTab),
    },
    {
      title: "Mines Act Permit #",
      dataIndex: "mines_permit_number",
      sortField: "mines_permit_number",
      render: (text) => <div title="Mines Act Permit #">{text}</div>,
      sorter: false,
    },
    {
      title: "Notice of Work #",
      dataIndex: "now_number",
      sortField: "now_number",
      render: (text) => <div title="Notice of Work #">{text || Strings.EMPTY_FIELD}</div>,
      sorter: false,
    },
    {
      title: "Status",
      dataIndex: "application_status",
      sortField: "application_status",
      render: (text) => (
        <div title="Status" className={hideColumn(this.props.isPermitTab)}>
          <Badge
            status={getExplosivesPermitBadgeStatusType(
              this.props.explosivesPermitStatusOptionsHash[text]
            )}
            style={{ marginRight: 5 }}
          />
          {this.props.explosivesPermitStatusOptionsHash[text] || Strings.EMPTY_FIELD}
        </div>
      ),
      className: hideColumn(this.props.isPermitTab),
      sorter: false,
    },
    {
      title: "Status",
      dataIndex: "is_closed",
      sortField: "is_closed",
      render: (text) => (
        <div title="Status" className={hideColumn(!this.props.isPermitTab)}>
          <Badge
            status={getExplosivesPermitClosedBadgeStatusType(text)}
            style={{ marginRight: 5 }}
          />
          {text ? "Closed" : "Open" || Strings.EMPTY_FIELD}
        </div>
      ),
      className: hideColumn(!this.props.isPermitTab),
      sorter: false,
    },
    {
      title: "Decision Reason",
      dataIndex: "decision_reason",
      sortField: "decision_reason",
      render: (text) => (
        <div title="Decision Reason" className={hideColumn(this.props.isPermitTab)}>
          {text || Strings.EMPTY_FIELD}
        </div>
      ),
      className: hideColumn(this.props.isPermitTab),
      sorter: false,
    },
    {
      title: "Issuing Inspector",
      dataIndex: "issuing_inspector_name",
      render: (text) => (
        <div title="Issuing Inspector" className={hideColumn(!this.props.isPermitTab)}>
          {text || Strings.EMPTY_FIELD}
        </div>
      ),
      sorter: false,
      className: hideColumn(!this.props.isPermitTab),
    },
    {
      title: "Source",
      dataIndex: "originating_system",
      sortField: "originating_system",
      render: (text) => <div title="Source">{text || Strings.EMPTY_FIELD}</div>,
      sorter: false,
    },
    {
      title: "Permittee",
      dataIndex: "permittee_name",
      render: (text) => <div title="Permittee">{text || Strings.EMPTY_FIELD}</div>,
      sorter: false,
    },
    {
      title: "Application Date",
      dataIndex: "application_date",
      sortField: "application_date",
      render: (text) => (
        <div title="Application Date">{formatDate(text) || Strings.EMPTY_FIELD}</div>
      ),
      sorter: dateSorter("application_date"),
    },
    {
      title: "Issue Date",
      dataIndex: "issue_date",
      sortField: "issue_date",
      render: (text) => (
        <div title="Issue Date" className={hideColumn(!this.props.isPermitTab)}>
          {formatDate(text) || Strings.EMPTY_FIELD}
        </div>
      ),
      sorter: dateSorter("issue_date"),
      className: hideColumn(!this.props.isPermitTab),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiry_date",
      sortField: "expiry_date",
      render: (text, record) => (
        <div title="Expiry Date" className={hideColumn(!this.props.isPermitTab)}>
          {record.isExpired && (
            <Tooltip placement="topLeft" title="Permit has Expired.">
              <WarningOutlined className="icon-lg red" />
            </Tooltip>
          )}{" "}
          {formatDate(text) || Strings.EMPTY_FIELD}
        </div>
      ),
      sorter: dateSorter("expiry_date"),
      className: hideColumn(!this.props.isPermitTab),
    },
    {
      title: (
        <span>
          Explosive Quantity
          <CoreTooltip title="Total Explosive Quantity: This is the total quantity stored on site. Click to view more details" />
        </span>
      ),
      dataIndex: "total_explosive_quantity",
      sortField: "total_explosive_quantity",
      render: (text, record) => (
        /* eslint-disable-next-line */
        <div
          title="Explosive Quantity"
          className="underline"
          onClick={(event) => this.props.handleOpenViewMagazineModal(event, record, "EXP")}
        >
          {text || "0"} kg
        </div>
      ),
      sorter: false,
    },
    {
      title: (
        <span>
          Detonator Quantity
          <CoreTooltip title="Total Detonator Quantity: This is the total quantity stored on site. Click to view more details" />
        </span>
      ),
      dataIndex: "total_detonator_quantity",
      sortField: "total_detonator_quantity",
      render: (text, record) => (
        /* eslint-disable-next-line */
        <div
          title="Detonator Quantity"
          className="underline"
          onClick={(event) => this.props.handleOpenViewMagazineModal(event, record, "DET")}
        >
          {text || "0"} units
        </div>
      ),
      sorter: false,
    },
    {
      title: "",
      dataIndex: "addEditButton",
      key: "addEditButton",
      align: "right",
      render: (text, record) => {
        const isApproved = record.application_status === "APP";
        const isProcessed = record.application_status !== "REC";
        const hasDocuments =
          record.documents?.filter((doc) =>
            ["LET", "PER"].includes(doc.explosives_permit_document_type_code)
          )?.length > 0;
        const isCoreSource = record.originating_system === "Core";
        const approvedMenu = (
          <Menu>
            <Menu.Item key="0">
              <button
                type="button"
                className="full add-permit-dropdown-button"
                onClick={(event) =>
                  this.props.handleOpenAddExplosivesPermitModal(
                    event,
                    this.props.isPermitTab,
                    record
                  )
                }
              >
                <img
                  alt="document"
                  className="padding-sm"
                  src={EDIT_OUTLINE_VIOLET}
                  style={{ paddingRight: "15px" }}
                />
                Edit Documents
              </button>
            </Menu.Item>
            <Menu.Item key="edit">
              <button
                type="button"
                className="full add-permit-dropdown-button"
                onClick={(event) => this.props.handleOpenExplosivesPermitCloseModal(event, record)}
              >
                <img
                  alt="document"
                  className="padding-sm"
                  src={EDIT_OUTLINE_VIOLET}
                  style={{ paddingRight: "15px" }}
                />
                Close Explosives Permit
              </button>
            </Menu.Item>
          </Menu>
        );
        const menu = (
          <Menu>
            {!isProcessed && (
              <Menu.Item key="process">
                <button
                  type="button"
                  className="full add-permit-dropdown-button"
                  onClick={(event) =>
                    this.props.handleOpenExplosivesPermitDecisionModal(event, record)
                  }
                >
                  <img
                    alt="document"
                    className="padding-sm"
                    src={EDIT_OUTLINE_VIOLET}
                    style={{ paddingRight: "15px" }}
                  />
                  Approve
                </button>
              </Menu.Item>
            )}
            {!isProcessed && (
              <Menu.Item key="edit">
                <button
                  type="button"
                  className="full add-permit-dropdown-button"
                  onClick={(event) =>
                    this.props.handleOpenExplosivesPermitStatusModal(event, record)
                  }
                >
                  <img
                    alt="document"
                    className="padding-sm"
                    src={EDIT_OUTLINE_VIOLET}
                    style={{ paddingRight: "15px" }}
                  />
                  Withdraw/Reject
                </button>
              </Menu.Item>
            )}
            <Menu.Item key="0">
              <button
                type="button"
                className="full add-permit-dropdown-button"
                onClick={(event) =>
                  this.props.handleOpenAddExplosivesPermitModal(
                    event,
                    this.props.isPermitTab,
                    record
                  )
                }
              >
                <img
                  alt="document"
                  className="padding-sm"
                  src={EDIT_OUTLINE_VIOLET}
                  style={{ paddingRight: "15px" }}
                />
                Edit
              </button>
            </Menu.Item>
          </Menu>
        );
        const showActions = !isApproved || (isApproved && this.props.isPermitTab);
        const showDelete =
          (record.application_status !== "APP" && !this.props.isPermitTab) ||
          (isApproved && this.props.isPermitTab);
        return (
          <div className="btn--middle flex">
            {isApproved && !hasDocuments && isCoreSource && (
              <AuthorizationWrapper permission={Permission.EDIT_EXPLOSIVES_PERMITS}>
                <Button
                  type="secondary"
                  className="full-mobile"
                  htmlType="submit"
                  onClick={(event) =>
                    this.props.handleOpenExplosivesPermitDecisionModal(event, record)
                  }
                >
                  Re-generate docs
                </Button>
              </AuthorizationWrapper>
            )}
            {showActions && (
              <AuthorizationWrapper permission={Permission.EDIT_EXPLOSIVES_PERMITS}>
                <Dropdown
                  className="full-height full-mobile"
                  overlay={isApproved ? approvedMenu : menu}
                  placement="bottomLeft"
                >
                  <Button type="secondary" className="permit-table-button">
                    <div className="padding-sm">
                      <img
                        className="padding-sm--right icon-svg-filter"
                        src={EDIT}
                        alt="Add/Edit"
                      />
                      {isApproved ? "Edit" : "Process/Edit"}
                      <img
                        className="padding-sm--right icon-svg-filter"
                        src={CARAT}
                        alt="Menu"
                        style={{ paddingLeft: "5px" }}
                      />
                    </div>
                  </Button>
                </Dropdown>
              </AuthorizationWrapper>
            )}
            {showDelete && (
              <AuthorizationWrapper permission={Permission.ADMIN}>
                <Popconfirm
                  placement="topLeft"
                  title={`Are you sure you want to delete the Explosives Storage & Use ${
                    this.props.isPermitTab ? "Permit" : "Permit Application"
                  }?`}
                  onConfirm={(event) => this.props.handleDeleteExplosivesPermit(event, record)}
                  okText="Delete"
                  cancelText="Cancel"
                >
                  <Button ghost type="primary" size="small">
                    <img name="remove" src={TRASHCAN} alt="Remove Permit" />
                  </Button>
                </Popconfirm>
              </AuthorizationWrapper>
            )}
          </div>
        );
      },
    },
  ];

  documentDetail = (permit) => {
    const expandedColumns = [
      {
        title: "Category",
        dataIndex: "explosives_permit_document_type_code",
        key: "explosives_permit_document_type_code",
        render: (text) => (
          <div title="Upload Date">
            {this.props.explosivesPermitDocumentTypeOptionsHash[text] || Strings.EMPTY_FIELD}
          </div>
        ),
      },
      {
        title: "Document Name",
        dataIndex: "document_name",
        key: "document_name",
        render: (text, record) => (
          <div className="cap-col-height" title="Document Name">
            <DocumentLink documentManagerGuid={record.document_manager_guid} documentName={text} />
            <br />
          </div>
        ),
      },
      {
        title: "Date",
        dataIndex: "upload_date",
        key: "upload_date",
        render: (text) => <div title="Upload Date">{formatDate(text) || Strings.EMPTY_FIELD}</div>,
      },
    ];

    return (
      <Table
        align="left"
        pagination={false}
        columns={expandedColumns}
        dataSource={permit.documents}
        locale={{ emptyText: "No Data Yet" }}
      />
    );
  };

  render() {
    return (
      <CoreTable
        condition={this.props.isLoaded}
        dataSource={transformRowData(this.props.data)}
        columns={this.columns(this.props)}
        recordType="document details"
        tableProps={{
          align: "left",
          pagination: false,
          expandRowByClick: true,
          expandedRowRender: this.documentDetail,
          expandedRowKeys: this.props.expandedRowKeys,
          onExpand: this.props.onExpand,
        }}
      />
    );
  }
}

MineExplosivesPermitTable.propTypes = propTypes;
MineExplosivesPermitTable.defaultProps = defaultProps;

export default withRouter(MineExplosivesPermitTable);
