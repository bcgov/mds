import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Button, Icon } from "antd";
import _ from "lodash";
import {
  getIncidentDeterminationHash,
  getIncidentStatusCodeHash,
  getIncidentCategoryCodeHash,
  getHSRCMComplianceCodesHash,
} from "@common/selectors/staticContentSelectors";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { formatDate } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import NullScreen from "@/components/common/NullScreen";
import LinkButton from "@/components/common/LinkButton";
import CoreTable from "@/components/common/CoreTable";
import * as router from "@/constants/routes";

const propTypes = {
  incidents: PropTypes.arrayOf(CustomPropTypes.incident).isRequired,
  followupActions: PropTypes.arrayOf(CustomPropTypes.incidentFollowupType).isRequired,
  handleEditMineIncident: PropTypes.func.isRequired,
  openMineIncidentModal: PropTypes.func.isRequired,
  openViewMineIncidentModal: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  isDashboardView: PropTypes.bool,
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
  handleIncidentSearch: PropTypes.func,
  incidentDeterminationHash: PropTypes.objectOf(PropTypes.string),
  complianceCodesHash: PropTypes.objectOf(PropTypes.string),
  incidentStatusCodeHash: PropTypes.objectOf(PropTypes.string),
  incidentCategoryCodeHash: PropTypes.objectOf(PropTypes.string),
  isPaginated: PropTypes.bool,
};

