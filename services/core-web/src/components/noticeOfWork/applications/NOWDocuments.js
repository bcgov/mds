import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isEmpty } from "lodash";
import { PropTypes } from "prop-types";
import { Button, Popconfirm, Tooltip, Row, Col, Typography } from "antd";
import moment from "moment";
import {
  DownloadOutlined,
  FileOutlined,
  FlagOutlined,
  InboxOutlined,
  MenuOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import CustomPropTypes from "@/customPropTypes";
import { formatDate, formatDateTime } from "@mds/common/redux/utils/helpers";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  getNoticeOfWorkApplicationDocumentTypeOptionsHash,
  getDropdownNoticeOfWorkApplicationDocumentTypeOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import {
  getNoticeOfWork,
  getApplicationDelay,
} from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { getDraftPermitAmendmentForNOW } from "@mds/common/redux/selectors/permitSelectors";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import {
  comparePermitPackageDocuments,
  getPermitPackageOrderLabel,
  isFileReferencedInConditions,
} from "@mds/common/utils/permitPackageDocuments";
import {
  fetchImportedNoticeOfWorkApplication,
  updateNoticeOfWorkApplication,
  deleteNoticeOfWorkApplicationDocument,
  editNoticeOfWorkDocument,
  sortNoticeOfWorkDocuments,
  createNoticeOfWorkDocumentVersion,
  archiveNoticeOfWorkDocuments,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { NOTICE_OF_WORK_DOCUMENT_VERSION_UPLOAD } from "@mds/common/constants/API";
import { FileOperations, NoWApplicationDocument } from "@mds/common/models/documents/document";
import { renderActionsColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { documentWithTag } from "@mds/common/components/documents/DocumentColumns";
import ReplaceDocumentModal from "@mds/common/components/documents/ReplaceDocumentModal";
import ArchiveDocumentModal from "@mds/common/components/documents/ArchiveDocumentModal";
import { openDocument } from "@mds/common/components/syncfusion/DocumentViewer";
import { downloadFileFromDocumentManager } from "@mds/common/redux/utils/actionlessNetworkCalls";
import * as Strings from "@mds/common/constants/strings";
import DocumentLink from "@mds/common/components/documents/DocumentLink";
import AddButton from "@/components/common/buttons/AddButton";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import { EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import ReferralConsultationPackage from "@/components/noticeOfWork/applications/referals/ReferralConsultationPackage";
import PermitPackage from "@/components/noticeOfWork/applications/PermitPackage";
import { sortableContainer, sortableElement, sortableHandle } from "react-sortable-hoc";
import arrayMove from "array-move";
import CoreTable from "@mds/common/components/common/CoreTable";

const DragHandle = sortableHandle(() => <MenuOutlined style={{ cursor: "grab", color: "#999" }} />);

const propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  documents: PropTypes.arrayOf(PropTypes.any).isRequired,
  noticeOfWorkApplicationDocumentTypeOptionsHash: PropTypes.objectOf(PropTypes.any).isRequired,
  noticeOfWorkApplicationDocumentTypeOptions: PropTypes.objectOf(PropTypes.any).isRequired,
  isViewMode: PropTypes.bool.isRequired,
  selectedRows: PropTypes.objectOf(PropTypes.any),
  categoriesToShow: PropTypes.arrayOf(PropTypes.string),
  disclaimerText: PropTypes.string,
  isAdminView: PropTypes.bool,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  editNoticeOfWorkDocument: PropTypes.func.isRequired,
  sortNoticeOfWorkDocuments: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  deleteNoticeOfWorkApplicationDocument: PropTypes.func.isRequired,
  allowAfterProcess: PropTypes.bool,
  disableCategoryFilter: PropTypes.bool,
  isStandardDocuments: PropTypes.bool,
  isFinalPackageTable: PropTypes.bool,
  isRefConDocuments: PropTypes.bool,
  isPackageModal: PropTypes.bool,
  isSortingAllowed: PropTypes.bool,
  showDescription: PropTypes.bool,
  lockedRowKeys: PropTypes.arrayOf(PropTypes.string),
  applicationDelay: PropTypes.objectOf(PropTypes.string).isRequired,
  draftPermitAmendment: PropTypes.objectOf(PropTypes.any),
  showOrderColumn: PropTypes.bool,
  documentNumberFormat: PropTypes.oneOf(["decimal", "whole"]),
  enableFileManagement: PropTypes.bool,
  userRoles: PropTypes.arrayOf(PropTypes.string),
  createNoticeOfWorkDocumentVersion: PropTypes.func.isRequired,
  archiveNoticeOfWorkDocuments: PropTypes.func.isRequired,
  openDocument: PropTypes.func.isRequired,
};

const defaultProps = {
  selectedRows: null,
  categoriesToShow: [],
  draftPermitAmendment: null,
  disclaimerText: "",
  isAdminView: false,
  allowAfterProcess: false,
  disableCategoryFilter: false,
  isFinalPackageTable: false,
  isStandardDocuments: false,
  isRefConDocuments: false,
  isPackageModal: false,
  isSortingAllowed: false,
  showDescription: false,
  lockedRowKeys: [],
  documentNumberFormat: "decimal",
  showOrderColumn: false,
  enableFileManagement: false,
  userRoles: [],
};

// Previous versions of a file are shown as child rows of the current one
const isVersionRow = (record) => Boolean(record.mine_document_version_guid);

// Wraps a table row in a NoWApplicationDocument, which works out the row's allowed actions and its version rows
const toFileManagementRow = (row, fileManagementContext) =>
  Object.assign(
    // document_name uses the row's filename, which falls back to a placeholder when the file has no name
    new NoWApplicationDocument({
      ...row,
      ...row.mine_document,
      document_name: row.filename,
      ...fileManagementContext,
    }),
    row
  );

const transformDocuments = (
  documents,
  now_application_guid,
  noticeOfWorkApplicationDocumentTypeOptionsHash,
  isFinalPackageTable,
  fileManagementContext = null
) =>
  documents &&
  documents
    .sort(comparePermitPackageDocuments)
    .map((document, index) => ({
      key: document.now_application_document_xref_guid,
      now_application_document_xref_guid: document.now_application_document_xref_guid,
      mine_document_guid: document.mine_document.mine_document_guid,
      now_application_guid,
      filename: document.mine_document.document_name || Strings.EMPTY_FIELD,
      document_manager_guid: document.mine_document.document_manager_guid,
      upload_date: document.mine_document.upload_date,
      category:
        (noticeOfWorkApplicationDocumentTypeOptionsHash &&
          noticeOfWorkApplicationDocumentTypeOptionsHash[
          document.now_application_document_type_code
          ]) ||
        document.documenttype ||
        Strings.EMPTY_FIELD,
      description: document.description || Strings.EMPTY_FIELD,
      is_final_package: document.is_final_package || false,
      is_referral_package: document.is_referral_package || false,
      is_consultation_package: document.is_consultation_package || false,
      isModificationAllowed:
        (!document.is_final_package &&
          !document.is_referral_package &&
          !document.is_consultation_package) ||
        isFinalPackageTable,
      index,
      ...document,
    }))
    .map((row) => (fileManagementContext ? toFileManagementRow(row, fileManagementContext) : row));

const SortableItem = sortableElement((props) => <tr {...props} />);
const SortableContainer = sortableContainer((props) => <tbody {...props} />);

export class NOWDocuments extends Component {
  getFileManagementContext = () =>
    this.props.enableFileManagement
      ? {
        now_application_status_code: this.props.noticeOfWork.now_application_status_code,
        is_delayed: !isEmpty(this.props.applicationDelay),
        is_view_mode: this.props.isViewMode,
        user_roles: this.props.userRoles,
      }
      : null;

  getDataSource = () =>
    transformDocuments(
      this.props.documents,
      this.props.noticeOfWork.now_application_guid,
      this.props.noticeOfWorkApplicationDocumentTypeOptionsHash,
      this.props.isFinalPackageTable,
      this.getFileManagementContext()
    );

  state = {
    dataSource: this.getDataSource(),
  };

  componentDidUpdate = (prevProps) => {
    const fileManagementContextChanged =
      this.props.enableFileManagement &&
      (prevProps.applicationDelay !== this.props.applicationDelay ||
        prevProps.userRoles !== this.props.userRoles ||
        prevProps.isViewMode !== this.props.isViewMode ||
        prevProps.noticeOfWork.now_application_status_code !==
        this.props.noticeOfWork.now_application_status_code);
    if (prevProps.documents !== this.props.documents || fileManagementContextChanged) {
      this.setState({
        dataSource: this.getDataSource(),
      });
    }
  };

  renderDescriptionCaption = (record) =>
    this.props.showDescription &&
      record.description &&
      record.description !== Strings.EMPTY_FIELD ? (
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {record.description}
      </Typography.Text>
    ) : null;

  onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      const hasLockedRow = this.state.dataSource?.some((d) => d.isLockedApplicationForm);
      const targetIndex = hasLockedRow && newIndex === 0 ? 1 : newIndex;
      const newData = arrayMove([].concat(this.state.dataSource), oldIndex, targetIndex);
      newData.forEach((doc, i) => {
        if (!(hasLockedRow && doc.isLockedApplicationForm)) {
          doc.index = i;
          doc.final_package_order = i;
        }
      });
      this.setState({ dataSource: newData });
      this.handleSortDocument(newData);
    }
  };

  DraggableContainer = (props) => (
    <SortableContainer
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={this.onSortEnd}
      {...props}
    />
  );

  DraggableBodyRow = ({ className, style, ...restProps }) => {
    const index =
      this.state.dataSource &&
      this.state.dataSource.findIndex((x) => x.index === restProps["data-row-key"]);
    const isLockedRow = this.state.dataSource?.[index]?.isLockedApplicationForm;
    // Order column can now be visible without dragging being allowed —
    // disable the actual drag capability whenever isSortingAllowed is false.
    return (
      <SortableItem
        index={index}
        disabled={isLockedRow || !this.props.isSortingAllowed}
        {...restProps}
      />
    );
  };

  isInCompleteStatus = () =>
    this.props.noticeOfWork.now_application_status_code === "AIA" ||
    this.props.noticeOfWork.now_application_status_code === "WDN" ||
    this.props.noticeOfWork.now_application_status_code === "REJ" ||
    this.props.noticeOfWork.now_application_status_code === "NPR" ||
    !isEmpty(this.props.applicationDelay);

  handleAddDocument = (values) => {
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
          mine_guid: this.props.noticeOfWork.mine_guid,
        },
      };
    });
    return this.props
      .updateNoticeOfWorkApplication(
        { documents },
        this.props.noticeOfWork.now_application_guid,
        "Successfully added documents to this application."
      )
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
        this.props.closeModal();
      });
  };

  handleSortDocument = (newData) => {
    const sortedDocuments = newData
      .filter((document) => !document.isLockedApplicationForm)
      .map((document, index) => ({
        mine_document_guid: document.mine_document_guid,
        final_package_order: index + 1,
      }));
    const values = { sorted_documents: sortedDocuments };
    return this.props
      .sortNoticeOfWorkDocuments(this.props.noticeOfWork.now_application_guid, values)
      .then(() =>
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        )
      );
  };

  handleEditDocument = (values) => {
    return this.props
      .editNoticeOfWorkDocument(
        this.props.noticeOfWork.now_application_guid,
        values.mine_document_guid,
        values
      )
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
        this.props.closeModal();
      });
  };

  handleDeleteDocument = (applicationGuid, mineDocumentGuid) => {
    return this.props
      .deleteNoticeOfWorkApplicationDocument(applicationGuid, mineDocumentGuid)
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
      });
  };

  openAddDocumentModal = () => {
    this.props.openModal({
      props: {
        onSubmit: this.handleAddDocument,
        now_application_guid: this.props.noticeOfWork.now_application_guid,
        title: "Add Notice of Work document",
        categoriesToShow: this.props.categoriesToShow,
        isEditMode: false,
        isInCompleteStatus: this.isInCompleteStatus(),
      },
      content: modalConfig.EDIT_NOTICE_OF_WORK_DOCUMENT,
    });
  };

  openEditDocumentModal = (record) => {
    this.props.openModal({
      props: {
        initialValues: record,
        onSubmit: this.handleEditDocument,
        now_application_guid: this.props.noticeOfWork.now_application_guid,
        title: "Edit Notice of Work document",
        categoriesToShow: this.props.categoriesToShow,
        isEditMode: true,
        isInCompleteStatus: this.isInCompleteStatus(),
      },
      content: modalConfig.EDIT_NOTICE_OF_WORK_DOCUMENT,
      width: "75vw",
    });
  };

  refreshApplication = () =>
    this.props.fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid);

  openReplaceModal = (record) => {
    const applicationGuid = this.props.noticeOfWork.now_application_guid;
    this.props.openModal({
      props: {
        title: "Replace File",
        document: record,
        alertMessage:
          "The new file must be the same file type as the original. The current file will be kept as a previous version, which can be downloaded from this table.",
        uploadUrl: NOTICE_OF_WORK_DOCUMENT_VERSION_UPLOAD(applicationGuid, record.mine_document_guid),
        createVersion: (documentManagerVersionGuid) =>
          this.props.createNoticeOfWorkDocumentVersion(
            applicationGuid,
            record.mine_document_guid,
            documentManagerVersionGuid
          ),
        handleSubmit: this.refreshApplication,
      },
      content: ReplaceDocumentModal,
    });
  };

  getArchivePermitPackageWarning = (record) => {
    if (!record.is_final_package) {
      return undefined;
    }
    const isReferenced = isFileReferencedInConditions(
      this.props.draftPermitAmendment?.conditions,
      record.now_application_document_xref_guid
    );
    return isReferenced
      ? "This file is in the permit package and is currently being referenced in a permit condition. Archiving it will remove it from the permit package and break that reference."
      : "This file is in the permit package. Archiving it will remove it from the permit package.";
  };

  openArchiveModal = (record) => {
    const applicationGuid = this.props.noticeOfWork.now_application_guid;
    this.props.openModal({
      props: {
        title: "Archive File",
        documents: [record],
        alertMessage: "This action cannot be undone",
        alertDescription:
          "Archiving removes this file from Government Documents. You can find it and its previous versions, in Archived Documents.",
        extraWarning: this.getArchivePermitPackageWarning(record),
        handleSubmit: async () => {
          try {
            await this.props.archiveNoticeOfWorkDocuments(applicationGuid, [
              record.mine_document_guid,
            ]);
          } catch (err) {
            // The action creator has already surfaced the error; keep the modal open so the user can retry.
            return;
          }
          await this.refreshApplication();
          this.props.closeModal();
        },
      },
      content: ArchiveDocumentModal,
    });
  };

  fileManagementActionsColumn = () =>
    renderActionsColumn({
      actions: [
        {
          key: "view",
          label: FileOperations.View,
          icon: <FileOutlined />,
          clickFunction: (_event, record) =>
            this.props.openDocument(record.document_manager_guid, record.document_name),
        },
        {
          key: "download",
          label: FileOperations.Download,
          icon: <DownloadOutlined />,
          clickFunction: (_event, record) => downloadFileFromDocumentManager(record),
        },
        {
          key: "replace",
          label: FileOperations.Replace,
          icon: <SyncOutlined />,
          clickFunction: (_event, record) => this.openReplaceModal(record),
        },
        {
          key: "archive",
          label: FileOperations.Archive,
          icon: <InboxOutlined />,
          clickFunction: (_event, record) => this.openArchiveModal(record),
        },
      ],
      recordActionsFilter: (record, actions) =>
        actions.filter((action) => record.allowed_actions?.includes(action.label)),
    });

  columns = (noticeOfWorkApplicationDocumentTypeOptions, categoriesToShow) => {
    let tableColumns = [];
    const filtered = noticeOfWorkApplicationDocumentTypeOptions.filter(({ subType, value }) => {
      if (subType && categoriesToShow.length > 0) {
        return categoriesToShow.includes(subType);
      }
      if (categoriesToShow.length > 0) {
        return categoriesToShow.includes(value);
      }
      return true;
    });

    const categoryFilters = filtered.map((item) => ({
      text: item.label,
      value: item.value,
    }));

    const sortColumn = {
      title: "Order",
      dataIndex: "index",
      className: "drag-visible",
      render: (text, record) => {
        const hasLockedRow = this.state.dataSource?.some((d) => d.isLockedApplicationForm);
        if (record.isLockedApplicationForm) {
          // The NoW application document (NTR — system-generated Notice of Work Form) is
          // always position 1.1 in the permit; it is locked and cannot be reordered.
          return (
            <span style={{ paddingLeft: "26px" }}>
              {getPermitPackageOrderLabel(text, hasLockedRow, true)}
            </span>
          );
        }
        // Order column can now be visible without dragging being allowed —
        // hide the drag handle itself whenever isSortingAllowed is false.
        const dragHandle = this.props.isSortingAllowed ? (
          <DragHandle />
        ) : (
          <span style={{ display: "inline-block", width: 14 }} />
        );
        if (this.props.documentNumberFormat === "whole") {
          return (
            <>
              {dragHandle}
              &nbsp; {text + 1}
            </>
          );
        }
        return (
          <>
            {dragHandle}
            &nbsp; {getPermitPackageOrderLabel(text, hasLockedRow, false)}
          </>
        );
      },
    };

    const fileNameColumn = this.props.selectedRows
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
        render: (text, record) => {
          if (record.isLockedApplicationForm && !record.document_manager_guid) {
            return <div title="File Name">N/A</div>;
          }
          // Previous versions are download only (for now), as the document viewer always opens the latest version of a file and this is an existing pattern.
          if (isVersionRow(record)) {
            return (
              <div title="File Name">
                <Button
                  type="link"
                  style={{ padding: 0, height: "auto" }}
                  onClick={() => downloadFileFromDocumentManager(record)}
                >
                  {record.document_name}
                </Button>
              </div>
            );
          }
          const fileName = (
            <div title="File Name">
              <DocumentLink
                documentManagerGuid={record.document_manager_guid}
                documentName={record.filename}
                truncateDocumentName={false}
              />
              {this.renderDescriptionCaption(record)}
            </div>
          );
          return this.props.enableFileManagement
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
        render: (text, record) => (
          <div title="Date">{formatDate(record.preamble_date) || "N/A"}</div>
        ),
      },
    ];

    const categoryColumn = {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: this.props.disableCategoryFilter ? null : categoryFilters,
      onFilter: this.props.disableCategoryFilter
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
        if (record.isLockedApplicationForm || isVersionRow(record)) {
          return <div />;
        }
        if (this.props.isFinalPackageTable && this.props.isViewMode) {
          return <div />;
        }
        if (!this.isInCompleteStatus()) {
          if (isModificationAllowed) {
            return (
              <NOWActionWrapper
                permission={Permission.EDIT_PERMITS}
                tab={this.props.isAdminView ? "" : "REV"}
                ignoreDelay
              >
                {!this.props.isFinalPackageTable && (
                  <Popconfirm
                    placement="topLeft"
                    title={
                      isFileReferencedInConditions(
                        this.props.draftPermitAmendment?.conditions,
                        record.now_application_document_xref_guid
                      )
                        ? "This file is currently being referenced in a permit condition. Deleting it will break that reference. Are you sure you want to delete this document?"
                        : "Are you sure you want to remove this document?"
                    }
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={() =>
                      this.handleDeleteDocument(
                        record.now_application_guid,
                        record.mine_document_guid
                      )
                    }
                  >
                    <Button className="no-margin" ghost type="primary" size="small">
                      <img name="remove" src={TRASHCAN} alt="Remove document" />
                    </Button>
                  </Popconfirm>
                )}
                <Button
                  className="no-margin"
                  ghost
                  type="primary"
                  size="small"
                  onClick={() => this.openEditDocumentModal(record)}
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
                tab={this.props.isAdminView ? "" : "REV"}
                ignoreDelay
              >
                <Tooltip
                  title="You cannot remove a document that is a part of the Permit, Referral, or Consultation Package."
                  placement="right"
                  mouseEnterDelay={0.3}
                  className="no-margin"
                >
                  <Button className="no-margin" ghost type="primary" size="small">
                    <img
                      className="lessOpacity"
                      name="remove"
                      src={TRASHCAN}
                      alt="Remove document"
                    />
                  </Button>
                </Tooltip>
                <Tooltip
                  title="You cannot edit a document that is a part of the Permit, Referral, or Consultation Package."
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
        return !this.isInCompleteStatus() ? (
          <div className="inline-flex between">
            <div className="grid">
              <span>Permit</span>
              <span>Package</span>
            </div>
            <PermitPackage isAdminView={this.props.isAdminView} isTableHeaderView />
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
        return !this.isInCompleteStatus() ? (
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
        return !this.isInCompleteStatus() ? (
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

    const postApprovalDocumentColumn = {
      title: "",
      key: "post_approval_document",
      render: (text, record) => {
        if (isVersionRow(record)) {
          return null;
        }
        let isPostDecision = false;
        if (
          this.isInCompleteStatus() &&
          moment(record.upload_date, "YYYY-MM-DD") >
          moment(this.props.noticeOfWork.decision_by_user_date, "YYYY-MM-DD")
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

    if (this.props.isFinalPackageTable) {
      tableColumns = [
        ...fileMetadataColumns,
        categoryColumn,
        fileNameColumn,
        descriptionColumn,
        deleteAndEditButtonColumn,
      ];
      if (this.props.showOrderColumn) {
        tableColumns = [sortColumn, ...tableColumns];
      }
    } else if (this.props.isStandardDocuments) {
      tableColumns = [categoryColumn, fileNameColumn, uploadDateColumn];
      if (this.isInCompleteStatus()) {
        tableColumns = [...tableColumns, postApprovalDocumentColumn];
      }
      tableColumns = [
        ...tableColumns,
        deleteAndEditButtonColumn,
        referralPackageColumn,
        consultationPackageColumn,
        permitPackageColumn,
      ];
      if (this.props.enableFileManagement) {
        tableColumns = [...tableColumns, this.fileManagementActionsColumn()];
      }
    } else if (this.props.isRefConDocuments) {
      tableColumns = [categoryColumn, fileNameColumn];
      if (this.isInCompleteStatus()) {
        tableColumns = [...tableColumns, postApprovalDocumentColumn];
      }
      tableColumns = [...tableColumns, uploadDateColumn];
    } else if (this.props.isPackageModal) {
      tableColumns = [fileNameColumn, categoryColumn, descriptionColumn, uploadDateColumn];
    } else {
      tableColumns = [categoryColumn, fileNameColumn, uploadDateColumn];
    }

    return tableColumns;
  };

  render() {
    return (
      <div>
        <Row className="inline-flex between">
          <Col span={16}>
            <p>{this.props.disclaimerText}</p>
          </Col>
          <Col span={6}>
            {!this.props.selectedRows &&
              !this.props.isViewMode &&
              !this.props.isRefConDocuments &&
              !this.props.isFinalPackageTable && (
                <NOWActionWrapper
                  permission={Permission.EDIT_PERMITS}
                  tab={this.props.isAdminView ? "" : "REV"}
                  allowAfterProcess={this.props.allowAfterProcess}
                  ignoreDelay
                >
                  <AddButton
                    className="position-right"
                    disabled={this.props.isViewMode}
                    style={this.props.isAdminView ? { marginRight: "100px" } : {}}
                    onClick={this.openAddDocumentModal}
                  >
                    Add Document
                  </AddButton>
                </NOWActionWrapper>
              )}
          </Col>
        </Row>
        <br />
        <CoreTable
          columns={this.columns(
            this.props.noticeOfWorkApplicationDocumentTypeOptions,
            this.props.categoriesToShow
          )}
          recordType="document description"
          dataSource={this.state.dataSource}
          // The key must be set to "index" to allow the drag-sort to work.
          rowKey={
            this.props.enableFileManagement
              ? (record) => record.mine_document_version_guid ?? record.key
              : this.props.isSortingAllowed
                ? "index"
                : "key"
          }
          expandProps={
            this.props.enableFileManagement
              ? {
                childrenColumnName: "versions",
                matchChildColumnsToParent: true,
                recordDescription: "version history",
                rowExpandable: (record) => record.number_prev_versions > 0,
                // Show the expand icon beside the file name rather than the category
                expandIconColumnIndex: 1,
              }
              : null
          }
          components={{
            body: {
              wrapper: this.DraggableContainer,
              row: this.DraggableBodyRow,
            },
          }}
          rowSelection={
            this.props.selectedRows
              ? {
                selectedRowKeys: this.props.selectedRows.selectedCoreRows,
                onChange: (selectedRowKeys) => {
                  this.props.selectedRows.setSelectedCoreRows(selectedRowKeys);
                },
                getCheckboxProps: (record) => ({
                  disabled: this.props.lockedRowKeys?.includes(record.key),
                }),
              }
              : null
          }
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWorkApplicationDocumentTypeOptionsHash: getNoticeOfWorkApplicationDocumentTypeOptionsHash(
    state
  ),
  noticeOfWorkApplicationDocumentTypeOptions: getDropdownNoticeOfWorkApplicationDocumentTypeOptions(
    state
  ),
  noticeOfWork: getNoticeOfWork(state),
  applicationDelay: getApplicationDelay(state),
  draftPermitAmendment: getDraftPermitAmendmentForNOW(state),
  userRoles: getUserAccessData(state),
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
      sortNoticeOfWorkDocuments,
      createNoticeOfWorkDocumentVersion,
      archiveNoticeOfWorkDocuments,
      openDocument,
    },
    dispatch
  );

NOWDocuments.propTypes = propTypes;
NOWDocuments.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(NOWDocuments);
