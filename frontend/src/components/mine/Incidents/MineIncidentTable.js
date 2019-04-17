import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";

import CustomPropTypes from "@/customPropTypes";
import NullScreen from "@/components/common/NullScreen";
import { formatDate } from "@/utils/helpers";

const propTypes = {
  incidents: PropTypes.arrayOf(CustomPropTypes.incident).isRequired,
  followupActions: PropTypes.arrayOf(CustomPropTypes.incidentFollowupType).isRequired,
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
  },
];

const transformRowData = (incidents, actions) =>
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
      ).description,
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
        dataSource={transformRowData(props.incidents, props.followupActions)}
      />
    )}
  </div>
);

MineIncidentTable.propTypes = propTypes;

export default MineIncidentTable;