const defaultProps = {
  handleIncidentSearch: () => {},
  incidentDeterminationHash: {},
  complianceCodesHash: {},
  incidentStatusCodeHash: {},
  incidentCategoryCodeHash: {},
  isDashboardView: false,
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

const handleTableChange = (updateIncidentList) => (pagination, filters, sorter) => {
  const params = {
    results: pagination.pageSize,
    page: pagination.current,
    sort_field: sorter.field,
    sort_dir: sorter.order ? sorter.order.replace("end", "") : sorter.order,
    ...filters,
  };
  updateIncidentList(params);
};

const renderDownloadLinks = (files, mine_incident_document_type_code) => {
  const links = files
    .filter((file) => file.mine_incident_document_type_code === mine_incident_document_type_code)
    .map((file) => (
      <div key={file.mine_document_guid}>
        <LinkButton
          key={file.mine_document_guid}
          onClick={() => downloadFileFromDocumentManager(file)}
        >
          {file.document_name}
        </LinkButton>
      </div>
    ));
  return links && links.length > 0 ? links : false;
};

export class MineIncidentTable extends Component {
  transformRowData = (
    incidents,
    actions,
    handleEditMineIncident,
    openMineIncidentModal,
    openViewMineIncidentModal,
    determinationHash,
    statusHash
  ) =>
    incidents.map((incident) => {
      return {
        key: incident.incident_id,
        mine_incident_report_no: incident.mine_incident_report_no,
        incident_timestamp: formatDate(incident.incident_timestamp),
        reported_timestamp: formatDate(incident.reported_timestamp),
        reported_by: incident.reported_by_name || Strings.EMPTY_FIELD,
        mine_name: incident.mine_name || Strings.EMPTY_FIELD,
        incident_status: statusHash[incident.status_code] || Strings.EMPTY_FIELD,
        determination: determinationHash[incident.determination_type_code] || Strings.EMPTY_FIELD,
        code: incident.dangerous_occurrence_subparagraph_ids || Strings.EMPTY_FIELD,
        docs: incident.documents,
        followup_action: actions.find(
          (x) =>
            x.mine_incident_followup_investigation_type_code ===
            incident.followup_investigation_type_code
        ),
        handleEditMineIncident,
        openMineIncidentModal,
        openViewMineIncidentModal,
        incident,
      };
    });

  render() {
    const columns = [
      {
        title: "Number",
        dataIndex: "mine_incident_report_no",
        sortField: "mine_incident_report_no",
        sorter: this.props.isDashboardView,
        render: (text) => <div title="Number">{text}</div>,
      },
      {
        title: "Incident Date",
        dataIndex: "incident_timestamp",
        sortField: "incident_timestamp",
        sorter: this.props.isDashboardView,
        render: (text) => <span title="Incident Date">{text}</span>,
      },
      {
        title: "Mine",
        dataIndex: "mine_name",
        sortField: "mine_name",
        sorter: this.props.isDashboardView,
        className: hideColumn(!this.props.isDashboardView),
        render: (text, record) => (
          <div title="Mine" className={hideColumn(!this.props.isDashboardView)}>
            <Link to={router.MINE_SUMMARY.dynamicRoute(record.incident.mine_guid)}>{text}</Link>
          </div>
        ),
      },
      {
        title: "Status",
        dataIndex: "incident_status",
        sortField: "incident_status",
        sorter: this.props.isDashboardView,
        className: hideColumn(!this.props.isDashboardView),
        render: (text) => (
          <span title="Status" className={hideColumn(!this.props.isDashboardView)}>
            {text}
          </span>
        ),
      },
      {
        title: "Determination",
        dataIndex: "determination",
        sortField: "determination",
        sorter: this.props.isDashboardView,
        className: hideColumn(!this.props.isDashboardView),
        render: (text) => (
          <span title="Determination" className={hideColumn(!this.props.isDashboardView)}>
            {text}
          </span>
        ),
      },
      {
        title: "Code",
        dataIndex: "code",
        className: hideColumn(!this.props.isDashboardView),
        render: (text) => (
          <span title="Incident Codes" className={hideColumn(!this.props.isDashboardView)}>
            {text.length === 0 ? (
              <span>{Strings.EMPTY_FIELD}</span>
            ) : (
              <span>
                {text.map((code) => (
                  <div key={code}>{this.props.complianceCodesHash[code]}</div>
                ))}
              </span>
            )}
          </span>
        ),
      },
      {
        title: "Reported By",
        dataIndex: "reported_by",
        className: hideColumn(this.props.isDashboardView),
        sorter: (a, b) => a.reported_by.localeCompare(b.reported_by),
        render: (text) => (
          <span title="Reported By" className={hideColumn(this.props.isDashboardView)}>
            {text}
          </span>
        ),
        onFilter: (value, record) => record.incident.reported_by_name === value,
        filters: _.reduce(
          this.props.incidents,
          (reporterList, incident) => {
            if (!reporterList.map((x) => x.value).includes(incident.reported_by_name)) {
              reporterList.push({
                value: incident.reported_by_name,
                text: incident.reported_by_name,
              });
            }
            return reporterList;
          },
          []
        ),
      },
      {
        title: "EMPR Action",
        dataIndex: "followup_action",
        className: hideColumn(this.props.isDashboardView),
        render: (action, record) => (
          <div title="EMPR Action" className={hideColumn(this.props.isDashboardView)}>
            {action ? action.description : record.incident.followup_type_code}
          </div>
        ),
        onFilter: (value, record) => record.incident.followup_investigation_type_code === value,
        filters: this.props.followupActions.map((action) => ({
          value: action.mine_incident_followup_investigation_type_code,
          text: action.mine_incident_followup_investigation_type_code,
        })),
      },
      {
        title: "Initial Report Documents",
        dataIndex: "initialDocuments",
        className: hideColumn(this.props.isDashboardView),
        render: (text, record) => (
          <div title="Initial Report Documents" className={hideColumn(this.props.isDashboardView)}>
            {(record.docs &&
              record.docs.length > 0 &&
              renderDownloadLinks(record.docs, Strings.INCIDENT_DOCUMENT_TYPES.initial)) ||
              Strings.EMPTY_FIELD}
          </div>
        ),
      },
      {
        title: "Final Report Documents",
        dataIndex: "finalDocuments",
        className: hideColumn(this.props.isDashboardView),
        render: (text, record) => (
          <div title="Final Report Documents" className={hideColumn(this.props.isDashboardView)}>
            {(record.docs &&
              record.docs.length > 0 &&
              renderDownloadLinks(record.docs, Strings.INCIDENT_DOCUMENT_TYPES.final)) ||
              Strings.EMPTY_FIELD}
          </div>
        ),
      },
      {
        title: "",
        dataIndex: "handleEditModal",
        render: (text, record) => (
          <div title="" align="right" className="btn--middle flex">
            <AuthorizationWrapper permission={Permission.EDIT_DO}>
              <Button
                type="primary"
                size="small"
                ghost
                onClick={(event) =>
                  record.openMineIncidentModal(
                    event,
                    record.handleEditMineIncident,
                    false,
                    record.incident
                  )
                }
              >
                <img src={EDIT_OUTLINE_VIOLET} alt="Edit Incident" />
              </Button>
            </AuthorizationWrapper>
            <Button
              type="primary"
              size="small"
              ghost
              onClick={(event) => record.openViewMineIncidentModal(event, record.incident)}
            >
              <Icon type="eye" className="icon-lg icon-svg-filter" />
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
        dataSource={this.transformRowData(
          this.props.incidents,
          this.props.followupActions,
          this.props.handleEditMineIncident,
          this.props.openMineIncidentModal,
          this.props.openViewMineIncidentModal,
          this.props.incidentDeterminationHash,
          this.props.incidentStatusCodeHash,
          this.props.incidentCategoryCodeHash
        )}
        tableProps={{
          onChange: this.props.isDashboardView
            ? handleTableChange(this.props.handleIncidentSearch)
            : null,
          align: "left",
          pagination: this.props.isPaginated,
          locale: {
            emptyText: (
              <NullScreen type={this.props.isDashboardView ? "no-results" : "incidents"} />
            ),
          },
        }}
      />
    );
  }
}

MineIncidentTable.propTypes = propTypes;
MineIncidentTable.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  incidentDeterminationHash: getIncidentDeterminationHash(state),
  incidentStatusCodeHash: getIncidentStatusCodeHash(state),
  incidentCategoryCodeHash: getIncidentCategoryCodeHash(state),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
});

export default connect(mapStateToProps)(MineIncidentTable);
