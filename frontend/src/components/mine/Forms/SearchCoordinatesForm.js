import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import RenderField from '@/components/reusables/RenderField';
import { Form, Button, Col, Row } from 'antd';
import * as FORM from '@/constants/forms';
import { required, maxLength, minLength, number, lat, lon } from '@/utils/Validate';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired
};

export const SearchCoordinatesForm = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>  
        <Col span={12} offset={12}>
          <Form.Item>
            <Field
              id="latitude"
              name="latitude"
              label='Latitude'
              component={RenderField}
              validate={[number, maxLength(10), lat]}
              />
          </Form.Item>
        </Col>
        </Row>
        <Row gutter={16}>
        <Col span={12} offset={12}>
          <Form.Item>
            <Field
              id="longitude"
              name="longitude"
              label='Longitude'
              component={RenderField}
              validate={[number, maxLength(12), lon]}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className="right"><Button type="primary" htmlType="submit">Search</Button></div>
    </Form>
  );
};

SearchCoordinatesForm.propTypes = propTypes;

export default (reduxForm({
  form: FORM.SEARCH_COORDINATES,
  destroyOnUnmount: true
})(SearchCoordinatesForm)
);