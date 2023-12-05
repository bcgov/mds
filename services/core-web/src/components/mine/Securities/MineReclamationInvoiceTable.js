import React from "react";
import { Button } from "antd";
import PropTypes from "prop-types";
import * as Strings from "@mds/common/constants/strings";
import { formatMoney } from "@common/utils/helpers";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { EDIT, EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import CoreTable from "@mds/common/components/common/CoreTable";
import DocumentLink from "@/components/common/DocumentLink";
import { CoreTooltip } from "@/components/common/CoreTooltip";

/**
 * @class  MineReclamationInvoiceTable - displays a table of permits with their related invoices
 */

const propTypes = {
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  invoices: PropTypes.arrayOf(CustomPropTypes.invoice).isRequired,
  isLoaded: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  openEditReclamationInvoiceModal: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  openAddReclamationInvoiceModal: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  recordsByPermit: PropTypes.func.isRequired,
  getBalance: PropTypes.func.isRequired,
  getAmountSum: PropTypes.func.isRequired,
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
      title: "Project ID",
      dataIndex: "project_id",
      key: "project_id",
      render: (text) => <div title="Project ID">{text}</div>,
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
      title: (
        <div>
          Balance
          <CoreTooltip title="Balance: This is the current amount of money available from the confiscated bonds. If this amount is negative, it means invoices have exceeded the confiscated bonds." />
        </div>
      ),
      dataIndex: "balance",
      key: "balance",
      render: (text) => <div title="Balance">{formatMoney(text) || Strings.EMPTY_FIELD}</div>,
    },
    {
      key: "addEditButton",
      align: "right",
      render: (record) => {
        return (
          <AuthorizationWrapper permission={Permission.EDIT_SECURITIES}>
            <Button
              type="secondary"
              className="permit-table-button"
              onClick={(event) =>
                props.openAddReclamationInvoiceModal(event, record, props.getBalance(record))
              }
            >
              <div className="padding-sm">
                <img className="padding-sm--right icon-svg-filter" src={EDIT} alt="Add/Edit" />
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
      render: (text) => <div title="Vendor">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Notes",
      dataIndex: "note",
      key: "note",
      render: (text) => <div title="Notes">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Documents",
      dataIndex: "documents",
      key: "documents",
      render: (text, record) => (
        <div title="Documents">
          {record.documents.length > 0
            ? record.documents.map((file) => (
                <div key={file.mine_document_guid} title={file.document_name}>
                  <DocumentLink
                    documentManagerGuid={file.document_manager_guid}
                    documentName={file.document_name}
                  />
                </div>
              ))
            : Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      key: "addEditButton",
      align: "right",
      render: (record) => {
        return (
          <div>
            <AuthorizationWrapper permission={Permission.EDIT_SECURITIES}>
              <Button
                type="secondary"
                className="permit-table-button"
                onClick={(event) =>
                  props.openEditReclamationInvoiceModal(event, record, props.getBalance(record))
                }
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

  const transformRowData = (permits) =>
    permits.map((permit) => {
      return {
        key: permit.permit_guid,
        amount_confiscated: permit.confiscated_bond_total,
        amount_spent: props.getAmountSum(permit),
        balance: props.getBalance(permit),
        ...permit,
      };
    });

  return (
    <CoreTable
      condition={props.isLoaded}
      dataSource={transformRowData(props.permits)}
      columns={columns}
      classPrefix="mine-reclamation-invoices"
      expandProps={{
        recordDescription: "associated bonds",
        rowExpandable: (record) => props.recordsByPermit(record, props.invoices).length > 0,
        getDataSource: (record) => props.recordsByPermit(record, props.invoices),
        subTableColumns: invoiceColumns,
      }}
    />
  );
};

MineReclamationInvoiceTable.propTypes = propTypes;

export default MineReclamationInvoiceTable;
