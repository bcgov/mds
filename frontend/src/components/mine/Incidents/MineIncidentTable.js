import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Table, Button, Icon } from "antd";
import moment from "moment";
import _ from "lodash";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import {
  getIncidentDeterminationHash,
  getIncidentStatusCodeHash,
  getHSRCMComplianceCodesHash
} from "@/selectors/staticContentSelectors";
import * as Permission from "@/constants/permissions";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import CustomPropTypes from "@/customPropTypes";
import NullScreen from "@/components/common/NullScreen";
import { formatDate } from "@/utils/helpers";
import LinkButton from "@/components/common/LinkButton";
import * as Strings from "@/constants/strings";

const propTypes = {
  incidents: PropTypes.arrayOf(CustomPropTypes.incident).isRequired,
  followupActions: PropTypes.arrayOf(CustomPropTypes.incidentFollowupType).isRequired,
  handleEditMineIncident: PropTypes.func.isRequired,    
  openMineIncidentModal: PropTypes.func.isRequired,
  openViewMineIncidentModal: PropTypes.func.isRequired,
  isDashboardView: PropTypes.bool,
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
};

const defaultProps = {
  // isApplication: false,
  isDashboardView: false,
  // params: {},
  sortField: null,
  sortDir: null,
};

const hideColumn = (condition) => (condition ? "column-hide" : "");

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


const renderComplianceCodes = (code_list) =>
  code_list.map((code) => (
        <div key={code}>
          {code}
        </div>
      ))


export class MineIncidentTable extends Component {
  transformRowData = (
  incidents,
  actions,
  // codehash,
  // status hash,
  // determination hash,
  handleEditMineIncident,
  openMineIncidentModal,
  openViewMineIncidentModal,
  determinationHash,
  codehash
) =>
  incidents
    .map((incident) => {
      const code_list = incident.dangerous_occurrence_subparagraph_ids;
      const codes = code_list.length > 0 ? code_list.map(x => codehash[x]) : Strings.EMPTY_FIELD

      return ({
      key: incident.incident_id,
      mine_incident_report_no: incident.mine_incident_report_no,
      incident_timestamp: formatDate(incident.incident_timestamp),
      reported_timestamp: formatDate(incident.reported_timestamp),
      reported_by: incident.reported_by_name,
      mine_name: incident.mine_name,
      incident_status: incident.status_code || Strings.EMPTY_FIELD, // TODO This mus be transformed 
      determination: determinationHash[incident.determination_type_code] || Strings.EMPTY_FIELD,// TODO This mus be transformed 
      code: codes,// TODO This mus be transformed //null values should be empty string
      // code: codehash[incident.dangerous_occurrence_subparagraph_ids] || Strings.EMPTY_FIELD,// TODO This mus be transformed //null values should be empty string
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
    })})
    .sort((a, b) => (a.mine_incident_report_no > b.mine_incident_report_no ? -1 : 1));


    columns = (props) => [
      {
        title: "Incident Report No.",
        dataIndex: "mine_incident_report_no",
        sorter: (a, b) => a.mine_incident_report_no.localeCompare(b.mine_incident_report_no),
      },
      {
        title: "Date",
        dataIndex: "incident_timestamp",
        sorter: (a, b) => moment(a.incident_timestamp) > moment(b.incident_timestamp),
      },
        {
        title: "Mine Name",
        dataIndex: "mine_name",
        className: hideColumn(!props.isDashboardView),
        sorter: (a, b) => moment(a.incident_timestamp) > moment(b.incident_timestamp),// TODO implement for mine name
      },
      {
        title: "Incident Status",
        dataIndex: "incident_status",
        className: hideColumn(!props.isDashboardView),
        sorter: (a, b) => moment(a.incident_timestamp) > moment(b.incident_timestamp),// TODO implement for incident status
      },
      {
        title: "Determination",
        dataIndex: "determination",
        className: hideColumn(!props.isDashboardView),
        sorter: (a, b) => moment(a.incident_timestamp) > moment(b.incident_timestamp),// TODO implement for determination
      },
      {
        title: "Code",
        dataIndex: "code",
        className: hideColumn(!props.isDashboardView), // TODO implement for codes
        width: 400,
        render: (text,record) => (
          <span title="Incident Codes">
             {record.code.length > 0
              ? record.code.map((code) => (
                  <div key={code}>
                    {code}
                  </div>
                ))
              : Strings.EMPTY_FIELD}
            {/* {text} */}
            {/* {text.map((code) => (
              <div>
              {code}
              </div>
            ))} */}
            {/* {console.log("$$$$$$$$$$$$$$$$$$$$$")}
            {console.log(text)}
            {console.log(record)} */}
            {/* { (text.length > 0  && text[0]) ? text.map(code => (<div> {code} </div>)) : "N/A"} */}
          
          
    </span>
        ),
        // end new code
      },
      {
        title: "Reported By",
        dataIndex: "reported_by",
        className: hideColumn(props.isDashboardView),
        sorter: (a, b) => a.reported_by.localeCompare(b.reported_by),
        onFilter: (value, record) => record.incident.reported_by_name === value,
        filters: _.reduce(
          props.incidents,
          (reporterList, incident) => {
            if (!reporterList.map((x) => x.value).includes(incident.reported_by_name)) {
              reporterList.push({ value: incident.reported_by_name, text: incident.reported_by_name });
            }
            return reporterList;
          },
          []
        ),
      },
      {
        title: "EMPR Action",
        dataIndex: "followup_action",
        className: hideColumn(props.isDashboardView),
        render: (action, record) => (
          <div title="followup_action">
            {action ? action.description : record.incident.followup_type_code}
          </div>
        ),
        onFilter: (value, record) => record.incident.followup_investigation_type_code === value,
        filters: props.followupActions.map((action) => ({
          value: action.mine_incident_followup_investigation_type_code,
          text: action.mine_incident_followup_investigation_type_code,
        })),
      },
      {
        title: "Initial Report Documents",
        dataIndex: "initialDocuments",
        className: hideColumn(props.isDashboardView),
        width: 200,
        render: (text, record) => (
          <div title="Initial Report Documents">
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
        className: hideColumn(props.isDashboardView),
        width: 200,
        render: (text, record) => (
          <div title="Final Report Documents">
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

    render() {
      console.log("**********The state is ************")
      console.log(this.props)
      return (
        <div>
        <Table
          align="left"
          pagination={false}
          columns={this.columns(this.props)}
          locale={{ emptyText: <NullScreen type="incidents" /> }}
          dataSource={this.transformRowData(
            this.props.incidents,
            this.props.followupActions,
            this.props.handleEditMineIncident,
            this.props.openMineIncidentModal,
            this.props.openViewMineIncidentModal,
            this.props.incidentDeterminationHash,
            this.props.complianceCodesHash
          )}
        />
      </div>
      )
    }
  }

MineIncidentTable.propTypes = propTypes;
MineIncidentTable.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  // codehash,
  // status hash,
  // determination hash,
  incidentDeterminationHash: getIncidentDeterminationHash(state),
  incidentStatusCodeHash: getIncidentStatusCodeHash(state),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  // inspectorsHash: getInspectorsHash(state),
  // varianceStatusOptionsHash: getVarianceStatusOptionsHash(state),
});

export default connect(mapStateToProps)(MineIncidentTable);
