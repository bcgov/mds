import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { required, maxLength, number, lat, lon } from "@mds/common/redux/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export const SearchCoordinatesForm = (props) => (
  <FormWrapper
    name={FORM.SEARCH_COORDINATES}
    reduxFormConfig={{
      touchOnBlur: false,
      onSubmitSuccess: resetForm(FORM.SEARCH_COORDINATES),
    }}
    onSubmit={props.onSubmit}>
    <Field
      id="latitude"
      name="latitude"
      placeholder="Latitude"
      component={renderConfig.FIELD}
      required
      validate={[number, maxLength(10), lat, required]}
    />
    <Field
      id="longitude"
      name="longitude"
      placeholder="Longitude"
      component={renderConfig.FIELD}
      required
      validate={[number, maxLength(12), lon, required]}
    />
    <div className="right center-mobile">
      <Button className="full-mobile" type="primary" htmlType="submit">
        <SearchOutlined />
      </Button>
    </div>
  </FormWrapper>
);

SearchCoordinatesForm.propTypes = propTypes;

export default SearchCoordinatesForm;
