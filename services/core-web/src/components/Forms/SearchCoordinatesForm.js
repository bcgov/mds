import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { required, maxLength, number, lat, lon } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
};

export const SearchCoordinatesForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Form.Item>
      <Field
        id="latitude"
        name="latitude"
        placeholder="Latitude"
        component={renderConfig.FIELD}
        validate={[number, maxLength(10), lat, required]}
      />
    </Form.Item>
    <Form.Item>
      <Field
        id="longitude"
        name="longitude"
        placeholder="Longitude"
        component={renderConfig.FIELD}
        validate={[number, maxLength(12), lon, required]}
      />
    </Form.Item>
    <div className="right center-mobile">
      <Button className="full-mobile" type="primary" htmlType="submit">
        <SearchOutlined />
      </Button>
    </div>
  </Form>
);

SearchCoordinatesForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.SEARCH_COORDINATES,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.SEARCH_COORDINATES),
})(SearchCoordinatesForm);
