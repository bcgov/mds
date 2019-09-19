import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Table, Button, Icon } from "antd";
import moment from "moment";
import _, { isEmpty } from "lodash";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import {
  getIncidentDeterminationHash,
  getIncidentStatusCodeHash,
  getHSRCMComplianceCodesHash,
} from "@/selectors/staticContentSelectors";
import {
  fetchMineIncidentDeterminationOptions,
  fetchMineIncidentStatusCodeOptions,
} from "@/actionCreators/staticContentActionCreator";
import * as Permission from "@/constants/permissions";
import { downloadFileFromDocumentManager } from "@/utils/actionlessNetworkCalls";
import CustomPropTypes from "@/customPropTypes";
import NullScreen from "@/components/common/NullScreen";
import { formatDate, getTableHeaders } from "@/utils/helpers";
import LinkButton from "@/components/common/LinkButton";
import * as Strings from "@/constants/strings";
import TableLoadingWrapper from "@/components/common/wrappers/TableLoadingWrapper";
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
  fetchMineIncidentDeterminationOptions: PropTypes.func,
  fetchMineIncidentStatusCodeOptions: PropTypes.func,
  handleIncidentSearch: PropTypes.func,
  incidentDeterminationHash: PropTypes.objectOf(PropTypes.string),
  complianceCodesHash: PropTypes.objectOf(PropTypes.string),
  incidentStatusCodeHash: PropTypes.objectOf(PropTypes.string),
  paginationPerPage: PropTypes.number,
};

const defaultProps = {
  fetchMineIncidentDeterminationOptions: () => {},
  fetchMineIncidentStatusCodeOptions: () => {},
  handleIncidentSearch: () => {},
  incidentDeterminationHash: {},
  complianceCodesHash: {},
  incidentStatusCodeHash: {},
  isDashboardView: false,
  sortField: null,
  sortDir: null,
  paginationPerPage: 9,
};

const hideColumn = (condition) => (condition ? "column-hide" : "");

const applySortIndicator = (_columns, field, dir) => {
  return _columns.map((column) => ({
    ...column,
    sortOrder: column.sortField === field ? dir.concat("end") : false,
  }));
};

const handleTableChange = (updateIncidentList) => (pagination, filters, sorter) => {
  const params = isEmpty(sorter)
    ? {
        sort_field: undefined,
        sort_dir: undefined,
      }
    : {
        sort_field: sorter.column.sortField,
        sort_dir: sorter.order.replace("end", ""),
      };
  updateIncidentList(params);
};

const renderDownloadLinks = (files, mine_incident_document_type_code) =>
  files
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

export class MineIncidentTable extends Component {
  componentDidMount() {
    this.props.fetchMineIncidentDeterminationOptions();
    this.props.fetchMineIncidentStatusCodeOptions();
  }

