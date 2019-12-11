import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table, Button, Icon } from "antd";
import { isEmpty } from "lodash";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import moment from "moment";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import {
  getVarianceStatusOptionsHash,
  getHSRCMComplianceCodesHash,
} from "@/selectors/staticContentSelectors";
import { getInspectorsHash } from "@/selectors/partiesSelectors";
import * as Permission from "@/constants/permissions";
import { RED_CLOCK, EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import NullScreen from "@/components/common/NullScreen";
import { formatDate, compareCodes, getTableHeaders } from "@/utils/helpers";
import { downloadFileFromDocumentManager } from "@/utils/actionlessNetworkCalls";
import * as Strings from "@/constants/strings";
import { COLOR } from "@/constants/styles";
import LinkButton from "@/components/common/LinkButton";
import * as router from "@/constants/routes";
import TableLoadingWrapper from "@/components/common/wrappers/TableLoadingWrapper";

const { errorRed } = COLOR;

const propTypes = {
  handleVarianceSearch: PropTypes.func,
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  inspectorsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  openViewVarianceModal: PropTypes.func,
  isApplication: PropTypes.bool,
  isDashboardView: PropTypes.bool,
  openEditVarianceModal: PropTypes.func,
  params: PropTypes.shape({
    variance_application_status_code: PropTypes.arrayOf(PropTypes.string),
  }),
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
  isLoaded: PropTypes.bool.isRequired,
  isPaginated: PropTypes.bool,
};

const defaultProps = {
  openEditVarianceModal: () => {},
  openViewVarianceModal: () => {},
  handleVarianceSearch: () => {},
  isApplication: false,
  isDashboardView: false,
  params: {},
  sortField: null,
  sortDir: null,
  isPaginated: false,
};

const errorStyle = (isOverdue) => (isOverdue ? { color: errorRed } : {});

const hideColumn = (condition) => (condition ? "column-hide" : "");

const applySortIndicator = (_columns, field, dir) =>
  _columns.map((column) => ({
    ...column,
    sortOrder: column.sortField === field ? dir.concat("end") : false,
  }));

const handleTableChange = (updateVarianceList) => (pagination, filters, sorter) => {
  const params = isEmpty(sorter)
    ? {
        sort_field: undefined,
        sort_dir: undefined,
      }
    : {
        sort_field: sorter.column.sortField,
        sort_dir: sorter.order.replace("end", ""),
      };
  updateVarianceList(params);
};

export class MineVarianceTable extends Component {
  transformRowData = (variances, codeHash, statusHash) =>
    variances.map((variance) => ({
      key: variance.variance_guid,
      variance,
      mineName: variance.mine_name || Strings.EMPTY_FIELD,
      mineGuid: variance.mine_guid,
      status: statusHash[variance.variance_application_status_code],
      compliance_article_id: codeHash[variance.compliance_article_id] || Strings.EMPTY_FIELD,
      expiry_date:
        (variance.expiry_date && formatDate(variance.expiry_date)) || Strings.EMPTY_FIELD,
      issue_date: formatDate(variance.issue_date) || Strings.EMPTY_FIELD,
      note: variance.note,
      received_date: formatDate(variance.received_date) || Strings.EMPTY_FIELD,
      isOverdue: variance.expiry_date && Date.parse(variance.expiry_date) < new Date(),
      leadInspector:
        this.props.inspectorsHash[variance.inspector_party_guid] || Strings.EMPTY_FIELD,
      documents: variance.documents,
      varianceNumber: variance.variance_no || Strings.EMPTY_FIELD,
    }));

  render() {
    const columns = [
      {
        title: "",
        dataIndex: "isOverdue",
        width: 10,
        render: (isOverdue) => (
          <div title="">
            {isOverdue ? <img className="padding-small" src={RED_CLOCK} alt="expired" /> : ""}
          </div>
        ),
      },
      {
        title: "Variance Number",
        dataIndex: "varianceNumber",
        sortField: "variance_id",
        width: 150,
        render: (text, record) => (
          <div title="Variance Number" style={errorStyle(record.isOverdue)}>
            {text}
          </div>
        ),
        sorter: this.props.isDashboardView,
      },
      {
        title: "Code Section",
        dataIndex: "compliance_article_id",
        sortField: "compliance_article_id",
        width: 150,
        render: (text, record) => (
          <div title="Code Section" style={errorStyle(record.isOverdue)}>
            {text}
          </div>
        ),
        sorter: !this.props.isDashboardView
          ? (a, b) => compareCodes(a.compliance_article_id, b.compliance_article_id)
          : true,
      },
      {
        title: "Mine Name",
        dataIndex: "mineName",
        sortField: "mine_name",
        width: 150,
        className: hideColumn(!this.props.isDashboardView),
        render: (text, record) => (
          <div
            title="Mine Name"
            style={errorStyle(record.isOverdue)}
            className={hideColumn(!this.props.isDashboardView)}
          >
            <Link to={router.MINE_SUMMARY.dynamicRoute(record.mineGuid)}>{text}</Link>
          </div>
        ),
        sorter: this.props.isDashboardView,
      },
      {
        title: "Lead Inspector",
        dataIndex: "leadInspector",
        sortField: "lead_inspector",
        width: 150,
        className: hideColumn(!this.props.isDashboardView),
        render: (text, record) => (
          <div
            title="Mine Name"
            style={errorStyle(record.isOverdue)}
            className={hideColumn(!this.props.isDashboardView)}
          >
            {text}
          </div>
        ),
        sorter: this.props.isDashboardView,
      },
      {
        title: "Submission Date",
        dataIndex: "received_date",
        sortField: "received_date",
        width: 150,
        className: hideColumn(!this.props.isApplication),
        render: (text) => (
          <div className={hideColumn(!this.props.isApplication)} title="Submission Date">
            {text}
          </div>
        ),
        sorter: !this.props.isDashboardView
          ? (a, b) => (moment(a.received_date) > moment(b.received_date) ? -1 : 1)
          : true,
        defaultSortOrder: "ascend",
      },
      {
        title: "Application Status",
        dataIndex: "status",
        sortField: "variance_application_status_code",
        width: 150,
        className: hideColumn(!this.props.isApplication),
        render: (text, record) => (
          <div
            className={hideColumn(!this.props.isApplication)}
            title="Application Status"
            style={errorStyle(record.isOverdue)}
          >
            {text}
          </div>
        ),
        sorter: !this.props.isDashboardView ? (a, b) => (a.status > b.status ? -1 : 1) : true,
      },
      {
        title: "Issue Date",
        dataIndex: "issue_date",
        width: 150,
        className: hideColumn(this.props.isApplication),
        render: (text, record) => (
          <div
            className={hideColumn(this.props.isApplication)}
            title="Issue Date"
            style={errorStyle(record.isOverdue)}
          >
            {text}
          </div>
        ),
        sorter: (a, b) => (moment(a.issue_date) > moment(b.issue_date) ? -1 : 1),
      },
      {
        title: "Expiry Date",
        dataIndex: "expiry_date",
        width: 150,
        className: hideColumn(this.props.isApplication),
        render: (text, record) => (
          <div
            className={hideColumn(this.props.isApplication)}
            title="Expiry Date"
            style={errorStyle(record.isOverdue)}
          >
            {text}
          </div>
        ),
        sorter: (a, b) => (moment(a.expiry_date || 0) > moment(b.expiry_date || 0) ? -1 : 1),
        defaultSortOrder: "ascend",
      },
      {
        title: "Approval Status",
        dataIndex: "",
        width: 150,
        className: hideColumn(this.props.isApplication),
        render: (text, record) => (
          <div
            className={hideColumn(this.props.isApplication)}
            title="Approval Status"
            style={errorStyle(record.isOverdue)}
          >
            {record.isOverdue ? "Expired" : "Active"}
          </div>
        ),
      },
      {
        title: "Documents",
        dataIndex: "documents",
        width: 150,
        render: (text, record) => (
          <div title="Documents">
            {record.documents.length > 0
              ? record.documents.map((file) => (
                  <div key={file.mine_document_guid}>
                    <LinkButton
                      key={file.mine_document_guid}
                      onClick={() => downloadFileFromDocumentManager(file)}
                    >
                      {file.document_name}
                    </LinkButton>
                  </div>
                ))
              : Strings.EMPTY_FIELD}
          </div>
        ),
      },
      {
        title: "",
        dataIndex: "variance",
        width: 150,
        render: (text, record) => (
          <div title="" align="right" className="btn--middle flex">
            <AuthorizationWrapper permission={Permission.EDIT_VARIANCES}>
              <Button
                type="primary"
                size="small"
                ghost
                onClick={() => this.props.openEditVarianceModal(record.variance)}
              >
                <img src={EDIT_OUTLINE_VIOLET} alt="Edit" className="icon-svg-filter" />
              </Button>
            </AuthorizationWrapper>
            <Button
              type="primary"
              size="small"
              ghost
              onClick={() => this.props.openViewVarianceModal(record.variance)}
            >
              <Icon type="eye" alt="View" className="icon-lg icon-svg-filter" />
            </Button>
          </div>
        ),
      },
    ];

    return (
      <TableLoadingWrapper
        condition={this.props.isLoaded}
        tableHeaders={getTableHeaders(columns)}
        isPaginated={this.props.isPaginated}
      >
        <Table
          rowClassName="fade-in"
          onChange={
            this.props.isDashboardView ? handleTableChange(this.props.handleVarianceSearch) : null
          }
          align="left"
          pagination={false}
          columns={
            this.props.isDashboardView
              ? applySortIndicator(columns, this.props.sortField, this.props.sortDir)
              : columns
          }
          locale={{
            emptyText: (
              <NullScreen
                type={this.props.isApplication ? "variance-applications" : "approved-variances"}
              />
            ),
          }}
          dataSource={this.transformRowData(
            this.props.variances,
            this.props.complianceCodesHash,
            this.props.varianceStatusOptionsHash
          )}
        />
      </TableLoadingWrapper>
    );
  }
}

MineVarianceTable.propTypes = propTypes;
MineVarianceTable.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  inspectorsHash: getInspectorsHash(state),
  varianceStatusOptionsHash: getVarianceStatusOptionsHash(state),
});

export default connect(mapStateToProps)(MineVarianceTable);
