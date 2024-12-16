import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Button, Col, Row, Popconfirm } from "antd";
import {
  required,
  number,
  postalCode,
  maxLength,
  dateNotInFuture,
  currency,
  date,
  dateNotBeforeOther,
  dateNotAfterOther,
  assessedLiabilityNegativeWarning,
} from "@common/utils/Validate";
import { resetForm, upperCase, currencyMask } from "@common/utils/helpers";
import { BOND_DOCUMENTS } from "@mds/common/constants/API";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderDate from "@mds/common/components/forms/RenderDate";
import PartySelectField from "@/components/common/PartySelectField";
import * as FORM from "@/constants/forms";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import DocumentTable from "@mds/common/components/documents/DocumentTable";
import CustomPropTypes from "@/customPropTypes";
import FileUpload from "@/components/common/FileUpload";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";
import {
  documentNameColumn,
  removeFunctionColumn,
  uploadDateColumn,
} from "@/components/common/DocumentColumns";
import { renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

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
  bondStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  initialPartyValue: PropTypes.objectOf(PropTypes.string),
  editBond: PropTypes.bool,
};

const defaultProps = {
  editBond: false,
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

  // TODO: this function will have to remove the file through a BE call
  // before it can be used with the Actions menu. Currently only on submit, and unlikely they're deleted
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
          document_name: doc.document_name,
          date: doc.document_date,
          category: this.props.bondDocumentTypeOptionsHash[doc.bond_document_type_code],
          upload_date: doc.upload_date,
        },
        ...docs,
      ],
      []
    );

    const isBondClosed =
      this.props.bond.bond_status_code === "REL" || this.props.bond.bond_status_code === "CON";
    const bondStatusDescription = this.props.bondStatusOptionsHash[
      this.props.bond.bond_status_code
    ];

    const documentColumns = [
      documentNameColumn(),
      renderTextColumn("category", "Category"),
      uploadDateColumn(),
      removeFunctionColumn(this.onRemoveExistingFile),
    ];

    return (
      <FormWrapper
        name={FORM.ADD_BOND}
        reduxFormConfig={{
          touchOnBlur: true,
          onSubmitSuccess: resetForm(FORM.ADD_BOND),
        }}
        onSubmit={this.props.handleSubmit((values) => {
          // Set the bond document type code for each uploaded document to the selected value.
          this.state.uploadedFiles.forEach((doc) => {
            doc.bond_document_type_code = values.bond_document_type_code;
            doc.document_date = values.document_date;
            doc.mine_guid = this.props.mineGuid;
          });

          // Delete this value from the bond, as it's not a valid property.
          // eslint-disable-next-line no-param-reassign
          delete values.bond_document_type_code;
          delete values.document_date;

          // TODO: move document deletion to BE call in onRemoveExistingFile
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
            <Field
              id="amount"
              name="amount"
              label="Bond Amount"
              required
              component={RenderField}
              {...currencyMask}
              validate={[required, number, currency]}
              disabled={this.props.editBond}
              warn={[assessedLiabilityNegativeWarning]}
            />
          </Col>
          <Col md={12} sm={24}>
            <Field
              id="bond_type_code"
              name="bond_type_code"
              label="Bond Type"
              required
              component={RenderSelect}
              placeholder="Please select bond type"
              data={this.props.bondTypeDropDownOptions}
              validate={[required]}
              disabled={this.props.bond.bond_status_code === "CON"}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <PartySelectField
              id="payer_party_guid"
              name="payer_party_guid"
              label="Payer"
              required
              partyLabel="payee"
              initialValues={this.props.initialPartyValue}
              validate={[required]}
              allowAddingParties
            />
          </Col>
          <Col md={12} sm={24}>
            <Field
              id="issue_date"
              name="issue_date"
              label="Issue Date"
              required
              showTime
              component={RenderDate}
              validate={
                isBondClosed
                  ? [
                    required,
                    date,
                    dateNotInFuture,
                    dateNotAfterOther(this.props.bond.closed_date),
                  ]
                  : [required, date, dateNotInFuture]
              }
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Field
              id="reference_number"
              name="reference_number"
              label="Reference Number"
              component={RenderField}
            />
          </Col>
          <Col md={12} sm={24}>
            <Field id="project_id" name="project_id" label="Project ID" component={RenderField} />
          </Col>
        </Row>
        <Row>
          <Col md={24}>
            <Field id="note" name="note" label="Notes" component={RenderAutoSizeField} />
          </Col>
        </Row>
        {this.props.editBond && isBondClosed && (
          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Field
                id="closed_date"
                name="closed_date"
                label={`${bondStatusDescription} Date`}
                required
                showTime
                component={RenderDate}
                validate={[
                  required,
                  date,
                  dateNotInFuture,
                  dateNotBeforeOther(this.props.bond.issue_date),
                ]}
              />
            </Col>
            <Col md={12} sm={24}>
              <Field
                id="closed_note"
                name="closed_note"
                label={`${bondStatusDescription} Notes`}
                component={RenderAutoSizeField}
                validate={[maxLength(4000)]}
              />
            </Col>
          </Row>
        )}
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <h5>Institution</h5>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col lg={12} md={24}>
            <Field
              id="institution_name"
              name="institution_name"
              label="Institution Name"
              component={RenderField}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <Field
              id="institution_street"
              name="institution_street"
              label="Street Address"
              component={RenderField}
            />
          </Col>
          <Col md={12} xs={24}>
            <Field
              id="institution_city"
              name="institution_city"
              label="City"
              component={RenderField}
              validate={[maxLength(30)]}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <Field
              id="institution_province"
              name="institution_province"
              label="Province"
              placeholder="Please select province"
              component={RenderSelect}
              data={this.props.provinceOptions}
            />
          </Col>
          <Col md={12} xs={24}>
            <Field
              id="institution_postal_code"
              name="institution_postal_code"
              label="Postal Code"
              placeholder="e.g xxxxxx"
              component={RenderField}
              validate={[maxLength(10), postalCode]}
              normalize={upperCase}
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
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <Field
              id="document_date"
              name="document_date"
              label="Document Date"
              showTime
              component={RenderDate}
              validate={[date, dateNotInFuture]}
            />
          </Col>
          <Col md={12} xs={24}>
            <Field
              id="bond_document_type_code"
              name="bond_document_type_code"
              label={"Document Category"}
              required={filesUploaded}
              placeholder="Please select category"
              component={RenderSelect}
              validate={
                filesUploaded
                  ? [required]
                  : []
              }
              data={this.props.bondDocumentTypeDropDownOptions}
            />
          </Col>
        </Row>
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
            loading={this.props.submitting}
          >
            {this.props.title}
          </Button>
        </div>
      </FormWrapper>
    );
  }
}

BondForm.propTypes = propTypes;
BondForm.defaultProps = defaultProps;

export default BondForm;
