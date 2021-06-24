/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getFormValues, submit, reset, change, FormSection, FieldArray, Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import { required, maxLength, dateNotInFuture, number, lat, lon } from "@common/utils/Validate";
// import { Rimport { Field, reduxForm } from "redux-form";ow, Col, Steps, Button, Popconfirm } from "antd";
import { createParty, addPartyRelationship } from "@common/actionCreators/partiesActionCreator";
import { fetchMineNameList } from "@common/actionCreators/mineActionCreator";
import * as FORM from "@/constants/forms";

import "@ant-design/compatible/assets/index.css";
import { Collapse, Button, Popconfirm, Col, Row, Divider } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CustomPropTypes from "@/customPropTypes";
// import * as FORM from "@/constants/forms";
import { TRASHCAN } from "@/constants/assets";
import { renderConfig } from "@/components/common/config";
import { COLOR } from "@/constants/styles";

const propTypes = {
  fetchData: PropTypes.func.isRequired,
  fetchMineNameList: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createParty: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  addPartyFormValues: PropTypes.objectOf(PropTypes.strings),
  addRolesFormValues: PropTypes.objectOf(PropTypes.strings),
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  addPartyRelationship: PropTypes.func.isRequired,
  partyRelationshipTypesList: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  mineNameList: PropTypes.arrayOf(CustomPropTypes.mineName).isRequired,
};

const defaultProps = {
  addPartyFormValues: {},
  addRolesFormValues: {},
};

const groupRolePayloads = (formValues, party_guid) => {
  const rolePayloads = {};
  Object.entries(formValues).forEach(([key, value]) => {
    const [field, number] = key.split("-");
    rolePayloads[number] = rolePayloads[number] || {};
    rolePayloads[number][field] = value;
    rolePayloads[number].party_guid = party_guid;
  });
  return rolePayloads;
};

export class AddPartyModal extends Component {
  state = {
    explosiveNumbers: [],
    submitting: false,
    activeExplosiveKey: null,
    detonatorNumbers: [],
    activeDetonatorKey: null,
  };

  componentWillMount() {
    // this.addExplosiveField();
    // this.addDetonatorField();
  }

  clearFieldValues = (number) => {
    this.props.change(FORM.ADD_ROLES, `mine_guid-${number}`, "");
    this.props.change(FORM.ADD_ROLES, `mine_party_appt_type_code-${number}`, "");
    this.props.change(FORM.ADD_ROLES, `start_date-${number}`, "");
    this.props.change(FORM.ADD_ROLES, `end_date-${number}`, "");
  };

  addExplosiveField = () => {
    this.setState(({ explosiveNumbers: prevNumbers }) => {
      const highestRoleNumber = Number(prevNumbers[prevNumbers.length - 1] || 0);
      const newRoleNumber = String(highestRoleNumber + 1);
      return {
        explosiveNumbers: [...prevNumbers, newRoleNumber],
        activeExplosiveKey: newRoleNumber,
      };
    });
  };

  addField = (event, fields, type) => {
    event.preventDefault();
    // this.setState(({ detonatorNumbers: prevNumbers }) => {
    //   const highestRoleNumber = Number(prevNumbers[prevNumbers.length - 1] || 0);
    //   const newRoleNumber = String(highestRoleNumber + 1);
    //   return {
    //     detonatorNumbers: [...prevNumbers, newRoleNumber],
    //     activeDetonatorKey: newRoleNumber,
    //   };
    // });
    fields.push({});
    if (type === "EXP") {
      this.setState({ activeExplosiveKey: fields.length.toString() });
    } else {
      this.setState({ activeDetonatorKey: fields.length.toString() });
    }
  };

  removeExplosiveField = (number) => () => {
    // Clear field values from Redux store
    this.clearFieldValues(number);
    // Remove role number from state
    this.setState(({ explosiveNumbers: prevNumbers }) => ({
      explosiveNumbers: prevNumbers.filter((x) => x !== number),
    }));
  };

  removeDetonatorField = (number) => () => {
    // Clear field values from Redux store
    this.clearFieldValues(number);
    // Remove role number from state
    this.setState(({ detonatorNumbers: prevNumbers }) => ({
      detonatorNumbers: prevNumbers.filter((x) => x !== number),
    }));
  };

  handleActiveDetonatorPanelChange = (key) => {
    console.log(key);
    return this.setState({ activeDetonatorKey: key });
  };

  handleActiveExplosivePanelChange = (number) => {
    this.setState({ activeExplosiveKey: number });
  };

  panelHeader = (removeField, number, type) => (
    <div className="inline-flex between">
      <Form.Item
        style={{ marginTop: "15px" }}
        label={
          type === "EXP" ? `Explosive Magazine ${number + 1}` : `Detonator Magazine ${number + 1}`
        }
      />
      <div>
        <Popconfirm
          placement="topRight"
          title={`Are you sure you want to remove Role ${number + 1}?`}
          onConfirm={removeField(number)}
          okText="Yes"
          cancelText="No"
        >
          <Button ghost>
            <img name="remove" src={TRASHCAN} alt="Remove Activity" />
          </Button>
        </Popconfirm>
      </div>
    </div>
  );

