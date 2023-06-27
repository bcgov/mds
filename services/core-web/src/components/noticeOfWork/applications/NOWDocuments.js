import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isEmpty } from "lodash";
import { PropTypes } from "prop-types";
import { Table, Button, Popconfirm, Tooltip, Row, Col, Descriptions } from "antd";
import moment from "moment";
import { FlagOutlined, MenuOutlined } from "@ant-design/icons";
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
  sortNoticeOfWorkDocuments,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import * as Strings from "@common/constants/strings";
import DocumentLink from "@/components/common/DocumentLink";
import AddButton from "@/components/common/buttons/AddButton";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import { EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import ReferralConsultationPackage from "@/components/noticeOfWork/applications/referals/ReferralConsultationPackage";
import PermitPackage from "@/components/noticeOfWork/applications/PermitPackage";
import { sortableContainer, sortableElement, sortableHandle } from "react-sortable-hoc";
import arrayMove from "array-move";
import CoreTable from "@/components/common/CoreTable";

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
  isSortingAllowed: false,
  showDescription: false,
};

const transformDocuments = (
  documents,
  now_application_guid,
  noticeOfWorkApplicationDocumentTypeOptionsHash,
  isFinalPackageTable
) =>
  documents &&
  documents
    .sort((a, b) => a.final_package_order - b.final_package_order)
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
    }));

const SortableItem = sortableElement((props) => <tr {...props} />);
const SortableContainer = sortableContainer((props) => <tbody {...props} />);

export class NOWDocuments extends Component {
  getDataSource = () =>
    transformDocuments(
      this.props.documents,
      this.props.noticeOfWork.now_application_guid,
      this.props.noticeOfWorkApplicationDocumentTypeOptionsHash,
      this.props.isFinalPackageTable
    );

  state = {
    dataSource: this.getDataSource(),
  };

  componentDidUpdate = (prevProps) => {
    if (prevProps.documents !== this.props.documents) {
      this.setState({
        dataSource: this.getDataSource(),
      });
    }
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMove([].concat(this.state.dataSource), oldIndex, newIndex);
      newData.map((doc, index) => ((doc.index = index), (doc.final_package_order = index)));
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
    return <SortableItem index={index} {...restProps} />;
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
        preamble_title: values?.preamble_title,
        preamble_author: values?.preamble_author,
        mine_document: {
          document_manager_guid: file[0],
          document_name: file[1],
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
    const sortedDocuments = newData.map((document, index) => ({
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
      render: (text) => (
        <>
          <DragHandle />
          {/* NOTE: We are adding 2 here because "1.1" in the issued permits is currently always the application form document. */}
          &nbsp; 1.{text + 2}
        </>
      ),
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
      filters: this.props.disableCategoryFilter ? null : categoryFilters,
      onFilter: this.props.disableCategoryFilter
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
                    title="Are you sure you want to remove this document?"
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
      render: (text) => <div title="Part of Permit">{text ? "Yes" : "No"}</div>,
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
      render: (text) => <div title="Consultation Package">{text ? "Yes" : "No"}</div>,
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
      render: (text) => <div title="Referral Package">{text ? "Yes" : "No"}</div>,
    };

    const postApprovalDocumentColumn = {
      title: "",
      key: "post_approval_document",
      render: (text, record) => {
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
      if (this.props.isSortingAllowed) {
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

  docDescription = (record) => {
    return (
      <Descriptions column={1}>
        <Descriptions.Item label="Description">{record.description}</Descriptions.Item>
      </Descriptions>
    );
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
              !this.props.isRefConDocuments && (
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
          expandProps={{
            recordDescription: "document details",
            expandedRowRender: this.props.showDescription ? this.docDescription : undefined,
            rowExpandable: () => this.props.showDescription,
          }}
          // The key must be set to "index" to allow the drag-sort to work.
          rowKey={this.props.isSortingAllowed ? "index" : "key"}
          components={{
            body: {
              wrapper: this.DraggableContainer,
              row: this.DraggableBodyRow,
            },
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWorkApplicationDocumentTypeOptionsHash:
    getNoticeOfWorkApplicationDocumentTypeOptionsHash(state),
  noticeOfWorkApplicationDocumentTypeOptions:
    getDropdownNoticeOfWorkApplicationDocumentTypeOptions(state),
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
      sortNoticeOfWorkDocuments,
    },
    dispatch
  );

NOWDocuments.propTypes = propTypes;
NOWDocuments.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(NOWDocuments);
