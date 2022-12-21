// Disabled due to bug detecting propTypes as unused in static components:
/* eslint-disable react/no-unused-prop-types */
import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Table, Button } from "antd";
import PropTypes from "prop-types";
import { truncateFilename, dateSorter } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import {
  getIncidentDeterminationHash,
  getIncidentStatusCodeHash,
  getIncidentCategoryCodeHash,
} from "@common/selectors/staticContentSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { detectProdEnvironment as IN_PROD } from "@/utils/environmentUtils";
import { formatDate } from "@/utils/helpers";
import LinkButton from "@/components/common/LinkButton";
import * as Strings from "@/constants/strings";
import * as routes from "@/constants/routes";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  isLoaded: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(CustomPropTypes.incident).isRequired,
  incidentDeterminationHash: PropTypes.objectOf(PropTypes.string).isRequired,
  incidentStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  incidentCategoryCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

const IncidentDocuments = (props) =>
  props.documents.length > 0 && (
    <div>
      <i>{props.title}</i>
      <br />
      {props.documents.map((file) => (
        <LinkButton
          key={file.mine_document_guid}
          onClick={() => downloadFileFromDocumentManager(file)}
          title={file.document_name}
        >
          {truncateFilename(file.document_name)}
        </LinkButton>
      ))}
    </div>
  );

IncidentDocuments.propTypes = {
  title: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export const IncidentsTable = (props) => {
  const columns = [
    {
      title: "Incident No.",
      dataIndex: "mine_incident_report_no",
      sortField: "mine_incident_report_no",
      sorter: (a, b) => (a.mine_incident_report_no > b.mine_incident_report_no ? -1 : 1),
      render: (text) => <span title="Incident No.">{text}</span>,
    },
    {
      title: "Incident Type",
      dataIndex: "categories",
      key: "categories",
      sorter: false,
      render: (categories) => (
        <div title="Incident Type">
          {(categories.length > 0 &&
            categories.map((cat) => [<span>{cat.description}</span>, <br />])) ||
            Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "Occurred On",
      dataIndex: "incident_timestamp",
      sortField: "incident_timestamp",
      sorter: dateSorter("incident_timestamp"),
      render: (incident_timestamp) => (
        <span title="Occurred On">{formatDate(incident_timestamp)}</span>
      ),
    },
    {
      title: "Reported By",
      dataIndex: "reported_by_name",
      key: "reported_by_name",
      sorter: (a, b) => (a.reported_by_name > b.reported_by_name ? -1 : 1),
      render: (text) => <span title="Reported By">{text}</span>,
    },
    {
      title: "Dangerous Occurrence",
      dataIndex: "determination_type_code",
      key: "determination_type_code",
      sorter: (a, b) =>
        props.incidentDeterminationHash[a.determination_type_code] >
        props.incidentDeterminationHash[b.determination_type_code]
          ? -1
          : 1,
      render: (determination_type_code) => (
        <span title="Dangerous Occurrence">
          {props.incidentDeterminationHash[determination_type_code]}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status_code",
      key: "status_code",
      sorter: (a, b) =>
        props.incidentStatusCodeHash[a.status_code] > props.incidentStatusCodeHash[b.status_code]
          ? -1
          : 1,
      render: (status_code) => (
        <span title="Status">{props.incidentStatusCodeHash[status_code]}</span>
      ),
    },
    {
      render: (record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            // ENV FLAG FOR MINE INCIDENTS //
            if (!IN_PROD()) {
              if (record.status_code && record.status_code !== "DFT") {
                return props.history.push({
                  pathname: routes.REVIEW_MINE_INCIDENT.dynamicRoute(
                    record.mine_guid,
                    record.mine_incident_guid
                  ),
                  state: { current: 2 },
                });
              }
              return props.history.push({
                pathname: routes.EDIT_MINE_INCIDENT.dynamicRoute(
                  record.mine_guid,
                  record.mine_incident_guid
                ),
                state: { current: 1 },
              });
            }
            return props.openModal({
              props: {
                title: "View Incident Details",
                incident: record,
              },
              width: "75vw",
              content: modalConfig.VIEW_INCIDENT,
            });
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <Table
      size="small"
      pagination={false}
      loading={!props.isLoaded}
      columns={columns}
      dataSource={props.data}
      rowKey={(record) => record.mine_incident_guid}
      locale={{ emptyText: "This mine has no incident data." }}
    />
  );
};

IncidentsTable.propTypes = propTypes;

const mapStateToProps = (state) => ({
  incidentDeterminationHash: getIncidentDeterminationHash(state),
  incidentStatusCodeHash: getIncidentStatusCodeHash(state),
  incidentCategoryCodeHash: getIncidentCategoryCodeHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
    },
    dispatch
  );

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(IncidentsTable));
