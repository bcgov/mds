import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row, Badge } from "antd";
import { required, lat, lon } from "@common/utils/Validate";
import RenderMineSelect from "@/components/common/RenderMineSelect";
import RenderField from "@/components/common/RenderField";
import * as Styles from "@/constants/styles";

const propTypes = {
  locationOnly: PropTypes.bool,
  latitude: PropTypes.string.isRequired,
  longitude: PropTypes.string.isRequired,
};

const defaultProps = { locationOnly: false };

export const EditNOWMineAndLocation = (props) => {
  const additionalPin = props.latitude && props.longitude ? [props.latitude, props.longitude] : [];
  const span = props.locationOnly ? 12 : 6;
  return (
    <div>
      <Row gutter={16}>
        {!props.locationOnly && (
          <Col md={12} s={24}>
            <Form.Item label="Mine Name">
              <Field
                id="mine_guid"
                name="mine_guid"
                component={RenderMineSelect}
                validate={[required]}
                fullWidth
                additionalPin={additionalPin}
              />
            </Form.Item>
          </Col>
        )}
        <Col md={span} s={12}>
          <Form.Item label={[<Badge color={Styles.COLOR.yellow} />, "NoW Latitude"]}>
            <Field id="latitude" name="latitude" component={RenderField} validate={[lat]} />
          </Form.Item>
        </Col>
        <Col md={span} s={12}>
          <Form.Item label="NoW Longitude">
            <Field id="longitude" name="longitude" component={RenderField} validate={[lon]} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

EditNOWMineAndLocation.propTypes = propTypes;
EditNOWMineAndLocation.defaultProps = defaultProps;

export default EditNOWMineAndLocation;
