import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import { required, number, currency } from "@common/utils/Validate";
import { resetForm, currencyMask } from "@common/utils/helpers";
import { RECLAMATION_INVOICE_DOCUMENTS } from "@common/constants/API";
import RenderField from "@/components/common/RenderField";
import * as FORM from "@/constants/forms";
import DocumentTable from "@/components/common/DocumentTable";
import CustomPropTypes from "@/customPropTypes";
import FileUpload from "@/components/common/FileUpload";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
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
      uploadedFiles: [{ document_manager_guid, document_name }, ...prevState.uploadedFiles],
    }));
  };

  onRemoveFile = (error, file) => {
    this.setState((prevState) => ({
      uploadedFiles: prevState.uploadedFiles.filter(
        (doc) => doc.document_manager_guid !== file.serverId
      ),
    }));
  };

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
          name: doc.document_name,
          uploaded: doc.upload_date,
        },
        ...docs,
      ],
      []
    );

    return (
      <Form
        layout="vertical"
        onSubmit={this.props.handleSubmit((values) => {
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
        })}
      >
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Form.Item>
              <Field
                id="amount"
                name="amount"
                label="Invoice Amount*"
                component={RenderField}
                {...currencyMask}
                validate={[required, number, currency]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Form.Item>
              <Field
                id="project_id"
                name="project_id"
                label="Project ID*"
                component={RenderField}
                validate={[required]}
              />
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <Form.Item>
              <Field
                id="vendor"
                name="vendor"
                label="Vendor*"
                component={RenderField}
                validate={[required]}
              />
            </Form.Item>
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
              removeDocument={this.onRemoveExistingFile}
            />
          </Col>
        </Row>
        <br />
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <h5>Document Upload</h5>
          </Col>
        </Row>
        <Form.Item>
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
        </Form.Item>
        <div className="right center-mobile">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={this.props.closeModal}
            okText="Yes"
            cancelText="No"
          >
            <Button className="full-mobile" type="secondary">
              Cancel
            </Button>
          </Popconfirm>
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            disabled={this.props.submitting}
          >
            {this.props.title}
          </Button>
        </div>
      </Form>
    );
  }
}

ReclamationInvoiceForm.propTypes = propTypes;
ReclamationInvoiceForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.ADD_RECLAMATION_INVOICE,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_RECLAMATION_INVOICE),
})(ReclamationInvoiceForm);
