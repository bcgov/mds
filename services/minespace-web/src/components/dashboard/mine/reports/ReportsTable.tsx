import React, { FC } from "react";
import { connect } from "react-redux";
import { Badge, Button, TablePaginationConfig } from "antd";
import {
  formatComplianceCodeValueOrLabel,
  truncateFilename,
} from "@mds/common/redux/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { getMineReportDefinitionHash } from "@mds/common/redux/selectors/staticContentSelectors";
import * as Strings from "@/constants/strings";
import { EDIT_PENCIL } from "@/constants/assets";
import LinkButton from "@/components/common/LinkButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import {
  Feature,
  IMineReport,
  MINE_REPORT_STATUS_HASH,
  MINE_REPORT_SUBMISSION_CODES,
} from "@mds/common";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
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
  openEditReportModal: (event: React.MouseEvent, record: IMineReport) => void;
  openReport: (record: IMineReport) => void;
  isLoaded: boolean;
}

const DEFAULT_PAGE_SIZE = 10;

export const reportStatusSeverity = (status: MINE_REPORT_SUBMISSION_CODES) => {
  switch (status) {
    case MINE_REPORT_SUBMISSION_CODES.REQ:
    case MINE_REPORT_SUBMISSION_CODES.REC:
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
  const { isFeatureEnabled } = useFeatureFlag();

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
    renderTextColumn("report_name", "Report Name", true),
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
    renderTextColumn("submission_year", "Compliance Year", true, null, 5),
    renderTextColumn("due_date", "Due", true, null, 5),
    renderTextColumn("received_date", "Submitted On", true),
    renderTextColumn("created_by_idir", "Requested By", true),
    {
      title: "Documents",
      dataIndex: "mine_report_submissions",
      render: (text) => (
        <div title="Documents" className="cap-col-height">
          {(text &&
            text.length > 0 &&
            text[text.length - 1].documents &&
            text[text.length - 1].documents.length > 0 &&
            text[text.length - 1].documents.map((document) => (
              <LinkButton
                key={document.mine_document_guid}
                onClick={() => downloadFileFromDocumentManager(document)}
                title={document.document_name}
              >
                {truncateFilename(document.document_name)}
                <br />
              </LinkButton>
            ))) ||
            Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "",
      dataIndex: "edit",
      render: (text, record) => {
        return (
          <div>
            <AuthorizationWrapper>
              <Button type="link" onClick={(event) => props.openEditReportModal(event, record)}>
                <img src={EDIT_PENCIL} alt="Edit" />
              </Button>
            </AuthorizationWrapper>
          </div>
        );
      },
    },
  ];

  if (isFeatureEnabled(Feature.CODE_REQUIRED_REPORTS)) {
    columns = columns.filter((column) => !["", "Documents"].includes(column.title as string));
    const statusColumn = {
      title: "Status",
      dataIndex: "mine_report_status_code",
      sorter: (a, b) => a.mine_report_status_code.localeCompare(b.mine_report_status_code),
      render: (text: MINE_REPORT_SUBMISSION_CODES) => {
        return <Badge status={reportStatusSeverity(text)} text={MINE_REPORT_STATUS_HASH[text]} />;
      },
    };

    const newColumns = [statusColumn, renderActionsColumn({ actions })];
    columns = [...columns, ...newColumns];
  }

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
      pagination={pagination}
    />
  );
};

const mapStateToProps = (state) => ({
  mineReportDefinitionHash: getMineReportDefinitionHash(state),
});

export default connect(mapStateToProps, null)(ReportsTable);
