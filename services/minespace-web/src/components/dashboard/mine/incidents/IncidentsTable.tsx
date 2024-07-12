import React, { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button } from "antd";
import { formatDateTimeTz } from "@common/utils/helpers";
import {
  getIncidentDeterminationHash,
  getIncidentStatusCodeHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import {
  serverSidePaginationOptions,
  parseServerSideSearchOptions,
  IMineIncident,
  IPageData,
} from "@mds/common";
import * as routes from "@/constants/routes";
import CoreTable from "@mds/common/components/common/CoreTable";

interface IncidentTableProps {
  isLoaded: boolean;
  data: IMineIncident[];
  pageData: IPageData<IMineIncident>;
  handleSearch: (...args) => any;
}

export const IncidentsTable: FC<IncidentTableProps> = ({
  pageData,
  handleSearch,
  isLoaded,
  data,
}) => {
  const [paginationOptions, setPaginationOptions] = useState<any>();
  const history = useHistory();
  const incidentDeterminationHash = useSelector(getIncidentDeterminationHash);
  const incidentStatusCodeHash = useSelector(getIncidentStatusCodeHash);

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
          {incidentDeterminationHash[determination_type_code]}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status_code",
      key: "status_code",
      sortField: "status_code",
      sorter: true,
      render: (status_code) => <span title="Status">{incidentStatusCodeHash[status_code]}</span>,
    },
    {
      render: (record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            if (record.status_code && record.status_code !== "DFT") {
              return history.push({
                pathname: routes.REVIEW_MINE_INCIDENT.dynamicRoute(
                  record.mine_guid,
                  record.mine_incident_guid
                ),
                state: { current: 2 },
              });
            }
            return history.push({
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

  const formatIncidentData = (data: IMineIncident[]) => {
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
      loading={!isLoaded}
      columns={columns}
      dataSource={formatIncidentData(data)}
      rowKey={(record) => record.mine_incident_guid}
      emptyText="This mine has no incident data."
    />
  );
};

export default IncidentsTable;
