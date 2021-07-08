import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isEmpty } from "lodash";
import { PropTypes } from "prop-types";
import { Table, Button, Popconfirm, Tooltip, Row, Col, Descriptions } from "antd";
import moment from "moment";
import { MinusSquareFilled, PlusSquareFilled, FlagOutlined } from "@ant-design/icons";
import CustomPropTypes from "@/customPropTypes";
import { formatDateTime } from "@common/utils/helpers";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  getNoticeOfWorkApplicationDocumentTypeOptionsHash,
  getDropdownNoticeOfWorkApplicationDocumentTypeOptions,
} from "@common/selectors/staticContentSelectors";
import { getNoticeOfWork, getApplicationDelay } from "@common/selectors/noticeOfWorkSelectors";
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
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  editNoticeOfWorkDocument: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  deleteNoticeOfWorkApplicationDocument: PropTypes.func.isRequired,
  allowAfterProcess: PropTypes.bool,
  disableCategoryFilter: PropTypes.bool,
  isStandardDocuments: PropTypes.bool,
  isFinalPackageTable: PropTypes.bool,
  isRefConDocuments: PropTypes.bool,
  isPackageModal: PropTypes.bool,
  showDescription: PropTypes.bool,
  applicationDelay: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  selectedRows: null,
  categoriesToShow: [],
  disclaimerText: "",
  isAdminView: false,
  allowAfterProcess: false,
  disableCategoryFilter: false,
  isFinalPackageTable: false,
  isStandardDocuments: false,
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
  const isApplicationDelayed = !isEmpty(props.applicationDelay);
  const isInCompleteStatus =
    props.noticeOfWork.now_application_status_code === "AIA" ||
    props.noticeOfWork.now_application_status_code === "WDN" ||
    props.noticeOfWork.now_application_status_code === "REJ" ||
    props.noticeOfWork.now_application_status_code === "NPR" ||
    isApplicationDelayed;

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
      width: "75vw",
    });
  };

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
        render: (text, record) => (
          <div title="Date">{formatDateTime(record.preamble_date) || "N/A"}</div>
        ),
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
      width: 170,
      render: (isModificationAllowed, record) => {
        if (!isInCompleteStatus) {
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
                  title="You cannot remove a document that is a part of the Permit, Referral, or Consultation Package."
                  placement="right"
                  mouseEnterDelay={0.3}
                  className="no-margin"
                >
                  <Button className="no-margin" ghost type="primary" disabled size="small">
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
                  <Button className="no-margin" ghost type="primary" disabled size="small">
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

    const postApprovalDocumentColumn = {
      title: "",
      key: "post_approval_document",
      render: (text, record) => {
        let isPostDecision = false;
        if (
          isInCompleteStatus &&
          moment(record.upload_date, "YYYY-MM-DD") >
            moment(props.noticeOfWork.status_updated_date, "YYYY-MM-DD")
        ) {
          isPostDecision = true;
        }
        return (
          isPostDecision && (
            <Tooltip
              title="This is a post decision document."
              placement="right"
              mouseEnterDelay={0.3}
            >
              <FlagOutlined />
            </Tooltip>
          )
        );
      },
    };

    if (props.isFinalPackageTable) {
      tableColumns = [
        ...fileMetadataColumns,
        categoryColumn,
        fileNameColumn,
        descriptionColumn,
        deleteAndEditButtonColumn,
      ];
    } else if (props.isStandardDocuments) {
      tableColumns = [categoryColumn, fileNameColumn, uploadDateColumn];
      if (isInCompleteStatus) {
        tableColumns = [...tableColumns, postApprovalDocumentColumn];
      }
      tableColumns = [
        ...tableColumns,
        deleteAndEditButtonColumn,
        referralPackageColumn,
        consultationPackageColumn,
        permitPackageColumn,
      ];
    } else if (props.isRefConDocuments) {
      tableColumns = [categoryColumn, fileNameColumn];
      if (isInCompleteStatus) {
        tableColumns = [...tableColumns, postApprovalDocumentColumn];
      }
      tableColumns = [...tableColumns, uploadDateColumn];
    } else if (props.isPackageModal) {
      tableColumns = [fileNameColumn, categoryColumn, descriptionColumn, uploadDateColumn];
    } else {
      tableColumns = [categoryColumn, fileNameColumn, uploadDateColumn];
    }

    return tableColumns;
  };

  const docDescription = (record) => {
    return (
      <Descriptions column={1}>
        <Descriptions.Item label="Description">{record.description}</Descriptions.Item>
      </Descriptions>
    );
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
          {!props.selectedRows && !props.isViewMode && !props.isRefConDocuments && (
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
        columns={columns(props.noticeOfWorkApplicationDocumentTypeOptions, props.categoriesToShow)}
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
  applicationDelay: getApplicationDelay(state),
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
