import React from "react";
import PropTypes from "prop-types";
import { Table, Button } from "antd";

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

const columns = [
  {
    title: "Incident Report No.",
    dataIndex: "mine_incident_report_no",
  },
  {
    title: "Incident Time",
    dataIndex: "incident_timestamp",
  },
  {
    title: "Reported By",
    dataIndex: "reported_by",
  },
  {
    title: "EMPR Action",
    dataIndex: "followup_action",
    render: (action) => (
      <div title="followup_action">{action ? action.description : "error..."}</div>
    ),
  },
  {
    title: "",
    dataIndex: "handleEditModal",
    render: (handleEditModal, record) => (
      <div title="" align="right">
        <AuthorizationWrapper permission={Permission.CREATE}>
          <Button
            type="primary"
            size="small"
            ghost
            onClick={(event) =>
              record.openMineIncidentModal(event, handleEditModal, record.incident)
            }
          >
            <img src={BRAND_PENCIL} alt="Edit TSF Report" />
          </Button>
        </AuthorizationWrapper>
      </div>
    ),
  },
];

const transformRowData = (incidents, actions, funcs) =>
  incidents
    .sort((i) => i.mine_incident_report_no)
    .map((incident) => ({
      key: incident.incident_id,
      mine_incident_report_no: incident.mine_incident_report_no,
      incident_timestamp: formatDate(incident.incident_timestamp),
      reported_timestamp: formatDate(incident.reported_timestamp),
      reported_by: incident.reported_by,
      followup_action: actions.find(
        (x) => x.mine_incident_followup_type_code === incident.followup_type_code
      ),
      ...funcs,
      incident,
    }));

const MineIncidentTable = (props) => (
  <div>
    {props.incidents.length < 1 ? (
      <NullScreen type="incidents" />
    ) : (
      <Table
        align="left"
        pagination={false}
        columns={columns}
        dataSource={transformRowData(props.incidents, props.followupActions, {
          handleEditModal: props.handleEditMineIncident,
          openMineIncidentModal: props.openMineIncidentModal,
        })}
      />
    )}
  </div>
);

MineIncidentTable.propTypes = propTypes;

export default MineIncidentTable;
