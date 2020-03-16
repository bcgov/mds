import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Badge } from "antd";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  getVarianceStatusOptionsHash,
  getHSRCMComplianceCodesHash,
} from "@common/selectors/staticContentSelectors";
import { getInspectorsHash } from "@common/selectors/partiesSelectors";
import { formatDate, truncateFilename } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { RED_CLOCK, EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import NullScreen from "@/components/common/NullScreen";
import LinkButton from "@/components/common/LinkButton";
import * as router from "@/constants/routes";
import CoreTable from "@/components/common/CoreTable";
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
    sort_field: sorter.order ? sorter.field : undefined,
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
        render: (text) => <div title="Number">{text}</div>,
      },
      {
        title: "Mine",
        dataIndex: "mine_name",
        sortField: "mine_name",
        sorter: this.props.isDashboardView,
        className: hideColumn(!this.props.isDashboardView),
        render: (text, record) => (
          <div title="Mine" className={hideColumn(!this.props.isDashboardView)}>
            <Link to={router.MINE_SUMMARY.dynamicRoute(record.mine_guid)}>{text}</Link>
          </div>
        ),
      },
      {
        title: "Code",
        dataIndex: "compliance_article_id",
        sortField: "compliance_article_id",
        sorter: this.props.isDashboardView,
        render: (text) => (
          <div title="Code">{this.props.complianceCodesHash[text] || Strings.EMPTY_FIELD}</div>
        ),
      },
      {
        title: "Lead Inspector",
        dataIndex: "lead_inspector",
        sortField: "lead_inspector",
        sorter: this.props.isDashboardView,
        render: (text, record) =>
          (record.inspector_party_guid && (
            <Link
              title="Lead Inspector"
              to={router.PARTY_PROFILE.dynamicRoute(record.inspector_party_guid)}
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
        className: hideColumn(!this.props.isApplication),
        render: (text) => (
          <div title="Submission Date" className={hideColumn(!this.props.isApplication)}>
            {text}
          </div>
        ),
      },
      {
        title: "Application Status",
        dataIndex: "variance_application_status_code",
        sortField: "variance_application_status_code",
        sorter: this.props.isDashboardView,
        className: hideColumn(!this.props.isApplication),
        render: (text) => (
          <div title="Application Status" className={hideColumn(!this.props.isApplication)}>
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
        className: hideColumn(this.props.isApplication),
        render: (text) => (
          <div title="Issue Date" className={hideColumn(this.props.isApplication)}>
            {text}
          </div>
        ),
      },
      {
        title: "Expiry Date",
        dataIndex: "expiry_date",
        sortField: "expiry_date",
        sorter: this.props.isDashboardView,
        className: hideColumn(this.props.isApplication),
        render: (text) => (
          <div title="Expiry Date" className={hideColumn(this.props.isApplication)}>
            {text}
          </div>
        ),
      },
      {
        title: "Approval Status",
        dataIndex: "",
        className: hideColumn(this.props.isApplication),
        render: (text, record) => (
          <div title="Approval Status" className={hideColumn(this.props.isApplication)}>
            {record.is_overdue ? "Expired" : "Active"}
          </div>
        ),
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
        dataIndex: "variance",
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
      <CoreTable
        condition={this.props.isLoaded}
        columns={
          this.props.isDashboardView
            ? applySortIndicator(columns, this.props.sortField, this.props.sortDir)
            : columns
        }
        dataSource={this.transformRowData(this.props.variances)}
        tableProps={{
          onChange: handleTableChange(this.props.handleVarianceSearch),
          align: "left",
          pagination: this.props.isPaginated,
          locale: {
            emptyText: (
              <NullScreen
                type={this.props.isApplication ? "variance-applications" : "approved-variances"}
              />
            ),
          },
        }}
      />
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
