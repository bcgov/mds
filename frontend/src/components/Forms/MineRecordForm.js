import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { compose } from "redux";
import { Field, reduxForm, FieldArray, getFormValues } from "redux-form";
import { Form, Button, Col, Row, Popconfirm, Icon, Collapse } from "antd";
import * as FORM from "@/constants/forms";
import { required, maxLength, minLength, number, lat, lon } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  title: PropTypes.string,
  mineStatusOptions: PropTypes.array.isRequired,
  mineRegionOptions: PropTypes.array.isRequired,
  mineTenureTypes: PropTypes.array.isRequired,
  mine_types: PropTypes.array,
  conditionalDisturbanceOptions: PropTypes.object.isRequired,
  conditionalCommodityOptions: PropTypes.object.isRequired,
  initialValues: PropTypes.object,
};

export class MineRecordForm extends Component {
  state = {
    activeKey: [],
  };

  /**
   *
   * @param {*} nextProps
   * In order to use a multiSelect with ReduxForms, it need to be initiated with an empty array,
   * ReduxForms defaults to an empty string when initializing fields inputs.
   * In this situation, FieldArray is being used to dynamically create field blocks,
   * componentWillReceiveProps checks if the FieldArray changes and
   * overrides the default behaviour to set a defautValue top the new block
   */
  componentWillReceiveProps(nextProps) {
    const defaultValue = {
      mine_tenure_type_code: [],
      mine_commodity_code: [],
      mine_disturbance_code: [],
    };
    // Do nothing if no mine_types, or no change to mine_types
    if (!nextProps.mine_types || nextProps.mine_types === this.props.mine_types) {
      return;
    }
    if (!this.props.mine_types || nextProps.mine_types.length > this.props.mine_types.length) {
      this.props.change(
        "mine_types",
        nextProps.mine_types.slice(0, nextProps.mine_types.length - 1).concat(defaultValue)
      );
    }
  }

  // function to set the active CollapsePanel, this keeps the panel open when the inner state changes. (Ie changing inputs)
  setActiveKey = (key) => {
    this.setState({
      activeKey: key,
    });
  };

  removeField = (event, fields, index) => {
    event.preventDefault();
    fields.remove(index);
  };

  createPanelHeader = (index, fields) => (
    <div className="inline-flex between">
      <Form.Item style={{ marginTop: "15px" }} label={`Mine Type ${index + 1}`} />
      <Button
        ghost
        onClick={(event) => {
          this.removeField(event, fields, index);
        }}
      >
        <Icon type="minus-circle" theme="outlined" style={{ color: "#BC2929" }} />
      </Button>
    </div>
  );

  render() {
    const renderTypeSelect = ({ fields }) => (
      <div>
        <Collapse activeKey={this.state.activeKey} onChange={this.setActiveKey}>
          {fields.map((type, index) => (
            <Collapse.Panel header={this.createPanelHeader(index, fields)} key={index}>
              <Row gutter={16}>
                <Col span={24}>
                  <Field
                    onChange={this.handleOptionChange}
                    id={`${type}.mine_tenure_type_code`}
                    name={`${type}.mine_tenure_type_code`}
                    label="Tenure"
                    placeholder="Please Select Tenure"
                    component={renderConfig.SELECT}
                    data={this.props.mineTenureTypes}
                    validate={[required]}
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Field
                    id={`${type}.mine_commodity_code`}
                    name={`${type}.mine_commodity_code`}
                    label="Commodity"
                    placeholder="Please Select Commodity"
                    component={renderConfig.MULTI_SELECT}
                    data={
                      this.props.conditionalCommodityOptions[
                        (this.props.mine_types &&
                          this.props.mine_types[index].mine_tenure_type_code) ||
                          "COL"
                      ]
                    }
                    validate={[required]}
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Field
                    id={`${type}.mine_disturbance_code`}
                    name={`${type}.mine_disturbance_code`}
                    placeholder="Please Select Disturbance"
                    label="Disturbance"
                    component={renderConfig.MULTI_SELECT}
                    validate={[required]}
                    data={
                      this.props.conditionalDisturbanceOptions[
                        (this.props.mine_types &&
                          this.props.mine_types[index].mine_tenure_type_code) ||
                          "COL"
                      ]
                    }
                  />
                </Col>
              </Row>
            </Collapse.Panel>
          ))}
        </Collapse>
        <Button className="btn--dropdown" onClick={() => fields.push({})}>
          <Icon type="plus" style={{ color: "#0F620E" }} />
          {fields.length === 0 ? "Add Mine Type" : "Add Another Mine Type"}
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
        {/* hiding the mine_types fieldArray fron Edit view until the edit functionality is added */}
        {!this.props.initialValues && (
          <div>
            <Form.Item label="Mine Type" />
            <FieldArray name="mine_types" component={renderTypeSelect} />
          </div>
        )}
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
            <Button className="full-mobile">Cancel</Button>
          </Popconfirm>
          <Button className="full-mobile" type="primary" htmlType="submit">
            {this.props.title}
          </Button>
        </div>
      </Form>
    );
  }
}

MineRecordForm.propTypes = propTypes;

export default compose(
  connect((state) => ({
    mine_types: (getFormValues(FORM.MINE_RECORD)(state) || {}).mine_types,
  })),
  reduxForm({
    form: FORM.MINE_RECORD,
    touchOnBlur: false,
    enableReinitialize: true,
    onSubmitSuccess: resetForm(FORM.MINE_RECORD),
  })
)(MineRecordForm);
