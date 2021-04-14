import React, { Component } from "react";
import { connect } from "react-redux";
import { compose, bindActionCreators } from "redux";
import { remove } from "lodash";

import PropTypes from "prop-types";
import { Field, reduxForm, change, formValueSelector, FormSection } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import {
  required,
  dateNotInFuture,
  maxLength,
  validateSelectOptions,
  requiredList,
} from "@common/utils/Validate";
import { resetForm, determineExemptionFeeStatus } from "@common/utils/helpers";
import {
  getDropdownPermitStatusOptions,
  getConditionalDisturbanceOptionsHash,
  getConditionalCommodityOptions,
  getMineTenureTypeDropdownOptions,
  getExemptionFeeSatusDropDownOptions,
} from "@common/selectors/staticContentSelectors";
import { renderConfig } from "@/components/common/config";
import PartySelectField from "@/components/common/PartySelectField";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import PermitAmendmentFileUpload from "@/components/mine/Permit/PermitAmendmentFileUpload";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  permitStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  mine_guid: PropTypes.string.isRequired,
  permitPrefix: PropTypes.string,
  permitIsExploration: PropTypes.bool,
  change: PropTypes.func.isRequired,
  conditionalDisturbanceOptions: PropTypes.objectOf(CustomPropTypes.options).isRequired,
  conditionalCommodityOptions: PropTypes.objectOf(CustomPropTypes.options).isRequired,
  exemptionFeeSatusDropDownOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  mineTenureTypes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  permitStatusCode: PropTypes.string,
  site_properties: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
  ),
};

const defaultProps = {
  permitPrefix: "",
  permitStatusCode: "",
  permitIsExploration: false,
  site_properties: {},
};

const permitTypes = [
  {
    label: "Coal",
    value: "C",
  },
  {
    label: "Mineral",
    value: "M",
  },
  {
    label: "Placer",
    value: "P",
  },
  {
    label: "Sand & Gravel",
    value: "G",
  },
  {
    label: "Quarry",
    value: "Q",
  },
];

const mapApplicationTypeToTenureType = (permitPrefix) =>
  ({
    P: ["PLR"],
    C: ["COL"],
    M: ["MIN"],
    G: ["BCL", "PRL"],
    Q: ["BCL", "PRL", "MIN"],
    null: [],
  }[permitPrefix]);

const selector = formValueSelector(FORM.ADD_PERMIT);

const validateBusinessRules = (values) => {
  const errors = {};
  if (values.is_exploration && !(values.permit_type === "C" || values.permit_type === "M")) {
    errors.permit_type = "Exploration is only valid for Coal and Placer permits";
  }
  return errors;
};

export class AddPermitForm extends Component {
  state = {
    uploadedFiles: [],
  };

