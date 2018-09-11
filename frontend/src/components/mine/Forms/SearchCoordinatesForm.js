import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import RenderField from '@/components/reusables/RenderField';
import { Form, Button, Col, Row, Icon } from 'antd';
import * as FORM from '@/constants/forms';
import { required, maxLength, number, lat, lon } from '@/utils/Validate';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired
};

export const SearchCoordinatesForm = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      {/* <Row>  
        <Col> */}
          <Form.Item>
            <Field
              id="latitude"
              name="latitude"
              placeholder='Latitude'
              component={RenderField}
              validate={[number, maxLength(10), lat, required]}
              />
          </Form.Item>
        {/* </Col>
        </Row>
        <Row>
        <Col> */}
          <Form.Item>
            <Field
              id="longitude"
              name="longitude"
              placeholder='Longitude'
              component={RenderField}
              validate={[number, maxLength(12), lon, required]}
            />
          </Form.Item>
        {/* </Col>
      </Row> */}
      <div className="right"><Button type="primary" htmlType="submit"><Icon type="search" /></Button></div>
    </Form>
  );
};

SearchCoordinatesForm.propTypes = propTypes;

export default (reduxForm({
  form: FORM.SEARCH_COORDINATES,
  destroyOnUnmount: true
})(SearchCoordinatesForm)
);