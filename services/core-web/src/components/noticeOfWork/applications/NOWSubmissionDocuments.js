import React, { useState } from "react";
import { PropTypes } from "prop-types";
import { Table, Badge, Tooltip, Button, Popconfirm, Row, Col } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  ImportOutlined,
  ReloadOutlined,
  MinusSquareFilled,
  PlusSquareFilled,
} from "@ant-design/icons";
import { formatDateTime } from "@common/utils/helpers";
import { isEmpty } from "lodash";
import CustomPropTypes from "@/customPropTypes";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import { openDocument } from "@/components/syncfusion/DocumentViewer";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Strings from "@common/constants/strings";
import DocumentLink from "@/components/common/DocumentLink";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";
import {
  createNoticeOfWorkApplicationImportSubmissionDocumentsJob,
  fetchImportNoticeOfWorkSubmissionDocumentsJob,
  fetchImportedNoticeOfWorkApplication,
  updateNoticeOfWorkApplication,
  deleteNoticeOfWorkApplicationDocument,
  editNoticeOfWorkDocument,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import {
  getNoticeOfWorkApplicationDocumentTypeOptionsHash,
  getDropdownNoticeOfWorkApplicationDocumentTypeOptions,
} from "@common/selectors/staticContentSelectors";
import { EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import AddButton from "@/components/common/AddButton";
import ReferralConsultationPackage from "@/components/noticeOfWork/applications/referals/ReferralConsultationPackage";
import PermitPackage from "@/components/noticeOfWork/applications/PermitPackage";

const propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  now_application_guid: PropTypes.string.isRequired,
  openDocument: PropTypes.func.isRequired,
  createNoticeOfWorkApplicationImportSubmissionDocumentsJob: PropTypes.func.isRequired,
  fetchImportNoticeOfWorkSubmissionDocumentsJob: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  noticeOfWorkApplicationDocumentTypeOptionsHash: PropTypes.objectOf(PropTypes.any).isRequired,
  noticeOfWorkApplicationDocumentTypeOptions: PropTypes.objectOf(PropTypes.any).isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  editNoticeOfWorkDocument: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  deleteNoticeOfWorkApplicationDocument: PropTypes.func.isRequired,
  documents: PropTypes.arrayOf(PropTypes.any),
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  selectedRows: PropTypes.objectOf(PropTypes.any),
  categoriesToShow: PropTypes.arrayOf(PropTypes.string),
  displayTableDescription: PropTypes.bool,
  tableDescription: PropTypes.string,
  hideImportStatusColumn: PropTypes.bool,
  hideJobStatusColumn: PropTypes.bool,
  showPreambleFileMetadata: PropTypes.bool,
  editPreambleFileMetadata: PropTypes.bool,
  showDescription: PropTypes.bool,
  allowAfterProcess: PropTypes.bool,
  isFinalPackageTable: PropTypes.bool,
};

const defaultProps = {
  selectedRows: null,
  importNowSubmissionDocumentsJob: {},
  categoriesToShow: [],
  documents: [],
  tableDescription: null,
  displayTableDescription: false,
  hideImportStatusColumn: false,
  hideJobStatusColumn: false,
  showPreambleFileMetadata: false,
  editPreambleFileMetadata: false,
  showDescription: false,
  allowAfterProcess: false,
  isFinalPackageTable: false,
};

const transformDocuments = (
  documents,
  importNowSubmissionDocumentsJob,
  now_application_guid,
  props
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
      filename: document.filename || Strings.EMPTY_FIELD,
      url: document.documenturl,
      category:
        (props.noticeOfWorkApplicationDocumentTypeOptionsHash &&
          props.noticeOfWorkApplicationDocumentTypeOptionsHash[
            document.now_application_document_type_code
          ]) ||
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
      ...document,
    };
  });

export const RenderNowDocumentsTableExpandIcon = (rowProps) => (
  <div>
    {rowProps.expanded ? (
      <Tooltip title="Click to hide amendment history." placement="right" mouseEnterDelay={1}>
        <MinusSquareFilled className="icon-lg--lightgrey" />
      </Tooltip>
    ) : (
      <Tooltip title="Click to view amendment history." placement="right" mouseEnterDelay={1}>
        <PlusSquareFilled className="icon-lg--lightgrey" />
      </Tooltip>
    )}
  </div>
);

