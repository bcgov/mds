import React from "react";
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

const propTypes = {
  isProcessed: PropTypes.bool.isRequired,
};

const defaultProps = {};

export const MagazineForm = (props) => {
  const [activeKeys, setActiveKeys] = React.useState(["0"]);
  const addField = (event, fields) => {
    event.preventDefault();
    fields.push({});
  };

  const removeField = (index, fields) => () => {
    fields.remove(index);
  };

  const panelHeader = (index, fields, type) => (
    <div className="inline-flex between horizontal-center">
      <Form.Item
        style={{ marginTop: "15px" }}
        label={
          <Typography.Text className="purple" strong>
            {type === "EXP" ? `Explosive Magazine ${index + 1}` : `Detonator Magazine ${index + 1}`}
          </Typography.Text>
        }
      />
      <div onClick={(event) => event.preventDefault()}>
        <Popconfirm
          placement="topRight"
          title={`Are you sure you want to remove Role ${index + 1}?`}
          onConfirm={removeField(index, fields)}
          okText="Yes"
          cancelText="No"
        >
          <Button ghost disabled={props.isProcessed}>
            <img
              className={props.isProcessed ? "disabled-icon" : ""}
              src={TRASHCAN}
              alt="Remove Activity"
            />
          </Button>
        </Popconfirm>
      </div>
    </div>
  );

  const renderInputs = (field, type) => {
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
              disabled={props.isProcessed}
            />
          </Col>
          <Col span={12}>
            <Field
              label="Tag No. *"
              id={`${field}tag_no`}
              name={`${field}tag_no`}
              component={renderConfig.FIELD}
              validate={[required]}
              disabled={props.isProcessed}
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
              disabled={props.isProcessed}
            />
          </Col>
          <Col span={12}>
            <Field
              label={`Quantity ${unit}*`}
              id={`${field}quantity`}
              name={`${field}quantity`}
              component={renderConfig.FIELD}
              validate={[positiveNumber, required]}
              disabled={props.isProcessed}
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
              disabled={props.isProcessed}
            />
          </Col>
          <Col span={12}>
            <Field
              label="Longitude *"
              id={`${field}longitude`}
              name={`${field}longitude`}
              validate={[number, maxLength(12), lon, lonNegative, required]}
              component={renderConfig.FIELD}
              disabled={props.isProcessed}
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
                disabled={props.isProcessed}
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
              disabled={props.isProcessed}
            />
          </Col>
          <Col span={24}>
            <Field
              label="Distance from Dwelling or Flammable Material Storage Area (m)*"
              id={`${field}distance_dwelling`}
              name={`${field}distance_dwelling`}
              component={renderConfig.FIELD}
              validate={[positiveNumber, required]}
              disabled={props.isProcessed}
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
              disabled={props.isProcessed}
            />
          </Col>
          <Col span={8}>
            <Field
              label="Width (m)*"
              id={`${field}width`}
              name={`${field}width`}
              component={renderConfig.FIELD}
              validate={[positiveNumber, required]}
              disabled={props.isProcessed}
            />
          </Col>
          <Col span={8}>
            <Field
              label="Height (m)*"
              id={`${field}height`}
              name={`${field}height`}
              component={renderConfig.FIELD}
              validate={[positiveNumber, required]}
              disabled={props.isProcessed}
            />
          </Col>
        </Row>
      </>
    );
  };

  const renderExplosive = ({ fields }) => {
    return (
      <div>
        <Row gutter={48}>
          <Col md={24}>
            {fields.map((field, index) => (
              <Collapse
                defaultActiveKey={activeKeys}
                key={index}
                className="magazine-collapse margin-large--bottom"
                onChange={(key) => setActiveKeys(Array.isArray(key) ? key : [key])}
              >
                <Collapse.Panel
                  header={panelHeader(index, fields, "EXP")}
                  className="magazine-collapse"
                  key={`${index}EXP`}
                >
                  {renderInputs(field, "EXP")}
                </Collapse.Panel>
              </Collapse>
            ))}
            <Button
              className="add-magazine-button"
              onClick={(event) => addField(event, fields)}
              disabled={props.isProcessed}
              icon={<PlusOutlined style={{ color: COLOR.violet }} />}
            >
              {fields.length > 0 ? "Add Another Magazine" : "Add Magazine"}
            </Button>
          </Col>
        </Row>
      </div>
    );
  };

  const renderDetonator = ({ fields }) => {
    return (
      <div>
        <Row gutter={48}>
          <Col md={24}>
            {fields.map((field, index) => (
              <Collapse
                defaultActiveKey={activeKeys}
                onChange={(key) => setActiveKeys(Array.isArray(key) ? key : [key])}
                key={index}
                className="magazine-collapse margin-large--bottom"
              >
                <Collapse.Panel
                  className="magazine-collapse"
                  header={panelHeader(index, fields, "DET")}
                  key={`${index}DET`}
                >
                  {renderInputs(field, "DET")}
                </Collapse.Panel>
              </Collapse>
            ))}
            <Button
              className="add-magazine-button"
              onClick={(event) => addField(event, fields)}
              disabled={props.isProcessed}
              icon={<PlusOutlined style={{ color: COLOR.violet }} />}
            >
              {fields.length > 0 ? "Add Another Magazine" : "Add Magazine"}
            </Button>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div>
      <Typography.Title level={4} className="purple">
        Explosives Magazines
      </Typography.Title>
      <FieldArray props={{}} name="explosive_magazines" component={renderExplosive} />
      <Divider style={{ backgroundColor: COLOR.violet }} />
      <Typography.Title level={4} className="purple">
        Detonator Magazines
      </Typography.Title>
      <FieldArray props={{}} name="detonator_magazines" component={renderDetonator} />
    </div>
  );
};

MagazineForm.propTypes = propTypes;
MagazineForm.defaultProps = defaultProps;

export default MagazineForm;
