import React from "react";
import PropTypes from "prop-types";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import CoreTable from "@/components/common/CoreTable";
import {
  documentNameColumn,
  removeFunctionColumn,
  uploadDateColumn,
  uploadedByColumn,
} from "./DocumentColumns";
import { renderTextColumn, documentActionOperationsColumn } from "./CoreTableCommonColumns";
import { Button } from "antd";
import { some } from "lodash";
import { closeModal, openModal } from "@common/actions/modalActions";
import { archiveMineDocuments } from "@common/actionCreators/mineActionCreator";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { modalConfig } from "@/components/modalContent/config";
import { Feature, isFeatureEnabled } from "@mds/common";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.documentRecord),
  isViewOnly: PropTypes.bool,
  // eslint-disable-next-line react/no-unused-prop-types
  removeDocument: PropTypes.func,
  archiveMineDocuments: PropTypes.func,
  archiveDocumentsArgs: PropTypes.shape({
    mineGuid: PropTypes.string,
  }),
  onArchivedDocuments: PropTypes.func,
  canArchiveDocuments: PropTypes.bool,
  excludedColumnKeys: PropTypes.arrayOf(PropTypes.string),
  additionalColumnProps: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      colProps: PropTypes.objectOf(PropTypes.string),
    })
  ),
  // eslint-disable-next-line react/no-unused-prop-types
  documentParent: PropTypes.string,
  documentColumns: PropTypes.arrayOf(PropTypes.object),
  isLoaded: PropTypes.bool,
  matchChildColumnsToParent: PropTypes.bool,
  defaultSortKeys: PropTypes.arrayOf(PropTypes.string),
  openModal: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
};

const defaultProps = {
  documents: [],
  isViewOnly: false,
  removeDocument: () => {},
  excludedColumnKeys: [],
  additionalColumnProps: [],
  documentColumns: null,
  documentParent: null,
  isLoaded: false,
  matchChildColumnsToParent: false,
  defaultSortKeys: ["upload_date", "dated", "update_timestamp"], // keys to sort by when page loads
  view: "standard",
  canArchiveDocuments: false,
};

const renderFileType = (file) => {
  const index = file.lastIndexOf(".");
  return index === -1 ? null : file.substr(index);
};

const parseVersions = (versions, documentType) =>
  versions.map((version) => ({
    key: version.mine_document_version_guid,
    file_location:
      Strings.MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE_LOCATION[documentType] ||
      Strings.EMPTY_FIELD,
    file_type: renderFileType(version.document_name) || Strings.EMPTY_FIELD,
    ...version,
  }));

const transformRowData = (document) => {
  const pastFiles = parseVersions(document.versions, document.major_mine_application_document_type);
  const currentFile = {
    key: document.key,
    file_location:
      Strings.MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE_LOCATION[
        document.major_mine_application_document_type
      ] || Strings.EMPTY_FIELD,
    file_type: renderFileType(document.document_name) || Strings.EMPTY_FIELD,
    number_of_versions: document?.versions?.length,
    ...document,
  };

  return {
    ...currentFile,
    children: pastFiles,
  };
};

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

export const DocumentTable = (props) => {
  console.log("inside documentTable");
  console.log(props);
  const isMinimalView = props.view === "minimal";
  const canDelete = !props.isViewOnly && props.removeDocument;
  const canArchive =
    !props.isViewOnly &&
    props.canArchiveDocuments &&
    isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE);

  const archiveColumn = {
    key: "archive",
    render: (record) => {
      const button = (
        <Button
          ghost
          type="primary"
          size="small"
          onClick={(event) => openArchiveModal(event, props, [record])}
        >
          Archive
        </Button>
      );
      return record?.mine_document_guid ? <div>{button}</div> : <div></div>;
    },
  };

  let columns = props.matchChildColumnsToParent
    ? [
        documentNameColumn("document_name", "File Name"),
        renderTextColumn("file_location", "File Location", !isMinimalView),
        renderTextColumn("file_type", "File Type", !isMinimalView),
        uploadDateColumn("update_timestamp", "Last Modified"),
        uploadedByColumn("create_user", "Created By"),
        documentActionOperationsColumn(),
      ]
    : [
        documentNameColumn("document_name", "File Name", isMinimalView),
        renderTextColumn("category", "Category", !isMinimalView),
        uploadDateColumn("upload_date", "Uploaded", !isMinimalView),
        uploadDateColumn("dated", "Dated", !isMinimalView),
      ];

  const currentRowData = props.matchChildColumnsToParent
    ? props.documents?.map((document) => {
        return transformRowData(document);
      })
    : null;

  if (canDelete) {
    columns.push(removeFunctionColumn(props.removeDocument, props?.documentParent));
  }

  if (canArchive) {
    columns.push(archiveColumn);
  }

  if (!some(props.documents, "dated")) {
    columns = columns.filter((column) => column.key !== "dated");
  }

  if (props?.excludedColumnKeys?.length > 0) {
    columns = columns.filter((column) => !props.excludedColumnKeys.includes(column.key));
  }

  if (props?.additionalColumnProps?.length > 0) {
    // eslint-disable-next-line no-unused-expressions
    props?.additionalColumnProps.forEach((addColumn) => {
      const columnIndex = columns.findIndex((column) => addColumn?.key === column.key);
      if (columnIndex >= 0) {
        columns[columnIndex] = { ...columns[columnIndex], ...addColumn?.colProps };
      }
    });
  }

  if (props.defaultSortKeys.length > 0) {
    columns = columns.map((column) => {
      const isDefaultSort = props.defaultSortKeys.includes(column.key);
      return isDefaultSort ? { defaultSortOrder: "descend", ...column } : column;
    });
  }

  const minimalProps = isMinimalView
    ? { size: "small", rowClassName: "ant-table-row-minimal" }
    : null;
  return props.matchChildColumnsToParent ? (
    <CoreTable
      condition={props.isLoaded}
      dataSource={currentRowData}
      columns={columns}
      expandProps={{
        matchChildColumnsToParent: props.matchChildColumnsToParent,
        rowExpandable: (record) => record.number_of_versions > 0,
      }}
    />
  ) : (
    <CoreTable
      columns={props?.documentColumns ?? columns}
      dataSource={props.documents}
      {...minimalProps}
    />
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
