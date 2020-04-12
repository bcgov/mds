import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { reduxForm, Field, formValueSelector } from "redux-form";
import { Form, Button, Col, Row, Popconfirm, Badge } from "antd";
import { required, lat, lon } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import MineCard from "@/components/mine/NoticeOfWork/MineCard";
import RenderMineSelect from "@/components/common/RenderMineSelect";
import RenderField from "@/components/common/RenderField";
import * as Styles from "@/constants/styles";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  locationOnly: PropTypes.bool,
  mine: CustomPropTypes.mine,
  latitude: PropTypes.string,
  longitude: PropTypes.string,
};

const defaultProps = {
  locationOnly: false,
  mine: {},
  latitude: "",
  longitude: "",
};

const selector = formValueSelector(FORM.CHANGE_NOW_LOCATION);
// eslint-disable-next-line react/prefer-stateless-function
export class ChangeNOWLocationForm extends Component {
  state = { submitting: false };
  handleFormSubmit = (values) => {
    this.setState({ submitting: true });
    this.props.handleSubmit(values);
  };
  render() {
    const additionalPin =
      this.props.latitude && this.props.longitude
        ? [this.props.latitude, this.props.longitude]
        : [];
    const span = this.props.locationOnly ? 12 : 6;
    return (
      <Form layout="vertical" onSubmit={this.handleFormSubmit}>
        <Row gutter={16}>
          {!this.props.locationOnly && (
            <Col md={12} s={24}>
              <Form.Item>
                <Field
                  id="mine_guid"
                  name="mine_guid"
                  component={RenderMineSelect}
                  validate={[required]}
                  showCard
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
        {this.props.locationOnly && (
          <MineCard mine={this.props.mine} additionalPin={additionalPin} />
        )}
        <div className="right center-mobile">
          {this.props.locationOnly && (
            <Popconfirm
              placement="topRight"
              title="Are you sure you want to cancel?"
              onConfirm={this.props.closeModal}
              okText="Yes"
              cancelText="No"
            >
              <Button className="full-mobile" type="secondary">
                Cancel
              </Button>
            </Popconfirm>
          )}
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            disabled={this.state.submitting}
          >
            {this.props.title}
          </Button>
        </div>
      </Form>
    );
  }
}

ChangeNOWLocationForm.propTypes = propTypes;
ChangeNOWLocationForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    latitude: selector(state, "latitude"),
    longitude: selector(state, "longitude"),
  })),
  reduxForm({
    form: FORM.CHANGE_NOW_LOCATION,
    onSubmitSuccess: resetForm(FORM.CHANGE_NOW_LOCATION),
  })
)(ChangeNOWLocationForm);
