import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { arrayPush } from "redux-form";
import { debounce } from "lodash";
import { PropTypes } from "prop-types";
import { Table } from "antd";
import moment from "moment";
import { formatDateTime } from "@common/utils/helpers";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getNoticeOfWorkApplicationDocumentTypeOptionsHash } from "@common/selectors/staticContentSelectors";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@common/constants/strings";
import LinkButton from "@/components/common/LinkButton";
import AddButton from "@/components/common/AddButton";
import { modalConfig } from "@/components/modalContent/config";
import * as FORM from "@/constants/forms";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  now_application_guid: PropTypes.string.isRequired,
  mine_guid: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(PropTypes.any).isRequired,
  noticeOfWorkApplicationDocumentTypeOptionsHash: PropTypes.objectOf(PropTypes.any).isRequired,
  arrayPush: PropTypes.func.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  selectedRows: PropTypes.objectOf(PropTypes.any),
  categoriesToShow: PropTypes.arrayOf(PropTypes.string),
  disclaimerText: PropTypes.string,
  isAdminView: PropTypes.bool,
  handleAfterUpload: PropTypes.func,
};
const defaultProps = {
  selectedRows: null,
  categoriesToShow: [],
  disclaimerText: "",
  isAdminView: false,
  handleAfterUpload: () => {},
};

const handleAddDocument = (closeDocumentModal, addDocument, handleAfterUpload) => (values) => {
  const document = {
    now_application_document_type_code: values.now_application_document_type_code,
    description: values.description,
    is_final_package: values.is_final_package,
    mine_document: {
      document_manager_guid: values.document_manager_guid,
      document_name: values.document_name,
      mine_guid: values.mine_guid,
    },
  };
  addDocument(FORM.EDIT_NOTICE_OF_WORK, "documents", document);
  closeDocumentModal();
  handleAfterUpload();
};

const openAddDocumentModal = (
  event,
  openDocumentModal,
  closeDocumentModal,
  addDocument,
  now_application_guid,
  mine_guid,
  categoriesToShow,
  handleAfterUpload
) => {
  event.preventDefault();
  openDocumentModal({
    props: {
      onSubmit: debounce(
        handleAddDocument(closeDocumentModal, addDocument, handleAfterUpload),
        2000
      ),
      title: `Add Notice of Work document`,
      now_application_guid,
      mine_guid,
      categoriesToShow,
    },
    content: modalConfig.EDIT_NOTICE_OF_WORK_DOCUMENT,
  });
};

export const NOWDocuments = (props) => {
  const columns = (noticeOfWorkApplicationDocumentTypeOptionsHash, categoriesToShow) => {
    const filtered = Object.keys(noticeOfWorkApplicationDocumentTypeOptionsHash)
      .filter((key) => (categoriesToShow.length > 0 ? categoriesToShow.includes(key) : key))
      .reduce((obj, key) => {
        obj[key] = noticeOfWorkApplicationDocumentTypeOptionsHash[key];
        return obj;
      }, {});
    const categoryFilters = Object.values(filtered).map((dt) => ({
      text: dt,
      value: dt,
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
    return [
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
        title: "Description",
        dataIndex: "description",
        key: "description",
        sorter: (a, b) => (a.description > b.description ? -1 : 1),
        render: (text) => <div title="Proponent Description">{text}</div>,
      },
      {
        title: "Upload Date/Time",
        dataIndex: "upload_date",
        key: "upload_date",
        sorter: (a, b) => (moment(a.upload_date) > moment(b.upload_date) ? -1 : 1),
        render: (text, record) => (
          <div title="Due">{formatDateTime(record.upload_date) || "Pending"}</div>
        ),
      },
    ];
  };

  const transformDocuments = (
    documents,
    now_application_guid,
    noticeOfWorkApplicationDocumentTypeOptionsHash
  ) =>
    documents &&
    documents.map((document) => ({
      key: document.now_application_document_xref_guid,
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
    }));

  return (
    <div>
      {props.isAdminView && (
        <>
          <div className="inline-flex between">
            <p>{props.disclaimerText}</p>
            <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
              <AddButton
                disabled={props.isViewMode}
                onClick={(event) =>
                  openAddDocumentModal(
                    event,
                    props.openModal,
                    props.closeModal,
                    props.arrayPush,
                    props.now_application_guid,
                    props.mine_guid,
                    props.categoriesToShow,
                    props.handleAfterUpload
                  )
                }
              >
                Add Document
              </AddButton>
            </AuthorizationWrapper>
          </div>
        </>
      )}
      {!props.isAdminView && <p>{props.disclaimerText}</p>}
      <br />
      <Table
        align="left"
        pagination={false}
        columns={columns(
          props.noticeOfWorkApplicationDocumentTypeOptionsHash,
          props.categoriesToShow
        )}
        dataSource={transformDocuments(
          props.documents,
          props.now_application_guid,
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

      {!props.selectedRows && !props.isViewMode && !props.isAdminView && (
        <AddButton
          disabled={props.isViewMode}
          onClick={(event) =>
            openAddDocumentModal(
              event,
              props.openModal,
              props.closeModal,
              props.arrayPush,
              props.now_application_guid,
              props.mine_guid,
              props.categoriesToShow,
              props.handleAfterUpload
            )
          }
        >
          Add Document
        </AddButton>
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
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      arrayPush,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(NOWDocuments);
