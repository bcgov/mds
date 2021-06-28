import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { PropTypes } from "prop-types";
import { Table, Button, Popconfirm, Tooltip, Row, Col } from "antd";
import moment from "moment";
import { MinusSquareFilled, PlusSquareFilled } from "@ant-design/icons";
import CustomPropTypes from "@/customPropTypes";
import { formatDateTime } from "@common/utils/helpers";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  getNoticeOfWorkApplicationDocumentTypeOptionsHash,
  getDropdownNoticeOfWorkApplicationDocumentTypeOptions,
} from "@common/selectors/staticContentSelectors";
import { getNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";
import {
  fetchImportedNoticeOfWorkApplication,
  updateNoticeOfWorkApplication,
  deleteNoticeOfWorkApplicationDocument,
  editNoticeOfWorkDocument,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import * as Strings from "@common/constants/strings";
import DocumentLink from "@/components/common/DocumentLink";
import AddButton from "@/components/common/AddButton";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import { EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import ReferralConsultationPackage from "@/components/noticeOfWork/applications/referals/ReferralConsultationPackage";
import PermitPackage from "@/components/noticeOfWork/applications/PermitPackage";

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
  addDescriptionColumn: PropTypes.bool,
  showPreambleFileMetadata: PropTypes.bool,
  editPreambleFileMetadata: PropTypes.bool,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  editNoticeOfWorkDocument: PropTypes.func.isRequired,
  openFinalDocumentPackageModal: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  deleteNoticeOfWorkApplicationDocument: PropTypes.func.isRequired,
  allowAfterProcess: PropTypes.bool,
  disableCategoryFilter: PropTypes.bool,
  showPartOfPermitColumn: PropTypes.bool,
  isGovernmentDocuments: PropTypes.bool,
  isFinalPackageTable: PropTypes.bool,
  isRefConDocuments: PropTypes.bool,
  isPackageModal: PropTypes.bool,
  showDescription: PropTypes.bool,
};

const defaultProps = {
  selectedRows: null,
  categoriesToShow: [],
  disclaimerText: "",
  isAdminView: false,
  addDescriptionColumn: true,
  showPreambleFileMetadata: false,
  editPreambleFileMetadata: false,
  allowAfterProcess: false,
  disableCategoryFilter: false,
  showPartOfPermitColumn: true,
  isFinalPackageTable: false,
  isGovernmentDocuments: false,
  isRefConDocuments: false,
  isPackageModal: false,
  showDescription: false,
};

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

export const NOWDocuments = (props) => {
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

  const columns = (noticeOfWorkApplicationDocumentTypeOptions, categoriesToShow, isViewMode) => {
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
                    <img
                      className="lessOpacity"
                      name="remove"
                      src={TRASHCAN}
                      alt="Remove document"
                    />
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

    if (props.isFinalPackageTable) {
      tableColumns = [
        ...fileMetadataColumns,
        categoryColumn,
        fileNameColumn,
        descriptionColumn,
        deleteAndEditButtonColumn,
      ];
    } else if (props.isGovernmentDocuments) {
      tableColumns = [
        categoryColumn,
        fileNameColumn,
        uploadDateColumn,
        deleteAndEditButtonColumn,
        referralPackageColumn,
        consultationPackageColumn,
        permitPackageColumn,
      ];
    } else if (props.isRefConDocuments) {
      // TODO:need to add the permit package back to the column list after this table is managed better.
      tableColumns = [categoryColumn, fileNameColumn, uploadDateColumn];
    } else if (props.isPackageModal) {
      tableColumns = [categoryColumn, fileNameColumn, uploadDateColumn];
    } else {
      tableColumns = [categoryColumn, fileNameColumn, uploadDateColumn];
    }

    return tableColumns;
  };

  const docDescription = (record) => {
    return <p>{record.description}</p>;
  };

  const transformDocuments = (
    documents,
    now_application_guid,
    noticeOfWorkApplicationDocumentTypeOptionsHash
  ) =>
    documents &&
    documents.map((document) => ({
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
        props.isFinalPackageTable,
      ...document,
    }));

  return (
    <div>
      <Row className="inline-flex between">
        <Col span={16}>
          <p>{props.disclaimerText}</p>
        </Col>
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
        columns={columns(
          props.noticeOfWorkApplicationDocumentTypeOptions,
          props.categoriesToShow,
          props.isViewMode
        )}
        dataSource={transformDocuments(
          props.documents,
          props.noticeOfWork.now_application_guid,
          props.noticeOfWorkApplicationDocumentTypeOptionsHash
        )}
        locale={{
          emptyText: "No Data Yet",
        }}
        rowSelection={
          props.selectedRows
            ? {
                selectedRowKeys: props.selectedRows.selectedCoreRows,
                onChange: (selectedRowKeys) => {
                  props.selectedRows.setSelectedCoreRows(selectedRowKeys);
                },
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
  noticeOfWorkApplicationDocumentTypeOptionsHash: getNoticeOfWorkApplicationDocumentTypeOptionsHash(
    state
  ),
  noticeOfWorkApplicationDocumentTypeOptions: getDropdownNoticeOfWorkApplicationDocumentTypeOptions(
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
    },
    dispatch
  );

NOWDocuments.propTypes = propTypes;
NOWDocuments.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(NOWDocuments);
