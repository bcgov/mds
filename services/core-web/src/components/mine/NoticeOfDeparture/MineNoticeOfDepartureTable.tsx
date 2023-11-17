import React from "react";
import { Button } from "antd";
import { connect } from "react-redux";
import { formatDate } from "@common/utils/helpers";
import {
  EMPTY_FIELD,
  NOTICE_OF_DEPARTURE_STATUS,
  NOTICE_OF_DEPARTURE_TYPE,
} from "@mds/common/constants/strings";
import CoreTable from "@/components/common/CoreTable";
import { INoticeOfDeparture } from "@mds/common";
import { TablePaginationConfig } from "antd/es/table";

export interface MineNoticeOfDepartureTableProps {
  nods: INoticeOfDeparture[];
  openViewNodModal: (one: any, two: any) => void;
  isDashboardView?: boolean;
  sortField?: string;
  sortDir?: string;
  isLoaded?: boolean;
  isPaginated?: false | TablePaginationConfig;
}

const applySortIndicator = (_columns, field, dir) =>
  _columns.map((column) => ({
    ...column,
    sortOrder: dir && column.sortField === field ? dir.concat("end") : false,
  }));

export const MineNoticeOfDepartureTable: React.FC<MineNoticeOfDepartureTableProps> = (props) => {
  const {
    isDashboardView,
    isLoaded,
    isPaginated,
    sortField,
    sortDir,
    nods,
    openViewNodModal,
  } = props;
  const transformRowData = (baseNods) =>
    baseNods.map(
      ({
        submission_timestamp,
        create_timestamp,
        update_timestamp,
        nod_guid,
        nod_no,
        nod_type,
        nod_status,
        ...other
      }) => ({
        ...other,
        key: nod_guid,
        nod_guid,
        nod_no,
        nod_status: NOTICE_OF_DEPARTURE_STATUS[nod_status] || EMPTY_FIELD,
        nod_type: NOTICE_OF_DEPARTURE_TYPE[nod_type] || EMPTY_FIELD,
        updated_at: formatDate(update_timestamp),
        submitted_at: formatDate(submission_timestamp) || formatDate(create_timestamp),
      })
    );

  const columns = [
    {
      title: "Project Title",
      dataIndex: "nod_title",
      sortField: "nod_title",
      sorter: (a, b) => (a.nod_title > b.nod_title ? -1 : 1),
      render: (text) => <div title="Code">{text || EMPTY_FIELD}</div>,
    },
    {
      title: "NOD",
      dataIndex: "nod_no",
      sortField: "nod_no",
      render: (text) => <div title="Id">{text}</div>,
    },
    {
      title: "Permit",
      dataIndex: ["permit", "permit_no"],
      key: ["permit", "permit_no"],
    },
    {
      title: "Type",
      dataIndex: "nod_type",
      sortField: "nod_type",
      sorter: (a, b) => (a.nod_type > b.nod_type ? -1 : 1),
      render: (text) => <div title="Type">{text || EMPTY_FIELD}</div>,
    },
    {
      title: "Status",
      dataIndex: "nod_status",
      sortField: "nod_status",
      sorter: (a, b) => (a.nod_status > b.nod_status ? -1 : 1),
      render: (text) => <div title="Status">{text || EMPTY_FIELD}</div>,
    },
    {
      title: "Submitted",
      dataIndex: "submitted_at",
      sortField: "submitted_at",
      sorter: (a, b) => (a.submitted_at > b.submitted_at ? -1 : 1),
      render: (text) => <div title="Submission Date">{text || EMPTY_FIELD}</div>,
    },
    {
      title: "Updated",
      dataIndex: "updated_at",
      sortField: "updated_at",
      sorter: (a, b) => (a.updated_at > b.updated_at ? -1 : 1),
      render: (text) => <div title="Update Date">{text || EMPTY_FIELD}</div>,
    },
    {
      dataIndex: "actions",
      render: (text, record) =>
        record.key && (
          <div className="btn--middle flex">
            <Button type="primary" onClick={(event) => openViewNodModal(event, record)}>
              Open
            </Button>
          </div>
        ),
    },
  ];

  return (
    <CoreTable
      condition={isLoaded}
      columns={isDashboardView ? applySortIndicator(columns, sortField, sortDir) : columns}
      dataSource={transformRowData(nods)}
      pagination={isPaginated}
    />
  );
};

export default connect()(MineNoticeOfDepartureTable);
