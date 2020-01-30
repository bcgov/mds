import React from "react";
import { PropTypes } from "prop-types";
import { Table } from "antd";
import { downloadNowDocument } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@common/constants/strings";
import LinkButton from "@/components/common/LinkButton";
import { UNIQUELY_SPATIAL } from "@/constants/fileTypes";
import NullScreen from "@/components/common/NullScreen";

const propTypes = {
  now_application_guid: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(PropTypes.any).isRequired,
  selectedRows: PropTypes.objectOf(PropTypes.any),
};
const defaultProps = { selectedRows: null };

const isSpatialFile = (document) =>
  document.documenttype === "SpatialFileDoc" ||
  (document.filename &&
    Object.keys(UNIQUELY_SPATIAL).includes(document.filename.substr(document.filename.length - 4)));

const transformDocuments = (documents, now_application_guid, spatial = false) =>
  documents
    .filter((document) => (spatial ? isSpatialFile(document) : !isSpatialFile(document)))
    .map((document) => ({
      key: document.id,
      now_application_guid,
      filename: document.filename || Strings.EMPTY_FIELD,
      url: document.documenturl,
      category: document.documenttype || Strings.EMPTY_FIELD,
      description: document.description || Strings.EMPTY_FIELD,
    }));

export const NOWSubmissionDocuments = (props) => {
  const fileNameColum = props.selectedRows
    ? {
        title: "File Name",
        dataIndex: "filename",
        key: "filename",
        render: (text) => <div title="File Name">{text}</div>,
      }
    : {
        title: "File Name",
        dataIndex: "filename",
        key: "filename",
        render: (text, record) => (
          <div title="File Name">
            <LinkButton
              onClick={() =>
                downloadNowDocument(record.key, record.now_application_guid, record.filename)
              }
            >
              <span>{text}</span>
            </LinkButton>
          </div>
        ),
      };
  const otherColumns = [
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (text) => <div title="Category">{text}</div>,
    },
    {
      title: "Proponent Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <div title="Proponent Description">{text}</div>,
    },
  ];

  const columns = [fileNameColum, ...otherColumns];

  return (
    <div>
      <div>
        {props.documents && props.documents.length >= 1 ? (
          <Table
            align="left"
            pagination={false}
            columns={columns}
            dataSource={transformDocuments(props.documents, props.now_application_guid)}
            locale={{
              emptyText: "There are no submission documents associated with this Notice of Work",
            }}
            rowSelection={
              props.selectedRows
                ? {
                    selectedRowKeys: props.selectedRows.selectedSubmissionRows,
                    onChange: (selectedRowKeys) => {
                      props.selectedRows.setSelectedSubmissionRows(selectedRowKeys);
                    },
                  }
                : null
            }
          />
        ) : (
          <NullScreen type="documents" />
        )}
      </div>
      <br />
      <h4>Submission Spatial Files</h4>
      <div>
        {props.documents && props.documents.length >= 1 ? (
          <Table
            align="left"
            pagination={false}
            columns={columns}
            dataSource={transformDocuments(props.documents, props.now_application_guid, true)}
            locale={{
              emptyText: "There are no spatial files associated with this Notice of Work",
            }}
            rowSelection={
              props.selectedRows
                ? {
                    selectedRowKeys: props.selectedRows.selectedSubmissionRows,
                    onChange: (selectedRowKeys) => {
                      props.selectedRows.setSelectedSubmissionRows(selectedRowKeys);
                    },
                  }
                : null
            }
          />
        ) : (
          <NullScreen type="documents" />
        )}
      </div>
    </div>
  );
};

NOWSubmissionDocuments.propTypes = propTypes;
NOWSubmissionDocuments.defaultProps = defaultProps;

export default NOWSubmissionDocuments;
