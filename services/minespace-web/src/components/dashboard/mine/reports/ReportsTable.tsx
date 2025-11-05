import React, { FC } from "react";
import { Badge, TablePaginationConfig } from "antd";
import { formatComplianceCodeValueOrLabel } from "@mds/common/redux/utils/helpers";
import { getMineReportDefinitionHash } from "@mds/common/redux/slices/complianceReportsSlice";
import {
  renderActionsColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import { ColumnsType } from "antd/es/table";
import CoreTable from "@mds/common/components/common/CoreTable";
import { MINE_REPORT_SUBMISSION_CODES } from "@mds/common/constants/enums";
import { IMineReport } from "@mds/common/interfaces/reports/mineReport.interface";
import { MINE_REPORT_STATUS_HASH } from "@mds/common/constants/strings";
import { useAppSelector as useSelector } from "@mds/common/redux/rootState";
import { EditOutlined } from "@ant-design/icons";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";
import { PERMIT_VIEW } from "@/constants/routes";

interface ReportsTableProps {
  mineReports: IMineReport[];
  openReport: (record: IMineReport, isEditMode?: boolean) => void;
  isLoaded: boolean;
  backendPaginated?: boolean;
  columns?: ColumnsType<IMineReport>;
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
  const mineReportDefinitionHash = useSelector(getMineReportDefinitionHash);
  const { isFeatureEnabled } = useFeatureFlag();
  const showOverdueLabel = isFeatureEnabled(Feature.REPORT_MANAGEMENT_V2);

  const actions = [
    {
      key: "view",
      label: "View",
      clickFunction: (_event, record) => {
        props.openReport(record);
      },
      icon: <EyeOutlined />,
    },
    {
      key: "submit",
      label: "Submit",
      clickFunction: (_event, record) => {
        props.openReport(record, true);
      },
      icon: <EditOutlined />,
    },
  ];

  const recordActionsFilter = (record: IMineReport, actionList: any[]) => {
    // Hide view action for NON and REQ statuses, show submit for others
    if (
      [MINE_REPORT_SUBMISSION_CODES.NON, MINE_REPORT_SUBMISSION_CODES.REQ].includes(
        record.mine_report_status_code
      )
    ) {
      return actionList.filter((action) => action.key !== "view");
    }

    return actionList.filter((action) => action.key !== "submit");
  };

  let defaultColumns: ColumnsType<IMineReport> = [
    renderTextColumn("report_name", "Report Name/Permit Condition", !props.backendPaginated),
    {
      title: "Code Section",
      key: "code_section",
      render: (record: any) => {
        return mineReportDefinitionHash[record?.mine_report_definition_guid]
          ?.compliance_articles[0] ? (
          <div title="Code Section">
            {formatComplianceCodeValueOrLabel(
              mineReportDefinitionHash[record.mine_report_definition_guid].compliance_articles[0],
              false
            )}
          </div>
        ) : null;
      },
    },
    renderTextColumn("submission_year", "Compliance Year", !props.backendPaginated, null, 50),
    renderTextColumn("due_date", "Due", true, null, 100),
    renderTextColumn(["latest_submission", "received_date"], "Submitted", true),
    {
      title: "Status",
      dataIndex: "mine_report_status_code",
      sorter: (a, b) => a.mine_report_status_code.localeCompare(b.mine_report_status_code),
      render: (text: MINE_REPORT_SUBMISSION_CODES, report: IMineReport) => {
        if (report.is_overdue && showOverdueLabel) {
          return <Badge status="error" text="Overdue" />;
        }

        return <Badge status={reportStatusSeverity(text)} text={MINE_REPORT_STATUS_HASH[text]} />;
      },
    },
  ];

  if (!props.columns && props.mineReports.some((report) => report.permit_guid)) {
    defaultColumns = defaultColumns.map((col) => {
      if (col.key === "code_section") {
        return {
          title: "Permit #",
          dataIndex: "permit_number",
          key: "permit_number",
          render: (text: string | null | undefined, record) => {
            if (!text) return "—";
            const permitLink = PERMIT_VIEW.dynamicRoute(record.mine_guid, record.permit_guid);
            return <a href={permitLink}>{text}</a>;
          },
          width: 125,
        };
      } else {
        return col;
      }
    });
  }

  const columns: ColumnsType<IMineReport> = props.columns || defaultColumns;

  const pagination: TablePaginationConfig = {
    defaultPageSize: DEFAULT_PAGE_SIZE,
    total: props.mineReports.length,
    position: ["bottomCenter"],
  };

  return (
    <CoreTable
      size={"small"}
      loading={!props.isLoaded}
      columns={[...columns, renderActionsColumn({ actions, recordActionsFilter })]}
      rowKey={(record) => record.mine_report_guid}
      emptyText="This mine has no report data."
      dataSource={props.mineReports}
      pagination={props.backendPaginated ? false : pagination}
    />
  );
};

export default ReportsTable;
