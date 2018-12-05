import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, FieldArray } from "redux-form";
import { Form, Button, Col, Row, Popconfirm, Icon, Collapse } from "antd";
import * as FORM from "@/constants/forms";
import { required, maxLength, minLength, number, lat, lon } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string,
  mineStatusOptions: PropTypes.array.isRequired,
  mineRegionOptions: PropTypes.array.isRequired,
  mineTenureTypes: PropTypes.array.isRequired,
};

export class MineRecordForm extends Component {
  createHeader = (index, fields) => (
    <div className="inline-flex between">
      <label>Mine Type {index + 1}</label>
      <Button
        ghost
        onClick={(event) => {
          event.preventDefault(), fields.remove(index);
        }}
      >
        <Icon type="minus-circle" theme="outlined" />
      </Button>
    </div>
  );

  render() {
    const renderTypeSelect = ({ fields }) => (
      <div className="form__types">
        <Collapse accordion>
          {fields.map((type, index) => (
            <Collapse.Panel header={this.createHeader(index, fields)} key={index}>
              <Row gutter={16}>
                <Col span={24}>
                  <Field
                    id={`${type}.mine_tenure_type_id`}
                    name={`${type}.mine_tenure_type_id`}
                    label="Tenure"
                    placeholder="Please Select Tenure"
                    component={renderConfig.SELECT}
                    data={this.props.mineTenureTypes}
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Field
                    id={`${type}.mine_commidity_type_id`}
                    name={`${type}.mine_commidity_type_id`}
                    label="Commodity"
                    placeholder="Please Select Tenure"
                    component={renderConfig.MULTI_SELECT}
                    data={this.props.mineTenureTypes}
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Field
                    id={`${type}.mine_disturbance_type_id`}
                    name={`${type}.mine_disturbance_type_id`}
                    label="Disturbance"
                    placeholder="Please Select Tenure"
                    component={renderConfig.MULTI_SELECT}
                    data={this.props.mineTenureTypes}
                  />
                </Col>
              </Row>
            </Collapse.Panel>
          ))}
        </Collapse>
        <Button type="primary" onClick={() => fields.push({})}>
          Add Mine Type
        </Button>
      </div>
    );

    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={16}>
          <Col>
            <Form.Item>
              <Field
                id="name"
                name="name"
                label="Mine Name *"
                component={renderConfig.FIELD}
                validate={[required, maxLength(60), minLength(3)]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col>
            <Form.Item>
              <Field
                id="mine_status"
                name="mine_status"
                label="Mine Status *"
                placeholder="Please select status"
                options={this.props.mineStatusOptions}
                component={renderConfig.CASCADER}
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item>
              <Field
                id="mine_region"
                name="mine_region"
                label="Mine Region *"
                placeholder="Select a Region"
                component={renderConfig.SELECT}
                data={this.props.mineRegionOptions}
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="latitude"
                name="latitude"
                label="Latitude"
                component={renderConfig.FIELD}
                validate={[number, maxLength(10), lat]}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="longitude"
                name="longitude"
                label="Longitude"
                component={renderConfig.FIELD}
                validate={[number, maxLength(12), lon]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Mine Type" />
        <FieldArray name="mine_types" component={renderTypeSelect} />
        <Row gutter={16}>
          <Col>
            <Form.Item>
              <Field
                id="note"
                name="note"
                label="Notes"
                component={renderConfig.AUTO_SIZE_FIELD}
                validate={[maxLength(300)]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col>
            <Form.Item>
              <Field
                id="major_mine_ind"
                name="major_mine_ind"
                label="Major Mine"
                type="checkbox"
                component={renderConfig.CHECKBOX}
                validate={[maxLength(300)]}
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
            <Button className="fdivl-mobile">Cancel</Button>
          </Popconfirm>
          <Button className="fdivl-mobile" type="primary" htmlType="submit">
            {this.props.title}
          </Button>
        </div>
      </Form>
    );
  }
}

MineRecordForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.MINE_RECORD,
  touchOnBlur: false,
  enableReinitialize: true,
  onSubmitSuccess: resetForm(FORM.MINE_RECORD),
})(MineRecordForm);
