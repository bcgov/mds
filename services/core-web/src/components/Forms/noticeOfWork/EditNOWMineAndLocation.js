import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Col, Row, Badge } from "antd";
import { required, lat, lon, lonNegative } from "@mds/common/redux/utils/Validate";
import RenderMineSelect from "@/components/common/RenderMineSelect";
import RenderField from "@mds/common/components/forms/RenderField";
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
            <Field
              id="mine_guid"
              name="mine_guid"
              component={RenderMineSelect}
              required
              validate={[required]}
              fullWidth
              additionalPin={additionalPin}
              label="Mine Name"
            />
          </Col>
        )}
        <Col md={span} s={12}>
          <Field id="latitude" name="latitude" component={RenderField} validate={[lat]} label={[<Badge color={Styles.COLOR.yellow} />, "NoW Latitude"]} />
        </Col>
        <Col md={span} s={12}>
          <Field
            id="longitude"
            name="longitude"
            component={RenderField}
            validate={[lon, lonNegative]}
            label="NoW Longitude"
          />
        </Col>
      </Row>
    </div>
  );
};

EditNOWMineAndLocation.propTypes = propTypes;
EditNOWMineAndLocation.defaultProps = defaultProps;

export default EditNOWMineAndLocation;
