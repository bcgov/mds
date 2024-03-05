import React from "react";
import PropTypes from "prop-types";
import { connect, useSelector } from "react-redux";
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
  getMineReportDefinitionHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { Link, useHistory } from "react-router-dom";
import { Badge, notification } from "antd";
import CustomPropTypes from "@/customPropTypes";
import DocumentLink from "@/components/common/DocumentLink";
import CoreTable from "@mds/common/components/common/CoreTable";
import * as router from "@/constants/routes";
import { getReportSubmissionBadgeStatusType } from "@/constants/theme";
import { renderActionsColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import DownloadOutlined from "@ant-design/icons/DownloadOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import { deleteConfirmWrapper } from "@mds/common/components/common/ActionMenu";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { Feature, USER_ROLES } from "@mds/common";
import { getDocumentDownloadToken } from "@mds/common/redux/utils/actionlessNetworkCalls";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { waitFor, downloadDocument } from "@/components/common/downloads/helpers";

const propTypes = {
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  mineReportCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineReportStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineReportDefinitionHash: PropTypes.objectOf(PropTypes.any).isRequired,
  openEditReportModal: PropTypes.func.isRequired,
  handleEditReport: PropTypes.func.isRequired,
  handleRemoveReport: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  handleTableChange: PropTypes.func,
  filters: PropTypes.objectOf(PropTypes.any),
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
  isPaginated: PropTypes.bool,
  isDashboardView: PropTypes.bool,
  mineReportType: PropTypes.string.isRequired,
};

const defaultProps = {
  handleTableChange: () => {},
  filters: {},
  sortField: undefined,
  sortDir: undefined,
  isPaginated: false,
  isDashboardView: false,
};

export const MineReportTable = (props) => {
  const hideColumn = (condition) => (condition ? "column-hide" : "");

  const userIsAdmin = useSelector((state) => userHasRole(state, USER_ROLES.role_admin));
  const { isFeatureEnabled } = useFeatureFlag();
  const history = useHistory();

  const openReportPage = (mineReport) => {
    history.push(
      router.REPORT_VIEW_EDIT.dynamicRoute(mineReport.mine_guid, mineReport.mine_report_guid)
    );
  };
  // from DownloadAllDocumentsButton- I think there is a new way to accomplish this
  const handleDownloadAll = (mineReport) => {
    const documents = mineReport.documents;
    const docURLS = [];

    const totalFiles = documents.length;
    if (totalFiles === 0) {
      return;
    }
    documents.forEach((doc) =>
      getDocumentDownloadToken(doc.document_manager_guid, doc.document_name, docURLS)
    );

    waitFor(() => docURLS.length === documents.length).then(async () => {
      for (const url of docURLS) {
        downloadDocument(url);

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      notification.success({
        message: `Successfully Downloaded: ${totalFiles} files.`,
        duration: 10,
      });
    });
  };

  const getRecordActions = () => {
    return [
      isFeatureEnabled(Feature.CODE_REQUIRED_REPORTS) && {
        key: "view",
        label: "View",
        icon: <EyeOutlined />,
        clickFunction: (event, record) => {
          openReportPage(record);
        },
      },
      !isFeatureEnabled(Feature.CODE_REQUIRED_REPORTS) && {
        key: "edit",
        label: "Edit",
        icon: <EditOutlined />,
        clickFunction: (event, record) => {
          props.openEditReportModal(event, props.handleEditReport, record.report);
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
      userIsAdmin && {
        key: "delete",
        label: "Delete",
        icon: <DeleteOutlined />,
        clickFunction: (event, record) => {
          deleteConfirmWrapper(
            `${record.report.submission_year} ${record.report.report_name}`,
            () => props.handleRemoveReport(record)
          );
        },
      },
    ].filter(Boolean);
  };

  const getComplianceCodeValue = (guid) => {
    return props.mineReportDefinitionHash && props.mineReportDefinitionHash[guid]
      ? formatComplianceCodeValueOrLabel(
          props.mineReportDefinitionHash[guid].compliance_articles[0],
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
      sorter: props.isDashboardView,
      className: hideColumn(!props.isDashboardView),
      render: (text, record) => (
        <div title="Mine" className={hideColumn(!props.isDashboardView)}>
          <Link to={router.MINE_SUMMARY.dynamicRoute(record.mine_guid)}>{text}</Link>
        </div>
      ),
    },
    {
      title:
        props.mineReportType === Strings.MINE_REPORTS_TYPE.permitRequiredReports
          ? "Report Type"
          : "Report Name",
      key: "report_name",
      dataIndex: "report_name",
      sortField: "report_name",
      sorter: props.isDashboardView || ((a, b) => a.report_name.localeCompare(b.report_name)),
      render: (text) => <div title="Report Name">{text}</div>,
    },
    {
      title: "Compliance Year",
      key: "submission_year",
      dataIndex: "submission_year",
      sortField: "submission_year",
      sorter: props.isDashboardView || ((a, b) => (a.submission_year < b.submission_year ? -1 : 1)),
      render: (text) => <div title="Compliance Year">{text}</div>,
    },
    {
      title: "Status",
      key: "mine_report_status",
      dataIndex: "mine_report_status",
      sortField: "mine_report_status",
      sorter: props.isDashboardView || nullableStringSorter("mine_report_status"),
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
      sorter: props.isDashboardView || dateSorter("due_date"),
      render: (text) => <div title="Due">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Received",
      key: "received_date",
      dataIndex: "received_date",
      sortField: "received_date",
      sorter: props.isDashboardView || dateSorter("received_date"),
      render: (text) => <div title="Received">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Requested By",
      dataIndex: "created_by_idir",
      key: "created_by_idir",
      sortField: "created_by_idir",
      sorter:
        props.isDashboardView || ((a, b) => a.created_by_idir.localeCompare(b.created_by_idir)),
      className: hideColumn(props.isDashboardView),
      render: (text) => (
        <div title="Requested By" className={hideColumn(props.isDashboardView)}>
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
    ),
  };

  const permitColumn = {
    title: "Permit Number",
    key: "permit_number",
    dataIndex: "permit_number",
    sortField: "permit_number",
    sorter: props.isDashboardView || nullableStringSorter("permit_number"),
    render: (text, record) => (
      <Link to={router.MINE_PERMITS.dynamicRoute(record.mine_guid)}>{text}</Link>
    ),
  };

  if (props.mineReportType === Strings.MINE_REPORTS_TYPE.codeRequiredReports) {
    columns.splice(2, 0, codeSectionColumn);
  }

  if (props.mineReportType === Strings.MINE_REPORTS_TYPE.permitRequiredReports) {
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
            .map((category) => props.mineReportCategoryOptionsHash[category])
            .join(", ")) ||
        Strings.EMPTY_FIELD,
      report_name: report.report_name,
      due_date: formatDate(report.due_date),
      received_date: formatDate(report.received_date),
      submission_year: Number(report.submission_year),
      created_by_idir: report.created_by_idir,
      permit_guid: report.permit_guid || Strings.EMPTY_FIELD,
      mine_report_status:
        props.mineReportStatusOptionsHash[report.mine_report_status_code] || Strings.EMPTY_FIELD,
      documents:
        report.mine_report_submissions &&
        report.mine_report_submissions.length > 0 &&
        report.mine_report_submissions[report.mine_report_submissions.length - 1].documents &&
        report.mine_report_submissions[report.mine_report_submissions.length - 1].documents.length >
          0
          ? report.mine_report_submissions[report.mine_report_submissions.length - 1].documents
          : [],
      mine_guid: report.mine_guid,
      mine_name: report.mine_name,
      report,
    }));

  const applySortIndicator = (_columns, field, dir) =>
    _columns.map((column) => ({
      ...column,
      sortOrder: dir && column.sortField === field ? dir.concat("end") : false,
    }));

  const handleTableChange = (updateReportList, tableFilters) => (pagination, filters, sorter) => {
    const params = {
      ...tableFilters,
      sort_field: sorter.order ? sorter.field : undefined,
      sort_dir: sorter.order ? sorter.order.replace("end", "") : undefined,
    };
    updateReportList(params);
  };

  return (
    <CoreTable
      condition={props.isLoaded}
      columns={applySortIndicator(columns, props.sortField, props.sortDir)}
      classPrefix="mine-reports"
      dataSource={transformRowData(props.mineReports)}
      pagination={props.isPaginated}
      onChange={handleTableChange(props.handleTableChange, props.filters)}
    />
  );
};

MineReportTable.propTypes = propTypes;
MineReportTable.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  mineReportCategoryOptionsHash: getMineReportCategoryOptionsHash(state),
  mineReportStatusOptionsHash: getMineReportStatusOptionsHash(state),
  mineReportDefinitionHash: getMineReportDefinitionHash(state),
});

export default connect(mapStateToProps)(MineReportTable);