  // File upload handlers
  onFileLoad = (fileName, document_manager_guid) => {
    this.state.uploadedFiles.push({ fileName, document_manager_guid });
    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  onRemoveFile = (err, fileItem) => {
    remove(this.state.uploadedFiles, { document_manager_guid: fileItem.serverId });
    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  componentWillReceiveProps = (nextProps) => {
    const permitTypeChanged =
      this.props.permitPrefix && this.props.permitPrefix !== nextProps.permitPrefix;
    if (permitTypeChanged) {
      this.props.change("site_properties.mine_tenure_type_code", null);
      this.props.change("site_properties.mine_disturbance_code", []);
      this.props.change("site_properties.mine_commodity_code", []);
      this.props.change("exemption_fee_status_code", null);
    }
    const statusSelected = this.props.permitStatusCode || nextProps.permitStatusCode;
    const permitTypeSelected = this.props.permitPrefix || nextProps.permitPrefix;
    const tenureSelected =
      this.props.site_properties?.mine_tenure_type_code ||
      nextProps.site_properties?.mine_tenure_type_code;
    if (permitTypeSelected && tenureSelected && statusSelected) {
      const statusCode = determineExemptionFeeStatus(
        nextProps.permitStatusCode,
        nextProps.permitPrefix,
        nextProps.site_properties?.mine_tenure_type_code,
        nextProps.permitIsExploration,
        nextProps.site_properties?.mine_disturbance_code
      );
      this.props.change("exemption_fee_status_code", statusCode);
    }
  };

  render() {
    const isCoalOrMineral =
      this.props.site_properties?.mine_tenure_type_code === "COL" ||
      this.props.site_properties?.mine_tenure_type_code === "MIN";
    const permitPrefix = this.props.permitPrefix ? this.props.permitPrefix : null;
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={48}>
          <Col md={12} sm={24} className="border--right--layout">
            <Form.Item>
              <PartySelectField
                id="permittee_party_guid"
                name="permittee_party_guid"
                label="Permittee*"
                partyLabel="permittee"
                validate={[required]}
                allowAddingParties
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="permit_type"
                name="permit_type"
                label="Permit type*"
                placeholder="Select a permit type"
                component={renderConfig.SELECT}
                validate={[required, validateSelectOptions(permitTypes)]}
                data={permitTypes}
              />
            </Form.Item>
            {(this.props.permitPrefix === "C" ||
              this.props.permitPrefix === "M" ||
              this.props.permitIsExploration) && (
              <Form.Item>
                <Field
                  id="is_exploration"
                  name="is_exploration"
                  label="Exploration permit"
                  type="checkbox"
                  component={renderConfig.CHECKBOX}
                />
              </Form.Item>
            )}
            <Form.Item>
              <Field
                id="permit_no"
                name="permit_no"
                label="Permit number*"
                component={renderConfig.FIELD}
                validate={[required, maxLength(9)]}
                inlineLabel={
                  this.props.permitPrefix &&
                  `${this.props.permitPrefix}${this.props.permitIsExploration ? "X" : ""} -`
                }
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="permit_status_code"
                name="permit_status_code"
                label="Permit status*"
                placeholder="Select a permit status"
                component={renderConfig.SELECT}
                data={this.props.permitStatusOptions}
                validate={[required, validateSelectOptions(this.props.permitStatusOptions)]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="issue_date"
                name="issue_date"
                label="Issue date*"
                component={renderConfig.DATE}
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
          </Col>

          <Col md={12} sm={24}>
            <FormSection name="site_properties">
              <div className="field-title">Tenure*</div>
              <Field
                id="mine_tenure_type_code"
                name="mine_tenure_type_code"
                component={renderConfig.SELECT}
                validate={[requiredList]}
                disabled={!this.props.permitPrefix}
                data={this.props.mineTenureTypes.filter(({ value }) =>
                  mapApplicationTypeToTenureType(permitPrefix).includes(value)
                )}
              />
              <div className="field-title">Commodity</div>
              <Field
                id="mine_commodity_code"
                name="mine_commodity_code"
                component={renderConfig.MULTI_SELECT}
                data={
                  this.props.site_properties?.mine_tenure_type_code
                    ? this.props.conditionalCommodityOptions[
                        this.props.site_properties?.mine_tenure_type_code
                      ]
                    : null
                }
              />
              <div className="field-title">{isCoalOrMineral ? "Disturbance*" : "Disturbance"}</div>
              <Field
                id="mine_disturbance_code"
                name="mine_disturbance_code"
                component={renderConfig.MULTI_SELECT}
                data={
                  this.props.site_properties?.mine_tenure_type_code
                    ? this.props.conditionalDisturbanceOptions[
                        this.props.site_properties?.mine_tenure_type_code
                      ]
                    : null
                }
                validate={isCoalOrMineral ? [required] : []}
              />
            </FormSection>
            <Field
              id="exemption_fee_status_code"
              name="exemption_fee_status_code"
              label="Inspection Fee Status"
              placeholder="Inspection Fee Status will be automatically populated."
              component={renderConfig.SELECT}
              disabled
              data={this.props.exemptionFeeSatusDropDownOptions}
            />
            <Field
              id="exemption_fee_status_note"
              name="exemption_fee_status_note"
              label="Fee Exemption Note"
              component={renderConfig.AUTO_SIZE_FIELD}
              validate={[maxLength(300)]}
            />
            <Form.Item label="Upload files">
              <Field
                id="PermitDocumentFileUpload"
                name="PermitDocumentFileUpload"
                onFileLoad={this.onFileLoad}
                onRemoveFile={this.onRemoveFile}
                mineGuid={this.props.mine_guid}
                component={PermitAmendmentFileUpload}
              />
            </Form.Item>
          </Col>
        </Row>
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
      </Form>
    );
  }
}

AddPermitForm.propTypes = propTypes;
AddPermitForm.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  permitStatusOptions: getDropdownPermitStatusOptions(state),
  permitPrefix: selector(state, "permit_type"),
  permitStatusCode: selector(state, "permit_status_code"),
  permitIsExploration: selector(state, "is_exploration"),
  mineTenureTypes: getMineTenureTypeDropdownOptions(state),
  conditionalCommodityOptions: getConditionalCommodityOptions(state),
  conditionalDisturbanceOptions: getConditionalDisturbanceOptionsHash(state),
  site_properties: selector(state, "site_properties"),
  exemptionFeeSatusDropDownOptions: getExemptionFeeSatusDropDownOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.ADD_PERMIT,
    validate: validateBusinessRules,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.ADD_PERMIT),
  })
)(AddPermitForm);
