import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { compose } from "redux";
import { Field, reduxForm, FieldArray, getFormValues } from "redux-form";
import { Form, Button, Col, Row, Popconfirm, Icon, Collapse, notification } from "antd";
import _ from "lodash";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { required, maxLength, minLength, number, lat, lon } from "@/utils/Validate";
import { renderConfig } from "@/components/common/config";
import { getCurrentMineTypes } from "@/selectors/mineSelectors";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  handleDelete: PropTypes.func,
  title: PropTypes.string,
  mineStatusOptions: CustomPropTypes.options.isRequired,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  mineTenureTypes: CustomPropTypes.options.isRequired,
  mine_types: PropTypes.array,
  conditionalDisturbanceOptions: PropTypes.object.isRequired,
  conditionalCommodityOptions: PropTypes.object.isRequired,
  initialValues: PropTypes.object,
};

const defaultProps = {
  title: "",
  mine_types: [],
  initialValues: null,
};

export class MineRecordForm extends Component {
  state = {
    activeKey: [],
    usedTenureTypes: [],
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
      nextProps.mine_types.map(({ mine_tenure_type_code }) => {
        if (mine_tenure_type_code) {
          this.setState((prevState) => ({
            usedTenureTypes: [...prevState.usedTenureTypes, mine_tenure_type_code],
          }));
        }
      });
    }
  }

  componentWillUnmount() {
    this.setState({ usedTenureTypes: [] });
  }

  // function to set the active CollapsePanel, this keeps the panel open when the inner state changes. (Ie changing inputs)
  setActiveKey = (key) => {
    this.setState({
      activeKey: key,
    });
  };

  // removeRield either deletes the mine_type if in edit mode,
  // OR removes a field from the field array if the mine_type doesn't exist in the DB.
  // ALSO removes a tenure value from this.state.usedTenureTypes to make that option availabe agin
  removeField = (event, fields, index) => {
    event.preventDefault();
    fields.remove(index);
  };

  addField = (event, fields) => {
    event.preventDefault();
    if (
      fields.length === 4 ||
      (this.props.currentMineTypes && this.props.currentMineTypes.length === 4)
    ) {
      notification.error({
        message: "You cannot have more than 4 tenures associated with a mine",
        duration: 10,
      });
    } else {
      fields.push({});
      this.setActiveKey([fields.length.toString()]);
    }
  };

  createPanelHeader = (index, fields) => (
    <div className="inline-flex between">
      <Form.Item style={{ marginTop: "15px" }} label={`New Mine Type: ${index + 1}`} />
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div onClick={(event) => event.stopPropagation()}>
        <Popconfirm
          placement="topRight"
          title={`Are you sure you want to remove Mine Type ${index + 1}?`}
          onConfirm={(event) => {
            this.removeField(event, fields, index);
          }}
          okText="Yes"
          cancelText="No"
        >
          <Button ghost>
            <Icon type="minus-circle" theme="outlined" style={{ color: "#BC2929" }} />
          </Button>
        </Popconfirm>
      </div>
    </div>
  );

  createExistingPanelHeader = (mineTenureCode) => (
    <div className="inline-flex between">
      <Form.Item
        style={{ marginTop: "15px" }}
        label={`Pre-Existing Mine Type: ${this.props.mineTenureHash[mineTenureCode]}`}
      />
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div onClick={(event) => event.stopPropagation()}>
        <Popconfirm
          placement="topRight"
          title={`Are you sure you want to remove Mine Type ${
            this.props.mineTenureHash[mineTenureCode]
          }?`}
          onConfirm={(event) => this.props.handleDelete(event, mineTenureCode)}
          okText="Yes"
          cancelText="No"
        >
          <Button ghost>
            <Icon type="minus-circle" theme="outlined" style={{ color: "#BC2929" }} />
          </Button>
        </Popconfirm>
      </div>
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
                    // handleSelect={this.handleTenureCodeUpdate}
                    usedOptions={this.state.usedTenureTypes}
                    onChange={this.handleOptionChange}
                    id={`${type}.mine_tenure_type_code`}
                    name={`${type}.mine_tenure_type_code`}
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
                    id={`${type}.mine_commodity_code`}
                    name={`${type}.mine_commodity_code`}
                    label="Commodity"
                    placeholder="Please Select Commodity"
                    component={renderConfig.MULTI_SELECT}
                    // if data doesn't exist, the multi-select is disabled
                    data={
                      this.props.mine_types[index] &&
                      this.props.mine_types[index].mine_tenure_type_code &&
                      this.props.mine_types[index].mine_tenure_type_code.length >= 1
                        ? this.props.conditionalCommodityOptions[
                            this.props.mine_types[index].mine_tenure_type_code
                          ]
                        : null
                    }
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
                    data={
                      this.props.mine_types[index] &&
                      this.props.mine_types[index].mine_tenure_type_code &&
                      this.props.mine_types[index].mine_tenure_type_code.length >= 1
                        ? this.props.conditionalDisturbanceOptions[
                            this.props.mine_types[index].mine_tenure_type_code
                          ]
                        : null
                    }
                  />
                </Col>
              </Row>
            </Collapse.Panel>
          ))}
        </Collapse>
        <Button className="btn--dropdown" onClick={(event) => this.addField(event, fields)}>
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
        <div>
          <Form.Item label="Mine Type" />
          <Collapse>
            {this.props.currentMineTypes &&
              this.props.currentMineTypes.map((type, index) => (
                <Collapse.Panel
                  header={this.createExistingPanelHeader(type.mine_tenure_type_code)}
                  key={index}
                >
                  <div key={index}>
                    <div className="inline-flex">
                      <div>
                        <p>Commodity:</p>
                      </div>
                      <div>
                        {type.mine_commodity_code &&
                          type.mine_commodity_code.map((code) => (
                            <span>{this.props.mineCommodityOptionsHash[code] + ", "}</span>
                          ))}
                      </div>
                    </div>
                    <div className="inline-flex">
                      <div>
                        <p>Disturbance:</p>
                      </div>
                      <div>
                        {type.mine_disturbance_code &&
                          type.mine_disturbance_code.map((code) => (
                            <span>{this.props.mineDisturbanceOptionsHash[code] + ", "}</span>
                          ))}
                      </div>
                    </div>
                  </div>
                </Collapse.Panel>
              ))}
          </Collapse>
          <FieldArray name="mine_types" component={renderTypeSelect} />
        </div>
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
MineRecordForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    mine_types: (getFormValues(FORM.MINE_RECORD)(state) || {}).mine_types,
    currentMineTypes: getCurrentMineTypes(state),
  })),
  reduxForm({
    form: FORM.MINE_RECORD,
    touchOnBlur: false,
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    // onSubmitSuccess: resetForm(FORM.MINE_RECORD),
  })
)(MineRecordForm);
