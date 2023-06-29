// Disabled due to bug detecting propTypes as unused in static components:
/* eslint-disable react/no-unused-prop-types */
import React, { useEffect, useState } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Button } from "antd";
import PropTypes from "prop-types";
import { formatDateTimeTz, truncateFilename } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import {
  getIncidentDeterminationHash,
  getIncidentStatusCodeHash,
} from "@common/selectors/staticContentSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { serverSidePaginationOptions, parseServerSideSearchOptions } from "@mds/common";
import LinkButton from "@/components/common/LinkButton";
import * as routes from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import CoreTable from "@/components/common/CoreTable";

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
      title: "Occurred On",
      dataIndex: "incident_timestamp",
      sortField: "incident_timestamp",
      sorter: true,
      render: (incident_timestamp) => <span title="Occurred On">{incident_timestamp}</span>,
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

  const formatIncidentData = (data) => {
    return data.map((item) => {
      return {
        ...item,
        incident_timestamp: formatDateTimeTz(item.incident_timestamp, item.incident_timezone),
      };
    });
  };

  useEffect(() => {
    setPaginationOptions(serverSidePaginationOptions(pageData));
  }, [pageData]);

  return (
    <CoreTable
      pagination={paginationOptions}
      onChange={handleTableUpdate}
      loading={!props.isLoaded}
      columns={columns}
      dataSource={formatIncidentData(props.data)}
      rowKey={(record) => record.mine_incident_guid}
      emptyText="This mine has no incident data."
    />
  );
};

IncidentsTable.propTypes = propTypes;
IncidentsTable.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  incidentDeterminationHash: getIncidentDeterminationHash(state),
  incidentStatusCodeHash: getIncidentStatusCodeHash(state),
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
