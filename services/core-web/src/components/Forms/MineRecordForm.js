import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { compose } from "redux";
import { Field, reduxForm, FieldArray, formValueSelector } from "redux-form";
import { Form, Button, Col, Row, Popconfirm, Icon, Collapse, notification, Tag, Radio } from "antd";
import { difference, map, isEmpty, uniq } from "lodash";
import {
  required,
  maxLength,
  minLength,
  dateNotInFuture,
  number,
  lat,
  lon,
} from "@common/utils/Validate";
import { getCurrentMineTypes } from "@common/selectors/mineSelectors";
import {
  getConditionalDisturbanceOptionsHash,
  getConditionalCommodityOptions,
  getDisturbanceOptionHash,
  getCommodityOptionHash,
  getMineStatusDropDownOptions,
  getMineRegionDropdownOptions,
  getMineTenureTypeDropdownOptions,
  getMineTenureTypesHash,
  getExemptionFeeSatusDropDownOptions,
} from "@common/selectors/staticContentSelectors";
import * as Strings from "@common/constants/strings";
import * as FORM from "@/constants/forms";
import * as Styles from "@/constants/styles";
import CustomPropTypes from "@/customPropTypes";
import { TRASHCAN } from "@/constants/assets";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  title: PropTypes.string,
  mineStatusDropDownOptions: CustomPropTypes.options.isRequired,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  mineTenureTypes: CustomPropTypes.options.isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineDisturbanceOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mine_types: PropTypes.arrayOf(CustomPropTypes.mineTypes),
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  conditionalDisturbanceOptions: PropTypes.objectOf(CustomPropTypes.options).isRequired,
  conditionalCommodityOptions: PropTypes.objectOf(CustomPropTypes.options).isRequired,
  currentMineTypes: PropTypes.arrayOf(CustomPropTypes.mineTypes),
  submitting: PropTypes.bool.isRequired,
  isNewRecord: PropTypes.bool,
  exemptionFeeSatusDropDownOptions: PropTypes.objectOf(CustomPropTypes.options).isRequired,
};

const defaultProps = {
  title: "",
  currentMineTypes: [],
  mine_types: [],
  isNewRecord: false,
};

export class MineRecordForm extends Component {
  state = {
    activeKey: [],
    usedTenureTypes: [],
    showStatusDate: false,
  };

