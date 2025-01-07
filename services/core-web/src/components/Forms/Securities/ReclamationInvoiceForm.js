import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Col, Row } from "antd";
import { required, number, currency } from "@mds/common/redux/utils/Validate";
import { currencyMask } from "@common/utils/helpers";
import { RECLAMATION_INVOICE_DOCUMENTS } from "@mds/common/constants/API";
import RenderDate from "@mds/common/components/forms/RenderDate";
import RenderField from "@mds/common/components/forms/RenderField";
import * as FORM from "@/constants/forms";
import DocumentTable from "@mds/common/components/documents/DocumentTable";
import CustomPropTypes from "@/customPropTypes";
import FileUpload from "@/components/common/FileUpload";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";
import {
  documentNameColumn,
  removeFunctionColumn,
  uploadDateColumn,
} from "@/components/common/DocumentColumns";
import { renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  title: PropTypes.string.isRequired,
  invoice: CustomPropTypes.invoice,
  mineGuid: PropTypes.string.isRequired,
};

const defaultProps = {
  invoice: {},
};

export class ReclamationInvoiceForm extends Component {
  state = {
    uploadedFiles: [],
    filesToDelete: [],
  };

  onFileLoad = (document_name, document_manager_guid) => {
    this.setState((prevState) => ({
      uploadedFiles: [
        { document_manager_guid, document_name, mine_guid: this.props.mineGuid },
        ...prevState.uploadedFiles,
      ],
    }));
  };

  onRemoveFile = (error, file) => {
    this.setState((prevState) => ({
      uploadedFiles: prevState.uploadedFiles.filter(
        (doc) => doc.document_manager_guid !== file.serverId
      ),
    }));
  };

  // TODO: this function will have to remove the file through a BE call
  // before it can be used with the Actions menu. Currently only on submit, and unlikely they're deleted
  onRemoveExistingFile = (event, mineDocumentGuid) => {
    event.preventDefault();
    this.setState((prevState) => ({
      filesToDelete: [mineDocumentGuid, ...prevState.filesToDelete],
    }));
  };

  render() {
    const documentTableRecords = (this.props.invoice.documents
      ? this.props.invoice.documents.filter(
        (doc) => !this.state.filesToDelete.includes(doc.mine_document_guid)
      )
      : []
    ).reduce(
      (docs, doc) => [
        {
          key: doc.mine_document_guid,
          mine_document_guid: doc.mine_document_guid,
          document_manager_guid: doc.document_manager_guid,
          document_name: doc.document_name,
          upload_date: doc.upload_date,
        },
        ...docs,
      ],
      []
    );

    const documentColumns = [
      documentNameColumn(),
      renderTextColumn("category", "Category"),
      uploadDateColumn(),
      removeFunctionColumn(this.onRemoveExistingFile),
    ];

    return (
      <FormWrapper
        initialValues={this.props.initialValues}
        name={FORM.ADD_RECLAMATION_INVOICE}
        isModal
        reduxFormConfig={{
          touchOnBlur: false,
        }}
        onSubmit={(values) => {
          // TODO: move document deletion to BE call in onRemoveExistingFile
          // Create the invoice's new document list by removing deleted documents and adding uploaded documents.
          const currentDocuments = this.props.invoice.documents || [];
          const newDocuments = currentDocuments
            .filter((doc) => !this.state.filesToDelete.includes(doc.mine_document_guid))
            .concat(this.state.uploadedFiles);

          // Create the new invoice and pass it to the form's submit method.
          const invoice = {
            ...values,
            documents: newDocuments,
          };
          return this.props.onSubmit(invoice);
        }}
      >
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Field
              id="project_id"
              name="project_id"
              label="Project ID"
              required
              component={RenderField}
              validate={[required]}
              disabled
            />
          </Col>
          <Col md={12} sm={24}>
            <Field
              id="vendor"
              name="vendor"
              label="Vendor"
              required
              component={RenderField}
              validate={[required]}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Field
              id="amount"
              name="amount"
              label="Invoice Amount"
              required
              component={RenderField}
              {...currencyMask}
              validate={[required, number, currency]}
            />
          </Col>
          <Col md={12} sm={24}>
            <Field
              id="paid_date"
              name="paid_date"
              label="Paid Date"
              required
              component={RenderDate}
              validate={[required]}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <h5>Documents</h5>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24}>
            <DocumentTable
              documents={documentTableRecords}
              documentColumns={documentColumns}
              excludedColumnKeys={["actions"]}
            />
          </Col>
        </Row>
        <Row>
          <Col md={24}>
            <Field id="note" name="note" label="Notes" component={RenderAutoSizeField} />
          </Col>
        </Row>
        <br />
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <h5>Document Upload</h5>
          </Col>
        </Row>
        <Field
          id="documents"
          name="documents"
          component={FileUpload}
          uploadUrl={RECLAMATION_INVOICE_DOCUMENTS(this.props.mineGuid)}
          acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
          onFileLoad={this.onFileLoad}
          onRemoveFile={this.onRemoveFile}
          allowRevert
          allowMultiple
        />
        <div className="right center-mobile">
          <RenderCancelButton />
          <RenderSubmitButton buttonText="Save Reclamation Invoice" />
        </div>
      </FormWrapper>
    );
  }
}

ReclamationInvoiceForm.propTypes = propTypes;
ReclamationInvoiceForm.defaultProps = defaultProps;

export default ReclamationInvoiceForm;
