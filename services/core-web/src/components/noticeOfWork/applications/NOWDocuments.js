import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
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

const columns = [
  {
    title: "File Name",
    dataIndex: "filename",
    key: "filename",
    sorter: (a, b) => (a.filename > b.filename ? -1 : 1),
    render: (text) => (
      <div title="File Name">
        <LinkButton onClick={() => {}}>
          <span>{text}</span>
        </LinkButton>
      </div>
    ),
  },
  {
    title: "Category",
    dataIndex: "category",
    key: "category",
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

const transfromDocuments = (documents, now_application_guid) =>
  documents.map((document) => ({
    key: document.id,
    now_application_guid,
    filename: document.document_name || Strings.EMPTY_FIELD,
    upload_date: document.upload_date,
    category: document.now_application_document_type_code_description || Strings.EMPTY_FIELD,
    description: document.description || Strings.EMPTY_FIELD,
  }));

const handleAddDocument = (closeDocumentModal, addDocumentToNoticeOfWork) => (values) => {
  addDocumentToNoticeOfWork(values);
  closeDocumentModal();
};

const openAddDocumentModal = (
  event,
  openDocumentModal,
  closeDocumentModal,
  addDocumentToNoticeOfWork,
  now_application_guid
) => {
  event.preventDefault();
  openDocumentModal({
    props: {
      onSubmit: debounce(handleAddDocument(closeDocumentModal, addDocumentToNoticeOfWork), 2000),
      title: `Add Notice of Work document`,
      now_application_guid,
    },
    content: modalConfig.EDIT_NOTICE_OF_WORK_DOCUMENT,
  });
};

const propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  now_application_guid: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(PropTypes.any).isRequired,
  addDocumentToNoticeOfWork: PropTypes.func.isRequired,
};

export const NOWDocuments = (props) => (
  <div>
    <AddButton
      onClick={(event) =>
        openAddDocumentModal(
          event,
          props.openModal,
          props.closeModal,
          props.addDocumentToNoticeOfWork,
          props.now_application_guid
        )
      }
    >
      Add a Document
    </AddButton>
    <div className="padding-large--sides">
      {props.documents && props.documents.length >= 1 ? (
        <Table
          align="left"
          pagination={false}
          columns={columns}
          dataSource={transfromDocuments(props.documents, props.now_application_guid)}
          locale={{
            emptyText: "There are no additional documents associated with this Notice of Work",
          }}
        />
      ) : (
        <NullScreen type="documents" />
      )}
    </div>
  </div>
);

NOWDocuments.propTypes = propTypes;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps
)(NOWDocuments);
