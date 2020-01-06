import React from "react";
import { PropTypes } from "prop-types";
import { Divider, Table } from "antd";
import LinkButton from "@/components/common/LinkButton";
import { downloadNowDocument } from "@/utils/actionlessNetworkCalls";
import { UNIQUELY_SPATIAL } from "@/constants/fileTypes";
import * as Strings from "@/constants/strings";
import NullScreen from "@/components/common/NullScreen";

const propTypes = {
  now_application_guid: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(PropTypes.any).isRequired,
};

const columns = [
  {
    title: "File name",
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
  },
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

const isSpatialFile = (document) =>
  document.documenttype === "SpatialFileDoc" ||
  (document.filename &&
    Object.keys(UNIQUELY_SPATIAL).includes(document.filename.substr(document.filename.length - 4)));

const transfromData = (documents, now_application_guid, spatial = false) =>
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

export const ReviewNOWDocuments = (props) => (
  <div>
    <br />
    <h3>Original Submission Files</h3>
    <Divider />
    <div className="padding-large--sides">
      {props.documents && props.documents.length >= 1 ? (
        <Table
          align="left"
          pagination={false}
          columns={columns}
          dataSource={transfromData(props.documents, props.now_application_guid)}
          locale={{ emptyText: "There are no documents associated with this Notice of Work" }}
        />
      ) : (
        <NullScreen type="documents" />
      )}
    </div>
    <br />
    <h3>Original Submission Spatial Files</h3>
    <Divider />
    <div className="padding-large--sides">
      {props.documents && props.documents.length >= 1 ? (
        <Table
          align="left"
          pagination={false}
          columns={columns}
          dataSource={transfromData(props.documents, props.now_application_guid, true)}
          locale={{
            emptyText: "There are no spatial files associated with this Notice of Work",
          }}
        />
      ) : (
        <NullScreen type="documents" />
      )}
    </div>
  </div>
);

ReviewNOWDocuments.propTypes = propTypes;

export default ReviewNOWDocuments;
