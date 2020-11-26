import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { PropTypes } from "prop-types";
import { Table, Button, Popconfirm, Tooltip } from "antd";
import moment from "moment";
import CustomPropTypes from "@/customPropTypes";
import { formatDateTime } from "@common/utils/helpers";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  getNoticeOfWorkApplicationDocumentTypeOptionsHash,
  getDropdownNoticeOfWorkApplicationDocumentTypeOptions,
} from "@common/selectors/staticContentSelectors";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { getNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";
import {
  fetchImportedNoticeOfWorkApplication,
  updateNoticeOfWorkApplication,
  deleteNoticeOfWorkApplicationDocument,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import * as Strings from "@common/constants/strings";
import LinkButton from "@/components/common/LinkButton";
import AddButton from "@/components/common/AddButton";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import { TRASHCAN } from "@/constants/assets";

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
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  deleteNoticeOfWorkApplicationDocument: PropTypes.func.isRequired,
};
const defaultProps = {
  selectedRows: null,
  categoriesToShow: [],
  disclaimerText: "",
  isAdminView: false,
  addDescriptionColumn: true,
};

export const NOWDocuments = (props) => {
  const handleAddDocument = (values) => {
    const documents = values.uploadedFiles.map((file) => {
      return {
        now_application_document_type_code: values.now_application_document_type_code,
        description: values.description,
        is_final_package: values.is_final_package,
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
      },
      content: modalConfig.EDIT_NOTICE_OF_WORK_DOCUMENT,
    });
  };

  const columns = (noticeOfWorkApplicationDocumentTypeOptions, categoriesToShow, isViewMode) => {
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
              <LinkButton
                onClick={() =>
                  downloadFileFromDocumentManager({
                    document_manager_guid: record.document_manager_guid,
                    document_name: record.filename,
                  })
                }
              >
                <span>{text}</span>
              </LinkButton>
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

    const tableColumns = [
      fileNameColumn,
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        filters: categoryFilters,
        onFilter: (value, record) => record.category.includes(value),
        sorter: (a, b) => (a.category > b.category ? -1 : 1),
        render: (text) => <div title="Category">{text}</div>,
      },
      {
        title: "Upload Date/Time",
        dataIndex: "upload_date",
        key: "upload_date",
        sorter: (a, b) => (moment(a.upload_date) > moment(b.upload_date) ? -1 : 1),
        render: (text, record) => <div title="Due">{formatDateTime(record.upload_date)}</div>,
      },
      {
        title: "Part of Permit",
        dataIndex: "is_final_package",
        key: "is_final_package",
        sorter: (a, b) => (a.is_final_package > b.is_final_package ? -1 : 1),
        render: (text) => <div title="Part of Permit">{text ? "Yes" : "No"}</div>,
      },
    ];

    if (props.addDescriptionColumn) {
      tableColumns.splice(2, 0, descriptionColumn);
    }

    const deleteButtonColumn = {
      title: "",
      dataIndex: "isDeletionAllowed",
      key: "isDeletionAllowed",
      render: (isDeletionAllowed, record) => {
        if (isDeletionAllowed) {
          return (
            <NOWActionWrapper permission={Permission.EDIT_PERMITS}>
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
            </NOWActionWrapper>
          );
        }
        return (
          /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
          <div disabled onClick={(event) => event.stopPropagation()}>
            <Tooltip
              title="You cannot remove a document that is a part of the Final Application Package."
              placement="right"
              mouseEnterDelay={0.3}
            >
              <Button ghost type="primary" disabled size="small">
                <img className="lessOpacity" name="remove" src={TRASHCAN} alt="Remove document" />
              </Button>
            </Tooltip>
          </div>
        );
      },
    };

    if (!isViewMode) {
      tableColumns.push(deleteButtonColumn);
    }

    return tableColumns;
  };

  const transformDocuments = (
    documents,
    now_application_guid,
    noticeOfWorkApplicationDocumentTypeOptionsHash
  ) =>
    documents &&
    documents.map((document) => ({
      key: document.now_application_document_xref_guid,
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
        Strings.EMPTY_FIELD,
      description: document.description || Strings.EMPTY_FIELD,
      is_final_package: document.is_final_package || false,
      isDeletionAllowed: !document.is_final_package,
    }));

  return (
    <div>
      <p>{props.disclaimerText}</p>
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
      />
      <br />

      {!props.selectedRows && !props.isViewMode && (
        <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab={props.isAdminView ? "" : "REV"}>
          <AddButton
            className={props.isAdminView ? "position-right" : ""}
            disabled={props.isViewMode}
            style={props.isAdminView ? { marginRight: "100px" } : {}}
            onClick={openAddDocumentModal}
          >
            Add Document
          </AddButton>
        </NOWActionWrapper>
      )}
    </div>
  );
};

NOWDocuments.propTypes = propTypes;
NOWDocuments.defaultProps = defaultProps;
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
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(NOWDocuments);
