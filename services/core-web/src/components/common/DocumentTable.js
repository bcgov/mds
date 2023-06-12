import React from "react";
import PropTypes from "prop-types";
import { Table, Popconfirm, Button } from "antd";
import { formatDate, dateSorter, nullableStringSorter } from "@common/utils/helpers";
import { some } from "lodash";
import DocumentLink from "@/components/common/DocumentLink";
import { TRASHCAN } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import { closeModal, openModal } from "@common/actions/modalActions";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { modalConfig } from "@/components/modalContent/config";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.documentRecord),
  isViewOnly: PropTypes.bool,
  // eslint-disable-next-line react/no-unused-prop-types
  removeDocument: PropTypes.func,
  archiveDocuments: PropTypes.func,
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
  openModal: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
};

const defaultProps = {
  documents: [],
  isViewOnly: false,
  removeDocument: () => {},
  archiveDocuments: () => {},
  excludedColumnKeys: [],
  additionalColumnProps: [],
  documentColumns: null,
  documentParent: null,
  view: "standard",
};

const openArchiveModal = (event, props, documents) => {
  event.preventDefault();

  props.openModal({
    props: {
      title: `Archive ${props.documents?.length > 1 ? "Multiple Files" : "File"}`,
      closeModal: props.closeModal,
      handleSubmit: props.archiveDocuments,
      documents,
    },
    content: modalConfig.ARCHIVE_DOCUMENT,
    // width: "75vw",
  });
};

export const DocumentTable = (props) => {
  const isMinimalView = props.view === "minimal";

  let columns = [
    {
      title: "Name",
      key: "name",
      dataIndex: "name",
      sorter: !isMinimalView && nullableStringSorter("name"),
      render: (text, record) => {
        if (isMinimalView) {
          return record.name;
        }

        return (
          <div key={record.key} title="Name">
            <DocumentLink
              documentManagerGuid={record.document_manager_guid}
              documentName={record.name}
              truncateDocumentName={false}
            />
          </div>
        );
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
    {
      key: "archive",
      className: props.isViewOnly || !props.archiveDocuments ? "column-hide" : "",
      render: (text, record) => (
        <div className={props.isViewOnly || !props.archiveDocuments ? "column-hide" : ""}>
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
  ];

  if (isMinimalView) {
    props.excludedColumnKeys = props.excludedColumnKeys.concat(["remove", "archive", "category"]);
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

  return (
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
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(DocumentTable);
