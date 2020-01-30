import React from "react";
import { Field, reduxForm } from "redux-form";
import { Form } from "antd";
import PropTypes from "prop-types";
import { required } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  inspectors: CustomPropTypes.groupOptions.isRequired,
  setLeadInspectorPartyGuid: PropTypes.func.isRequired,
};

const UpdateNOWLeadInspectorForm = (props) => {
  return (
    <div>
      <Form layout="vertical">
        <Form.Item>
          <Field
            id="lead_inspector_party_guid"
            name="lead_inspector_party_guid"
            label="Lead Inspector"
            component={renderConfig.GROUPED_SELECT}
            placeholder="Start typing lead inspector name"
            validate={[required]}
            data={props.inspectors}
            onSelect={props.setLeadInspectorPartyGuid}
            doNotPinDropdown
          />
        </Form.Item>
      </Form>
    </div>
  );
};

UpdateNOWLeadInspectorForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.UPDATE_NOW_LEAD_INSPECTOR,
})(UpdateNOWLeadInspectorForm);
