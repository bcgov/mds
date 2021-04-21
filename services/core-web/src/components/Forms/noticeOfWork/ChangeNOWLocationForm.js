import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { reduxForm, formValueSelector } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Popconfirm } from "antd";
import { resetForm } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import MineCard from "@/components/mine/NoticeOfWork/MineCard";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import EditNOWMineAndLocation from "@/components/Forms/noticeOfWork/EditNOWMineAndLocation";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  locationOnly: PropTypes.bool,
  mine: CustomPropTypes.mine,
  latitude: PropTypes.string.isRequired,
  longitude: PropTypes.string.isRequired,
};

const defaultProps = {
  locationOnly: false,
  mine: {},
};

const selector = formValueSelector(FORM.CHANGE_NOW_LOCATION);
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
    return (
      <Form layout="vertical" onSubmit={this.handleFormSubmit}>
        <EditNOWMineAndLocation
          locationOnly
          latitude={this.props.latitude}
          longitude={this.props.longitude}
        />
        {this.props.locationOnly && (
          <MineCard mine={this.props.mine} additionalPin={additionalPin} />
        )}
        <div className="right center-mobile">
          {this.props.locationOnly && (
            <>
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
              <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                <Button
                  className="full-mobile"
                  type="primary"
                  htmlType="submit"
                  disabled={this.state.submitting}
                >
                  {this.props.title}
                </Button>
              </AuthorizationWrapper>
            </>
          )}
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
    onSubmit: () => {},
  })
)(ChangeNOWLocationForm);
