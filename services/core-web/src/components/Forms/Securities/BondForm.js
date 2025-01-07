import React, { useState } from "react";
import PropTypes from "prop-types";
import { Field, getFormValues } from "redux-form";
import { Col, Row } from "antd";
import {
  required,
  number,
  maxLength,
  dateNotInFuture,
  currency,
  date,
  dateNotBeforeOther,
  dateNotAfterOther,
  assessedLiabilityNegativeWarning,
  postalCodeWithCountry,
} from "@mds/common/redux/utils/Validate";
import { upperCase, currencyMask } from "@common/utils/helpers";
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
import { useSelector } from "react-redux";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  title: PropTypes.string.isRequired,
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

export const BondForm = (props) => {

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const { sub_division_code } = useSelector(getFormValues(FORM.ADD_FULL_PARTY)) ?? {};
  const province = props.provinceOptions.find((prov) => prov.value === sub_division_code);
  const address_type_code = province?.subType;


  const onFileLoad = (document_name, document_manager_guid) => {
    setUploadedFiles([{ document_manager_guid, document_name }, ...uploadedFiles]);
  };

  const onRemoveFile = (error, file) => {
    setUploadedFiles(uploadedFiles.filter((doc) => doc.document_manager_guid !== file.serverId));
  };

  // TODO: this function will have to remove the file through a BE call
  // before it can be used with the Actions menu. Currently only on submit, and unlikely they're deleted
  const onRemoveExistingFile = (event, mineDocumentGuid) => {
    event.preventDefault();
    setFilesToDelete([mineDocumentGuid, ...filesToDelete]);
  };

  const filesUploaded = uploadedFiles.length >= 1;

  const documentTableRecords = (props.bond.documents
    ? props.bond.documents.filter(
      (doc) => !filesToDelete.includes(doc.mine_document_guid)
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
        category: props.bondDocumentTypeOptionsHash[doc.bond_document_type_code],
        upload_date: doc.upload_date,
      },
      ...docs,
    ],
    []
  );

  const isBondClosed =
    props.bond.bond_status_code === "REL" || props.bond.bond_status_code === "CON";
  const bondStatusDescription = props.bondStatusOptionsHash[
    props.bond.bond_status_code
  ];

  const documentColumns = [
    documentNameColumn(),
    renderTextColumn("category", "Category"),
    uploadDateColumn(),
    removeFunctionColumn(onRemoveExistingFile),
  ];

  return (
    <FormWrapper
      initialValues={props.initialValues}
      name={FORM.ADD_BOND}
      isModal
      reduxFormConfig={{
        touchOnBlur: true,
      }}
      onSubmit={(values) => {
        // Set the bond document type code for each uploaded document to the selected value.
        uploadedFiles.forEach((doc) => {
          doc.bond_document_type_code = values.bond_document_type_code;
          doc.document_date = values.document_date;
          doc.mine_guid = props.mineGuid;
        });

        // Delete this value from the bond, as it's not a valid property.
        // eslint-disable-next-line no-param-reassign
        delete values.bond_document_type_code;
        delete values.document_date;

        // TODO: move document deletion to BE call in onRemoveExistingFile
        // Create the bond's new document list by removing deleted documents and adding uploaded documents.
        const currentDocuments = props.bond.documents || [];
        const newDocuments = currentDocuments
          .filter((doc) => !filesToDelete.includes(doc.mine_document_guid))
          .concat(uploadedFiles);

        // Create the new bond and pass it to the form's submit method.
        const bond = {
          ...values,
          documents: newDocuments,
        };
        return props.onSubmit(bond);
      }}
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
            disabled={props.editBond}
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
            data={props.bondTypeDropDownOptions}
            validate={[required]}
            disabled={props.bond.bond_status_code === "CON"}
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
            initialValues={props.initialPartyValue}
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
                  dateNotAfterOther(props.bond.closed_date),
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
      {props.editBond && isBondClosed && (
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
                dateNotBeforeOther(props.bond.issue_date),
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
            data={props.provinceOptions}
          />
        </Col>
        <Col md={12} xs={24}>
          <Field
            id="institution_postal_code"
            name="institution_postal_code"
            label="Postal Code"
            placeholder="e.g xxxxxx"
            component={RenderField}
            validate={[maxLength(10), postalCodeWithCountry(address_type_code)]}
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
            data={props.bondDocumentTypeDropDownOptions}
          />
        </Col>
      </Row>
      <Field
        id="documents"
        name="documents"
        component={FileUpload}
        uploadUrl={BOND_DOCUMENTS(props.mineGuid)}
        acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
        onFileLoad={onFileLoad}
        onRemoveFile={onRemoveFile}
        allowRevert
        allowMultiple
      />
      <div className="right center-mobile">
        <RenderCancelButton />
        <RenderSubmitButton buttonText={props.title} />
      </div>
    </FormWrapper>
  );
}

BondForm.propTypes = propTypes;
BondForm.defaultProps = defaultProps;

export default BondForm;
