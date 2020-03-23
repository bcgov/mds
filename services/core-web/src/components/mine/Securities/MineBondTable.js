/* eslint-disable */
import React from "react";
import { Menu, Dropdown, Button, Icon, Tooltip, Table } from "antd";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@common/constants/strings";
import NullScreen from "@/components/common/NullScreen";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { EDIT_OUTLINE, EDIT_OUTLINE_VIOLET, EDIT, CARAT } from "@/constants/assets";
import LinkButton from "@/components/common/LinkButton";
import CoreTable from "@/components/common/CoreTable";
import { formatDate } from "@common/utils/helpers";

/**
 * @class  MineBondTable - displays a table of permits with their related bonds
 */

const propTypes = {
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  bondStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  bondTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
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
      title: "Security Total",
      dataIndex: "security_total",
      key: "security_total",
      render: (text, record) => (
        <div title="Security Total">
          {record.permit_amendments[0].security_total || Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "Total Bonds",
      dataIndex: "total_bonds",
      key: "total_bonds",
      render: (text) => <div title="Total Bonds">{text}</div>,
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
      render: (text) => <div title="Issue Date">{formatDate(text)}</div>,
    },
    {
      title: "Payer",
      dataIndex: "payer_party_guid",
      key: "payer_party_guid",
      render: (text, record) => <div title="Payer">{record.payer.name || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Institution",
      dataIndex: "institution_name",
      key: "institution_name",
      render: (text) => <div title="Institution">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Type",
      dataIndex: "bond_type_code",
      key: "bond_type_code",
      render: (text) => <div title="Type">{props.bondTypeOptionsHash[text]}</div>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => <div title="Amount">{text}</div>,
    },
    {
      title: "Status",
      dataIndex: "bond_status_code",
      key: "bond_status_code",
      render: (text) => <div title="Status">{props.bondStatusOptionsHash[text]}</div>,
    },
    {
      title: "",
      dataIndex: "addEditButton",
      key: "addEditButton",
      align: "right",
      render: (text, record) => {
        const menu = (
          <Menu>
            <Menu.Item key="0">
              <button
                type="button"
                className="full"
                onClick={() => props.releaseOrConfiscateBond("REL", record.bond_guid, record)}
              >
                Release Bond
              </button>
            </Menu.Item>
            <Menu.Item key="1">
              <button
                type="button"
                className="full"
                onClick={() => props.releaseOrConfiscateBond("CON", record.bond_guid, record)}
              >
                Confiscate Bond
              </button>
            </Menu.Item>
            <Menu.Item key="2">
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
                <Icon type="eye" alt="View" className="icon-lg icon-svg-filter" />
              </div>
            </Button>
            {record.bond_status_code === "ACT" && (
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
            )}
          </div>
        );
      },
    },
  ];

  const bonds = (record) => {
    const bondsByPermit = props.bonds.filter(({ permit_guid }) => {
      return permit_guid === record.permit_guid;
    });
    return (
      <Table align="left" pagination={false} columns={bondColumns} dataSource={bondsByPermit} />
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
          <Icon type="minus-square" theme="filled" className="icon-lg--grey" />
        </Tooltip>
      ) : (
        <Tooltip title="Click to view associated bonds." placement="right" mouseEnterDelay={1}>
          <Icon type="plus-square" theme="filled" className="icon-lg--grey" />
        </Tooltip>
      )}
    </a>
  );

  const transformRowData = (permits) =>
    permits.map((permit) => {
      return {
        key: permit.permit_guid,
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
        locale: { emptyText: <NullScreen type="securities" /> },
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
