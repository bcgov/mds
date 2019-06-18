import React from "react";
import PropTypes from "prop-types";
import { Table, Button } from "antd";

import { BRAND_PENCIL } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import CustomPropTypes from "@/customPropTypes";
import NullScreen from "@/components/common/NullScreen";
import { formatDate } from "@/utils/helpers";
import LinkButton from "@/components/common/LinkButton";

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
    title: "Initial Report Documents",
    dataIndex: "initialDocuments",
    width: 200,
    render: (text, record) => (
      <div title="Initial Report Documents">
        {record.docs.length === 0 ? (
          <span>--</span>
        ) : (
          record.docs
            .filter((file) => file.mine_incident_document_type_code === "INI")
            .map((file) => (
              <div key={file.mine_document_guid}>
                <LinkButton
                  key={file.mine_document_guid}
                  onClick={() => downloadFileFromDocumentManager(file.document_manager_guid)}
                >
                  {file.document_name}
                </LinkButton>
              </div>
            ))
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
          record.docs
            .filter((file) => file.mine_incident_document_type_code === "FIN")
            .map((file) => (
              <div key={file.mine_document_guid}>
                <LinkButton
                  key={file.mine_document_guid}
                  onClick={() => downloadFileFromDocumentManager(file.document_manager_guid)}
                >
                  {file.document_name}
                </LinkButton>
              </div>
            ))
        )}
      </div>
    ),
  },
  {
    title: "",
    dataIndex: "handleEditModal",
    render: (text, record) => (
      <div title="" align="right">
        <AuthorizationWrapper permission={Permission.CREATE}>
          <Button
            type="primary"
            size="small"
            ghost
            onClick={(event) =>
              record.openMineIncidentModal(event, record.handleEditMineIncident, record.incident)
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
      reported_by: incident.reported_by,
      docs: incident.documents,
      followup_action: actions.find(
        (x) => x.mine_incident_followup_type_code === incident.followup_type_code
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
