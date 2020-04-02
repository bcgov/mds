import React from "react";
import { Button, Icon, Tooltip, Table } from "antd";
import PropTypes from "prop-types";
import * as Strings from "@common/constants/strings";
import { formatMoney, truncateFilename } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import NullScreen from "@/components/common/NullScreen";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { EDIT, EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import CoreTable from "@/components/common/CoreTable";
import LinkButton from "@/components/common/LinkButton";

/**
 * @class  MineReclamationInvoiceTable - displays a table of permits with their related bonds
 */

const propTypes = {
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  invoices: PropTypes.arrayOf(CustomPropTypes.invoice).isRequired,
  isLoaded: PropTypes.bool.isRequired,
  expandedRowKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  openEditBondModal: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  onExpand: PropTypes.func.isRequired,
};

export const MineReclamationInvoiceTable = (props) => {
  const columns = [
    {
      title: "Permit No.",
      dataIndex: "permit_no",
      key: "permit_no",
      render: (text) => <div title="Permit No.">{text}</div>,
    },
    {
      title: "Total Confiscated",
      dataIndex: "amount_confiscated",
      key: "amount_confiscated",
      render: (text) => (
        <div title="Total Confiscated">{formatMoney(text) || Strings.EMPTY_FIELD}</div>
      ),
    },
    {
      title: "Total Spent",
      dataIndex: "amount_spent",
      key: "amount_spent",
      render: (text) => <div title="Total Spent">{formatMoney(text) || Strings.EMPTY_FIELD}</div>,
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
              onClick={(event) => props.openAddReclamationInvoiceModal(event, record.permit_guid)}
            >
              <div className="padding-small">
                <img className="padding-small--right icon-svg-filter" src={EDIT} alt="Add/Edit" />
                Add Reclamation Invoice
              </div>
            </Button>
          </AuthorizationWrapper>
        );
      },
    },
  ];

  const invoiceColumns = [
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => <div title="Amount">{formatMoney(text) || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Vendor",
      dataIndex: "vendor",
      key: "vendor",
      render: (text, record) => <div title="Vendor">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Project ID",
      dataIndex: "project_id",
      key: "project_id",
      render: (text) => <div title="Project ID">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Documents",
      dataIndex: "documents",
      render: (text, record) => (
        <div title="Documents">
          {record.documents.length > 0
            ? record.documents.map((file) => (
                <div key={file.mine_document_guid} title={file.document_name}>
                  <LinkButton
                    key={file.mine_document_guid}
                    onClick={() => downloadFileFromDocumentManager(file)}
                  >
                    {truncateFilename(file.document_name)}
                  </LinkButton>
                </div>
              ))
            : Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "",
      dataIndex: "addEditButton",
      key: "addEditButton",
      align: "right",
      render: (text, record) => {
        return (
          <div>
            <AuthorizationWrapper permission={Permission.EDIT_SECURITIES}>
              <Button
                type="secondary"
                className="permit-table-button"
                onClick={(event) => props.openEditReclamationInvoiceModal(event, record)}
              >
                <img
                  src={EDIT_OUTLINE_VIOLET}
                  title="Edit"
                  alt="Edit"
                  className="padding-md--right"
                />
              </Button>
            </AuthorizationWrapper>
          </div>
        );
      },
    },
  ];

  const invoicesByPermit = (permit) =>
    props.invoices.filter(({ permit_guid }) => permit_guid === permit.permit_guid);
  const getSum = (status, permit) =>
    props.bonds
      .filter(
        ({ bond_status_code, permit_guid }) =>
          bond_status_code === status && permit_guid === permit.permit_guid
      )
      .reduce((sum, bond) => +sum + +bond.amount, 0);
  const getAmountSum = (permit) =>
    props.invoices
      .filter(({ permit_guid }) => permit_guid === permit.permit_guid)
      .reduce((sum, invoice) => +sum + +invoice.amount, 0);

  const invoices = (record) => {
    return (
      <Table
        align="left"
        pagination={false}
        columns={invoiceColumns}
        dataSource={invoicesByPermit(record)}
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
        amount_confiscated: getSum("CON", permit),
        amount_spent: getAmountSum(permit),
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
        expandedRowRender: invoices,
        expandedRowKeys: props.expandedRowKeys,
        onExpand: props.onExpand,
      }}
    />
  );
};

MineReclamationInvoiceTable.propTypes = propTypes;

export default MineReclamationInvoiceTable;
