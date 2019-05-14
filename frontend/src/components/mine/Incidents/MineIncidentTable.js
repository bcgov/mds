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
    render: (action, record) => (
      <div title="followup_action">
        {action ? action.description : record.incident.followup_type_code}
      </div>
    ),
  },
  {
    title: "",
    dataIndex: "handleEditModal",
    render: (handleEdit, record) => (
      <div title="" align="right">
        <AuthorizationWrapper permission={Permission.CREATE}>
          <Button
            type="primary"
            size="small"
            ghost
            onClick={(event) => record.openMineIncidentModal(event, handleEdit, record.incident)}
          >
            <img src={BRAND_PENCIL} alt="Edit TSF Report" />
          </Button>
        </AuthorizationWrapper>
      </div>
    ),
  },
];

const transformRowData = (incidents, actions, handleEditModal, openMineIncidentModal) =>
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
      handleEditModal,
      openMineIncidentModal,
      incident,
    }));

const MineIncidentTable = (props) => (
  <div>
    <Table
      align="left"
      pagination={false}
      columns={columns}
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
