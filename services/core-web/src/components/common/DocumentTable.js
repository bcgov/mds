import React from "react";
import PropTypes from "prop-types";
import { Table, Popconfirm, Button, Tooltip, Tag } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { formatDate, dateSorter, nullableStringSorter } from "@common/utils/helpers";
import { some } from "lodash";
import DocumentLink from "@/components/common/DocumentLink";
import { TRASHCAN } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@common/constants/strings";
import CoreTable from "@/components/common/CoreTable";
import DocumentActions from "@/components/common/DocumentActions";
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
  expandable: PropTypes.bool,
  openModal: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
};

const renderFileLocation = (documentTypeCode) => {
  let location = "N/A";
  switch (documentTypeCode) {
    case "PRM":
      location = "Primary Document";
      break;
    case "SPT":
      location = "Spatial Component";
      break;
    case "SPR":
      location = "Supporting Document";
      break;
  }

  return location;
};

const renderFileType = (file) => {
  const index = file.lastIndexOf(".");
  return index === -1 ? "N/A" : file.substr(index);
};

const parseFiles = (versions, documentType) =>
  versions.map((version, index) => ({
    document: version,
    key: version.mine_document_version_guid,
    fileName: version.document_name,
    fileLocation: renderFileLocation(documentType) || Strings.EMPTY_FIELD,
    fileType: renderFileType(version.document_name) || Strings.EMPTY_FIELD,
    lastModified:
      (version.update_timestamp && formatDate(version.update_timestamp)) || Strings.EMPTY_FIELD,
    createdBy: version.create_user,
    numberOfVersions: index === 0 ? versions.length - 1 : 0,
  }));

const transformRowData = (document) => {
  const files = parseFiles(document.versions, document.major_mine_application_document_type);
  const currentFile = files[0];
  const pastFiles = files.slice(1);

  return {
    ...currentFile,
    children: pastFiles,
  };
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
  expandable: false,
  view: "standard",
  canArchiveDocuments: false,
};

const openArchiveModal = (event, props, documents) => {
  event.preventDefault();

  props.openModal({
    props: {
      title: `Archive ${props.documents?.length > 1 ? "Multiple Files" : "File"}`,
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

const withTag = (record, elem, title) => {
  return (
    <div className="inline-flex flex-between file-name-container" title={title}>
      {elem}

      <span className="file-history-container">
        {record?.numberOfVersions > 0 ? (
          <span>
            <Tooltip
              title={`This file has ${record.numberOfVersions} previous versions`}
              placement="top"
              mouseEnterDelay={1}
            >
              <Tag icon={<ClockCircleOutlined />} color="#5E46A1" className="file-version-amount">
                {record.numberOfVersions}
              </Tag>
            </Tooltip>
          </span>
        ) : null}
        {record?.is_archived ? <Tag>{"Archived"}</Tag> : null}
      </span>
    </div>
  );
};

export const DocumentTable = (props) => {
  const isMinimalView = props.view === "minimal";
  let columns = props.expandable
    ? [
        {
          className: "file-name-column",
          title: "File Name",
          dataIndex: "fileName",
          key: "fileName",
          render: (text, record) => {
            let content = (
              <div
                className="file-name-text"
                style={record?.numberOfVersions === 0 ? { marginLeft: "38px" } : {}}
              >
                {text}
              </div>
            );

            return record?.numberOfVersions > 0 || record?.is_archived ? (
              withTag(record, content, "File Name")
            ) : (
              <div title="File Name">{content}</div>
            );
          },
        },
        {
          title: "File Location",
          dataIndex: "fileLocation",
          key: "fileLocation",
          render: (text) => <div title="File Location">{text}</div>,
        },
        {
          title: "File Type",
          dataIndex: "fileType",
          key: "fileType",
          render: (text) => <div title="File Type">{text}</div>,
        },
        {
          title: "Last Modified",
          dataIndex: "lastModified",
          key: "lastModified",
          render: (text) => <div title="Last Modified">{text}</div>,
        },
        {
          title: "Created By",
          dataIndex: "createdBy",
          key: "createdBy",
          render: (text) => <div title="Created By">{text}</div>,
        },
        {
          title: "",
          dataIndex: "operations",
          key: "operations",
          align: "right",
          render: (text, record) => {
            return (
              <DocumentActions
                openDocument
                document={{
                  documentName: record.document.document_name,
                  documentMangerGuid: record.document.document_manager_guid,
                }}
              />
            );
          },
        },
      ]
    : [
        {
          title: "Name",
          key: "name",
          dataIndex: "name",
          sorter: !isMinimalView && nullableStringSorter("name"),
          render: (text, record) => {
            let content = record.name;

            if (!isMinimalView) {
              content = (
                <div key={record.key} title="Name">
                  <DocumentLink
                    documentManagerGuid={record.document_manager_guid}
                    documentName={record.name}
                    truncateDocumentName={false}
                  />
                </div>
              );
            }

            return record.is_archived ? withTag(record, content, "Name") : content;
          },
        },
        {
          title: "Dated",
          key: "dated",
          dataIndex: "dated",
          sorter: !isMinimalView && dateSorter("dated"),
          defaultSortOrder: "descend",
          render: (text) => <div title="Dated">{formatDate(text)}</div>,
        },
        {
          title: "Category",
          key: "category",
          dataIndex: "category",
          sorter: !isMinimalView && nullableStringSorter("category"),
          render: (text) => <div title="Category">{text}</div>,
        },
        {
          title: "Uploaded",
          key: "uploaded",
          dataIndex: "uploaded",
          sorter: !isMinimalView && dateSorter("uploaded"),
          defaultSortOrder: "descend",
          render: (text) => <div title="Uploaded">{formatDate(text)}</div>,
        },
        {
          key: "remove",
          className: props.isViewOnly || !props.removeDocument ? "column-hide" : "",
          render: (text, record) => (
            <div className={props.isViewOnly || !props.removeDocument ? "column-hide" : ""}>
              <Popconfirm
                placement="topLeft"
                title={`Are you sure you want to delete ${record.name}?`}
                onConfirm={(event) =>
                  props.removeDocument(event, record.key, props?.documentParent)
                }
                okText="Delete"
                cancelText="Cancel"
              >
                <Button ghost type="primary" size="small">
                  <img src={TRASHCAN} alt="Remove" />
                </Button>
              </Popconfirm>
            </div>
          ),
        },
        isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE) && {
          key: "archive",
          className: props.isViewOnly || !props.canArchiveDocuments ? "column-hide" : "",
          render: (text, record) => (
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
        },
      ].filter(Boolean);

  const currentRowData = props.expandable
    ? props.documents?.map((document) => {
        return transformRowData(document);
      })
    : null;

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

  return props.expandable ? (
    <CoreTable
      condition={props.isLoaded}
      dataSource={currentRowData}
      columns={columns}
      recordType="document history"
      tableProps={{
        className: "nested-table",
        rowClassName: "table-row-align-middle pointer fade-in expandable-table-rows",
        align: "left",
        pagination: false,
        indentSize: 0,
        expandable: true,
      }}
    />
  ) : (
    <Table
      pagination={false}
      columns={props?.documentColumns ?? columns}
      locale={{ emptyText: "No Data Yet" }}
      dataSource={props.documents}
      showHeader={!isMinimalView}
      size={isMinimalView ? "small" : undefined}
      rowClassName={isMinimalView ? "ant-table-row-minimal" : undefined}
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
