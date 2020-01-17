import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table, Button, Icon, Badge } from "antd";
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
import { formatDate, getTableHeaders, truncateFilename } from "@/utils/helpers";
import { downloadFileFromDocumentManager } from "@/utils/actionlessNetworkCalls";
import * as Strings from "@/constants/strings";
import LinkButton from "@/components/common/LinkButton";
import * as router from "@/constants/routes";
import TableLoadingWrapper from "@/components/common/wrappers/TableLoadingWrapper";
import { getVarianceApplicationBadgeStatusType } from "@/constants/theme";

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

const hideColumn = (condition) => (condition ? "column-hide" : "");

const applySortIndicator = (_columns, field, dir) =>
  _columns.map((column) => ({
    ...column,
    sortOrder: dir && column.sortField === field ? dir.concat("end") : false,
  }));

const handleTableChange = (updateVarianceList) => (pagination, filters, sorter) => {
  const params = {
    results: pagination.pageSize,
    page: pagination.current,
    sort_field: sorter.field,
    sort_dir: sorter.order ? sorter.order.replace("end", "") : sorter.order,
    ...filters,
  };
  updateVarianceList(params);
};

export class MineVarianceTable extends Component {
  transformRowData = (variances) =>
    variances.map((variance) => ({
      key: variance.variance_guid,
      variance,
      mine_name: variance.mine_name || Strings.EMPTY_FIELD,
      mine_guid: variance.mine_guid,
      variance_application_status_code: variance.variance_application_status_code,
      compliance_article_id: variance.compliance_article_id,
      expiry_date:
        (variance.expiry_date && formatDate(variance.expiry_date)) || Strings.EMPTY_FIELD,
      issue_date: formatDate(variance.issue_date) || Strings.EMPTY_FIELD,
      note: variance.note,
      received_date: formatDate(variance.received_date) || Strings.EMPTY_FIELD,
      is_overdue: variance.expiry_date && Date.parse(variance.expiry_date) < new Date(),
      lead_inspector:
        this.props.inspectorsHash[variance.inspector_party_guid] || Strings.EMPTY_FIELD,
      inspector_party_guid: variance.inspector_party_guid,
      documents: variance.documents,
      variance_id: variance.variance_no || Strings.EMPTY_FIELD,
    }));

  render() {
    const columns = [
      {
        title: "",
        dataIndex: "is_overdue",
        width: 10,
        render: (isOverdue) => (
          <div title="Expired">
            {isOverdue ? <img className="padding-small" src={RED_CLOCK} alt="Expired" /> : ""}
          </div>
        ),
      },
      {
        title: "Number",
        dataIndex: "variance_id",
        sortField: "variance_id",
        sorter: this.props.isDashboardView,
        width: 150,
        render: (text) => <div title="Number">{text}</div>,
      },
      {
        title: "Code Section",
        dataIndex: "compliance_article_id",
        sortField: "compliance_article_id",
        sorter: this.props.isDashboardView,
        width: 150,
        render: (text) => (
          <div title="Code Section">
            {this.props.complianceCodesHash[text] || Strings.EMPTY_FIELD}
          </div>
        ),
      },
      {
        title: "Mine",
        dataIndex: "mine_name",
        sortField: "mine_name",
        sorter: this.props.isDashboardView,
        width: 150,
        className: hideColumn(!this.props.isDashboardView),
        render: (text, record) => (
          <div title="Mine" className={hideColumn(!this.props.isDashboardView)}>
            <Link to={router.MINE_SUMMARY.dynamicRoute(record.mine_guid)}>{text}</Link>
          </div>
        ),
      },
      {
        title: "Lead Inspector",
        dataIndex: "lead_inspector",
        sortField: "lead_inspector",
        sorter: this.props.isDashboardView,
        width: 150,
        className: hideColumn(!this.props.isDashboardView),
        render: (text, record) =>
          (record.inspector_party_guid && (
            <Link
              to={router.PARTY_PROFILE.dynamicRoute(record.inspector_party_guid)}
              title="Lead Inspector"
            >
              {text}
            </Link>
          )) || <div title="Lead Inspector">{text}</div>,
      },
      {
        title: "Submission Date",
        dataIndex: "received_date",
        sortField: "received_date",
        sorter: this.props.isDashboardView,
        width: 150,
        className: hideColumn(!this.props.isApplication),
        render: (text) => <div title="Submission Date">{text}</div>,
      },
      {
        title: "Application Status",
        dataIndex: "variance_application_status_code",
        sortField: "variance_application_status_code",
        sorter: this.props.isDashboardView,
        width: 150,
        className: hideColumn(!this.props.isApplication),
        render: (text) => (
          <div className={hideColumn(!this.props.isApplication)} title="Application Status">
            <Badge
              status={getVarianceApplicationBadgeStatusType(
                this.props.varianceStatusOptionsHash[text]
              )}
              text={this.props.varianceStatusOptionsHash[text]}
            />
          </div>
        ),
      },
      {
        title: "Issue Date",
        dataIndex: "issue_date",
        sortField: "issue_date",
        sorter: this.props.isDashboardView,
        width: 150,
        className: hideColumn(this.props.isApplication),
        render: (text) => (
          <div className={hideColumn(this.props.isApplication)} title="Issue Date">
            {text}
          </div>
        ),
      },
      {
        title: "Expiry Date",
        dataIndex: "expiry_date",
        sortField: "expiry_date",
        sorter: this.props.isDashboardView,
        width: 150,
        className: hideColumn(this.props.isApplication),
        render: (text) => (
          <div className={hideColumn(this.props.isApplication)} title="Expiry Date">
            {text}
          </div>
        ),
      },
      {
        title: "Approval Status",
        dataIndex: "",
        width: 150,
        className: hideColumn(this.props.isApplication),
        render: (text, record) => (
          <div className={hideColumn(this.props.isApplication)} title="Approval Status">
            {record.is_overdue ? "Expired" : "Active"}
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
          onChange={handleTableChange(this.props.handleVarianceSearch)}
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
          dataSource={this.transformRowData(this.props.variances)}
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
