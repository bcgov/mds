/* eslint-disable */
import React, { Component } from "react";
import { Badge, Tooltip, Table, Button, Menu, Popconfirm, Dropdown } from "antd";
import { withRouter, Link } from "react-router-dom";
import * as router from "@/constants/routes";
import PropTypes from "prop-types";
import { formatDate, dateSorter } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import { MinusSquareFilled, PlusSquareFilled } from "@ant-design/icons";
import CoreTable from "@/components/common/CoreTable";
import { getApplicationStatusType } from "@/constants/theme";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import DocumentLink from "@/components/common/DocumentLink";
import { EDIT_OUTLINE_VIOLET, EDIT, CARAT, TRASHCAN } from "@/constants/assets";

/**
 * @class MineExplosivesPermitTable - list of mine explosives storage and use permits
 */
const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
  isLoaded: PropTypes.bool.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }).isRequired,
  onExpand: PropTypes.func.isRequired,
  expandedRowKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleOpenExplosivesPermitDecisionModal: PropTypes.func.isRequired,
};

const defaultProps = {
  data: [],
};

const transformRowData = (permits) => {
  return permits.map((permit) => {
    return {
      ...permit,
      key: permit.esup_guid,
      documents: permit.documents,
      det_quantity: permit.detonator_magazines.length,
      exp_quantity: permit.explosive_magazines.length,
    };
  });
};

const transformExpandedRowData = (record) => ({
  ...record,
  documents: record.documents
    .filter((doc) => doc.now_application_document_type_code === "ADR")
    .map((doc) => ({
      mine_guid: doc.mine_document.mine_guid,
      document_manager_guid: doc.mine_document.document_manager_guid,
      document_name: doc.mine_document.document_name,
    })),
});

const hideColumn = (condition) => (condition ? "column-hide" : "");

const RenderTableExpandIcon = (rowProps) => (
  <a
    role="link"
    className="expand-row-icon"
    onClick={(e) => rowProps.onExpand(rowProps.record, e)}
    onKeyPress={(e) => rowProps.onExpand(rowProps.record, e)}
    style={{ cursor: "pointer" }}
    tabIndex="0"
  >
    {rowProps.expanded ? (
      <Tooltip title="Click to hide amendment details." placement="right" mouseEnterDelay={1}>
        <MinusSquareFilled className="icon-lg--lightgrey" />
      </Tooltip>
    ) : (
      <Tooltip title="Click to hide amendment details." placement="right" mouseEnterDelay={1}>
        <PlusSquareFilled className="icon-lg--lightgrey" />
      </Tooltip>
    )}
  </a>
);