export const NOWSubmissionDocuments = (props) => {
  const [isLoaded, setIsLoaded] = useState(true);

  const handleAddDocument = (values) => {
    const documents = values.uploadedFiles.map((file) => {
      return {
        now_application_document_type_code: values.now_application_document_type_code,
        description: values.description,
        is_final_package: values.is_final_package,
        preamble_title: values?.preamble_title,
        preamble_author: values?.preamble_author,
        mine_document: {
          document_manager_guid: file[0],
          document_name: file[1],
          mine_guid: props.noticeOfWork.mine_guid,
        },
      };
    });
    return props
      .updateNoticeOfWorkApplication(
        { documents },
        props.noticeOfWork.now_application_guid,
        "Successfully added documents to this application."
      )
      .then(() => {
        props.fetchImportedNoticeOfWorkApplication(props.noticeOfWork.now_application_guid);
        props.closeModal();
      });
  };

  const handleEditDocument = (values) => {
    console.log(values);
    return props
      .editNoticeOfWorkDocument(
        props.noticeOfWork.now_application_guid,
        values.mine_document_guid,
        values
      )
      .then(() => {
        props.fetchImportedNoticeOfWorkApplication(props.noticeOfWork.now_application_guid);
        props.closeModal();
      });
  };

  const handleDeleteDocument = (applicationGuid, mineDocumentGuid) => {
    props.deleteNoticeOfWorkApplicationDocument(applicationGuid, mineDocumentGuid).then(() => {
      props.fetchImportedNoticeOfWorkApplication(props.noticeOfWork.now_application_guid);
    });
  };

  const openAddDocumentModal = () => {
    props.openModal({
      props: {
        onSubmit: handleAddDocument,
        now_application_guid: props.noticeOfWork.now_application_guid,
        title: "Add Notice of Work document",
        categoriesToShow: props.categoriesToShow,
        isEditMode: false,
      },
      content: modalConfig.EDIT_NOTICE_OF_WORK_DOCUMENT,
    });
  };

  const openEditDocumentModal = (record) => {
    props.openModal({
      props: {
        initialValues: record,
        onSubmit: handleEditDocument,
        now_application_guid: props.noticeOfWork.now_application_guid,
        title: "Edit Notice of Work document",
        categoriesToShow: props.categoriesToShow,
        isEditMode: true,
      },
      content: modalConfig.EDIT_NOTICE_OF_WORK_DOCUMENT,
    });
  };

  const filtered = props.noticeOfWorkApplicationDocumentTypeOptions.filter(({ subType, value }) => {
    if (subType && props.categoriesToShow.length > 0) {
      return props.categoriesToShow.includes(subType);
    }
    if (props.categoriesToShow.length > 0) {
      return props.categoriesToShow.includes(value);
    }
    return true;
  });

  const categoryFilters = filtered.map((item) => ({
    text: item.label,
    value: item.value,
  }));

  const fileNameColumn = props.selectedRows
    ? {
        title: "File Name",
        dataIndex: "filename",
        key: "filename",
        sorter: (a, b) => (a.filename > b.filename ? -1 : 1),
        render: (text) => <div title="File Name">{text}</div>,
      }
    : {
        title: "File Name",
        dataIndex: "filename",
        key: "filename",
        sorter: (a, b) => (a.filename > b.filename ? -1 : 1),
        render: (text, record) => (
          <div title="File Name">
            <DocumentLink
              documentManagerGuid={record.document_manager_guid}
              documentName={record.filename}
              truncateDocumentName={false}
            />
          </div>
        ),
      };

  const descriptionColumn = {
    title: "Description",
    dataIndex: "description",
    key: "description",
    sorter: (a, b) => (a.description > b.description ? -1 : 1),
    render: (text) => <div title="Proponent Description">{text}</div>,
  };

  const fileMetadataColumns = [
    {
      title: "Title",
      dataIndex: "preamble_title",
      key: "preamble_title",
      render: (text, record) => <div title="Title">{record.preamble_title}</div>,
    },
    {
      title: "Author",
      dataIndex: "preamble_author",
      key: "preamble_author",
      render: (text, record) => <div title="Author">{record.preamble_author}</div>,
    },
    {
      title: "Date",
      dataIndex: "preamble_date",
      key: "preamble_date",
      render: (text, record) => <div title="Date">{record.preamble_date || "N/A"}</div>,
    },
  ];

  const categoryColumn = {
    title: "Category",
    dataIndex: "category",
    key: "category",
    filters: props.disableCategoryFilter ? null : categoryFilters,
    onFilter: props.disableCategoryFilter
      ? () => {}
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
    render: (isModificationAllowed, record) => {
      if (!(props.noticeOfWork.now_application_status_code === "AIA")) {
        if (isModificationAllowed) {
          return (
            <NOWActionWrapper
              permission={Permission.EDIT_PERMITS}
              tab={props.isAdminView ? "" : "REV"}
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
                  <Button ghost type="primary" size="small">
                    <img name="remove" src={TRASHCAN} alt="Remove document" />
                  </Button>
                </Popconfirm>
              )}
              <Button
                ghost
                type="primary"
                size="small"
                onClick={() => openEditDocumentModal(record)}
              >
                <img name="remove" src={EDIT_OUTLINE_VIOLET} alt="Edit document" />
              </Button>
            </NOWActionWrapper>
          );
        }
        return (
          /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
          <div disabled onClick={(event) => event.stopPropagation()}>
            <NOWActionWrapper
              permission={Permission.EDIT_PERMITS}
              tab={props.isAdminView ? "" : "REV"}
            >
              <Tooltip
                title="You cannot remove a document that is a part of the Final Application, Referral, or Consultation Package."
                placement="right"
                mouseEnterDelay={0.3}
              >
                <Button ghost type="primary" disabled size="small">
                  <img className="lessOpacity" name="remove" src={TRASHCAN} alt="Remove document" />
                </Button>
              </Tooltip>
              <Tooltip
                title="You cannot edit a document that is a part of the Final Application, Referral, or Consultation Package."
                placement="right"
                mouseEnterDelay={0.3}
              >
                <Button ghost type="primary" disabled size="small">
                  <img
                    className="lessOpacity"
                    name="remove"
                    src={EDIT_OUTLINE_VIOLET}
                    alt="Edit document"
                  />
                </Button>
              </Tooltip>
            </NOWActionWrapper>
          </div>
        );
      }
    },
  };

  const permitPackageColumn = {
    title: () => {
      return !(props.noticeOfWork.now_application_status_code === "AIA") ? (
        <div>
          Permit Package
          <PermitPackage isAdminView={props.isAdminView} isTableHeaderView />
        </div>
      ) : (
        <div>Permit Package</div>
      );
    },
    dataIndex: "is_final_package",
    key: "is_final_package",
    render: (text) => <div title="Part of Permit">{text ? "Yes" : "No"}</div>,
  };

  const consultationPackageColumn = {
    title: () => {
      return !(props.noticeOfWork.now_application_status_code === "AIA") ? (
        <div>
          Consultation Package
          <ReferralConsultationPackage type="CON" isTableHeaderView />
        </div>
      ) : (
        <div>Consultation Package</div>
      );
    },
    dataIndex: "is_consultation_package",
    key: "is_consultation_package",
    render: (text) => <div title="Consultation Package">{text ? "Yes" : "No"}</div>,
  };

  const referralPackageColumn = {
    title: () => {
      return !(props.noticeOfWork.now_application_status_code === "AIA") ? (
        <div>
          Referral Package
          <ReferralConsultationPackage type="REF" isTableHeaderView />
        </div>
      ) : (
        <div>Referral Package</div>
      );
    },
    dataIndex: "is_referral_package",
    key: "is_referral_package",
    render: (text) => <div title="Referral Package">{text ? "Yes" : "No"}</div>,
  };

  const importStatusColumn = {
    title: "Import Status",
    key: "import_status",
    render: (text, record) => {
      let statusBadgeType = "warning";
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

  let columns = [...fileMetadataColumns, categoryColumn, fileNameColumn];

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

  const dataSource = transformDocuments(
    props.documents,
    props.importNowSubmissionDocumentsJob,
    props.now_application_guid,
    props
  );

  const docDescription = (record) => {
    return <p>{record.description || Strings.EMPTY_FIELD}</p>;
  };

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
      return props
        .createNoticeOfWorkApplicationImportSubmissionDocumentsJob(props.now_application_guid)
        .then(() =>
          new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
            props.fetchImportNoticeOfWorkSubmissionDocumentsJob(props.now_application_guid)
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

  return (
    <div>
      {!props.hideJobStatusColumn && renderImportJobStatus()}
      <Row className="inline-flex between">
        <Col span={16}>{props.displayTableDescription && <p>{props.tableDescription}</p>}</Col>
        <Col span={6}>
          {!props.selectedRows && !props.isViewMode && (
            <NOWActionWrapper
              permission={Permission.EDIT_PERMITS}
              tab={props.isAdminView ? "" : "REV"}
              allowAfterProcess={props.allowAfterProcess}
            >
              <AddButton
                className="position-right"
                disabled={props.isViewMode}
                style={props.isAdminView ? { marginRight: "100px" } : {}}
                onClick={openAddDocumentModal}
              >
                Add Document
              </AddButton>
            </NOWActionWrapper>
          )}
        </Col>
      </Row>
      <br />
      <Table
        align="left"
        pagination={false}
        columns={columns}
        dataSource={dataSource}
        locale={{
          emptyText: "No Data Yet",
        }}
        rowSelection={
          props.selectedRows
            ? {
                selectedRowKeys: props.selectedRows.selectedSubmissionRows,
                onChange: (selectedRowKeys) => {
                  props.selectedRows.setSelectedSubmissionRows(selectedRowKeys);
                },
                getCheckboxProps: (record) => ({
                  disabled: record && !record.mine_document_guid,
                }),
              }
            : null
        }
        expandIcon={props.showDescription ? RenderNowDocumentsTableExpandIcon : undefined}
        expandRowByClick={props.showDescription}
        expandedRowRender={props.showDescription ? docDescription : undefined}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  noticeOfWorkApplicationDocumentTypeOptions: getDropdownNoticeOfWorkApplicationDocumentTypeOptions(
    state
  ),
  noticeOfWorkApplicationDocumentTypeOptionsHash: getNoticeOfWorkApplicationDocumentTypeOptionsHash(
    state
  ),
  noticeOfWork: getNoticeOfWork(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      deleteNoticeOfWorkApplicationDocument,
      editNoticeOfWorkDocument,
      createNoticeOfWorkApplicationImportSubmissionDocumentsJob,
      fetchImportNoticeOfWorkSubmissionDocumentsJob,
      openDocument,
    },
    dispatch
  );

NOWSubmissionDocuments.propTypes = propTypes;
NOWSubmissionDocuments.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(NOWSubmissionDocuments);
