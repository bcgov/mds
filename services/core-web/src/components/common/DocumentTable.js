import React from "react";
import PropTypes from "prop-types";
import { Table, Popconfirm, Button, Tooltip } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { formatDate, dateSorter, nullableStringSorter } from "@common/utils/helpers";
import { some } from "lodash";
import DocumentLink from "@/components/common/DocumentLink";
import { TRASHCAN } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@common/constants/strings";
import CoreTable from "@/components/common/CoreTable";

import DocumentActions from "@/components/common/DocumentActions";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.documentRecord),
  isViewOnly: PropTypes.bool,
  // eslint-disable-next-line react/no-unused-prop-types
  removeDocument: PropTypes.func,
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
  expandable: PropTypes.bool
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
  versions.map((version, index) =>
  ({
    document: version,
    key: version.mine_document_version_guid,
    fileName: version.document_name,
    fileLocation: renderFileLocation(documentType) || Strings.EMPTY_FIELD,
    fileType: renderFileType(version.document_name) || Strings.EMPTY_FIELD,
    lastModified: (version.update_timestamp && formatDate(version.update_timestamp)) || Strings.EMPTY_FIELD,
    createdBy: version.create_user,
    numberOfVersions: (index === 0 ? (versions.length) - 1 : 0),
  })
  );

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
  removeDocument: () => { },
  excludedColumnKeys: [],
  additionalColumnProps: [],
  documentColumns: null,
  documentParent: null,
  isLoaded: false,
  expandable: false,
};

export const DocumentTable = (props) => {
  let columns = props.expandable
    ? [
      {
        className: "file-name-column",
        title: "File Name",
        dataIndex: "fileName",
        key: "fileName",
        render: (text, record) => {
          return (
            <div className="file-name-container" title="File Name">
              <span className="file-name-text" style={!record.numberOfVersions ? { marginLeft: "23px" } : {}}>{text}</span>
              {record?.numberOfVersions > 0 ?
                (<span className="file-history-container">
                  <span>
                    <Tooltip
                      title={`This file has ${record.numberOfVersions} previous versions`}
                      placement="top"
                      mouseEnterDelay={1}
                    >
                      <span className="file-version-amount">
                        <ClockCircleOutlined />
                        <span>{record.numberOfVersions}</span>
                      </span>
                    </Tooltip>
                  </span>
                </span>) : null
              }
            </div>
          )
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
              document={
                {
                  documentName: record.document.document_name,
                  documentMangerGuid: record.document.document_manager_guid,
                }
              } />
          );
        },
      },
    ]
    : [
      {
        title: "Name",
        key: "name",
        dataIndex: "name",
        sorter: nullableStringSorter("name"),
        render: (text, record) => {
          return (
            <div key={record.key} title="Name">
              <DocumentLink
                documentManagerGuid={record.document_manager_guid}
                documentName={record.name}
                truncateDocumentName={false}
              />
            </div>
          )
        },
      },
      {
        title: "Dated",
        key: "dated",
        dataIndex: "dated",
        sorter: dateSorter("dated"),
        defaultSortOrder: "descend",
        render: (text) => <div title="Dated">{formatDate(text)}</div>,
      },
      {
        title: "Category",
        key: "category",
        dataIndex: "category",
        sorter: nullableStringSorter("category"),
        render: (text) => <div title="Category">{text}</div>,
      },
      {
        title: "Uploaded",
        key: "uploaded",
        dataIndex: "uploaded",
        sorter: dateSorter("uploaded"),
        defaultSortOrder: "descend",
        render: (text) => <div title="Uploaded">{formatDate(text)}</div>,
      },
      {
        key: "remove",
        className: props.isViewOnly || !props.removeDocument ? "column-hide" : "",
        render: (text, record) => (
          <div
            align="right"
            className={props.isViewOnly || !props.removeDocument ? "column-hide" : ""}
          >
            <Popconfirm
              placement="topLeft"
              title={`Are you sure you want to delete ${record.name}?`}
              onConfirm={(event) => props.removeDocument(event, record.key, props?.documentParent)}
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
    ];

  const currentRowData = props.expandable
    ? props.documents?.map((document) => {
      return transformRowData(
        document,
      )
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

  return (
    (
      props.expandable ?
        (<CoreTable
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
        />)
        : (<Table
          align="left"
          pagination={false}
          columns={props?.documentColumns ?? columns}
          locale={{ emptyText: "No Data Yet" }}
          dataSource={props.documents}
        />)
    )
  );
};

DocumentTable.propTypes = propTypes;
DocumentTable.defaultProps = defaultProps;

export default DocumentTable;