  renderInputs = (field) => {
    return (
      <>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item>
              <Field
                label="Type No. *"
                id={`${field}type_no`}
                name={`${field}type_no`}
                component={renderConfig.FIELD}
                validate={[required]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item>
              <Field
                label="Tag No. *"
                id={`${field}tag_no`}
                name={`${field}tag_no`}
                component={renderConfig.FIELD}
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item>
              <Field
                label="Construction *"
                id={`${field}construction`}
                name={`${field}construction`}
                component={renderConfig.FIELD}
                validate={[required]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item>
              <Field
                label="Quantity *"
                id={`${field}quantity`}
                name={`${field}quantity`}
                component={renderConfig.FIELD}
                validate={[number, required]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item>
              <Field
                label="Latitude *"
                id={`${field}latitude`}
                name={`${field}latitude`}
                component={renderConfig.FIELD}
                validate={[number, maxLength(10), lat, required]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item>
              <Field
                label="Longitude *"
                id={`${field}longitude`}
                name={`${field}longitude`}
                validate={[number, maxLength(12), lon, required]}
                component={renderConfig.FIELD}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item>
              <Field
                label="Distance from Road or Work Area *"
                id={`${field}distance_road`}
                name={`${field}distance_road`}
                component={renderConfig.FIELD}
                validate={[number, required]}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item>
              <Field
                label="Distance from Dwelling or Flammable Material Storage Area *"
                id={`${field}distance_dwelling`}
                name={`${field}distance_dwelling`}
                component={renderConfig.FIELD}
                validate={[number, required]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Field
              label="Length*"
              id={`${field}length`}
              name={`${field}length`}
              component={renderConfig.FIELD}
              validate={[number, required]}
            />
          </Col>
          <Col span={8}>
            <Field
              label="Width*"
              id={`${field}width`}
              name={`${field}width`}
              component={renderConfig.FIELD}
              validate={[number, required]}
            />
          </Col>
          <Col span={8}>
            <Field
              label="Height*"
              id={`${field}height`}
              name={`${field}height`}
              component={renderConfig.FIELD}
              validate={[number, required]}
            />
          </Col>
        </Row>
      </>
    );
  };

  renderExplosive = ({ fields }) => {
    return (
      <div>
        <Row gutter={48}>
          <Col md={24}>
            <Collapse
              accordion
              activeKey={[this.state.activeExplosiveKey]}
              onChange={this.handleActiveExplosivePanelChange}
              className="light-background"
            >
              {fields.map((field, index) => (
                // {this.state.explosiveNumbers.map((number) => (
                <Collapse.Panel
                  header={this.panelHeader(this.removeExplosiveField, index, "EXP")}
                  key={index}
                >
                  {this.renderInputs(field)}
                </Collapse.Panel>
              ))}
            </Collapse>
            <Button
              className="btn--dropdown"
              onClick={(event) => this.addField(event, fields, "EXP")}
            >
              <PlusOutlined style={{ color: COLOR.mediumGrey }} />
              {fields.length > 0 ? "Add Another Magazine" : "Add Magazine"}
            </Button>
          </Col>
        </Row>
      </div>
    );
  };

  renderDetonator = ({ fields }) => {
    return (
      <div>
        <Row gutter={48}>
          <Col md={24}>
            <Collapse
              accordion
              activeKey={[this.state.activeDetonatorKey]}
              onChange={this.handleActiveDetonatorPanelChange}
              className="light-background"
            >
              {fields.map((field, index) => (
                // {this.state.detonatorNumbers.map((number) => (
                <Collapse.Panel
                  header={this.panelHeader(this.removeDetonatorField, index, "DET")}
                  key={index}
                >
                  {this.renderInputs(field)}
                </Collapse.Panel>
              ))}
            </Collapse>
            <Button
              className="btn--dropdown"
              onClick={(event) => this.addField(event, fields, "DET")}
            >
              <PlusOutlined style={{ color: COLOR.mediumGrey }} />
              {fields.length > 0 ? "Add Another Magazine" : "Add Magazine"}
            </Button>
          </Col>
        </Row>
      </div>
    );
  };

  render() {
    return (
      <div>
        <Form.Item label="Explosive Magazines" />
        {/* <FormSection name="explosive_magazines">{this.renderExplosive()}</FormSection> */}
        <FieldArray name="explosive_magazines" component={this.renderExplosive} />
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item>
              <Field
                id="total_exp_quantity"
                name="total_exp_quantity"
                label="Total Maximum Quantity*"
                component={renderConfig.FIELD}
              />
            </Form.Item>
          </Col>
        </Row>
        <Divider style={{ backgroundColor: COLOR.violet }} />
        <Form.Item label="Detonator Magazines" />
        <FieldArray name="detonator_magazines" component={this.renderDetonator} />
        {/* <FormSection name="detonator_magazines">{this.renderDetonator()}</FormSection> */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item>
              <Field
                id="total_det_quantity"
                name="total_det_quantity"
                label="Total Maximum Quantity*"
                component={renderConfig.FIELD}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  addPartyFormValues: getFormValues(FORM.ADD_FULL_PARTY)(state) || {},
  addRolesFormValues: getFormValues(FORM.ADD_ROLES)(state) || {},
  addPartyForm: state.form[FORM.ADD_FULL_PARTY],
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      addPartyRelationship,
      fetchMineNameList,
      submit,
      reset,
      createParty,
      change,
    },
    dispatch
  );

AddPartyModal.propTypes = propTypes;
AddPartyModal.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(AddPartyModal);