  transformRowData = (
    incidents,
    actions,
    handleEditMineIncident,
    openMineIncidentModal,
    openViewMineIncidentModal,
    determinationHash,
    statusHash
  ) =>
    incidents
      .map((incident) => {
        return {
          key: incident.incident_id,
          mine_incident_report_no: incident.mine_incident_report_no,
          incident_timestamp: formatDate(incident.incident_timestamp),
          reported_timestamp: formatDate(incident.reported_timestamp),
          reported_by: incident.reported_by_name,
          mine_name: incident.mine_name,
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
      })
      .sort((a, b) => (a.mine_incident_report_no > b.mine_incident_report_no ? -1 : 1));

  render() {
    const columns = [
      {
        title: "Incident Report No.",
        dataIndex: "mine_incident_report_no",
        sortField: "mine_incident_report_no",
        render: (text) => <div title="Incident Report No">{text}</div>,
        sorter: !this.props.isDashboardView
          ? (a, b) => a.mine_incident_report_no.localeCompare(b.mine_incident_report_no)
          : false, // Sorting not implemented on the backend due to ambiguity in the model
      },
      {
        title: "Date",
        dataIndex: "incident_timestamp",
        sortField: "incident_timestamp",
        render: (text) => <span title="Date">{text}</span>,
        sorter: !this.props.isDashboardView
          ? (a, b) => moment(a.incident_timestamp) > moment(b.incident_timestamp)
          : true,
      },
      {
        title: "Mine Name",
        dataIndex: "mine_name",
        sortField: "mine_name",
        className: hideColumn(!this.props.isDashboardView),
        render: (text, record) => (
          <div title="Mine Name" className={hideColumn(!this.props.isDashboardView)}>
            <Link to={router.MINE_SUMMARY.dynamicRoute(record.incident.mine_guid)}>{text}</Link>
          </div>
        ),
        sorter: true,
      },
      {
        title: "Incident Status",
        dataIndex: "incident_status",
        sortField: "incident_status",
        className: hideColumn(!this.props.isDashboardView),
        render: (text) => (
          <span title="Incident Status" className={hideColumn(!this.props.isDashboardView)}>
            {text}
          </span>
        ),
        sorter: true,
      },
      {
        title: "Determination",
        dataIndex: "determination",
        sortField: "determination",
        className: hideColumn(!this.props.isDashboardView),
        render: (text) => (
          <span title="Determination" className={hideColumn(!this.props.isDashboardView)}>
            {text}
          </span>
        ),
        sorter: true,
      },
      {
        title: "Code",
        dataIndex: "code",
        className: hideColumn(!this.props.isDashboardView),
        width: 400,
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
          <div title="followup_action" className={hideColumn(this.props.isDashboardView)}>
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
        width: 200,
        render: (text, record) => (
          <div title="Initial Report Documents" className={hideColumn(this.props.isDashboardView)}>
            {record.docs.length === 0 ? (
              <span>--</span>
            ) : (
              renderDownloadLinks(record.docs, Strings.INCIDENT_DOCUMENT_TYPES.initial)
            )}
          </div>
        ),
      },
      {
        title: "Final Report Documents",
        dataIndex: "finalDocuments",
        className: hideColumn(this.props.isDashboardView),
        width: 200,
        render: (text, record) => (
          <div title="Final Report Documents" className={hideColumn(this.props.isDashboardView)}>
            {record.docs.length === 0 ? (
              <span>--</span>
            ) : (
              renderDownloadLinks(record.docs, Strings.INCIDENT_DOCUMENT_TYPES.final)
            )}
          </div>
        ),
      },
      {
        title: "",
        dataIndex: "handleEditModal",
        render: (text, record) => (
          <div title="" align="right">
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
              <Icon type="eye" className="icon-sm" />
            </Button>
          </div>
        ),
      },
    ];

    return (
      <TableLoadingWrapper
        condition={this.props.isLoaded}
        tableHeaders={getTableHeaders(columns)}
        paginationPerPage={this.props.paginationPerPage}
      >
        <Table
          onChange={
            this.props.isDashboardView ? handleTableChange(this.props.handleIncidentSearch) : null
          }
          align="left"
          pagination={false}
          columns={
            this.props.isDashboardView
              ? applySortIndicator(columns, this.props.sortField, this.props.sortDir)
              : columns
          }
          locale={{ emptyText: <NullScreen type="incidents" /> }}
          dataSource={this.transformRowData(
            this.props.incidents,
            this.props.followupActions,
            this.props.handleEditMineIncident,
            this.props.openMineIncidentModal,
            this.props.openViewMineIncidentModal,
            this.props.incidentDeterminationHash,
            this.props.incidentStatusCodeHash
          )}
        />
      </TableLoadingWrapper>
    );
  }
}

MineIncidentTable.propTypes = propTypes;
MineIncidentTable.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  incidentDeterminationHash: getIncidentDeterminationHash(state),
  incidentStatusCodeHash: getIncidentStatusCodeHash(state),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineIncidentDeterminationOptions,
      fetchMineIncidentStatusCodeOptions,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineIncidentTable);
