import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import {
  required,
  number,
  postalCode,
  maxLength,
  dateNotInFuture,
  currency,
} from "@common/utils/Validate";
import { resetForm, upperCase, currencyMask } from "@common/utils/helpers";
import { BOND_DOCUMENTS } from "@common/constants/API";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderDate from "@/components/common/RenderDate";
import PartySelectField from "@/components/common/PartySelectField";
import * as FORM from "@/constants/forms";
import RenderSelect from "@/components/common/RenderSelect";
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
  bond: CustomPropTypes.bond.isRequired,
  mineGuid: PropTypes.string.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  bondTypeDropDownOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  bondDocumentTypeDropDownOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  bondDocumentTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  initialPartyValue: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
  initialPartyValue: {},
};

export class BondForm extends Component {
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
    const filesUploaded = this.state.uploadedFiles.length >= 1;

    const documentTableRecords = (this.props.bond.documents
      ? this.props.bond.documents.filter(
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
          category: this.props.bondDocumentTypeOptionsHash[doc.bond_document_type_code],
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
          // Set the bond document type code for each uploaded document to the selected value.
          this.state.uploadedFiles.map(
            // eslint-disable-next-line no-return-assign, no-param-reassign
            (doc) => (doc.bond_document_type_code = values.bond_document_type_code)
          );

          // Delete this value from the bond, as it's not a valid property.
          // eslint-disable-next-line no-param-reassign
          delete values.bond_document_type_code;

          // Create the bond's new document list by removing deleted documents and adding uploaded documents.
          const currentDocuments = this.props.bond.documents || [];
          const newDocuments = currentDocuments
            .filter((doc) => !this.state.filesToDelete.includes(doc.mine_document_guid))
            .concat(this.state.uploadedFiles);

          // Create the new bond and pass it to the form's submit method.
          const bond = {
            ...values,
            documents: newDocuments,
          };
          return this.props.onSubmit(bond);
        })}
      >
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Form.Item>
              <Field
                id="amount"
                name="amount"
                label="Bond Amount*"
                component={RenderField}
                {...currencyMask}
                validate={[required, number, currency]}
              />
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <Form.Item>
              <Field
                id="bond_type_code"
                name="bond_type_code"
                label="Bond Type*"
                component={RenderSelect}
                data={this.props.bondTypeDropDownOptions}
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Form.Item>
              <PartySelectField
                id="payer_party_guid"
                name="payer_party_guid"
                label="Payer*"
                partyLabel="payee"
                initialValue={this.props.initialPartyValue}
                validate={[required]}
                allowAddingParties
              />
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <Form.Item>
              <Field
                id="issue_date"
                name="issue_date"
                label="Issue Date*"
                showTime
                component={RenderDate}
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Form.Item>
              <Field
                id="reference_number"
                name="reference_number"
                label="Reference Number"
                component={RenderField}
              />
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <Form.Item>
              <Field id="project_id" name="project_id" label="Project ID" component={RenderField} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <h5>Institution</h5>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col lg={12} md={24}>
            <Form.Item>
              <Field
                id="institution_name"
                name="institution_name"
                label="Institution Name"
                component={RenderField}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="institution_street"
                name="institution_street"
                label="Street Address"
                component={RenderField}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="institution_city"
                name="institution_city"
                label="City"
                component={RenderField}
                validate={[maxLength(30)]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="institution_province"
                name="institution_province"
                label="Province"
                component={RenderSelect}
                data={this.props.provinceOptions}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="institution_postal_code"
                name="institution_postal_code"
                label="Postal Code"
                placeholder="e.g xxxxxx"
                component={RenderField}
                validate={[maxLength(6), postalCode]}
                normalize={upperCase}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md={24}>
            <Form.Item>
              <Field id="note" name="note" label="Notes" component={RenderAutoSizeField} />
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
        <p className="p-light">
          All documents uploaded will be associated with the category selected. If you would like to
          add a different category of document, please submit and re-open the form.
        </p>
        <br />
        <Form.Item>
          <Field
            id="bond_document_type_code"
            name="bond_document_type_code"
            label={filesUploaded ? "Document Category*" : "Document Category"}
            placeholder="Please select category"
            component={RenderSelect}
            validate={filesUploaded ? [required] : []}
            data={this.props.bondDocumentTypeDropDownOptions}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="documents"
            name="documents"
            component={FileUpload}
            uploadUrl={BOND_DOCUMENTS(this.props.mineGuid)}
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

BondForm.propTypes = propTypes;
BondForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.ADD_BOND,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_BOND),
})(BondForm);
