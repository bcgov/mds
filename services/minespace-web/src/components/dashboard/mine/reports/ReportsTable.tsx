import React, { FC } from "react";
import { connect } from "react-redux";
import { Badge, TablePaginationConfig } from "antd";
import { formatComplianceCodeValueOrLabel } from "@mds/common/redux/utils/helpers";
import { getMineReportDefinitionHash } from "@mds/common/redux/selectors/staticContentSelectors";
import { IMineReport, MINE_REPORT_STATUS_HASH, MINE_REPORT_SUBMISSION_CODES } from "@mds/common";
import {
  renderActionsColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import { ColumnsType } from "antd/es/table";
import CoreTable from "@mds/common/components/common/CoreTable";

interface ReportsTableProps {
  mineReports: IMineReport[];
  mineReportDefinitionHash: any;
  openReport: (record: IMineReport) => void;
  isLoaded: boolean;
  backendPaginated: boolean;
}

const DEFAULT_PAGE_SIZE = 10;

export const reportStatusSeverity = (status: MINE_REPORT_SUBMISSION_CODES) => {
  switch (status) {
    case MINE_REPORT_SUBMISSION_CODES.REQ:
    case MINE_REPORT_SUBMISSION_CODES.REC:
    case MINE_REPORT_SUBMISSION_CODES.NON:
      return "warning";
    case MINE_REPORT_SUBMISSION_CODES.ACC:
    case MINE_REPORT_SUBMISSION_CODES.NRQ:
    case MINE_REPORT_SUBMISSION_CODES.INI:
      return "success";
    case MINE_REPORT_SUBMISSION_CODES.WTD:
    default:
      return "default";
  }
};

export const ReportsTable: FC<ReportsTableProps> = (props) => {
  const actions = [
    {
      key: "view",
      label: "View",
      clickFunction: (_event, record) => {
        props.openReport(record);
      },
      icon: <EyeOutlined />,
    },
  ];

  let columns: ColumnsType<IMineReport> = [
    renderTextColumn("report_name", "Report Name", !props.backendPaginated),
    {
      title: "Code Section",
      key: "code_section",
      render: (record) => (
        <div title="Code Section">
          {formatComplianceCodeValueOrLabel(
            props.mineReportDefinitionHash[record.mine_report_definition_guid]
              .compliance_articles[0],
            false
          )}
        </div>
      ),
    },
    renderTextColumn("submission_year", "Compliance Year", !props.backendPaginated, null, 5),
    renderTextColumn("due_date", "Due", true, null, 5),
    renderTextColumn(["latest_submission", "received_date"], "Submitted On", true),
    renderTextColumn("created_by_idir", "Requested By", true),
    {
      title: "Status",
      dataIndex: "mine_report_status_code",
      sorter: (a, b) => a.mine_report_status_code.localeCompare(b.mine_report_status_code),
      render: (text: MINE_REPORT_SUBMISSION_CODES) => {
        return <Badge status={reportStatusSeverity(text)} text={MINE_REPORT_STATUS_HASH[text]} />;
      },
    },
    renderActionsColumn({ actions }),
  ];

  if (props.mineReports.some((report) => report.permit_guid)) {
    columns = columns.map((col) => {
      if (col.key === "code_section") {
        return renderTextColumn("permit_number", "Permit #", true, null, 5);
      } else {
        return col;
      }
    });
  }

  const pagination: TablePaginationConfig = {
    defaultPageSize: DEFAULT_PAGE_SIZE,
    total: props.mineReports.length,
    position: ["bottomCenter"],
  };

  return (
    <CoreTable
      size={"small"}
      loading={!props.isLoaded}
      columns={columns}
      rowKey={(record) => record.mine_report_guid}
      emptyText="This mine has no report data."
      dataSource={props.mineReports}
      pagination={props.backendPaginated ? false : pagination}
    />
  );
};

const mapStateToProps = (state) => ({
  mineReportDefinitionHash: getMineReportDefinitionHash(state),
});

export default connect(mapStateToProps, null)(ReportsTable);
