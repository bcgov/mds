import React, { FC, useState } from "react";
import { useSelector } from "react-redux";
import * as Strings from "@mds/common/constants/strings";
import {
  formatDate,
  dateSorter,
  nullableStringSorter,
  formatComplianceCodeValueOrLabel,
} from "@common/utils/helpers";
import {
  getMineReportCategoryOptionsHash,
  getMineReportStatusOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { Link, useHistory } from "react-router-dom";
import { Badge } from "antd";
import DocumentLink from "@/components/common/DocumentLink";
import CoreTable from "@mds/common/components/common/CoreTable";
import * as router from "@/constants/routes";
import { getReportSubmissionBadgeStatusType } from "@/constants/theme";
import { renderActionsColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import DownloadOutlined from "@ant-design/icons/DownloadOutlined";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import { deleteConfirmWrapper } from "@mds/common/components/common/ActionMenu";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";
import { IMineReport } from "@mds/common/interfaces";
import { TablePaginationConfig } from "antd/es/table";
import DocumentCompression from "@mds/common/components/documents/DocumentCompression";
import { MineDocument } from "@mds/common/models/documents/document";
import { getMineReportDefinitionHash } from "@mds/common/redux/slices/complianceReportsSlice";

interface MineReportTableProps {
  mineReports: IMineReport[];
  handleRemoveReport: any;
  isLoaded: boolean;
  handleTableChange?: any;
  filters?: any;
  sortField?: string;
  sortDir?: string;
  isPaginated?: false | TablePaginationConfig;
  isDashboardView?: boolean;
  mineReportType?: string;
}

export const MineReportTable: FC<MineReportTableProps> = ({
  mineReports,
  handleRemoveReport,
  isLoaded,
  mineReportType,
  handleTableChange = () => { },
  filters = {},
  sortField = undefined,
  sortDir = undefined,
  isPaginated = false,
  isDashboardView = false,
}) => {
  const [documentsToDownload, setDocumentsToDownload] = useState([]);
  const [isCompressionModalVisible, setIsCompressionModalVisible] = useState(false);

  const mineReportCategoryOptionsHash = useSelector(getMineReportCategoryOptionsHash);
  const mineReportStatusOptionsHash = useSelector(getMineReportStatusOptionsHash);
  const mineReportDefinitionHash = useSelector(getMineReportDefinitionHash);

  const hideColumn = (condition) => (condition ? "column-hide" : "");

  const userIsCoreEditReports = useSelector(
    userHasRole(USER_ROLES.role_edit_reports)
  );
  const history = useHistory();

  const openReportPage = (mineReport) => {
    history.push(
      router.REPORT_VIEW_EDIT.dynamicRoute(mineReport.mine_guid, mineReport.mine_report_guid)
    );
  };

  const handleDownloadAll = (mineReport) => {
    const mineDocuments = (mineReport.documents).map((doc) => new MineDocument(doc));
    setDocumentsToDownload(mineDocuments);
    setIsCompressionModalVisible(true);
  };

  const getRecordActions = () => {
    return [
      {
        key: "view",
        label: "View",
        icon: <EyeOutlined />,
        clickFunction: (event, record) => {
          openReportPage(record);
        },
      },
      {
        key: "download-all",
        label: "Download All",
        icon: <DownloadOutlined />,
        clickFunction: (event, record) => {
          handleDownloadAll(record);
        },
      },
      userIsCoreEditReports && {
        key: "delete",
        label: "Delete",
        icon: <DeleteOutlined />,
        clickFunction: (event, record) => {
          deleteConfirmWrapper(
            `${record.report.submission_year} ${record.report.report_name}`,
            () => handleRemoveReport(record)
          );
        },
      },
    ].filter(Boolean);
  };

  const getComplianceCodeValue = (guid) => {
    return mineReportDefinitionHash && mineReportDefinitionHash[guid]
      ? formatComplianceCodeValueOrLabel(
        mineReportDefinitionHash[guid].compliance_articles[0],
        false
      )
      : null;
  };

  const columns = [
    {
      title: "Mine",
      key: "mine_name",
      dataIndex: "mine_name",
      sortField: "mine_name",
      sorter: isDashboardView,
      className: hideColumn(!isDashboardView),
      render: (text, record) => (
        <div title="Mine" className={hideColumn(!isDashboardView)}>
          <Link to={router.MINE_DASHBOARD.dynamicRoute(record.mine_guid)}>{text}</Link>
        </div>
      ),
    },
    {
      title:
        mineReportType === Strings.MINE_REPORTS_TYPE.permitRequiredReports
          ? "Report Type"
          : "Report Name",
      key: "report_name",
      dataIndex: "report_name",
      sortField: "report_name",
      sorter: isDashboardView || ((a, b) => a.report_name.localeCompare(b.report_name)),
      render: (text) => <div title="Report Name">{text}</div>,
    },
    {
      title: "Compliance Year",
      key: "submission_year",
      dataIndex: "submission_year",
      sortField: "submission_year",
      sorter: isDashboardView || ((a, b) => (a.submission_year < b.submission_year ? -1 : 1)),
      render: (text) => <div title="Compliance Year">{text}</div>,
    },
    {
      title: "Status",
      key: "mine_report_status",
      dataIndex: "mine_report_status",
      sortField: "mine_report_status",
      sorter: isDashboardView || nullableStringSorter("mine_report_status"),
      render: (text) => (
        <div title="Status">
          <Badge
            status={getReportSubmissionBadgeStatusType(text)}
            text={text || Strings.EMPTY_FIELD}
          />
        </div>
      ),
    },
    {
      title: "Due",
      key: "due_date",
      dataIndex: "due_date",
      sortField: "due_date",
      sorter: isDashboardView || dateSorter("due_date"),
      render: (text) => <div title="Due">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Received",
      key: "received_date",
      dataIndex: "received_date",
      sortField: "received_date",
      sorter: isDashboardView || dateSorter("received_date"),
      render: (text) => <div title="Received">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Requested By",
      dataIndex: "created_by_idir",
      key: "created_by_idir",
      sortField: "created_by_idir",
      sorter:
        isDashboardView || ((a, b) => a.created_by_idir.localeCompare(b.created_by_idir)),
      className: hideColumn(isDashboardView),
      render: (text) => (
        <div title="Requested By" className={hideColumn(isDashboardView)}>
          {text}
        </div>
      ),
    },
    {
      title: "Documents",
      key: "documents",
      dataIndex: "documents",
      render: (text) => (
        <div title="Documents" className="cap-col-height">
          {(text &&
            text.length > 0 &&
            text.map((file) => (
              <div key={file.mine_document_guid} title={file.document_name}>
                <DocumentLink
                  documentManagerGuid={file.document_manager_guid}
                  documentName={file.document_name}
                />
              </div>
            ))) ||
            Strings.EMPTY_FIELD}
        </div>
      ),
    },
    renderActionsColumn({
      actions: getRecordActions(),
      recordActionsFilter: (record, actions) => {
        return record.documents.length > 0
          ? actions
          : actions.filter((action) => action.key !== "download-all");
      },
    }),
  ];

  const codeSectionColumn = {
    title: "Code Section",
    key: "code_section",
    render: (record) => (
      <div title="Code Section">{getComplianceCodeValue(record.mine_report_definition_guid)}</div>
    )
    ,
  };

  const permitColumn = {
    title: "Permit Number",
    key: "permit_number",
    dataIndex: "permit_number",
    sortField: "permit_number",
    sorter: isDashboardView || nullableStringSorter("permit_number"),
    render: (text, record) => (
      <Link to={router.MINE_PERMITS.dynamicRoute(record.mine_guid)}>{text}</Link>
    ),
  };

  if (mineReportType === Strings.MINE_REPORTS_TYPE.codeRequiredReports) {
    // @ts-ignore
    columns.splice(2, 0, codeSectionColumn);
  }

  if (mineReportType === Strings.MINE_REPORTS_TYPE.permitRequiredReports) {
    // @ts-ignore
    columns.splice(2, 0, permitColumn);
  }

  const transformRowData = (reports) =>
    reports.map((report) => ({
      key: report.mine_report_guid,
      mine_report_id: Number(report.mine_report_id),
      permit_number: report.permit_number,
      mine_report_guid: report.mine_report_guid,
      mine_report_definition_guid: report.mine_report_definition_guid,
      mine_report_category:
        (report.mine_report_category &&
          report.mine_report_category.length > 0 &&
          report.mine_report_category
            .map((category) => mineReportCategoryOptionsHash[category])
            .join(", ")) ||
        Strings.EMPTY_FIELD,
      report_name: report.report_name,
      due_date: formatDate(report.due_date),
      received_date: formatDate(report.latest_submission?.received_date),
      submission_year: Number(report.submission_year),
      created_by_idir: report.created_by_idir,
      permit_guid: report.permit_guid || Strings.EMPTY_FIELD,
      mine_report_status:
        mineReportStatusOptionsHash[report.mine_report_status_code] || Strings.EMPTY_FIELD,
      documents: report.latest_submission?.documents ?? [],
      mine_guid: report.mine_guid,
      mine_name: report.mine_name,
      report,
    }));

  const applySortIndicator = (_columns, field, dir) =>
    _columns.map((column) => ({
      ...column,
      sortOrder: dir && column.sortField === field ? dir.concat("end") : false,
    }));

  const mineReportHandleTableChange = (updateReportList, tableFilters) => (pagination, filters, sorter) => {
    const params = {
      ...tableFilters,
      sort_field: sorter.order ? sorter.field : undefined,
      sort_dir: sorter.order ? sorter.order.replace("end", "") : undefined,
    };
    updateReportList(params);
  };

  return (
    <div>
      <DocumentCompression
        mineDocuments={documentsToDownload}
        setCompressionModalVisible={setIsCompressionModalVisible}
        isCompressionModalVisible={isCompressionModalVisible}
        showDownloadWarning={false}
      />
      <CoreTable
        condition={isLoaded}
        columns={applySortIndicator(columns, sortField, sortDir)}
        classPrefix="mine-reports"
        dataSource={transformRowData(mineReports)}
        pagination={isPaginated}
        onChange={mineReportHandleTableChange(handleTableChange, filters)}
      />
    </div>
  );
};

export default MineReportTable;