  componentDidMount() {
    const existingMineTypes = map(this.props.currentMineTypes, "mine_tenure_type_code");
    this.setState({ usedTenureTypes: existingMineTypes });

    if (this.props.isNewRecord) {
      const date = new Date();
      this.props.change("status_date", date);
    }
  }

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
      mine_tenure_type_code: "",
      mine_commodity_code: [],
      mine_disturbance_code: [],
    };
    // when a currentMineType is deleted, update this.state.usedTenureTypes
    if (this.props.currentMineTypes && this.props.currentMineTypes !== nextProps.currentMineTypes) {
      const prevTenure = map(this.props.currentMineTypes, "mine_tenure_type_code");
      const nextTenure = map(nextProps.currentMineTypes, "mine_tenure_type_code");
      const diff = difference(prevTenure, nextTenure);
      this.setState((prevState) => ({
        usedTenureTypes: prevState.usedTenureTypes.filter(
          (tenureTypes) => !diff.includes(tenureTypes)
        ),
      }));
    }
    // when mine_type changes, update this.state.usedTenureTypes
    if (this.props.mine_types !== nextProps.mine_types) {
      const nextNewTenure = nextProps.mine_types
        .filter(({ mine_tenure_type_code }) => !isEmpty(mine_tenure_type_code))
        .map(({ mine_tenure_type_code }) => mine_tenure_type_code);
      const nextExistingTenure = map(nextProps.currentMineTypes, "mine_tenure_type_code");
      const combined = [...nextExistingTenure, ...nextNewTenure];
      const newUsedTenure = uniq(combined);
      this.setState({ usedTenureTypes: newUsedTenure });
    }

    if (!this.props.mine_types || nextProps.mine_types.length > this.props.mine_types.length) {
      this.props.change(
        "mine_types",
        nextProps.mine_types.slice(0, nextProps.mine_types.length - 1).concat(defaultValue)
      );
    }
  }

  componentWillUnmount() {
    this.setState({ usedTenureTypes: [] });
  }

  // set the active CollapsePanel, this keeps the panel open when the inner state changes. (Ie changing inputs)
  setActiveKey = (key) => {
    this.setState({
      activeKey: key,
    });
  };

  removeField = (event, fields, index) => {
    event.preventDefault();
    fields.remove(index);
  };

  // addField allows users to create a max of 4 mine Types.
  addField = (event, fields) => {
    const totalTypes = fields.length + this.props.currentMineTypes.length;
    event.preventDefault();
    if (totalTypes === 4) {
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
            <img name="remove" src={TRASHCAN} alt="Remove MineType" />
          </Button>
        </Popconfirm>
      </div>
    </div>
  );

  toggleStatusDate = () =>
    this.setState((prevState) => ({ showStatusDate: !prevState.showStatusDate }));

  // When the status changes, set the status date to current date.
  onStatusChange = () => {
    const date = new Date();
    this.props.change("status_date", date);
  };

  createExistingPanelHeader = (mineTenureCode) => (
    <div className="inline-flex between">
      <Form.Item
        style={{ marginTop: "15px" }}
        label={`Existing Mine Type: ${this.props.mineTenureHash[mineTenureCode]}`}
      />
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div onClick={(event) => event.stopPropagation()}>
        <Popconfirm
          placement="topRight"
          title={`Are you sure you want to remove Mine Type ${this.props.mineTenureHash[mineTenureCode]}?`}
          onConfirm={(event) => this.props.handleDelete(event, mineTenureCode)}
          okText="Yes"
          cancelText="No"
        >
          <Button ghost>
            <img name="remove" src={TRASHCAN} alt="Remove Mine Type" />
          </Button>
        </Popconfirm>
      </div>
    </div>
  );

  render() {
    const renderTypeSelect = ({ fields }) => (
      <div>
        <Collapse activeKey={this.state.activeKey} onChange={this.setActiveKey}>
          {this.props.currentMineTypes &&
            this.props.currentMineTypes.map((type) => (
              <Collapse.Panel
                header={this.createExistingPanelHeader(type.mine_tenure_type_code)}
                key={type.mine_tenure_type_code}
              >
                <div key={type.mine_tenure_type_code}>
                  <div className="inline-flex">
                    <Form.Item label="Commodity" />
                    <div>
                      {type.mine_commodity_code &&
                        type.mine_commodity_code.map((code) => (
                          <Tag>{this.props.mineCommodityOptionsHash[code]}</Tag>
                        ))}
                      {type.mine_commodity_code.length === 0 && <span>{Strings.EMPTY_FIELD}</span>}
                    </div>
                  </div>
                  <div className="inline-flex">
                    <Form.Item label="Disturbance" />
                    <div>
                      {type.mine_disturbance_code &&
                        type.mine_disturbance_code.map((code) => (
                          <Tag>{this.props.mineDisturbanceOptionsHash[code]}</Tag>
                        ))}
                      {type.mine_disturbance_code.length === 0 && (
                        <span>{Strings.EMPTY_FIELD}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Collapse.Panel>
            ))}
          {fields.map((type, index) => (
            <Collapse.Panel header={this.createPanelHeader(index, fields)} key={type}>
              <Row gutter={16}>
                <Col span={24}>
                  <Field
                    usedOptions={this.state.usedTenureTypes}
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
          <Icon type="plus" style={{ color: Styles.COLOR.violet }} />
          {fields.length === 0 && !this.props.currentMineTypes
            ? "Add Mine Type"
            : "Add Another Mine Type"}
        </Button>
      </div>
    );

    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={16}>
          <Col>
            <Form.Item>
              <Field
                id="mine_name"
                name="mine_name"
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
                options={this.props.mineStatusDropDownOptions}
                component={renderConfig.CASCADER}
                validate={[required]}
                onChange={this.onStatusChange}
                changeOnSelect
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col>
            <Form.Item label="Is this a historic mine status?">
              <Radio.Group
                onChange={this.toggleStatusDate}
                value={this.state.showStatusDate}
                defaultValue={this.state.showStatusDate}
              >
                <Radio value>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        {this.state.showStatusDate && (
          <Row gutter={16}>
            <Col>
              <Form.Item label="Date of Status Change" className="padding-large">
                <p className="p-light">
                  The date will default to todays date, unless otherwise specified.
                </p>
                <Field
                  id="status_date"
                  name="status_date"
                  placeholder="yyyy-mm-dd"
                  component={renderConfig.DATE}
                  validate={[dateNotInFuture, required]}
                />
              </Form.Item>
            </Col>
          </Row>
        )}
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
                id="mine_note"
                name="mine_note"
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
        <Row gutter={16}>
          <Col>
            <Form.Item>
              <Field
                id="exemption_fee_status_code"
                name="exemption_fee_status_code"
                label="Fee Exemption"
                placeholder="Select a fee exemption status"
                component={renderConfig.SELECT}
                data={this.props.exemptionFeeSatusDropDownOptions}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col>
            <Form.Item>
              <Field
                id="exemption_fee_status_note"
                name="exemption_fee_status_note"
                label="Fee Exemption Note"
                component={renderConfig.AUTO_SIZE_FIELD}
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
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            disabled={this.props.submitting}
          >
            {this.props.title}
          </Button>
        </div>
      </Form>
    );
  }
}

MineRecordForm.propTypes = propTypes;
MineRecordForm.defaultProps = defaultProps;
const selector = formValueSelector(FORM.MINE_RECORD);

export default compose(
  connect((state) => ({
    currentMineTypes: getCurrentMineTypes(state),
    mineStatusDropDownOptions: getMineStatusDropDownOptions(state),
    mineRegionOptions: getMineRegionDropdownOptions(state),
    mineTenureHash: getMineTenureTypesHash(state),
    mineCommodityOptionsHash: getCommodityOptionHash(state),
    mineDisturbanceOptionsHash: getDisturbanceOptionHash(state),
    mineTenureTypes: getMineTenureTypeDropdownOptions(state),
    conditionalCommodityOptions: getConditionalCommodityOptions(state),
    conditionalDisturbanceOptions: getConditionalDisturbanceOptionsHash(state),
    mineStatus: selector(state, "mine_status"),
    mine_types: selector(state, "mine_types"),
    status_date: selector(state, "status_date"),
    exemptionFeeSatusDropDownOptions: getExemptionFeeSatusDropDownOptions(state),
  })),
  reduxForm({
    form: FORM.MINE_RECORD,
    touchOnBlur: false,
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
  })
)(MineRecordForm);
