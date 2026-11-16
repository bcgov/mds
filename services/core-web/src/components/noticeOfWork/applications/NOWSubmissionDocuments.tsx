import React, { FC, ReactNode, useState } from "react";
import moment from "moment";
import { Badge, BadgeProps, Tooltip, Button, Popconfirm, Row, Col, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { ImportOutlined, ReloadOutlined, FlagOutlined } from "@ant-design/icons";
import { formatDateTime } from "@common/utils/helpers";
import { isEmpty } from "lodash";
import {
  IImportNoWSubmissionDocumentsJob,
  INoWApplicationForm,
  IOption,
  IPermitAmendment,
} from "@mds/common/interfaces";
import {
  INoWSubmissionDocument,
  IPermitPackageTitles,
} from "@/components/noticeOfWork/applications/permitPackageTitleColumn";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Strings from "@mds/common/constants/strings";
import DocumentLink from "@mds/common/components/documents/DocumentLink";
import OriginalVfcbcFileIcon from "@mds/common/components/documents/OriginalVfcbcFileIcon";
import { resolveIsOriginalVfcbcFile } from "@mds/common/utils/vfcbcFile";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  getNoticeOfWork,
  getApplicationDelay,
} from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { getDraftPermitAmendmentForNOW } from "@mds/common/redux/selectors/permitSelectors";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import {
  createNoticeOfWorkApplicationImportSubmissionDocumentsJob,
  fetchImportNoticeOfWorkSubmissionDocumentsJob,
  fetchImportedNoticeOfWorkApplication,
  updateNoticeOfWorkApplication,
  deleteNoticeOfWorkApplicationDocument,
  editNoticeOfWorkDocument,
  createNoticeOfWorkDocumentVersion,
  archiveNoticeOfWorkDocuments,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { documentWithTag } from "@mds/common/components/documents/DocumentColumns";
import { openDocument } from "@mds/common/components/syncfusion/DocumentViewer";
import { downloadFileFromDocumentManager } from "@mds/common/redux/utils/actionlessNetworkCalls";
import {
  getNoticeOfWorkApplicationDocumentTypeOptionsHash,
  getDropdownNoticeOfWorkApplicationDocumentTypeOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import AddButton from "@/components/common/buttons/AddButton";
import ReferralConsultationPackage from "@/components/noticeOfWork/applications/referals/ReferralConsultationPackage";
import PermitPackage from "@/components/noticeOfWork/applications/PermitPackage";
import NOWDownloadAllButton from "@/components/noticeOfWork/applications/NOWDownloadAllButton";
import CoreTable from "@mds/common/components/common/CoreTable";
import {
  getPermitPackageExpandProps,
  renderPermitPackageDetailsSummary,
  renderPermitPackageTitleColumn,
  renderPermitPackageTypeColumn,
} from "@/components/noticeOfWork/applications/permitPackageTitleColumn";
import SpatialFilesRowLink from "@mds/common/components/documents/spatial/SpatialFilesRowLink";
import {
  FILE_MANAGEMENT_ROW_CLASS,
  IFileManagementRecord,
  fileManagementActionsColumn,
  fileNameHeaderCell,
  getFileManagementContext,
  getFileNameOffset,
  isVersionRow,
  openArchiveFileModal,
  openReplaceFileModal,
  toFileManagementRow,
} from "@/components/noticeOfWork/applications/nowFileManagement";

export interface NOWSubmissionDocumentsProps {
  now_application_guid: string;
  isViewMode: boolean;
  documents?: INoWSubmissionDocument[];
  importNowSubmissionDocumentsJob?: IImportNoWSubmissionDocumentsJob;
  selectedRows?: {
    selectedSubmissionRows?: string[];
    setSelectedSubmissionRows?: (keys: string[]) => void;
  } | null;
  categoriesToShow?: string[];
  displayTableDescription?: boolean;
  tableDescription?: string | null;
  hideImportStatusColumn?: boolean;
  disableCategoryFilter?: boolean;
  hideJobStatusColumn?: boolean;
  showDescription?: boolean;
  allowAfterProcess?: boolean;
  isFinalPackageTable?: boolean;
  isAdminView?: boolean;
  isPackageModal?: boolean;
  lockedRowKeys?: string[];
  packageTitles?: IPermitPackageTitles | null;
  preTableContent?: ReactNode;
  // Only supplied where the Spatial Files panel sits above this table.
  onSpatialFileLinkClick?: (() => void) | null;
  // Replace, Archive and version history, only on the Manage Documents page
  enableFileManagement?: boolean;
}

const transformDocuments = (
  documents,
  importNowSubmissionDocumentsJob,
  now_application_guid,
  documentTypeOptionsHash
) =>
  documents &&
  documents.map((document) => {
    const importNowSubmissionDocument =
      !isEmpty(importNowSubmissionDocumentsJob) &&
        !isEmpty(importNowSubmissionDocumentsJob.import_now_submission_documents)
        ? importNowSubmissionDocumentsJob.import_now_submission_documents.find((doc) => {
          return (
            doc.submission_document_file_name === document.filename &&
            doc.submission_document_url === document.documenturl &&
            doc.submission_document_type === document.documenttype &&
            doc.submission_document_message_id === document.messageid
          );
        })
        : null;
    return {
      key: document.mine_document_guid ?? document.id,
      now_application_document_xref_guid: document.now_application_document_xref_guid,
      now_application_guid,
      url: document.documenturl,
      category: document.is_imported_submission
        ? document.category
        : (documentTypeOptionsHash &&
          documentTypeOptionsHash[document.now_application_document_type_code]) ||
        document.documenttype ||
        Strings.EMPTY_FIELD,
      description: document.description || Strings.EMPTY_FIELD,
      document_manager_guid: document.document_manager_guid,
      mine_document_guid: document.mine_document_guid,
      importNowSubmissionDocument,
      notForImport: document.notForImport,
      isModificationAllowed:
        !document.is_final_package &&
        !document.is_referral_package &&
        !document.is_consultation_package,
      upload_date: document?.mine_document?.upload_date,
      ...document,
      // A replaced vFCBC file keeps its original filename, document_name is its current name
      filename: document.document_name || document.filename || Strings.EMPTY_FIELD,
      is_original_vfcbc_file: resolveIsOriginalVfcbcFile(document, !document.notForImport),
    };
  });

export const NOWSubmissionDocuments: FC<NOWSubmissionDocumentsProps> = ({
  selectedRows = null,
  importNowSubmissionDocumentsJob,
  categoriesToShow = [],
  documents = [],
  tableDescription = null,
  displayTableDescription = false,
  hideImportStatusColumn = false,
  disableCategoryFilter = false,
  hideJobStatusColumn = false,
  showDescription = false,
  allowAfterProcess = false,
  isFinalPackageTable = false,
  isAdminView = false,
  isPackageModal = false,
  lockedRowKeys = [],
  packageTitles = null,
  preTableContent = null,
  onSpatialFileLinkClick = null,
  enableFileManagement = false,
  ...rest
}) => {
  const props = {
    selectedRows,
    importNowSubmissionDocumentsJob,
    categoriesToShow,
    documents,
    tableDescription,
    displayTableDescription,
    hideImportStatusColumn,
    disableCategoryFilter,
    hideJobStatusColumn,
    showDescription,
    allowAfterProcess,
    isFinalPackageTable,
    isAdminView,
    isPackageModal,
    lockedRowKeys,
    packageTitles,
    preTableContent,
    onSpatialFileLinkClick,
    enableFileManagement,
    ...rest,
  };
  const dispatch = useAppDispatch();
  const noticeOfWork = useAppSelector(getNoticeOfWork) as INoWApplicationForm;
  const noticeOfWorkApplicationDocumentTypeOptions = useAppSelector(
    getDropdownNoticeOfWorkApplicationDocumentTypeOptions
  ) as IOption[];
  const noticeOfWorkApplicationDocumentTypeOptionsHash = useAppSelector(
    getNoticeOfWorkApplicationDocumentTypeOptionsHash
  );
  const applicationDelay = useAppSelector(getApplicationDelay);
  const draftPermitAmendment = useAppSelector(getDraftPermitAmendmentForNOW) as IPermitAmendment;
  const userRoles = useAppSelector(getUserAccessData);

  // Bound action creators
  const openModalAction = (modalProps) => dispatch(openModal(modalProps));
  const closeModalAction = () => dispatch(closeModal());
  const updateApplication = (...args: Parameters<typeof updateNoticeOfWorkApplication>) =>
    dispatch(updateNoticeOfWorkApplication(...args));
  const fetchApplication = (applicationGuid: string) =>
    dispatch(fetchImportedNoticeOfWorkApplication(applicationGuid));
  const deleteDocument = (...args: Parameters<typeof deleteNoticeOfWorkApplicationDocument>) =>
    dispatch(deleteNoticeOfWorkApplicationDocument(...args));
  const editDocument = (...args: Parameters<typeof editNoticeOfWorkDocument>) =>
    dispatch(editNoticeOfWorkDocument(...args));
  const createImportJob = (...args: Parameters<typeof createNoticeOfWorkApplicationImportSubmissionDocumentsJob>) =>
    dispatch(createNoticeOfWorkApplicationImportSubmissionDocumentsJob(...args));
  const fetchImportJob = (...args: Parameters<typeof fetchImportNoticeOfWorkSubmissionDocumentsJob>) =>
    dispatch(fetchImportNoticeOfWorkSubmissionDocumentsJob(...args));
  const createDocumentVersion = (...args: Parameters<typeof createNoticeOfWorkDocumentVersion>) =>
    dispatch(createNoticeOfWorkDocumentVersion(...args));
  const archiveDocuments = (...args: Parameters<typeof archiveNoticeOfWorkDocuments>) =>
    dispatch(archiveNoticeOfWorkDocuments(...args));
  const openDocumentAction = (...args: Parameters<typeof openDocument>) =>
    dispatch(openDocument(...args));

  const [isLoaded, setIsLoaded] = useState(true);
  const isInCompleteStatus =
    noticeOfWork.now_application_status_code === "AIA" ||
    noticeOfWork.now_application_status_code === "WDN" ||
    noticeOfWork.now_application_status_code === "REJ" ||
    noticeOfWork.now_application_status_code === "NPR";

  const handleAddDocument = (values) => {
    const documents = values.uploadedFiles.map((file) => {
      return {
        now_application_document_type_code: values.now_application_document_type_code,
        description: values.description,
        is_final_package: values.is_final_package,
        permit_package_document_type_code: values.permit_package_document_type_code,
        preamble_title: values?.preamble_title,
        preamble_author: values?.preamble_author,
        mine_document: {
          ...file,
          mine_guid: noticeOfWork.mine_guid,
        },
      };
    });
    return updateApplication(
        { documents },
        noticeOfWork.now_application_guid,
        "Successfully added documents to this application."
      )
      .then(() => {
        fetchApplication(noticeOfWork.now_application_guid);
        closeModalAction();
      });
  };

  const handleEditDocument = (values) => {
    return editDocument(
        noticeOfWork.now_application_guid,
        values.mine_document_guid,
        values
      )
      .then(() => {
        fetchApplication(noticeOfWork.now_application_guid);
        closeModalAction();
      });
  };

  const handleDeleteDocument = (applicationGuid, mineDocumentGuid) => {
    deleteDocument(applicationGuid, mineDocumentGuid).then(() => {
      fetchApplication(noticeOfWork.now_application_guid);
    });
  };

  const openAddDocumentModal = () => {
    openModalAction({
      props: {
        onSubmit: handleAddDocument,
        now_application_guid: noticeOfWork.now_application_guid,
        title: "Add Notice of Work document",
        categoriesToShow: props.categoriesToShow,
        isEditMode: false,
        isInCompleteStatus,
      },
      content: modalConfig.EDIT_NOTICE_OF_WORK_DOCUMENT,
    });
  };

  const openEditDocumentModal = (record) => {
    openModalAction({
      props: {
        initialValues: record,
        onSubmit: handleEditDocument,
        now_application_guid: noticeOfWork.now_application_guid,
        title: "Edit Notice of Work document",
        categoriesToShow: props.categoriesToShow,
        isEditMode: true,
        isInCompleteStatus,
      },
      content: modalConfig.EDIT_NOTICE_OF_WORK_DOCUMENT,
    });
  };

  const filtered = noticeOfWorkApplicationDocumentTypeOptions.filter(({ subType, value }) => {
    if (subType && props.categoriesToShow.length > 0) {
      return props.categoriesToShow.includes(subType);
    }
    if (props.categoriesToShow.length > 0) {
      return props.categoriesToShow.includes(String(value));
    }
    return true;
  });

  const categoryFilters = filtered.map((item) => ({
    text: item.label,
    value: item.value,
  }));

  const fileManagementContext = props.enableFileManagement
    ? getFileManagementContext({
      noticeOfWork: noticeOfWork,
      applicationDelay: applicationDelay,
      isViewMode: props.isViewMode,
      userRoles: userRoles,
    })
    : null;

  const transformedDocuments = transformDocuments(
    props.documents,
    props.importNowSubmissionDocumentsJob,
    props.now_application_guid,
    noticeOfWorkApplicationDocumentTypeOptionsHash
  );
  const dataSource = fileManagementContext
    ? transformedDocuments?.map((row) =>
      toFileManagementRow(
        {
          ...row,
          // Documents added in Core are passed in with notForImport, the rest are vFCBC submission documents
          is_imported_submission_document: !row.notForImport,
        },
        fileManagementContext
      )
    )
    : transformedDocuments;

  const refreshApplication = () =>
    fetchApplication(noticeOfWork.now_application_guid);

  const actionsColumn = fileManagementActionsColumn({
    openDocument: openDocumentAction,
    onReplace: (record) =>
      openReplaceFileModal({
        record,
        applicationGuid: noticeOfWork.now_application_guid,
        openModal: openModalAction,
        createNoticeOfWorkDocumentVersion: createDocumentVersion,
        onReplaced: refreshApplication,
      }),
    onArchive: (record) =>
      openArchiveFileModal({
        record,
        applicationGuid: noticeOfWork.now_application_guid,
        conditions: draftPermitAmendment?.conditions,
        openModal: openModalAction,
        closeModal: closeModalAction,
        archiveNoticeOfWorkDocuments: archiveDocuments,
        onArchived: refreshApplication,
      }),
  });

  // Matching on the guids the panel itself lists keeps "tinted here" and "shown in Spatial Files"
  // the same statement, and works for both imported submissions and documents added in Core.
  const spatialFileGuids = new Set(
    (noticeOfWork?.spatial_document_bundles || [])
      .flatMap((bundle) => bundle?.bundle_documents || [])
      .flatMap((document) => [document?.mine_document_guid, document?.document_manager_guid])
      .filter(Boolean)
      .map(String)
  );
  const linksToSpatialFiles = (record) =>
    Boolean(props.onSpatialFileLinkClick) &&
    !isVersionRow(record) &&
    [record?.mine_document_guid, record?.document_manager_guid].some(
      (guid) => guid && spatialFileGuids.has(String(guid))
    );

  const renderDescriptionCaption = (record) =>
    props.showDescription &&
      record.description &&
      record.description !== Strings.EMPTY_FIELD ? (
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {record.description}
      </Typography.Text>
    ) : null;

  const fileNameColumn = props.selectedRows
    ? {
      title: "File Name",
      dataIndex: "filename",
      key: "filename",
      sorter: (a, b) => (a.filename > b.filename ? -1 : 1),
      render: (text, record) => (
        <div title="File Name">
          {text}
          {renderPermitPackageDetailsSummary(
            record,
            props.selectedRows?.selectedSubmissionRows,
            props.packageTitles
          )}
        </div>
      ),
    }
    : {
      title: "File Name",
      onHeaderCell: props.enableFileManagement ? fileNameHeaderCell : undefined,
      dataIndex: "filename",
      key: "filename",
      sorter: (a, b) => (a.filename > b.filename ? -1 : 1),
      render: (text, record) => {
        // Clicking a previous version's file name downloads that version, it can also be viewed from the Actions menu
        if (isVersionRow(record)) {
          return (
            <div
              title="File Name"
              className="inline-flex flex-between file-name-container child"
              style={getFileNameOffset(record)}
            >
              <Button
                type="link"
                className="btn--inline-link"
                onClick={() => downloadFileFromDocumentManager(record)}
              >
                {record.document_name}
              </Button>
              {record.is_original_vfcbc_file && (
                <OriginalVfcbcFileIcon containerClassName="file-history-container" />
              )}
            </div>
          );
        }
        const fileName = (
          <div title="File Name" style={props.enableFileManagement ? getFileNameOffset(record) : {}}>
            <DocumentLink
              documentManagerGuid={record.document_manager_guid}
              documentName={record.filename}
              truncateDocumentName={false}
            />
            {linksToSpatialFiles(record) && (
              <SpatialFilesRowLink onClick={() => props.onSpatialFileLinkClick()} />
            )}
            {renderDescriptionCaption(record)}
          </div>
        );
        return props.enableFileManagement
          ? documentWithTag(record, fileName, "File Name", true)
          : fileName;
      },
    };

  const descriptionColumn = {
    title: "Description",
    dataIndex: "description",
    key: "description",
    sorter: (a, b) => (a.description > b.description ? -1 : 1),
    render: (text) => <div title="Proponent Description">{text}</div>,
  };

  const categoryColumn = {
    title: "Category",
    dataIndex: "category",
    key: "category",
    filters: props.disableCategoryFilter ? null : categoryFilters,
    onFilter: props.disableCategoryFilter
      ? () => { }
      : (value, record) => record.category.includes(value),
    sorter: (a, b) => (a.category > b.category ? -1 : 1),
    render: (text) => <div title="Category">{text}</div>,
  };

  const uploadDateColumn = {
    title: "Date/Time",
    dataIndex: "upload_date",
    key: "upload_date",
    sorter: (a, b) => (moment(a.upload_date) > moment(b.upload_date) ? -1 : 1),
    render: (text, record) => <div title="Due">{formatDateTime(record.upload_date)}</div>,
  };

  const deleteAndEditButtonColumn = {
    title: "",
    dataIndex: "isModificationAllowed",
    key: "isModificationAllowed",
    width: 170,
    render: (isModificationAllowed, record) => {
      if (isVersionRow(record)) {
        return <div />;
      }
      if (!isInCompleteStatus) {
        if (isModificationAllowed) {
          return (
            <NOWActionWrapper
              permission={Permission.EDIT_PERMITS}
              tab={props.isAdminView ? "" : "REV"}
              ignoreDelay
            >
              {!props.isFinalPackageTable && (
                <Popconfirm
                  placement="topLeft"
                  title="Are you sure you want to remove this document?"
                  okText="Delete"
                  cancelText="Cancel"
                  onConfirm={() => {
                    handleDeleteDocument(record.now_application_guid, record.mine_document_guid);
                  }}
                >
                  <Button className="no-margin" ghost type="primary" size="small">
                    <img src={TRASHCAN} alt="Remove document" />
                  </Button>
                </Popconfirm>
              )}
              <Button
                ghost
                type="primary"
                size="small"
                className="no-margin"
                onClick={() => openEditDocumentModal(record)}
              >
                <img src={EDIT_OUTLINE_VIOLET} alt="Edit document" />
              </Button>
            </NOWActionWrapper>
          );
        }
        return (
          <div onClick={(event) => event.stopPropagation()}>
            <NOWActionWrapper
              permission={Permission.EDIT_PERMITS}
              tab={props.isAdminView ? "" : "REV"}
              ignoreDelay
            >
              <Tooltip
                title="You cannot remove a document that is a part of the Final Application, Referral, or Consultation Package."
                placement="right"
                mouseEnterDelay={0.3}
                className="no-margin"
              >
                <Button className="no-margin" ghost type="primary" size="small">
                  <img className="lessOpacity" src={TRASHCAN} alt="Remove document" />
                </Button>
              </Tooltip>
              <Tooltip
                title="You cannot edit a document that is a part of the Final Application, Referral, or Consultation Package."
                placement="right"
                mouseEnterDelay={0.3}
                className="no-margin"
              >
                <Button className="no-margin" ghost type="primary" size="small">
                  <img
                    className="lessOpacity"
                   
                    src={EDIT_OUTLINE_VIOLET}
                    alt="Edit document"
                  />
                </Button>
              </Tooltip>
            </NOWActionWrapper>
          </div>
        );
      }
      return <div />;
    },
  };

  const permitPackageColumn = {
    width: 150,
    title: () => {
      return !isInCompleteStatus ? (
        <div className="inline-flex between">
          <div className="grid">
            <span>Permit</span>
            <span>Package</span>
          </div>
          <PermitPackage isAdminView={props.isAdminView} isTableHeaderView />
        </div>
      ) : (
        <div className="grid">
          <span>Permit</span>
          <span>Package</span>
        </div>
      );
    },
    dataIndex: "is_final_package",
    key: "is_final_package",
    render: (text, record) =>
      isVersionRow(record) ? null : <div title="Part of Permit">{text ? "Yes" : "No"}</div>,
  };

  const consultationPackageColumn = {
    width: 150,
    title: () => {
      return !isInCompleteStatus ? (
        <div className="inline-flex between">
          <div className="grid">
            <span>Consultation</span>
            <span>Package</span>
          </div>
          <ReferralConsultationPackage type="CON" isTableHeaderView />
        </div>
      ) : (
        <div className="grid">
          <span>Consultation</span>
          <span>Package</span>
        </div>
      );
    },
    dataIndex: "is_consultation_package",
    key: "is_consultation_package",
    render: (text, record) =>
      isVersionRow(record) ? null : <div title="Consultation Package">{text ? "Yes" : "No"}</div>,
  };

  const referralPackageColumn = {
    width: 150,
    title: () => {
      return !isInCompleteStatus ? (
        <div className="inline-flex between">
          <div className="grid">
            <span>Referral</span>
            <span>Package</span>
          </div>
          <ReferralConsultationPackage type="REF" isTableHeaderView />
        </div>
      ) : (
        <div className="grid">
          <span>Referral</span>
          <span>Package</span>
        </div>
      );
    },
    dataIndex: "is_referral_package",
    key: "is_referral_package",
    render: (text, record) =>
      isVersionRow(record) ? null : <div title="Referral Package">{text ? "Yes" : "No"}</div>,
  };

  const importStatusColumn = {
    title: "Import Status",
    key: "import_status",
    render: (text, record) => {
      if (isVersionRow(record)) {
        return null;
      }
      let statusBadgeType: BadgeProps["status"] = "warning";
      let statusText = "Not Started";
      let error = null;

      if (record.notForImport) {
        statusText = "N/A";
        statusBadgeType = "success";
      } else if (record.mine_document_guid) {
        statusBadgeType = "success";
        statusText = "Success";
      } else if (record.importNowSubmissionDocument) {
        if (record.importNowSubmissionDocument.error) {
          // eslint-disable-next-line prefer-destructuring
          error = record.importNowSubmissionDocument.error;
          statusBadgeType = "error";
          statusText = "Error";
        } else {
          statusBadgeType = "processing";
          statusText = "In Progress";
        }
      }

      return (
        <Tooltip title={error || null} placement="right">
          <div title="Import Status" style={{ minWidth: 100 }}>
            <Badge status={statusBadgeType} text={statusText} />
          </div>
        </Tooltip>
      );
    },
  };

  const postApprovalDocumentColumn = {
    title: "",
    key: "post_approval_document",
    render: (text, record) => {
      let isPostDecision = false;
      if (
        !isVersionRow(record) &&
        isInCompleteStatus &&
        moment(record.upload_date, "YYYY-MM-DD") >
        moment(noticeOfWork.decision_by_user_date, "YYYY-MM-DD")
      ) {
        isPostDecision = true;
      }
      return (
        isPostDecision && (
          <Tooltip
            title="This is a post-decision document."
            placement="right"
            mouseEnterDelay={0.3}
          >
            <FlagOutlined />
          </Tooltip>
        )
      );
    },
  };

  let columns: any[] = [categoryColumn, fileNameColumn];

  if (isInCompleteStatus) {
    columns = [...columns, postApprovalDocumentColumn];
  }

  columns = [
    ...columns,
    deleteAndEditButtonColumn,
    referralPackageColumn,
    consultationPackageColumn,
    permitPackageColumn,
  ];

  if (!props.hideImportStatusColumn) {
    columns = [...columns, importStatusColumn];
  }

  if (props.enableFileManagement) {
    columns = [...columns, actionsColumn];
  }

  if (props.isPackageModal) {
    const packageColumnProps = {
      selectedKeys: props.selectedRows?.selectedSubmissionRows,
      lockedRowKeys: props.lockedRowKeys,
      packageTitles: props.packageTitles,
    };
    const titleColumns = props.packageTitles
      ? [
        renderPermitPackageTitleColumn(packageColumnProps),
        ...(props.packageTitles.showTypeSelector
          ? [renderPermitPackageTypeColumn(packageColumnProps)]
          : []),
      ]
      : [];
    columns = [
      fileNameColumn,
      ...titleColumns,
      categoryColumn,
      descriptionColumn,
      uploadDateColumn,
    ];
  }

  const renderImportJobStatus = () => {
    const importJobExists = !isEmpty(props.importNowSubmissionDocumentsJob);

    const jobStatus = importJobExists
      ? props.importNowSubmissionDocumentsJob.import_now_submission_documents_job_status_code
      : null;

    const jobStartTime = importJobExists
      ? props.importNowSubmissionDocumentsJob.start_timestamp
      : null;
    const jobEndTime = importJobExists ? props.importNowSubmissionDocumentsJob.end_timestamp : null;
    let jobStatusDescription = "Not Applicable";
    let jobStatusMessage =
      "An import job will be started once the Notice of Work has been verified.";
    if (jobStatus === "NOT") {
      jobStatusDescription = "Not Started";
      jobStatusMessage = "An import job has been created but hasn't started.";
    } else if (jobStatus === "SUC") {
      jobStatusDescription = "Success";
      jobStatusMessage = "All submission documents have been successfully imported into Core.";
    } else if (jobStatus === "FAI") {
      jobStatusDescription = "Failure";
      jobStatusMessage = `The import job has failed. The next attempt will be performed on ${formatDateTime(
        props.importNowSubmissionDocumentsJob.next_attempt_timestamp
      )}.`;
    } else if (jobStatus === "INP") {
      jobStatusDescription = "In Progress";
      jobStatusMessage = "An import job is currently in progress.";
    } else if (jobStatus === "DEL") {
      jobStatusDescription = "Delayed";
      jobStatusMessage = `The previous attempt to import the remaining documents failed. The next attempt will be performed on ${formatDateTime(
        props.importNowSubmissionDocumentsJob.next_attempt_timestamp
      )}.`;
    }
    const importDocuments =
      importJobExists &&
        !isEmpty(props.importNowSubmissionDocumentsJob.import_now_submission_documents)
        ? props.importNowSubmissionDocumentsJob.import_now_submission_documents
        : [];
    const amountToImport = importDocuments.length;
    const amountImported = importDocuments.filter((doc) => doc.document_id).length;

    const triggerImportJob = () => {
      setIsLoaded(false);
      return createImportJob(props.now_application_guid)
        .then(() =>
          new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
            fetchImportJob(props.now_application_guid)
          )
        )
        .finally(() => setIsLoaded(true));
    };

    const ReimportButton = () => (
      <AuthorizationWrapper permission={Permission.ADMIN}>
        <Button
          icon={<ReloadOutlined />}
          style={{ float: "right", marginTop: 0 }}
          onClick={triggerImportJob}
          loading={!isLoaded}
        >
          Reimport
        </Button>
      </AuthorizationWrapper>
    );

    return (
      <div
        style={{
          display: "inline-block",
          backgroundColor: "#f4f0f0",
          padding: 16,
          borderRadius: 5,
          marginBottom: 24,
          marginTop: 12,
        }}
      >
        <p style={{ fontWeight: "bold" }}>
          <ImportOutlined style={{ marginRight: 8 }} />
          Submission Documents Import Job
          <ReimportButton />
        </p>
        <div style={{ marginLeft: 24 }}>
          <p>{jobStatusMessage}</p>
          <p>
            <b>Status: </b>
            {jobStatusDescription}
            <br />
            <b>Start time: </b>
            {jobStartTime ? formatDateTime(jobStartTime) : Strings.EMPTY_FIELD}
            <br />
            <b>End time: </b>
            {jobEndTime ? formatDateTime(jobEndTime) : Strings.EMPTY_FIELD}
            <br />
            <b>Progress: </b>
            {importJobExists ? `${amountImported}/${amountToImport} imported` : Strings.EMPTY_FIELD}
            <br />
            <b>Attempt: </b>
            {importJobExists ? props.importNowSubmissionDocumentsJob.attempt : Strings.EMPTY_FIELD}
            <br />
          </p>
        </div>
      </div>
    );
  };

  const showDownloadAll = props.enableFileManagement && !props.selectedRows && !props.isPackageModal;
  const addDocumentButton = !props.selectedRows && !props.isViewMode && !props.isPackageModal && (
    <NOWActionWrapper
      permission={Permission.EDIT_PERMITS}
      tab={props.isAdminView ? "" : "REV"}
      allowAfterProcess={props.allowAfterProcess}
      ignoreDelay
    >
      <AddButton
        // Sits beside Download All when it's shown, otherwise in its usual spot
        className={showDownloadAll ? undefined : "position-right"}
        disabled={props.isViewMode}
        style={props.isAdminView && !showDownloadAll ? { marginRight: "100px" } : {}}
        onClick={openAddDocumentModal}
      >
        Add Document
      </AddButton>
    </NOWActionWrapper>
  );

  return (
    <div>
      {!props.hideJobStatusColumn && !props.isPackageModal && renderImportJobStatus()}
      {props.preTableContent}
      <Row className="inline-flex between">
        <Col span={16}>{props.displayTableDescription && <p>{props.tableDescription}</p>}</Col>
        <Col span={6}>
          {showDownloadAll ? (
            <div className="now-table-header-actions">
              <NOWDownloadAllButton
                rows={dataSource ?? []}
                mineGuid={noticeOfWork.mine_guid}
                documentType="application-documents"
              />
              {addDocumentButton}
            </div>
          ) : (
            addDocumentButton
          )}
        </Col>
      </Row>
      <br />
      <CoreTable
        columns={columns}
        dataSource={dataSource}
        rowKey={
          props.enableFileManagement
            ? (record: IFileManagementRecord) => record.mine_document_version_guid ?? record.key
            : "key"
        }
        expandProps={
          props.enableFileManagement
            ? {
              childrenColumnName: "versions",
              matchChildColumnsToParent: true,
              recordDescription: "version history",
              rowExpandable: (record) => record.number_prev_versions > 0,
              // Show the expand icon beside the file name, wherever it sits in the table
              expandIconColumnIndex: columns.findIndex((column) => column.key === "filename"),
            }
            : props.isPackageModal
              ? getPermitPackageExpandProps({
                selectedKeys: props.selectedRows?.selectedSubmissionRows,
                lockedRowKeys: props.lockedRowKeys,
                packageTitles: props.packageTitles,
              })
              : null
        }
        rowClassName={(record) =>
          [
            props.enableFileManagement && FILE_MANAGEMENT_ROW_CLASS,
            "fade-in",
            linksToSpatialFiles(record) && "spatial-file-row",
          ]
            .filter(Boolean)
            .join(" ")
        }
        rowSelection={
          props.selectedRows
            ? {
              selectedRowKeys: props.selectedRows.selectedSubmissionRows,
              onChange: (selectedRowKeys) => {
                props.selectedRows.setSelectedSubmissionRows(selectedRowKeys as string[]);
              },
              getCheckboxProps: (record) => ({
                disabled:
                  !record?.mine_document_guid ||
                  props.lockedRowKeys?.includes(record.mine_document_guid),
              }),
            }
            : null
        }
      />
    </div>
  );
};

export default NOWSubmissionDocuments;
