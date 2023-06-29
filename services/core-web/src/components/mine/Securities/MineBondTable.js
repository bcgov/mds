import React from "react";
import { Menu, Dropdown, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
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
  recordsByPermit: PropTypes.func.isRequired,
  activeBondCount: PropTypes.func.isRequired,
  getBalance: PropTypes.func.isRequired,
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
          Confiscated Cash On Hand
          <CoreTooltip title="Confiscated Cash On Hand: This is the current amount of money available from the confiscated bonds. If this amount is negative, it means invoices have exceeded the confiscated bonds." />
        </div>
      ),
      dataIndex: "balance",
      key: "balance",
      render: (text) => (
        <div title="Confiscated Cash On Hand">{formatMoney(text) || Strings.EMPTY_FIELD}</div>
      ),
    },
    {
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
              <div className="padding-sm">
                <img className="padding-sm--right icon-svg-filter" src={EDIT} alt="Add/Edit" />
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
              <div className="padding-sm">
                <EyeOutlined className="icon-lg icon-svg-filter" />
              </div>
            </Button>
            <AuthorizationWrapper permission={Permission.EDIT_SECURITIES}>
              <Dropdown className="full-height full-mobile" overlay={menu} placement="bottomLeft">
                <Button type="secondary" className="permit-table-button">
                  <div className="padding-sm">
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
          </div>
        );
      },
    },
  ];

  const transformRowData = (permits) =>
    permits.map((permit) => {
      return {
        key: permit.permit_guid,
        total_bonds: props.activeBondCount(permit),
        balance: props.getBalance(permit),
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
      expandProps={{
        rowKey: (bond) => bond.bond_guid,
        recordDescription: "associated bonds",
        getDataSource: (record) => props.recordsByPermit(record, props.bonds),
        subTableColumns: bondColumns,
      }}
    />
  );
};

MineBondTable.propTypes = propTypes;

export default MineBondTable;
