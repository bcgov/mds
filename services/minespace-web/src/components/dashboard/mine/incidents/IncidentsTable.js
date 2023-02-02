// Disabled due to bug detecting propTypes as unused in static components:
/* eslint-disable react/no-unused-prop-types */
import React, { useEffect, useState } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Table, Button } from "antd";
import PropTypes from "prop-types";
import { truncateFilename } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import {
  getIncidentDeterminationHash,
  getIncidentStatusCodeHash,
  getIncidentCategoryCodeHash,
} from "@common/selectors/staticContentSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { serverSidePaginationOptions, parseServerSideSearchOptions } from "@mds/common";
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
  pageData: PropTypes.shape({
    current_page: PropTypes.number,
    items_per_page: PropTypes.number,
    total: PropTypes.number,
    total_pages: PropTypes.number,
  }).isRequired,
  incidentDeterminationHash: PropTypes.objectOf(PropTypes.string).isRequired,
  incidentStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  incidentCategoryCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  handleSearch: PropTypes.func.isRequired,
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
};

const defaultProps = {
  sortField: undefined,
  sortDir: undefined,
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
  const { pageData, handleSearch } = props;
  const [paginationOptions, setPaginationOptions] = useState();
  const columns = [
    {
      title: "Incident No.",
      dataIndex: "mine_incident_report_no",
      sortField: "mine_incident_report_no",
      sorter: true,
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
      sorter: true,
      render: (incident_timestamp) => (
        <span title="Occurred On">{formatDate(incident_timestamp)}</span>
      ),
    },
    {
      title: "Reported By",
      dataIndex: "reported_by_name",
      key: "reported_by_name",
      sortField: "reported_by_name",
      sorter: false,
      render: (text) => <span title="Reported By">{text}</span>,
    },
    {
      title: "Dangerous Occurrence",
      dataIndex: "determination_type_code",
      key: "determination_type_code",
      sortField: "determination_type_code",
      sorter: true,
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
      sortField: "status_code",
      sorter: true,
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

  const handleTableUpdate = (pagination, filters, sorter) => {
    const searchOptions = parseServerSideSearchOptions(pagination, filters, sorter);
    handleSearch(searchOptions);
  };

  useEffect(() => {
    setPaginationOptions(serverSidePaginationOptions(pageData));
  }, [pageData]);

  return (
    <Table
      size="small"
      pagination={paginationOptions}
      onChange={handleTableUpdate}
      loading={!props.isLoaded}
      columns={columns}
      dataSource={props.data}
      rowKey={(record) => record.mine_incident_guid}
      locale={{ emptyText: "This mine has no incident data." }}
    />
  );
};

IncidentsTable.propTypes = propTypes;
IncidentsTable.defaultProps = defaultProps;

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
