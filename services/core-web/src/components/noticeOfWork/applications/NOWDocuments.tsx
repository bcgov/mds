import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { isEmpty } from "lodash";
import { Button, Popconfirm, Tooltip, Row, Col, Typography } from "antd";
import moment from "moment";
import { FlagOutlined, MenuOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { formatDate, formatDateTime } from "@mds/common/redux/utils/helpers";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import OriginalVfcbcFileIcon from "@mds/common/components/documents/OriginalVfcbcFileIcon";
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
  compareByTypeThenOrder,
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
import { documentWithTag } from "@mds/common/components/documents/DocumentColumns";
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
import * as SortableHOC from "react-sortable-hoc";
import arrayMove from "array-move";
import CoreTable from "@mds/common/components/common/CoreTable";
import { INoWApplicationForm, IOption, IPermitAmendment } from "@mds/common/interfaces";
import {
  INoWCoreDocument,
  IPermitPackageRow,
  IPermitPackageTitles,
  getPermitPackageExpandProps,
  renderPermitPackageDetailsSummary,
  renderPermitPackageTitleColumn,
  renderPermitPackageTypeColumn,
} from "@/components/noticeOfWork/applications/permitPackageTitleColumn";
import NOWDownloadAllButton from "@/components/noticeOfWork/applications/NOWDownloadAllButton";
import {
  fileManagementActionsColumn,
  fileNameHeaderCell,
  getFileManagementContext,
  getFileNameOffset,
  isVersionRow,
  openArchiveFileModal,
  openReplaceFileModal,
  toFileManagementRow,
} from "@/components/noticeOfWork/applications/nowFileManagement";

// The installed typings only declare the capitalised names, the lowercase ones are what v2 exports.
const { sortableContainer, sortableElement, sortableHandle } = SortableHOC as any;

const DragHandle = sortableHandle(() => <MenuOutlined style={{ cursor: "grab", color: "#999" }} />);

export interface NOWDocumentsProps {
  documents: INoWCoreDocument[];
  isViewMode: boolean;
  selectedRows?: {
    selectedCoreRows?: string[];
    setSelectedCoreRows?: (keys: string[]) => void;
  } | null;
  categoriesToShow?: string[];
  disclaimerText?: string;
  isAdminView?: boolean;
  allowAfterProcess?: boolean;
  disableCategoryFilter?: boolean;
  isStandardDocuments?: boolean;
  isFinalPackageTable?: boolean;
  isRefConDocuments?: boolean;
  isPackageModal?: boolean;
  isSortingAllowed?: boolean;
  showDescription?: boolean;
  lockedRowKeys?: string[];
  packageTitles?: IPermitPackageTitles | null;
  showOrderColumn?: boolean;
  groupFiguresFirst?: boolean;
  documentNumberFormat?: "decimal" | "whole";
  enableFileManagement?: boolean;
}

const transformDocuments = (
  documents,
  now_application_guid,
  noticeOfWorkApplicationDocumentTypeOptionsHash,
  isFinalPackageTable,
  compareFn = comparePermitPackageDocuments,
  fileManagementContext = null
) =>
  documents &&
  documents
    .sort(compareFn)
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

export const NOWDocuments: FC<NOWDocumentsProps> = (props) => {
  const {
    categoriesToShow = [],
    selectedRows = null,
    disclaimerText = "",
    isAdminView = false,
    allowAfterProcess = false,
    disableCategoryFilter = false,
    isFinalPackageTable = false,
    isStandardDocuments = false,
    isRefConDocuments = false,
    isPackageModal = false,
    isSortingAllowed = false,
    showDescription = false,
    lockedRowKeys = [],
    packageTitles = null,
    documentNumberFormat = "decimal",
    showOrderColumn = false,
    groupFiguresFirst = false,
    enableFileManagement = false,
    isViewMode,
  } = props;
  const dispatch = useAppDispatch();
  const noticeOfWork = useAppSelector(getNoticeOfWork) as INoWApplicationForm;
  const noticeOfWorkApplicationDocumentTypeOptionsHash = useAppSelector(
    getNoticeOfWorkApplicationDocumentTypeOptionsHash
  );
  const noticeOfWorkApplicationDocumentTypeOptions = useAppSelector(
    getDropdownNoticeOfWorkApplicationDocumentTypeOptions
  ) as IOption[];
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
  const sortDocuments = (...args: Parameters<typeof sortNoticeOfWorkDocuments>) =>
    dispatch(sortNoticeOfWorkDocuments(...args));
  const createDocumentVersion = (...args: Parameters<typeof createNoticeOfWorkDocumentVersion>) =>
    dispatch(createNoticeOfWorkDocumentVersion(...args));
  const archiveDocuments = (...args: Parameters<typeof archiveNoticeOfWorkDocuments>) =>
    dispatch(archiveNoticeOfWorkDocuments(...args));
  const openDocumentAction = (...args: Parameters<typeof openDocument>) =>
    dispatch(openDocument(...args));

  const buildFileManagementContext = () =>
    enableFileManagement
      ? getFileManagementContext({
        noticeOfWork,
        applicationDelay,
        isViewMode,
        userRoles,
      })
      : null;

  const getDataSource = () =>
    transformDocuments(
      props.documents,
      noticeOfWork.now_application_guid,
      noticeOfWorkApplicationDocumentTypeOptionsHash,
      isFinalPackageTable,
      groupFiguresFirst ? compareByTypeThenOrder : comparePermitPackageDocuments,
      buildFileManagementContext()
    );

  const [dataSource, setDataSource] = useState<IPermitPackageRow[]>(getDataSource);

  // Rebuild the rows when the documents change, or (with file management on) anything the row actions depend on.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setDataSource(getDataSource());
  }, [
    props.documents,
    enableFileManagement && applicationDelay,
    enableFileManagement && userRoles,
    enableFileManagement && isViewMode,
    enableFileManagement && noticeOfWork.now_application_status_code,
  ]);

  const renderDescriptionCaption = (record) =>
    showDescription &&
      record.description &&
      record.description !== Strings.EMPTY_FIELD ? (
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {record.description}
      </Typography.Text>
    ) : null;

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      const hasLockedRow = dataSource?.some((d) => d.isLockedApplicationForm);
      const targetIndex = hasLockedRow && newIndex === 0 ? 1 : newIndex;
      const newData = arrayMove([...dataSource], oldIndex, targetIndex);
      newData.forEach((doc, i) => {
        if (!(hasLockedRow && doc.isLockedApplicationForm)) {
          doc.index = i;
          doc.final_package_order = i;
        }
      });
      setDataSource(newData);
      handleSortDocument(newData);
    }
  };

  // The drag components are created once, so they aren't remounted on every render.
  // They read the latest values through a ref.
  const dragState = useRef<{
    dataSource: IPermitPackageRow[];
    isSortingAllowed: boolean;
    enableFileManagement: boolean;
    onSortEnd: (sort: { oldIndex: number; newIndex: number }) => void;
  }>(null);
  dragState.current = { dataSource, isSortingAllowed, enableFileManagement, onSortEnd };

  const tableComponents = useMemo(
    () => ({
      body: {
        wrapper: (wrapperProps) => (
          <SortableContainer
            useDragHandle
            disableAutoscroll
            helperClass="row-dragging"
            onSortEnd={(sort) => dragState.current.onSortEnd(sort)}
            {...wrapperProps}
          />
        ),
        row: ({ className, style, ...restProps }) => {
          const state = dragState.current;
          // Matches rows on "index", so this only finds the row when rowKey is "index" (see rowKey below)
          const index =
            state.dataSource &&
            state.dataSource.findIndex((x) => x.index === restProps["data-row-key"]);
          const isLockedRow = state.dataSource?.[index]?.isLockedApplicationForm;
          // Order column can now be visible without dragging being allowed — disable the actual drag capability whenever isSortingAllowed is false.
          return (
            <SortableItem
              index={index}
              disabled={isLockedRow || !state.isSortingAllowed}
              // Keeps the row classes that line file names up beside the version history icon
              className={state.enableFileManagement ? className : undefined}
              {...restProps}
            />
          );
        },
      },
    }),
    []
  );

  const isInCompleteStatus = () =>
    noticeOfWork.now_application_status_code === "AIA" ||
    noticeOfWork.now_application_status_code === "WDN" ||
    noticeOfWork.now_application_status_code === "REJ" ||
    noticeOfWork.now_application_status_code === "NPR" ||
    !isEmpty(applicationDelay);

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
        fetchApplication(
          noticeOfWork.now_application_guid
        );
        closeModalAction();
      });
  };

  const handleSortDocument = (newData) => {
    const sortedDocuments = newData
      .filter((document) => !document.isLockedApplicationForm)
      .map((document, index) => ({
        mine_document_guid: document.mine_document_guid,
        final_package_order: index + 1,
      }));
    const values = { sorted_documents: sortedDocuments };
    return sortDocuments(noticeOfWork.now_application_guid, values)
      .then(() =>
        fetchApplication(
          noticeOfWork.now_application_guid
        )
      );
  };

  const handleEditDocument = (values) => {
    return editDocument(
        noticeOfWork.now_application_guid,
        values.mine_document_guid,
        values
      )
      .then(() => {
        fetchApplication(
          noticeOfWork.now_application_guid
        );
        closeModalAction();
      });
  };

  const handleDeleteDocument = (applicationGuid, mineDocumentGuid) => {
    return deleteDocument(applicationGuid, mineDocumentGuid)
      .then(() => {
        fetchApplication(
          noticeOfWork.now_application_guid
        );
      });
  };

  const openAddDocumentModal = () => {
    openModalAction({
      props: {
        onSubmit: handleAddDocument,
        now_application_guid: noticeOfWork.now_application_guid,
        title: "Add Notice of Work document",
        categoriesToShow: categoriesToShow,
        isEditMode: false,
        isInCompleteStatus: isInCompleteStatus(),
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
        categoriesToShow: categoriesToShow,
        isEditMode: true,
        isInCompleteStatus: isInCompleteStatus(),
      },
      content: modalConfig.EDIT_NOTICE_OF_WORK_DOCUMENT,
      width: "75vw",
    });
  };

  const refreshApplication = () =>
    fetchApplication(noticeOfWork.now_application_guid);

  const openReplaceModal = (record) =>
    openReplaceFileModal({
      record,
      applicationGuid: noticeOfWork.now_application_guid,
      openModal: openModalAction,
      createNoticeOfWorkDocumentVersion: createDocumentVersion,
      onReplaced: refreshApplication,
    });

  const openArchiveModal = (record) =>
    openArchiveFileModal({
      record,
      applicationGuid: noticeOfWork.now_application_guid,
      conditions: draftPermitAmendment?.conditions,
      openModal: openModalAction,
      closeModal: closeModalAction,
      archiveNoticeOfWorkDocuments: archiveDocuments,
      onArchived: refreshApplication,
    });

  const buildFileManagementActionsColumn = () =>
    fileManagementActionsColumn({
      openDocument: openDocumentAction,
      onReplace: openReplaceModal,
      onArchive: openArchiveModal,
    });

  const columns = (noticeOfWorkApplicationDocumentTypeOptions, categoriesToShow) => {
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
        const hasLockedRow = dataSource?.some((d) => d.isLockedApplicationForm);
        if (record.isLockedApplicationForm) {
          // The NoW application document (NTR — system-generated Notice of Work Form) is
          // always position 1.1 in the permit; it is locked and cannot be reordered.
          return (
            <span style={{ paddingLeft: "26px" }}>
              {getPermitPackageOrderLabel(text, hasLockedRow, true)}
            </span>
          );
        }
        // Order column can now be visible without dragging being allowed — hide the drag handle itself whenever isSortingAllowed is false.
        const dragHandle = isSortingAllowed ? (
          <DragHandle />
        ) : (
          <span style={{ display: "inline-block", width: 14 }} />
        );
        if (documentNumberFormat === "whole") {
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

    const fileNameColumn = selectedRows
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
              selectedRows?.selectedCoreRows,
              packageTitles
            )}
          </div>
        ),
      }
      : {
        title: "File Name",
        onHeaderCell: enableFileManagement ? fileNameHeaderCell : undefined,
        dataIndex: "filename",
        key: "filename",
        sorter: (a, b) => (a.filename > b.filename ? -1 : 1),
        render: (text, record) => {
          if (record.isLockedApplicationForm && !record.document_manager_guid) {
            return <div title="File Name">N/A</div>;
          }
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
            <div
              title="File Name"
              style={enableFileManagement ? getFileNameOffset(record) : {}}
            >
              <DocumentLink
                documentManagerGuid={record.document_manager_guid}
                documentName={record.filename}
                truncateDocumentName={false}
              />
              {renderDescriptionCaption(record)}
            </div>
          );
          return enableFileManagement
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
      filters: disableCategoryFilter ? null : categoryFilters,
      onFilter: disableCategoryFilter
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
        if (isFinalPackageTable && isViewMode) {
          return <div />;
        }
        if (!isInCompleteStatus()) {
          if (isModificationAllowed) {
            return (
              <NOWActionWrapper
                permission={Permission.EDIT_PERMITS}
                tab={isAdminView ? "" : "REV"}
                ignoreDelay
              >
                {!isFinalPackageTable && (
                  <Popconfirm
                    placement="topLeft"
                    title={
                      isFileReferencedInConditions(
                        draftPermitAmendment?.conditions,
                        record.now_application_document_xref_guid
                      )
                        ? "This file is currently being referenced in a permit condition. Deleting it will break that reference. Are you sure you want to delete this document?"
                        : "Are you sure you want to remove this document?"
                    }
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={() =>
                      handleDeleteDocument(
                        record.now_application_guid,
                        record.mine_document_guid
                      )
                    }
                  >
                    <Button className="no-margin" ghost type="primary" size="small">
                      <img src={TRASHCAN} alt="Remove document" />
                    </Button>
                  </Popconfirm>
                )}
                <Button
                  className="no-margin"
                  ghost
                  type="primary"
                  size="small"
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
                tab={isAdminView ? "" : "REV"}
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
        return !isInCompleteStatus() ? (
          <div className="inline-flex between">
            <div className="grid">
              <span>Permit</span>
              <span>Package</span>
            </div>
            <PermitPackage isAdminView={isAdminView} isTableHeaderView />
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
        return !isInCompleteStatus() ? (
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
        return !isInCompleteStatus() ? (
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
          isInCompleteStatus() &&
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

    if (isFinalPackageTable) {
      tableColumns = [
        ...fileMetadataColumns,
        categoryColumn,
        fileNameColumn,
        descriptionColumn,
        deleteAndEditButtonColumn,
      ];
      if (showOrderColumn) {
        tableColumns = [sortColumn, ...tableColumns];
      }
      if (enableFileManagement) {
        tableColumns = [...tableColumns, buildFileManagementActionsColumn()];
      }
    } else if (isStandardDocuments) {
      tableColumns = [categoryColumn, fileNameColumn, uploadDateColumn];
      if (isInCompleteStatus()) {
        tableColumns = [...tableColumns, postApprovalDocumentColumn];
      }
      tableColumns = [
        ...tableColumns,
        deleteAndEditButtonColumn,
        referralPackageColumn,
        consultationPackageColumn,
        permitPackageColumn,
      ];
      if (enableFileManagement) {
        tableColumns = [...tableColumns, buildFileManagementActionsColumn()];
      }
    } else if (isRefConDocuments) {
      tableColumns = [categoryColumn, fileNameColumn];
      if (isInCompleteStatus()) {
        tableColumns = [...tableColumns, postApprovalDocumentColumn];
      }
      tableColumns = [...tableColumns, uploadDateColumn];
    } else if (isPackageModal) {
      // The Title column is only shown in the permit package bulk modal,
      // Other bulk modals (e.g. consultation) are unchanged.
      const packageColumnProps = {
        selectedKeys: selectedRows?.selectedCoreRows,
        lockedRowKeys: lockedRowKeys,
        packageTitles: packageTitles,
      };
      const titleColumns = packageTitles
        ? [
          renderPermitPackageTitleColumn(packageColumnProps),
          ...(packageTitles.showTypeSelector
            ? [renderPermitPackageTypeColumn(packageColumnProps)]
            : []),
        ]
        : [];
      tableColumns = [
        fileNameColumn,
        ...titleColumns,
        categoryColumn,
        descriptionColumn,
        uploadDateColumn,
      ];
    } else {
      tableColumns = [categoryColumn, fileNameColumn, uploadDateColumn];
    }

    return tableColumns;
  };

  const renderedColumns = columns(noticeOfWorkApplicationDocumentTypeOptions, categoriesToShow);
  const showDownloadAll =
    enableFileManagement &&
    !selectedRows &&
    !isFinalPackageTable &&
    !isRefConDocuments;
  const addDocumentButton = !selectedRows &&
    !isViewMode &&
    !isRefConDocuments &&
    !isFinalPackageTable && (
      <NOWActionWrapper
        permission={Permission.EDIT_PERMITS}
        tab={isAdminView ? "" : "REV"}
        allowAfterProcess={allowAfterProcess}
        ignoreDelay
      >
        <AddButton
          // Sits beside Download All when it's shown, otherwise in its usual spot
          className={showDownloadAll ? undefined : "position-right"}
          disabled={isViewMode}
          style={isAdminView && !showDownloadAll ? { marginRight: "100px" } : {}}
          onClick={openAddDocumentModal}
        >
          Add Document
        </AddButton>
      </NOWActionWrapper>
    );
  return (
    <div>
      <Row className="inline-flex between">
        <Col span={16}>
          <p>{disclaimerText}</p>
        </Col>
        <Col span={6}>
          {showDownloadAll ? (
            <div className="now-table-header-actions">
              <NOWDownloadAllButton
                rows={dataSource ?? []}
                mineGuid={noticeOfWork.mine_guid}
                documentType="government-documents"
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
        columns={renderedColumns}
        dataSource={dataSource}
        // The key must be set to "index" to allow the drag-sort to work.
        // With file management on, rows are keyed by version guid or key instead (so version history can expand), which
        // DraggableBodyRow can't match, so drag-sort won't work. That's fine for now, as file management is only on where sorting isn't allowed.
        rowKey={
          enableFileManagement
            ? (record) => record.mine_document_version_guid ?? record.key
            : isSortingAllowed
              ? "index"
              : "key"
        }
        expandProps={
          enableFileManagement
            ? {
              childrenColumnName: "versions",
              matchChildColumnsToParent: true,
              recordDescription: "version history",
              rowExpandable: (record) => record.number_prev_versions > 0,
              // Show the expand icon beside the file name, wherever it sits in the table
              expandIconColumnIndex: renderedColumns.findIndex((column) => column.key === "filename"),
            }
            : isPackageModal
              ? getPermitPackageExpandProps({
                selectedKeys: selectedRows?.selectedCoreRows,
                lockedRowKeys: lockedRowKeys,
                packageTitles: packageTitles,
              })
              : null
        }
        components={tableComponents}
        rowSelection={
          selectedRows
            ? {
              selectedRowKeys: selectedRows.selectedCoreRows,
              onChange: (selectedRowKeys) => {
                selectedRows.setSelectedCoreRows(selectedRowKeys as string[]);
              },
              getCheckboxProps: (record) => ({
                disabled: lockedRowKeys?.includes(record.key),
              }),
            }
            : null
        }
      />
    </div>
  );
};

export default NOWDocuments;
