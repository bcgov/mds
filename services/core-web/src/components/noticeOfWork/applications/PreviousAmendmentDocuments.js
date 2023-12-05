import React from "react";
import PropTypes from "prop-types";
import { FormSection, Field } from "redux-form";
import CoreTable from "@mds/common/components/common/CoreTable";
import DocumentLink from "@/components/common/DocumentLink";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  previousAmendmentDocuments: PropTypes.arrayOf(PropTypes.any),
  editPreambleFileMetadata: PropTypes.bool,
};

const defaultProps = {
  previousAmendmentDocuments: [],
  editPreambleFileMetadata: false,
};

export const PreviousAmendmentDocuments = (props) => {
  const columns = [
    {
      title: "Title",
      dataIndex: "preamble_title",
      key: "preamble_title",
      render: (text, record) => (
        <div title="Title">
          <Field
            id={`${record.permit_amendment_document_guid}_preamble_title`}
            name={`${record.permit_amendment_document_guid}_preamble_title`}
            placeholder={(props.editPreambleFileMetadata && "Enter Title") || null}
            component={renderConfig.FIELD}
            disabled={!props.editPreambleFileMetadata}
          />
        </div>
      ),
    },
    {
      title: "Author",
      dataIndex: "preamble_author",
      key: "preamble_author",
      render: (text, record) => (
        <div title="Author">
          <Field
            id={`${record.permit_amendment_document_guid}_preamble_author`}
            name={`${record.permit_amendment_document_guid}_preamble_author`}
            placeholder={(props.editPreambleFileMetadata && "Enter Author") || null}
            component={renderConfig.FIELD}
            disabled={!props.editPreambleFileMetadata}
          />
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "preamble_date",
      key: "preamble_date",
      render: (text, record) => (
        <div title="Date">
          <Field
            id={`${record.permit_amendment_document_guid}_preamble_date`}
            name={`${record.permit_amendment_document_guid}_preamble_date`}
            component={renderConfig.DATE}
            placeholder={(props.editPreambleFileMetadata && "YYYY-MM-DD") || null}
            disabled={!props.editPreambleFileMetadata}
          />
        </div>
      ),
    },
    {
      title: "File Name",
      dataIndex: "document_name",
      key: "document_name",
      sorter: (a, b) => (a.document_name > b.document_name ? -1 : 1),
      render: (text, record) => (
        <div title="File Name">
          <DocumentLink
            documentManagerGuid={record.document_manager_guid}
            documentName={record.document_name}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <br />
      <h4>Previous Amendment Documents</h4>
      <p>These documents came from the previous permit amendment.</p>
      <br />
      <FormSection name="previous_amendment_documents_metadata">
        <CoreTable
          columns={columns}
          rowKey={(record) => record.permit_amendment_document_guid}
          dataSource={props.previousAmendmentDocuments}
        />
      </FormSection>
    </>
  );
};

PreviousAmendmentDocuments.propTypes = propTypes;
PreviousAmendmentDocuments.defaultProps = defaultProps;

export default PreviousAmendmentDocuments;
