import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { arrayPush } from "redux-form";
import { debounce } from "lodash";
import { PropTypes } from "prop-types";
import { Table } from "antd";
import moment from "moment";
import LinkButton from "@/components/common/LinkButton";
import AddButton from "@/components/common/AddButton";
import * as Strings from "@/constants/strings";
import NullScreen from "@/components/common/NullScreen";
import { formatDateTime } from "@/utils/helpers";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";
import { getNoticeOfWorkApplicationDocumentTypeOptionsHash } from "@/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import { downloadFileFromDocumentManager } from "@/utils/actionlessNetworkCalls";

const columns = (noticeOfWorkApplicationDocumentTypeOptionsHash) => {
  const categoryFilters = Object.values(noticeOfWorkApplicationDocumentTypeOptionsHash).map(
    (dt) => ({
      text: dt,
      value: dt,
    })
  );
  return [
    {
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
    },
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

const transfromDocuments = (
  documents,
  now_application_guid,
  noticeOfWorkApplicationDocumentTypeOptionsHash
) =>
  documents.map((document) => ({
    key: document.id,
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

const handleAddDocument = (closeDocumentModal, addDocument) => (values) => {
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
};

const openAddDocumentModal = (
  event,
  openDocumentModal,
  closeDocumentModal,
  addDocument,
  now_application_guid,
  mine_guid
) => {
  event.preventDefault();
  openDocumentModal({
    props: {
      onSubmit: debounce(handleAddDocument(closeDocumentModal, addDocument), 2000),
      title: `Add Notice of Work document`,
      now_application_guid,
      mine_guid,
    },
    content: modalConfig.EDIT_NOTICE_OF_WORK_DOCUMENT,
  });
};

const propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  now_application_guid: PropTypes.string.isRequired,
  mine_guid: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(PropTypes.any).isRequired,
  noticeOfWorkApplicationDocumentTypeOptionsHash: PropTypes.objectOf(PropTypes.any).isRequired,
  arrayPush: PropTypes.func.isRequired,
  isViewMode: PropTypes.bool.isRequired,
};

export const NOWDocuments = (props) => (
  <div>
    {props.documents && props.documents.length >= 1 ? (
      <Table
        align="left"
        pagination={false}
        columns={columns(props.noticeOfWorkApplicationDocumentTypeOptionsHash)}
        dataSource={transfromDocuments(
          props.documents,
          props.now_application_guid,
          props.noticeOfWorkApplicationDocumentTypeOptionsHash
        )}
        locale={{
          emptyText: "There are no additional documents associated with this Notice of Work",
        }}
      />
    ) : (
      <NullScreen type="documents" />
    )}
    <AddButton
      disabled={props.isViewMode}
      onClick={(event) =>
        openAddDocumentModal(
          event,
          props.openModal,
          props.closeModal,
          props.arrayPush,
          props.now_application_guid,
          props.mine_guid
        )
      }
    >
      Add a Document
    </AddButton>
  </div>
);

NOWDocuments.propTypes = propTypes;

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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NOWDocuments);
