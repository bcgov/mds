import React from "react";
import PropTypes from "prop-types";
import { truncateFilename } from "@common/utils/helpers";
import { Button, Tag, Row } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";
import DocumentLink from "@/components/common/DocumentLink";
import CoreTable from "./CoreTable";
import { categoryColumn, uploadDateColumn } from "./DocumentColumns";
import { closeModal, openModal } from "@common/actions/modalActions";
import { archiveMineDocuments } from "@common/actionCreators/mineActionCreator";
import modalConfig from "../modalContent/config";
import { Feature, isFeatureEnabled } from "@mds/common";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.mineDocument),
  documentParent: PropTypes.string.isRequired,
  categoryDataIndex: PropTypes.string.isRequired,
  uploadDateIndex: PropTypes.string.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  handleDeleteDocument: PropTypes.func,
  // eslint-disable-next-line react/no-unused-prop-types
  deletePayload: PropTypes.objectOf(PropTypes.string),
  // eslint-disable-next-line react/no-unused-prop-types
  documentColumns: PropTypes.arrayOf(PropTypes.string),
  deletePermission: PropTypes.string,
  view: PropTypes.string,
  excludedColumnKeys: PropTypes.arrayOf(PropTypes.string),
  archiveMineDocuments: PropTypes.func,
  archiveDocumentsArgs: PropTypes.shape({
    mineGuid: PropTypes.string,
  }),
  onArchivedDocuments: PropTypes.func,
  canArchiveDocuments: PropTypes.bool,
};

const defaultProps = {
  documents: [],
  handleDeleteDocument: () => {},
  deletePayload: {},
  documentColumns: [],
  deletePermission: null,
  canArchiveDocuments: false,
};

const deleteEnabledDocumentParents = [
  "Major Mine Application",
  "Information Requirements Table",
  "Project Description",
  "Mine Incident",
];

const openArchiveModal = (event, props, documents) => {
  event.preventDefault();

  props.openModal({
    props: {
      title: `Archive ${documents?.length > 1 ? "Multiple Files" : "File"}`,
      closeModal: props.closeModal,
      handleSubmit: async () => {
        await props.archiveMineDocuments(
          props.archiveDocumentsArgs.mineGuid,
          documents.map((d) => d.mine_document_guid)
        );
        if (props.onArchivedDocuments) {
          props.onArchivedDocuments(documents);
        }
      },
      documents,
    },
    content: modalConfig.ARCHIVE_DOCUMENT,
  });
};

const withTag = (text, elem) => {
  return (
    <Row justify="space-between">
      {elem}

      <Tag color="#B3B3B3">{text}</Tag>
    </Row>
  );
};

export const DocumentTable = (props) => {
  let columns = [
    {
      title: "File Name",
      key: "document_name",
      dataIndex: "document_name",
      render: (text, record) => {
        const fileName = (
          <div title="File Name">
            <LinkButton title={text} onClick={() => downloadFileFromDocumentManager(record)}>
              {truncateFilename(text)}
            </LinkButton>
          </div>
        );

        return record.is_archived ? withTag("Archived", fileName) : fileName;
      },
    },
  ];

  const catColumn = categoryColumn(props.categoryDataIndex, props.documentCategoryOptionsHash);
  const uploadedDateColumn = uploadDateColumn(props.uploadDateIndex);

  const canDeleteDocuments =
    props?.deletePayload &&
    props?.handleDeleteDocument &&
    props?.deletePermission &&
    deleteEnabledDocumentParents.includes(props.documentParent);

  if (canDeleteDocuments) {
    columns[0] = {
      title: "File Name",
      key: "document_name",
      dataIndex: "document_name",
      render: (text, record) => {
        const { mine_document_guid } = record;
        const payload = { ...props.deletePayload, mineDocumentGuid: mine_document_guid };
        return (
          <div key={record?.mine_document_guid}>
            <DocumentLink
              documentManagerGuid={record.document_manager_guid}
              documentName={text}
              handleDelete={props.handleDeleteDocument}
              deletePayload={payload}
              deletePermission={props?.deletePermission}
            />
          </div>
        );
      },
      sorter: (a, b) => (a.document_name > b.document_name ? -1 : 1),
    };
  }

  const archiveColumn = {
    key: "archive",
    className: props.isViewOnly || !props.canArchiveDocuments ? "column-hide" : "",
    render: (record) => (
      <div
        className={
          !record?.mine_document_guid || props.isViewOnly || !props.canArchiveDocuments
            ? "column-hide"
            : ""
        }
      >
        <Button
          ghost
          type="primary"
          size="small"
          onClick={(event) => openArchiveModal(event, props, [record])}
        >
          Archive
        </Button>
      </div>
    ),
  };

  if (props.documentColumns?.length > 0) {
    columns.push(...props.documentColumns);
  } else {
    columns.push(catColumn);
    columns.push(uploadedDateColumn);
  }

  if (props.canArchiveDocuments && isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE)) {
    columns.push(archiveColumn);
  }

  if (props?.excludedColumnKeys?.length) {
    columns = columns.filter((column) => !props.excludedColumnKeys.includes(column.key));
  }

  return (
    <div>
      <CoreTable
        columns={columns}
        rowKey={(record) => record.mine_document_guid}
        emptyText={`This ${props.documentParent} does not contain any documents.`}
        dataSource={props.documents}
      />
    </div>
  );
};

DocumentTable.propTypes = propTypes;
DocumentTable.defaultProps = defaultProps;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      archiveMineDocuments,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(DocumentTable);