export class MineExplosivesPermitTable extends Component {
  columns = () => [
    {
      title: "Permit #",
      dataIndex: "permit_no",
      sortField: "permit_no",
      render: (text) => (
        <div title="Permit #" className={hideColumn(!this.props.isPermit)}>
          {text}
        </div>
      ),
      sorter: false,
      className: hideColumn(!this.props.isPermit),
    },
    {
      title: "Application #",
      dataIndex: "application_number",
      sortField: "application_number",
      render: (text) => (
        <div title="Application #" className={hideColumn(this.props.isPermit)}>
          {text}
        </div>
      ),
      sorter: false,
      className: hideColumn(this.props.isPermit),
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
        <div title="Status">
          {this.props.explosivesPermitStatusOptionsHash[text] || Strings.EMPTY_FIELD}
        </div>
      ),
      sorter: false,
    },
    {
      title: "Issuing Inspector",
      dataIndex: "issuing_inspector_name",
      render: (text) => (
        <div title="Issuing Inspector" className={hideColumn(!this.props.isPermit)}>
          {text || Strings.EMPTY_FIELD}
        </div>
      ),
      sorter: false,
      className: hideColumn(!this.props.isPermit),
    },
    {
      title: "Source",
      dataIndex: "originating_system",
      sortField: "originating_system",
      render: (text) => <div title="Source">{text || Strings.EMPTY_FIELD}</div>,
      sorter: false,
    },
    {
      title: "Mine Operator",
      dataIndex: "mine_operator_name",
      render: (text) => <div title="Mine Operator">{text || Strings.EMPTY_FIELD}</div>,
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
        <div title="Issue Date" className={hideColumn(!this.props.isPermit)}>
          {formatDate(text) || Strings.EMPTY_FIELD}
        </div>
      ),
      sorter: dateSorter("issue_date"),
      className: hideColumn(!this.props.isPermit),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiry_date",
      sortField: "expiry_date",
      render: (text) => (
        <div title="Expiry Date" className={hideColumn(!this.props.isPermit)}>
          {formatDate(text) || Strings.EMPTY_FIELD}
        </div>
      ),
      sorter: dateSorter("expiry_date"),
      className: hideColumn(!this.props.isPermit),
    },
    {
      title: "Explosive Quantity",
      dataIndex: "exp_quantity",
      sortField: "exp_quantity",
      render: (text, record) => (
        <div
          title="Explosive Quantity"
          className="underline"
          onClick={(event) => this.props.handleOpenViewMagazineModal(event, record, "EXP")}
        >
          {text}
        </div>
      ),
      sorter: false,
    },
    {
      title: "Detonator Quantity",
      dataIndex: "det_quantity",
      sortField: "det_quantity",
      render: (text, record) => (
        <div
          title="Detonator Quantity"
          className="underline"
          onClick={(event) => this.props.handleOpenViewMagazineModal(event, record, "DET")}
        >
          {text}
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
        const menu = (
          <Menu>
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
                Process
              </button>
            </Menu.Item>
            <Menu.Item key="edit">
              <button
                type="button"
                className="full add-permit-dropdown-button"
                onClick={(event) => this.props.handleOpenAddExplosivesPermitModal(event, record)}
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
        return (
          <div className="btn--middle flex">
            {!this.props.isPermit && (
              <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                <Dropdown className="full-height full-mobile" overlay={menu} placement="bottomLeft">
                  <Button type="secondary" className="permit-table-button">
                    <div className="padding-sm">
                      <img
                        className="padding-sm--right icon-svg-filter"
                        src={EDIT}
                        alt="Add/Edit"
                      />
                      Process/Edit
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
            <AuthorizationWrapper permission={Permission.ADMIN}>
              <Popconfirm
                placement="topLeft"
                title={`Are you sure you want to delete the Explosives Storage & Use ${
                  this.props.isPermit ? "Permit" : "Permit Application"
                }?`}
                onConfirm={() => console.log("yes delete")}
                okText="Delete"
                cancelText="Cancel"
              >
                <Button ghost type="primary" size="small">
                  <img name="remove" src={TRASHCAN} alt="Remove Permit" />
                </Button>
              </Popconfirm>
            </AuthorizationWrapper>
          </div>
        );
      },
    },
  ];

  documentDetail = (record) => {
    const expandedColumns = [
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
      },
      {
        title: "Document Name",
        dataIndex: "documents",
        key: "documents",
        render: (text) => (
          <div className="cap-col-height">
            {(text &&
              text.length > 0 &&
              text.map((file) => (
                <>
                  <DocumentLink
                    documentManagerGuid={file.document_manager_guid}
                    documentName={file.document_name}
                  />
                  <br />
                </>
              ))) ||
              Strings.EMPTY_FIELD}
          </div>
        ),
      },
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
      },
    ];

    return (
      <Table
        align="left"
        pagination={false}
        columns={expandedColumns}
        dataSource={[transformExpandedRowData(record)]}
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
        tableProps={{
          align: "left",
          pagination: false,
          expandIcon: RenderTableExpandIcon,
          expandRowByClick: true,
          expandedRowRender: this.documentDetail,
          expandedRowKeys: this.props.expandedRowKeys,
        }}
      />
    );
  }
}

MineExplosivesPermitTable.propTypes = propTypes;
MineExplosivesPermitTable.defaultProps = defaultProps;

export default withRouter(MineExplosivesPermitTable);
