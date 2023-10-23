import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, FieldArray } from "redux-form";
import { Form } from "@ant-design/compatible";
import {
  lat,
  lon,
  lonNegative,
  maxLength,
  number,
  positiveNumber,
  required,
} from "@common/utils/Validate";

import "@ant-design/compatible/assets/index.css";
import { Button, Col, Collapse, Divider, Popconfirm, Row, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { TRASHCAN } from "@/constants/assets";
import { renderConfig } from "@/components/common/config";
import { COLOR } from "@/constants/styles";

export type FormProps = {
  isProcessed: boolean;
};

class MagazineForm extends Component<FormProps> {
  static propTypes = {
    isProcessed: PropTypes.bool.isRequired,
  };

  state = {
    activeKeys: [],
  };

  static defaultProps = {};

  addField = (event: React.MouseEvent, fields: any) => {
    event.preventDefault();
    fields.push({});
  };

  removeField = (index: number, fields: any) => () => {
    fields.remove(index);
  };

  panelHeader = (index: number, fields: any, type: string) => (
    <div className="inline-flex between horizontal-center">
      <Form.Item
        style={{ marginTop: "15px" }}
        label={
          <Typography.Text className="purple" strong>
            {type === "EXP" ? `Explosive Magazine ${index + 1}` : `Detonator Magazine ${index + 1}`}
          </Typography.Text>
        }
      />
      <div onClick={(event) => event.stopPropagation()}>
        <Popconfirm
          placement="topRight"
          title={`Are you sure you want to remove Role ${index + 1}?`}
          onConfirm={this.removeField(index, fields)}
          okText="Yes"
          cancelText="No"
        >
          <Button ghost disabled={this.props.isProcessed}>
            <img
              className={this.props.isProcessed ? "disabled-icon" : ""}
              src={TRASHCAN}
              alt="Remove Activity"
            />
          </Button>
        </Popconfirm>
      </div>
    </div>
  );

  renderInputs = (field: string, type: string) => {
    const unit = type === "EXP" ? "(Kg)" : "(Unit)";
    const showDetonatorType = type === "DET";
    return (
      <>
        <Row gutter={16}>
          <Col span={12}>
            <Field
              label="Type No. *"
              id={`${field}type_no`}
              name={`${field}type_no`}
              component={renderConfig.FIELD}
              validate={[required]}
              disabled={this.props.isProcessed}
            />
          </Col>
          <Col span={12}>
            <Field
              label="Tag No. *"
              id={`${field}tag_no`}
              name={`${field}tag_no`}
              component={renderConfig.FIELD}
              validate={[required]}
              disabled={this.props.isProcessed}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Field
              label="Construction *"
              id={`${field}construction`}
              name={`${field}construction`}
              component={renderConfig.FIELD}
              validate={[required]}
              disabled={this.props.isProcessed}
            />
          </Col>
          <Col span={12}>
            <Field
              label={`Quantity ${unit}*`}
              id={`${field}quantity`}
              name={`${field}quantity`}
              component={renderConfig.FIELD}
              validate={[positiveNumber, required]}
              disabled={this.props.isProcessed}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Field
              label="Latitude *"
              id={`${field}latitude`}
              name={`${field}latitude`}
              component={renderConfig.FIELD}
              validate={[number, maxLength(10), lat, required]}
              disabled={this.props.isProcessed}
            />
          </Col>
          <Col span={12}>
            <Field
              label="Longitude *"
              id={`${field}longitude`}
              name={`${field}longitude`}
              validate={[number, maxLength(12), lon, lonNegative, required]}
              component={renderConfig.FIELD}
              disabled={this.props.isProcessed}
            />
          </Col>
        </Row>
        {showDetonatorType && (
          <Row gutter={16}>
            <Col span={24}>
              <Field
                label="Type of Detonator*"
                id={`${field}detonator_type`}
                name={`${field}detonator_type`}
                component={renderConfig.AUTO_SIZE_FIELD}
                validate={[required]}
                disabled={this.props.isProcessed}
              />
            </Col>
          </Row>
        )}
        <Row gutter={16}>
          <Col span={24}>
            <Field
              label="Distance from Road or Work Area (m)*"
              id={`${field}distance_road`}
              name={`${field}distance_road`}
              component={renderConfig.FIELD}
              validate={[positiveNumber, required]}
              disabled={this.props.isProcessed}
            />
          </Col>
          <Col span={24}>
            <Field
              label="Distance from Dwelling or Flammable Material Storage Area (m)*"
              id={`${field}distance_dwelling`}
              name={`${field}distance_dwelling`}
              component={renderConfig.FIELD}
              validate={[positiveNumber, required]}
              disabled={this.props.isProcessed}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Field
              label="Length (m)*"
              id={`${field}length`}
              name={`${field}length`}
              component={renderConfig.FIELD}
              validate={[positiveNumber, required]}
              disabled={this.props.isProcessed}
            />
          </Col>
          <Col span={8}>
            <Field
              label="Width (m)*"
              id={`${field}width`}
              name={`${field}width`}
              component={renderConfig.FIELD}
              validate={[positiveNumber, required]}
              disabled={this.props.isProcessed}
            />
          </Col>
          <Col span={8}>
            <Field
              label="Height (m)*"
              id={`${field}height`}
              name={`${field}height`}
              component={renderConfig.FIELD}
              validate={[positiveNumber, required]}
              disabled={this.props.isProcessed}
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
            {fields.map((field, index) => (
              <Collapse
                key={field.id}
                defaultActiveKey={this.state.activeKeys}
                className="magazine-collapse margin-large--bottom"
                onChange={(key) => this.setState({ activeKeys: Array.isArray(key) ? key : [key] })}
              >
                <Collapse.Panel
                  header={this.panelHeader(index, fields, "EXP")}
                  className="magazine-collapse"
                  key={`${field.id}EXP`}
                >
                  {this.renderInputs(field, "EXP")}
                </Collapse.Panel>
              </Collapse>
            ))}
            <Button
              className="add-magazine-button"
              onClick={(event) => this.addField(event, fields)}
              disabled={this.props.isProcessed}
              icon={<PlusOutlined style={{ color: COLOR.violet }} />}
            >
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
            {fields.map((field, index) => (
              <Collapse
                defaultActiveKey={this.state.activeKeys}
                onChange={(key) => this.setState({ activeKeys: Array.isArray(key) ? key : [key] })}
                key={field.id}
                className="magazine-collapse margin-large--bottom"
              >
                <Collapse.Panel
                  className="magazine-collapse"
                  header={this.panelHeader(index, fields, "DET")}
                  key={`${field.id}DET`}
                >
                  {this.renderInputs(field, "DET")}
                </Collapse.Panel>
              </Collapse>
            ))}
            <Button
              className="add-magazine-button"
              onClick={(event) => this.addField(event, fields)}
              disabled={this.props.isProcessed}
              icon={<PlusOutlined style={{ color: COLOR.violet }} />}
            >
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
        <Typography.Title level={4} className="purple">
          Explosives Magazines
        </Typography.Title>
        <FieldArray props={{}} name="explosive_magazines" component={this.renderExplosive} />
        <Divider style={{ backgroundColor: COLOR.violet }} />
        <Typography.Title level={4} className="purple">
          Detonator Magazines
        </Typography.Title>
        <FieldArray props={{}} name="detonator_magazines" component={this.renderDetonator} />
      </div>
    );
  }
}

export default MagazineForm;
