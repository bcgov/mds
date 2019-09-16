import React from "react";
import PropTypes from "prop-types";
import { Table, Button, Icon } from "antd";
import moment from "moment";
import _ from "lodash";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { downloadFileFromDocumentManager } from "@/utils/actionlessNetworkCalls";
import CustomPropTypes from "@/customPropTypes";
import NullScreen from "@/components/common/NullScreen";
import { formatDate, getTableHeaders } from "@/utils/helpers";
import LinkButton from "@/components/common/LinkButton";
import * as Strings from "@/constants/strings";
import TableLoadingWrapper from "@/components/common/wrappers/TableLoadingWrapper";

const propTypes = {
  incidents: PropTypes.arrayOf(CustomPropTypes.incident).isRequired,
  followupActions: PropTypes.arrayOf(CustomPropTypes.incidentFollowupType).isRequired,
  handleEditMineIncident: PropTypes.func.isRequired,
  openMineIncidentModal: PropTypes.func.isRequired,
  openViewMineIncidentModal: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
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

const columns = (props) => [
  {
    title: "Incident Report No.",
    dataIndex: "mine_incident_report_no",
    sorter: (a, b) => a.mine_incident_report_no.localeCompare(b.mine_incident_report_no),
  },
  {
    title: "Incident Time",
    dataIndex: "incident_timestamp",
    sorter: (a, b) => moment(a.incident_timestamp) > moment(b.incident_timestamp),
  },
  {
    title: "Reported By",
    dataIndex: "reported_by",
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

const transformRowData = (
  incidents,
  actions,
  handleEditMineIncident,
  openMineIncidentModal,
  openViewMineIncidentModal
) =>
  incidents
    .map((incident) => ({
      key: incident.incident_id,
      mine_incident_report_no: incident.mine_incident_report_no,
      incident_timestamp: formatDate(incident.incident_timestamp),
      reported_timestamp: formatDate(incident.reported_timestamp),
      reported_by: incident.reported_by_name,
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
    }))
    .sort((a, b) => (a.mine_incident_report_no > b.mine_incident_report_no ? -1 : 1));

export const MineIncidentTable = (props) => (
  <TableLoadingWrapper condition={props.isLoaded} tableHeaders={getTableHeaders(columns(props))}>
    <Table
      align="left"
      pagination={false}
      columns={columns(props)}
      locale={{ emptyText: <NullScreen type="incidents" /> }}
      dataSource={transformRowData(
        props.incidents,
        props.followupActions,
        props.handleEditMineIncident,
        props.openMineIncidentModal,
        props.openViewMineIncidentModal
      )}
    />
  </TableLoadingWrapper>
);

MineIncidentTable.propTypes = propTypes;

export default MineIncidentTable;
