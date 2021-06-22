/* eslint-disable */
import React, { Component } from "react";
import { Badge, Tooltip, Table, Button } from "antd";
import { withRouter, Link } from "react-router-dom";
import * as router from "@/constants/routes";
import PropTypes from "prop-types";
import { formatDate, dateSorter } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import { MinusSquareFilled, PlusSquareFilled } from "@ant-design/icons";
import CoreTable from "@/components/common/CoreTable";
import { getApplicationStatusType } from "@/constants/theme";
import DocumentLink from "@/components/common/DocumentLink";

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
      det_quantity: permit.magazines.filter(({ type }) => type === "DET").length,
      exp_quantity: permit.magazines.filter(({ type }) => type === "EXP").length,
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
      dataIndex: "esup_permit_no",
      sortField: "esup_permit_no",
      render: (text) => <div title="Permit #">{text}</div>,
      sorter: false,
    },
    {
      title: "Mines Act Permit #",
      dataIndex: "permit_no",
      sortField: "permit_no",
      render: (text) => <div title="Mines Act Permit #">{text}</div>,
      sorter: false,
    },
    {
      title: "Notice of Work #",
      dataIndex: "now_no",
      sortField: "now_no",
      render: (text) => <div title="Notice of Work #">{text || Strings.EMPTY_FIELD}</div>,
      sorter: false,
    },
    {
      title: "Issuing Inspector",
      dataIndex: "issuing_inspector_name",
      render: (text) => <div title="Issuing Inspector">{text || Strings.EMPTY_FIELD}</div>,
      sorter: false,
    },
    {
      title: "Source",
      dataIndex: "source",
      sortField: "source",
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
      dataIndex: "received_date",
      sortField: "received_date",
      render: (text) => (
        <div title="Application Date">{formatDate(text) || Strings.EMPTY_FIELD}</div>
      ),
      sorter: dateSorter("received_date"),
    },
    {
      title: "Issue Date",
      dataIndex: "issue_date",
      sortField: "issue_date",
      render: (text) => <div title="Issue Date">{formatDate(text) || Strings.EMPTY_FIELD}</div>,
      sorter: dateSorter("issue_date"),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiry_date",
      sortField: "expiry_date",
      render: (text) => <div title="Expiry Date">{formatDate(text) || Strings.EMPTY_FIELD}</div>,
      sorter: dateSorter("expiry_date"),
    },
    {
      title: "Explosive Quantity",
      dataIndex: "exp_quantity",
      sortField: "exp_quantity",
      render: (text) => <div title="Explosive Quantity">{text}</div>,
      sorter: false,
    },
    {
      title: "Detonator Quantity",
      dataIndex: "det_quantity",
      sortField: "det_quantity",
      render: (text) => <div title="Detonator Quantity">{text}</div>,
      sorter: false,
    },
  ];

  administrativeAmendmentDetail = (record) => {
    const expandedColumns = [
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
      },
      {
        title: "Final Application File Name",
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
          expandedRowRender: this.administrativeAmendmentDetail,
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
