import React from "react";
import { Menu, Dropdown, Button, Tooltip, Table } from "antd";
import { EyeOutlined, MinusSquareFilled, PlusSquareFilled } from "@ant-design/icons";
import PropTypes from "prop-types";
import * as Strings from "@common/constants/strings";
import { formatDate, dateSorter, formatMoney } from "@common/utils/helpers";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { EDIT, CARAT } from "@/constants/assets";
import CoreTable from "@/components/common/CoreTable";
import { CoreTooltip } from "@/components/common/CoreTooltip";

/**
 * @class  MineBondTable - displays a table of permits with their related bonds
 */

const propTypes = {
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  bondStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  bondTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  bonds: PropTypes.arrayOf(CustomPropTypes.bond).isRequired,
  isLoaded: PropTypes.bool.isRequired,
  expandedRowKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  openEditBondModal: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  openViewBondModal: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  openTransferBondModal: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  openAddBondModal: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  openCloseBondModal: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  onExpand: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  recordsByPermit: PropTypes.func.isRequired,
  activeBondCount: PropTypes.func.isRequired,
};

export const MineBondTable = (props) => {
  const columns = [
    {
      title: "Permit No.",
      dataIndex: "permit_no",
      key: "permit_no",
      render: (text) => <div title="Permit No.">{text}</div>,
    },
    {
      title: "Project ID",
      dataIndex: "project_id",
      key: "project_id",
      render: (text) => <div title="Project ID">{text}</div>,
    },
    {
      title: "Active Bonds",
      dataIndex: "total_bonds",
      key: "total_bonds",
      render: (text) => <div title="No. of Active Bonds">{text || 0}</div>,
    },
    {
      dataIndex: "total_assessed",
      key: "total_assessed",
      title: (
        <span>
          Assessed Liability
          <CoreTooltip title="Total Assessed Liability: This is the total value of all liability assessments for the permit, including amendments. Assessed values are set by permitting inspectors and come from the associated permit." />
        </span>
      ),
      render: (text) => (
        <div title="Assessed Liability">{formatMoney(text) || Strings.EMPTY_FIELD}</div>
      ),
    },
    {
      title: "Total Held",
      dataIndex: "amount_held",
      key: "amount_held",
      render: (text) => <div title="Total Held">{formatMoney(text) || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: (
        <div>
          Total Confiscated
          <CoreTooltip title="Total Confiscated: This is the total value of bonds that have been confiscated for the permit. This amount is also shown below as Cash On Hand for the permit" />
        </div>
      ),
      dataIndex: "amount_confiscated",
      key: "amount_confiscated",
      render: (text) => (
        <div title="Total Confiscated">{formatMoney(text) || Strings.EMPTY_FIELD}</div>
      ),
    },
    {
      title: "",
      dataIndex: "addEditButton",
      key: "addEditButton",
      align: "right",
      render: (text, record) => {
        return (
          <AuthorizationWrapper permission={Permission.EDIT_SECURITIES}>
            <Button
              type="secondary"
              className="permit-table-button"
              onClick={(event) => props.openAddBondModal(event, record.permit_guid)}
            >
              <div className="padding-small">
                <img className="padding-small--right icon-svg-filter" src={EDIT} alt="Add/Edit" />
                Add Bond
              </div>
            </Button>
          </AuthorizationWrapper>
        );
      },
    },
  ];

  const bondColumns = [
    {
      title: "Issue Date",
      dataIndex: "issue_date",
      key: "issue_date",
      sorter: dateSorter("due_date"),
      render: (text) => <div title="Issue Date">{formatDate(text) || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Payer",
      dataIndex: "payer_party_guid",
      key: "payer_party_guid",
      render: (text, record) => <div title="Payer">{record.payer.name || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Type",
      dataIndex: "bond_type_code",
      key: "bond_type_code",
      sorter: (a, b) => (a.bond_type_code > b.bond_type_code ? -1 : 1),
      render: (text) => (
        <div title="Type">{props.bondTypeOptionsHash[text] || Strings.EMPTY_FIELD}</div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => <div title="Amount">{formatMoney(text) || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Status",
      dataIndex: "bond_status_code",
      key: "bond_status_code",
      sorter: (a, b) => (a.bond_status_code > b.bond_status_code ? -1 : 1),
      render: (text) => (
        <div title="Status">{props.bondStatusOptionsHash[text] || Strings.EMPTY_FIELD}</div>
      ),
      defaultSortOrder: "descend",
    },
    {
      title: "",
      dataIndex: "addEditButton",
      key: "addEditButton",
      align: "right",
      render: (text, record) => {
        const menu = (
          <Menu>
            {record.bond_status_code === "ACT" && (
              <>
                <Menu.Item key="release" className="custom-menu-item">
                  <button
                    type="button"
                    onClick={(event) => props.openCloseBondModal(event, record, "REL")}
                  >
                    Release Bond
                  </button>
                </Menu.Item>
                <Menu.Item key="confiscate" className="custom-menu-item">
                  <button
                    type="button"
                    onClick={(event) => props.openCloseBondModal(event, record, "CON")}
                  >
                    Confiscate Bond
                  </button>
                </Menu.Item>
                {props.permits.length > 1 && (
                  <Menu.Item key="transfer" className="custom-menu-item">
                    <button
                      type="button"
                      onClick={(event) => props.openTransferBondModal(event, record)}
                    >
                      Transfer Bond
                    </button>
                  </Menu.Item>
                )}
              </>
            )}
            <Menu.Item key="edit" className="custom-menu-item">
              <button
                type="button"
                className="full"
                onClick={(event) => props.openEditBondModal(event, record)}
              >
                Edit Bond
              </button>
            </Menu.Item>
          </Menu>
        );
        return (
          <div>
            <Button
              type="secondary"
              className="permit-table-button"
              onClick={(event) => props.openViewBondModal(event, record)}
            >
              <div className="padding-small">
                <EyeOutlined className="icon-lg icon-svg-filter" />
              </div>
            </Button>
            <AuthorizationWrapper permission={Permission.EDIT_SECURITIES}>
              <Dropdown className="full-height full-mobile" overlay={menu} placement="bottomLeft">
                <Button type="secondary" className="permit-table-button">
                  <div className="padding-small">
                    <img
                      className="padding-small--right icon-svg-filter"
                      src={CARAT}
                      alt="Menu"
                      style={{ paddingLeft: "5px" }}
                    />
                  </div>
                </Button>
              </Dropdown>
            </AuthorizationWrapper>
          </div>
        );
      },
    },
  ];

  const bonds = (record) => {
    return (
      <Table
        align="left"
        pagination={false}
        columns={bondColumns}
        dataSource={props.recordsByPermit(record, props.bonds)}
        locale={{ emptyText: "No Data Yet" }}
      />
    );
  };

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
        <Tooltip title="Click to hide associated bonds." placement="right" mouseEnterDelay={1}>
          <MinusSquareFilled className="icon-lg--grey" />
        </Tooltip>
      ) : (
        <Tooltip title="Click to view associated bonds." placement="right" mouseEnterDelay={1}>
          <PlusSquareFilled className="icon-lg--grey" />
        </Tooltip>
      )}
    </a>
  );

  const transformRowData = (permits) =>
    permits.map((permit) => {
      return {
        key: permit.permit_guid,
        total_bonds: props.activeBondCount(permit),
        amount_confiscated: permit.confiscated_bond_total,
        amount_held: permit.active_bond_total,
        total_assessed: permit.assessed_liability_total,
        ...permit,
      };
    });

  return (
    <CoreTable
      condition={props.isLoaded}
      dataSource={transformRowData(props.permits)}
      columns={columns}
      tableProps={{
        className: "nested-table",
        rowClassName: "table-row-align-middle pointer fade-in",
        align: "left",
        pagination: false,
        expandIcon: RenderTableExpandIcon,
        expandRowByClick: true,
        expandedRowRender: bonds,
        expandedRowKeys: props.expandedRowKeys,
        onExpand: props.onExpand,
      }}
    />
  );
};

MineBondTable.propTypes = propTypes;

export default MineBondTable;
