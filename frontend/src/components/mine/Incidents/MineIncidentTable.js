import React from "react";
import PropTypes from "prop-types";
import { Table, Button } from "antd";

import _ from "lodash";

import { BRAND_PENCIL } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import NullScreen from "@/components/common/NullScreen";
import { formatDate } from "@/utils/helpers";

const propTypes = {
  incidents: PropTypes.arrayOf(CustomPropTypes.incident).isRequired,
  followupActions: PropTypes.arrayOf(CustomPropTypes.incidentFollowupType).isRequired,
  handleEditMineIncident: PropTypes.func.isRequired,
  openMineIncidentModal: PropTypes.func.isRequired,
};

const columns = (props) => [
  {
    title: "Incident Report No.",
    dataIndex: "mine_incident_report_no",
    sorter: (a, b) => a.mine_incident_report_no.localeCompare(b.mine_incident_report_no),
  },
  {
    title: "Incident Time",
    dataIndex: "incident_timestamp",
    sorter: (a, b) => new Date(a.incident_timestamp) > new Date(b.incident_timestamp),
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
            <img src={BRAND_PENCIL} alt="Edit Incident" />
          </Button>
        </AuthorizationWrapper>
      </div>
    ),
  },
];

const transformRowData = (incidents, actions, handleEditMineIncident, openMineIncidentModal) =>
  incidents
    .sort((i) => i.mine_incident_report_no)
    .map((incident) => ({
      key: incident.incident_id,
      mine_incident_report_no: incident.mine_incident_report_no,
      incident_timestamp: formatDate(incident.incident_timestamp),
      reported_timestamp: formatDate(incident.reported_timestamp),
      reported_by: incident.reported_by_name,
      followup_action: actions.find(
        (x) =>
          x.mine_incident_followup_investigation_type_code ===
          incident.followup_investigation_type_code
      ),
      handleEditMineIncident,
      openMineIncidentModal,
      incident,
    }));

export const MineIncidentTable = (props) => (
  <div>
    <Table
      align="left"
      pagination={false}
      columns={columns(props)}
      locale={{ emptyText: <NullScreen type="incidents" /> }}
      dataSource={transformRowData(
        props.incidents,
        props.followupActions,
        props.handleEditMineIncident,
        props.openMineIncidentModal
      )}
    />
  </div>
);

MineIncidentTable.propTypes = propTypes;

export default MineIncidentTable;
