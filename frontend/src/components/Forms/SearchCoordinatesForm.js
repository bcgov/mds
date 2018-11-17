import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import { Form, Button, Icon } from 'antd';
import * as FORM from '@/constants/forms';
import { required, maxLength, number, lat, lon } from '@/utils/Validate';
import { resetForm } from '@/utils/helpers';
import { renderConfig } from '@/components/common/config';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired
};

export const SearchCoordinatesForm = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Form.Item>
        <Field
          id="latitude"
          name="latitude"
          placeholder='Latitude'
          component={renderConfig.FIELD}
          validate={[number, maxLength(10), lat, required]}
          />
      </Form.Item>
      <Form.Item>
        <Field
          id="longitude"
          name="longitude"
          placeholder='Longitude'
          component={renderConfig.FIELD}
          validate={[number, maxLength(12), lon, required]}
        />
      </Form.Item>
      <div className="right center-mobile">
        <Button className="full-mobile" type="primary" htmlType="submit">
          <Icon type="search" />
        </Button>
      </div>
    </Form>
  );
};

SearchCoordinatesForm.propTypes = propTypes;

export default (reduxForm({
    form: FORM.SEARCH_COORDINATES,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.SEARCH_COORDINATES),
  })(SearchCoordinatesForm)
);