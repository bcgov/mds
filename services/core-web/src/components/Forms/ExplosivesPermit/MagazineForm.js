/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getFormValues, submit, reset, change, FormSection, FieldArray, Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import { required, maxLength, dateNotInFuture, number, lat, lon } from "@common/utils/Validate";
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
  closeModal: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  isApproved: PropTypes.bool,
};

const defaultProps = {
  isApproved: false,
};

export class MagazineForm extends Component {
  state = {
    activeExplosiveKey: null,
    activeDetonatorKey: null,
  };

  addField = (event, fields, type) => {
    event.preventDefault();
    fields.push({});
    if (type === "EXP") {
      this.handleActiveExplosivePanelChange([fields.length]);
    } else {
      this.handleActiveDetonatorPanelChange([fields.length]);
    }
  };

  removeField = (index, fields) => () => {
    fields.remove(index);
  };

  handleActiveDetonatorPanelChange = (key) => {
    this.setState({ activeDetonatorKey: key });
  };

  handleActiveExplosivePanelChange = (key) => {
    this.setState({ activeExplosiveKey: key });
  };

  panelHeader = (index, fields, type) => (
    <div className="inline-flex between">
      <Form.Item
        style={{ marginTop: "15px" }}
        label={
          type === "EXP" ? `Explosive Magazine ${index + 1}` : `Detonator Magazine ${index + 1}`
        }
      />
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div onClick={(event) => event.preventDefault()}>
        <Popconfirm
          placement="topRight"
          title={`Are you sure you want to remove Role ${index + 1}?`}
          onConfirm={this.removeField(index, fields)}
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

  renderInputs = (field, type) => {
    const unit = type === "EXP" ? "(Kg)" : "(Unit)";
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
                disabled={this.props.isApproved}
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
                disabled={this.props.isApproved}
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
                disabled={this.props.isApproved}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item>
              <Field
                label={`Quantity ${unit}*`}
                id={`${field}quantity`}
                name={`${field}quantity`}
                component={renderConfig.FIELD}
                validate={[number, required]}
                disabled={this.props.isApproved}
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
                disabled={this.props.isApproved}
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
                disabled={this.props.isApproved}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item>
              <Field
                label="Distance from Road or Work Area (m)*"
                id={`${field}distance_road`}
                name={`${field}distance_road`}
                component={renderConfig.FIELD}
                validate={[number, required]}
                disabled={this.props.isApproved}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item>
              <Field
                label="Distance from Dwelling or Flammable Material Storage Area (m)*"
                id={`${field}distance_dwelling`}
                name={`${field}distance_dwelling`}
                component={renderConfig.FIELD}
                validate={[number, required]}
                disabled={this.props.isApproved}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Field
              label="Length (m)*"
              id={`${field}length`}
              name={`${field}length`}
              component={renderConfig.FIELD}
              validate={[number, required]}
              disabled={this.props.isApproved}
            />
          </Col>
          <Col span={8}>
            <Field
              label="Width (m)*"
              id={`${field}width`}
              name={`${field}width`}
              component={renderConfig.FIELD}
              validate={[number, required]}
              disabled={this.props.isApproved}
            />
          </Col>
          <Col span={8}>
            <Field
              label="Height (m)*"
              id={`${field}height`}
              name={`${field}height`}
              component={renderConfig.FIELD}
              validate={[number, required]}
              disabled={this.props.isApproved}
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
                <Collapse.Panel header={this.panelHeader(index, fields, "EXP")} key={index}>
                  {this.renderInputs(field, "EXP")}
                </Collapse.Panel>
              ))}
            </Collapse>
            <Button
              className="btn--dropdown"
              onClick={(event) => this.addField(event, fields, "EXP")}
              disabled={this.props.isApproved}
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
                <Collapse.Panel header={this.panelHeader(index, fields, "DET")} key={field}>
                  {this.renderInputs(field, "DET")}
                </Collapse.Panel>
              ))}
            </Collapse>
            <Button
              className="btn--dropdown"
              onClick={(event) => this.addField(event, fields, "DET")}
              disabled={this.props.isApproved}
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
        <FieldArray name="explosive_magazines" component={this.renderExplosive} />
        <Divider style={{ backgroundColor: COLOR.violet }} />
        <Form.Item label="Detonator Magazines" />
        <FieldArray name="detonator_magazines" component={this.renderDetonator} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      submit,
      reset,
      change,
    },
    dispatch
  );

MagazineForm.propTypes = propTypes;
MagazineForm.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MagazineForm);
