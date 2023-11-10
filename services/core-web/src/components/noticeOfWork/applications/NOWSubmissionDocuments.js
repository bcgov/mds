import React, { useState } from "react";
import moment from "moment";
import { PropTypes } from "prop-types";
import { Badge, Tooltip, Button, Popconfirm, Row, Col, Descriptions } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { ImportOutlined, ReloadOutlined, FlagOutlined } from "@ant-design/icons";
import { formatDateTime } from "@common/utils/helpers";
import { isEmpty } from "lodash";
import CustomPropTypes from "@/customPropTypes";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Strings from "@common/constants/strings";
import DocumentLink from "@/components/common/DocumentLink";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { getNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import {
  createNoticeOfWorkApplicationImportSubmissionDocumentsJob,
  fetchImportNoticeOfWorkSubmissionDocumentsJob,
  fetchImportedNoticeOfWorkApplication,
  updateNoticeOfWorkApplication,
  deleteNoticeOfWorkApplicationDocument,
  editNoticeOfWorkDocument,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import {
  getNoticeOfWorkApplicationDocumentTypeOptionsHash,
  getDropdownNoticeOfWorkApplicationDocumentTypeOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import AddButton from "@/components/common/buttons/AddButton";
import ReferralConsultationPackage from "@/components/noticeOfWork/applications/referals/ReferralConsultationPackage";
import PermitPackage from "@/components/noticeOfWork/applications/PermitPackage";
import CoreTable from "@/components/common/CoreTable";

const propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  now_application_guid: PropTypes.string.isRequired,
  createNoticeOfWorkApplicationImportSubmissionDocumentsJob: PropTypes.func.isRequired,
  fetchImportNoticeOfWorkSubmissionDocumentsJob: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  noticeOfWorkApplicationDocumentTypeOptionsHash: PropTypes.objectOf(PropTypes.any).isRequired,
  noticeOfWorkApplicationDocumentTypeOptions: PropTypes.objectOf(PropTypes.any).isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  editNoticeOfWorkDocument: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  deleteNoticeOfWorkApplicationDocument: PropTypes.func.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  documents: PropTypes.arrayOf(PropTypes.any),
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  selectedRows: PropTypes.objectOf(PropTypes.any),
  categoriesToShow: PropTypes.arrayOf(PropTypes.string),
  displayTableDescription: PropTypes.bool,
  tableDescription: PropTypes.string,
  hideImportStatusColumn: PropTypes.bool,
  disableCategoryFilter: PropTypes.bool,
  hideJobStatusColumn: PropTypes.bool,
  showDescription: PropTypes.bool,
  allowAfterProcess: PropTypes.bool,
  // eslint-disable-next-line react/no-unused-prop-types
  isFinalPackageTable: PropTypes.bool,
  isAdminView: PropTypes.bool,
  isPackageModal: PropTypes.bool,
};

const defaultProps = {
  selectedRows: null,
  importNowSubmissionDocumentsJob: {},
  categoriesToShow: [],
  documents: [],
  tableDescription: null,
  displayTableDescription: false,
  hideImportStatusColumn: false,
  disableCategoryFilter: false,
  hideJobStatusColumn: false,
  showDescription: false,
  allowAfterProcess: false,
  isFinalPackageTable: false,
  isAdminView: false,
  isPackageModal: false,
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
      category: document.is_imported_submission
        ? document.category
        : (props.noticeOfWorkApplicationDocumentTypeOptionsHash &&
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
      upload_date: document?.mine_document?.upload_date,
      ...document,
    };
  });

export const NOWSubmissionDocuments = (props) => {
  const [isLoaded, setIsLoaded] = useState(true);
  const isInCompleteStatus =
    props.noticeOfWork.now_application_status_code === "AIA" ||
    props.noticeOfWork.now_application_status_code === "WDN" ||
    props.noticeOfWork.now_application_status_code === "REJ" ||
    props.noticeOfWork.now_application_status_code === "NPR";

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
        isInCompleteStatus,
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
        isInCompleteStatus,
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
    width: 170,
    render: (isModificationAllowed, record) => {
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
                    <img name="remove" src={TRASHCAN} alt="Remove document" />
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
                <img name="remove" src={EDIT_OUTLINE_VIOLET} alt="Edit document" />
              </Button>
            </NOWActionWrapper>
          );
        }
        return (
          <div disabled onClick={(event) => event.stopPropagation()}>
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
                  <img className="lessOpacity" name="remove" src={TRASHCAN} alt="Remove document" />
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
    render: (text) => <div title="Part of Permit">{text ? "Yes" : "No"}</div>,
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
    render: (text) => <div title="Consultation Package">{text ? "Yes" : "No"}</div>,
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

  const postApprovalDocumentColumn = {
    title: "",
    key: "post_approval_document",
    render: (text, record) => {
      let isPostDecision = false;
      if (
        isInCompleteStatus &&
        moment(record.upload_date, "YYYY-MM-DD") >
          moment(props.noticeOfWork.decision_by_user_date, "YYYY-MM-DD")
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

  let columns = [categoryColumn, fileNameColumn];

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

  if (props.isPackageModal) {
    columns = [fileNameColumn, categoryColumn, descriptionColumn, uploadDateColumn];
  }

  const dataSource = transformDocuments(
    props.documents,
    props.importNowSubmissionDocumentsJob,
    props.now_application_guid,
    props
  );

  const docDescription = (record) => {
    return (
      <Descriptions column={1}>
        <Descriptions.Item label="Description">{record.description}</Descriptions.Item>
      </Descriptions>
    );
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
      {!props.hideJobStatusColumn && !props.isPackageModal && renderImportJobStatus()}
      <Row className="inline-flex between">
        <Col span={16}>{props.displayTableDescription && <p>{props.tableDescription}</p>}</Col>
        <Col span={6}>
          {!props.selectedRows && !props.isViewMode && !props.isPackageModal && (
            <NOWActionWrapper
              permission={Permission.EDIT_PERMITS}
              tab={props.isAdminView ? "" : "REV"}
              allowAfterProcess={props.allowAfterProcess}
              ignoreDelay
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
      <CoreTable
        columns={columns}
        dataSource={dataSource}
        expandProps={{
          rowKey: (record) => record.key + "description",
          recordDescription: "document details",
          expandedRowRender: props.showDescription ? docDescription : undefined,
          rowExpandable: (record) => props.showDescription && record.description,
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
    },
    dispatch
  );

NOWSubmissionDocuments.propTypes = propTypes;
NOWSubmissionDocuments.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(NOWSubmissionDocuments);
